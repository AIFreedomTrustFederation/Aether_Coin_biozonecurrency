/**
 * Marketplace Service
 * This service manages the DApp marketplace functionality including
 * listings, purchases, reviews, and recommendations.
 */

import { db } from '../../storage';
import {
  marketplaceListings,
  dappPurchases,
  dappReviews,
  userDapps
} from '../../../shared/dapp-schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';
import { ethers } from 'ethers';

export class MarketplaceService {
  /**
   * Create a new marketplace listing
   * @param userId User ID of the seller
   * @param dappId DApp ID to list
   * @param title Listing title
   * @param description Listing description
   * @param price Price (can be 0 for free DApps)
   * @param currency Currency code (ETH, USDC, etc.)
   * @param pricingModel Pricing model (one-time, subscription, etc.)
   * @param category DApp category
   * @param tags Array of tags
   * @param images Array of image URLs
   * @returns Created listing
   */
  async createListing(
    userId: number,
    dappId: number,
    title: string,
    description: string,
    price: number,
    currency: string,
    pricingModel: string,
    category: string,
    tags: string[],
    images: string[]
  ): Promise<any> {
    try {
      // First verify the user owns the DApp
      const dapp = await db.query.userDapps.findFirst({
        where: and(
          eq(userDapps.id, dappId),
          eq(userDapps.userId, userId)
        )
      });
      
      if (!dapp) {
        throw new Error('You do not own this DApp or it does not exist');
      }
      
      // Check if the DApp is in a publishable state
      if (dapp.status !== 'published' && dapp.status !== 'draft') {
        throw new Error('DApp must be in published or draft state to create a listing');
      }
      
      // Create the listing
      const listing = await db
        .insert(marketplaceListings)
        .values({
          dappId,
          userId,
          title,
          description,
          price: price.toString(), // Store as string for precision
          currency,
          pricingModel,
          category,
          tags: JSON.stringify(tags),
          images: JSON.stringify(images),
          status: 'pending' // All listings start in pending state for moderation
        })
        .returning();
      
      // Update the DApp status to published if it was in draft
      if (dapp.status === 'draft') {
        await db
          .update(userDapps)
          .set({
            status: 'published',
            isPublished: true,
            updatedAt: new Date()
          })
          .where(eq(userDapps.id, dappId));
      }
      
      return listing[0];
    } catch (error) {
      console.error("Error creating listing:", error);
      throw error;
    }
  }

  /**
   * Get all active marketplace listings
   * @param category Optional category filter
   * @param search Optional search term
   * @param limit Number of results to return
   * @param offset Pagination offset
   * @returns Array of listings
   */
  async getListings(
    category?: string,
    search?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    try {
      // Base query for active listings
      let query = db.query.marketplaceListings.findMany({
        where: eq(marketplaceListings.status, 'active'),
        limit,
        offset,
        orderBy: [desc(marketplaceListings.featured), desc(marketplaceListings.createdAt)],
        with: {
          dapp: true,
          seller: {
            columns: {
              id: true,
              username: true
            }
          }
        }
      });
      
      // Apply category filter if provided
      if (category) {
        query = db.query.marketplaceListings.findMany({
          where: and(
            eq(marketplaceListings.status, 'active'),
            eq(marketplaceListings.category, category)
          ),
          limit,
          offset,
          orderBy: [desc(marketplaceListings.featured), desc(marketplaceListings.createdAt)],
          with: {
            dapp: true,
            seller: {
              columns: {
                id: true,
                username: true
              }
            }
          }
        });
      }
      
      // Apply search filter if provided
      if (search) {
        const searchTerm = `%${search}%`;
        query = db.query.marketplaceListings.findMany({
          where: and(
            eq(marketplaceListings.status, 'active'),
            sql`${marketplaceListings.title} ILIKE ${searchTerm} OR ${marketplaceListings.description} ILIKE ${searchTerm}`
          ),
          limit,
          offset,
          orderBy: [desc(marketplaceListings.featured), desc(marketplaceListings.createdAt)],
          with: {
            dapp: true,
            seller: {
              columns: {
                id: true,
                username: true
              }
            }
          }
        });
      }
      
      return await query;
    } catch (error) {
      console.error("Error getting listings:", error);
      return [];
    }
  }

