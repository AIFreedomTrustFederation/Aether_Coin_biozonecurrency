"use strict";
/**
 * Marketplace Service
 * This service manages the DApp marketplace functionality including
 * listings, purchases, reviews, and recommendations.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceService = void 0;
const storage_1 = require("../../storage");
const dapp_schema_1 = require("../../../shared/dapp-schema");
const drizzle_orm_1 = require("drizzle-orm");
const ethers_1 = require("ethers");
class MarketplaceService {
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
    async createListing(userId, dappId, title, description, price, currency, pricingModel, category, tags, images) {
        try {
            // First verify the user owns the DApp
            const dapp = await storage_1.db.query.userDapps.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.id, dappId), (0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.userId, userId))
            });
            if (!dapp) {
                throw new Error('You do not own this DApp or it does not exist');
            }
            // Check if the DApp is in a publishable state
            if (dapp.status !== 'published' && dapp.status !== 'draft') {
                throw new Error('DApp must be in published or draft state to create a listing');
            }
            // Create the listing
            const listing = await storage_1.db
                .insert(dapp_schema_1.marketplaceListings)
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
                await storage_1.db
                    .update(dapp_schema_1.userDapps)
                    .set({
                    status: 'published',
                    isPublished: true,
                    updatedAt: new Date()
                })
                    .where((0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.id, dappId));
            }
            return listing[0];
        }
        catch (error) {
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
    async getListings(category, search, limit = 20, offset = 0) {
        try {
            // Base query for active listings
            let query = storage_1.db.query.marketplaceListings.findMany({
                where: (0, drizzle_orm_1.eq)(dapp_schema_1.marketplaceListings.status, 'active'),
                limit,
                offset,
                orderBy: [(0, drizzle_orm_1.desc)(dapp_schema_1.marketplaceListings.featured), (0, drizzle_orm_1.desc)(dapp_schema_1.marketplaceListings.createdAt)],
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
                query = storage_1.db.query.marketplaceListings.findMany({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.marketplaceListings.status, 'active'), (0, drizzle_orm_1.eq)(dapp_schema_1.marketplaceListings.category, category)),
                    limit,
                    offset,
                    orderBy: [(0, drizzle_orm_1.desc)(dapp_schema_1.marketplaceListings.featured), (0, drizzle_orm_1.desc)(dapp_schema_1.marketplaceListings.createdAt)],
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
                query = storage_1.db.query.marketplaceListings.findMany({
                    where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.marketplaceListings.status, 'active'), (0, drizzle_orm_1.sql) `${dapp_schema_1.marketplaceListings.title} ILIKE ${searchTerm} OR ${dapp_schema_1.marketplaceListings.description} ILIKE ${searchTerm}`),
                    limit,
                    offset,
                    orderBy: [(0, drizzle_orm_1.desc)(dapp_schema_1.marketplaceListings.featured), (0, drizzle_orm_1.desc)(dapp_schema_1.marketplaceListings.createdAt)],
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
        }
        catch (error) {
            console.error("Error getting listings:", error);
            return [];
        }
    }
    /**
     * Get a specific listing by ID
     * @param listingId Listing ID
     * @returns Listing details
     */
    async getListingById(listingId) {
        try {
            const listing = await storage_1.db.query.marketplaceListings.findFirst({
                where: (0, drizzle_orm_1.eq)(dapp_schema_1.marketplaceListings.id, listingId),
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
                const reviews = await storage_1.db.query.dappReviews.findMany({
                    where: (0, drizzle_orm_1.eq)(dapp_schema_1.dappReviews.dappId, listing.dappId),
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
        }
        catch (error) {
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
    async processPurchase(userId, listingId, transactionHash) {
        try {
            // Get the listing details
            const listing = await storage_1.db.query.marketplaceListings.findFirst({
                where: (0, drizzle_orm_1.eq)(dapp_schema_1.marketplaceListings.id, listingId)
            });
            if (!listing) {
                throw new Error('Listing not found');
            }
            if (listing.status !== 'active') {
                throw new Error('This listing is not active');
            }
            // Check if the user already purchased this DApp
            const existingPurchase = await storage_1.db.query.dappPurchases.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.dappPurchases.userId, userId), (0, drizzle_orm_1.eq)(dapp_schema_1.dappPurchases.listingId, listingId))
            });
            if (existingPurchase) {
                throw new Error('You have already purchased this DApp');
            }
            // Handle different pricing models
            let expiresAt = null;
            if (listing.pricingModel === 'subscription') {
                // Set expiration date 30 days from now for subscriptions
                expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);
            }
            // Generate a unique license key
            const licenseKey = this.generateLicenseKey();
            // Create the purchase record
            const purchase = await storage_1.db
                .insert(dapp_schema_1.dappPurchases)
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
            await storage_1.db
                .update(dapp_schema_1.userDapps)
                .set({
                downloads: (0, drizzle_orm_1.sql) `${dapp_schema_1.userDapps.downloads} + 1`
            })
                .where((0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.id, listing.dappId));
            return purchase[0];
        }
        catch (error) {
            console.error("Error processing purchase:", error);
            throw error;
        }
    }
    /**
     * Get all purchases for a user
     * @param userId User ID
     * @returns Array of purchases with listing details
     */
    async getUserPurchases(userId) {
        try {
            return await storage_1.db.query.dappPurchases.findMany({
                where: (0, drizzle_orm_1.eq)(dapp_schema_1.dappPurchases.userId, userId),
                with: {
                    listing: {
                        with: {
                            dapp: true
                        }
                    }
                },
                orderBy: (0, drizzle_orm_1.desc)(dapp_schema_1.dappPurchases.createdAt)
            });
        }
        catch (error) {
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
    async submitReview(userId, dappId, rating, title, review) {
        try {
            // Verify the user has purchased this DApp
            const dappPurchaseExists = await storage_1.db.query.dappPurchases.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.dappPurchases.userId, userId), (0, drizzle_orm_1.sql) `${dapp_schema_1.dappPurchases.listingId} IN (
            SELECT id FROM marketplace_listings WHERE dapp_id = ${dappId}
          )`)
            });
            // Create the review
            const newReview = await storage_1.db
                .insert(dapp_schema_1.dappReviews)
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
            const allReviews = await storage_1.db.query.dappReviews.findMany({
                where: (0, drizzle_orm_1.eq)(dapp_schema_1.dappReviews.dappId, dappId)
            });
            const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
            await storage_1.db
                .update(dapp_schema_1.userDapps)
                .set({
                rating: avgRating.toString()
            })
                .where((0, drizzle_orm_1.eq)(dapp_schema_1.userDapps.id, dappId));
            return newReview[0];
        }
        catch (error) {
            console.error("Error submitting review:", error);
            throw error;
        }
    }
    /**
     * Get featured DApps for the homepage
     * @param limit Number of results to return
     * @returns Array of featured DApps
     */
    async getFeaturedDapps(limit = 6) {
        try {
            return await storage_1.db.query.marketplaceListings.findMany({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(dapp_schema_1.marketplaceListings.status, 'active'), (0, drizzle_orm_1.eq)(dapp_schema_1.marketplaceListings.featured, true)),
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
        }
        catch (error) {
            console.error("Error getting featured DApps:", error);
            return [];
        }
    }
    /**
     * Generate a unique license key
     * @returns License key string
     */
    generateLicenseKey() {
        // Generate a random license key
        const key = ethers_1.ethers.utils.randomBytes(16);
        return ethers_1.ethers.utils.hexlify(key).replace('0x', '').toUpperCase();
    }
}
exports.MarketplaceService = MarketplaceService;
exports.default = new MarketplaceService();