  /**
   * Get a specific listing by ID
   * @param listingId Listing ID
   * @returns Listing details
   */
  async getListingById(listingId: number): Promise<any> {
    try {
      const listing = await db.query.marketplaceListings.findFirst({
        where: eq(marketplaceListings.id, listingId),
        with: {
          dapp: true,
          seller: {
            columns: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      });
      
      if (listing) {
        // Get reviews for this listing's DApp
        const reviews = await db.query.dappReviews.findMany({
          where: eq(dappReviews.dappId, listing.dappId),
          with: {
            user: {
              columns: {
                id: true,
                username: true
              }
            }
          }
        });
        
        // Calculate average rating
        let avgRating = 0;
        if (reviews.length > 0) {
          avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        }
        
        return {
          ...listing,
          reviews,
          averageRating: avgRating
        };
      }
      
      return null;
    } catch (error) {
      console.error("Error getting listing:", error);
      return null;
    }
  }

  /**
   * Process a DApp purchase
   * @param userId User ID of the buyer
   * @param listingId Listing ID
   * @param transactionHash Blockchain transaction hash
   * @returns Created purchase record
   */
  async processPurchase(
    userId: number,
    listingId: number,
    transactionHash?: string
  ): Promise<any> {
    try {
      // Get the listing details
      const listing = await db.query.marketplaceListings.findFirst({
        where: eq(marketplaceListings.id, listingId)
      });
      
      if (!listing) {
        throw new Error('Listing not found');
      }
      
      if (listing.status !== 'active') {
        throw new Error('This listing is not active');
      }
      
      // Check if the user already purchased this DApp
      const existingPurchase = await db.query.dappPurchases.findFirst({
        where: and(
          eq(dappPurchases.userId, userId),
          eq(dappPurchases.listingId, listingId)
        )
      });
      
      if (existingPurchase) {
        throw new Error('You have already purchased this DApp');
      }
      
      // Handle different pricing models
      let expiresAt: Date | null = null;
      
      if (listing.pricingModel === 'subscription') {
        // Set expiration date 30 days from now for subscriptions
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);
      }
      
      // Generate a unique license key
      const licenseKey = this.generateLicenseKey();
      
      // Create the purchase record
      const purchase = await db
        .insert(dappPurchases)
        .values({
          userId,
          listingId,
          transactionHash: transactionHash || null,
          price: listing.price,
          currency: listing.currency,
          status: transactionHash ? 'completed' : 'pending',
          licenseKey,
          expiresAt
        })
        .returning();
      
      // Update DApp download count
      await db
        .update(userDapps)
        .set({
          downloads: sql`${userDapps.downloads} + 1`
        })
        .where(eq(userDapps.id, listing.dappId));
      
      return purchase[0];
    } catch (error) {
      console.error("Error processing purchase:", error);
      throw error;
    }
  }

  /**
   * Get all purchases for a user
   * @param userId User ID
   * @returns Array of purchases with listing details
   */
  async getUserPurchases(userId: number): Promise<any[]> {
    try {
      return await db.query.dappPurchases.findMany({
        where: eq(dappPurchases.userId, userId),
        with: {
          listing: {
            with: {
              dapp: true
            }
          }
        },
        orderBy: desc(dappPurchases.createdAt)
      });
    } catch (error) {
      console.error("Error getting user purchases:", error);
      return [];
    }
  }

  /**
   * Submit a review for a purchased DApp
   * @param userId User ID
   * @param dappId DApp ID
   * @param rating Rating (1-5)
   * @param title Review title
   * @param review Review text
   * @returns Created review
   */
  async submitReview(
    userId: number,
    dappId: number,
    rating: number,
    title: string,
    review: string
  ): Promise<any> {
    try {
      // Verify the user has purchased this DApp
      const dappPurchaseExists = await db.query.dappPurchases.findFirst({
        where: and(
          eq(dappPurchases.userId, userId),
          sql`${dappPurchases.listingId} IN (
            SELECT id FROM marketplace_listings WHERE dapp_id = ${dappId}
          )`
        )
      });
      
      // Create the review
      const newReview = await db
        .insert(dappReviews)
        .values({
          userId,
          dappId,
          rating,
          title,
          review,
          isVerifiedPurchase: !!dappPurchaseExists,
          mysterionVerified: false // Initially not verified by Mysterion
        })
        .returning();
      
      // Update DApp rating (average of all reviews)
      const allReviews = await db.query.dappReviews.findMany({
        where: eq(dappReviews.dappId, dappId)
      });
      
      const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      
      await db
        .update(userDapps)
        .set({
          rating: avgRating.toString()
        })
        .where(eq(userDapps.id, dappId));
      
      return newReview[0];
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  }

  /**
   * Get featured DApps for the homepage
   * @param limit Number of results to return
   * @returns Array of featured DApps
   */
  async getFeaturedDapps(limit: number = 6): Promise<any[]> {
    try {
      return await db.query.marketplaceListings.findMany({
        where: and(
          eq(marketplaceListings.status, 'active'),
          eq(marketplaceListings.featured, true)
        ),
        limit,
        with: {
          dapp: true,
          seller: {
            columns: {
              id: true,
              username: true
            }
          }
        }
      });
    } catch (error) {
      console.error("Error getting featured DApps:", error);
      return [];
    }
  }

  /**
   * Generate a unique license key
   * @returns License key string
   */
  private generateLicenseKey(): string {
    // Generate a random license key
    const key = ethers.utils.randomBytes(16);
    return ethers.utils.hexlify(key).replace('0x', '').toUpperCase();
  }
}

export default new MarketplaceService();