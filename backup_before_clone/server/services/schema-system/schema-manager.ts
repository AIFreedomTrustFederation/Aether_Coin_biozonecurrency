import { db } from "../../storage";
import { contractSchemas } from "../../../shared/dapp-schema";
import { eq } from "drizzle-orm";

/**
 * Schema Manager Service
 * Manages schema definitions for contract generation
 */
export class SchemaManager {
  /**
   * Get a schema by its name
   * @param name Schema name
   * @returns Schema definition
   */
  async getSchemaByName(name: string) {
    const schemas = await db.select()
      .from(contractSchemas)
      .where(eq(contractSchemas.name, name))
      .limit(1);
    
    return schemas.length > 0 ? schemas[0] : null;
  }

  /**
   * Get schema by category
   * @param category Schema category
   * @returns Schema definitions
   */
  async getSchemasByCategory(category: string) {
    const schemas = await db.select()
      .from(contractSchemas)
      .where(eq(contractSchemas.category, category));
    
    return schemas;
  }

  /**
   * Get all available schemas
   * @returns All schema definitions
   */
  async getAllSchemas() {
    const schemas = await db.select().from(contractSchemas);
    return schemas;
  }

  /**
   * Map user requirements to a schema structure
   * @param requirements User requirements in natural language
   * @returns Mapped schema structure
   */
  async mapRequirementsToSchema(requirements: string) {
    // This is a placeholder for a more sophisticated mapping system
    // In a real implementation, this would analyze user requirements and map them to a schema
    
    if (requirements.toLowerCase().includes('erc20') || 
        requirements.toLowerCase().includes('token') ||
        requirements.toLowerCase().includes('cryptocurrency')) {
      return this.getERC20Schema(requirements);
    } else if (requirements.toLowerCase().includes('nft') || 
              requirements.toLowerCase().includes('erc721') ||
              requirements.toLowerCase().includes('collectible')) {
      return this.getERC721Schema(requirements);
    } else if (requirements.toLowerCase().includes('marketplace') || 
              requirements.toLowerCase().includes('buy') ||
              requirements.toLowerCase().includes('sell')) {
      return this.getMarketplaceSchema(requirements);
    } else if (requirements.toLowerCase().includes('dao') || 
              requirements.toLowerCase().includes('governance') ||
              requirements.toLowerCase().includes('vote')) {
      return this.getDAOSchema(requirements);
    } else {
      // Default to a simple contract if we can't determine the type
      return this.getGenericContractSchema(requirements);
    }
  }

  /**
   * Parse numerical values from requirements
   * @param requirements User requirements
   * @param key The key to look for (e.g., "supply")
   * @param defaultValue Default value if not found
   * @returns Parsed numerical value
   */
  private parseNumericValue(requirements: string, key: string, defaultValue: number): number {
    const regex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*(?:million|thousand|billion)?\\s*${key}`, 'i');
    const match = requirements.match(regex);
    
    if (match && match[1]) {
      let value = parseFloat(match[1]);
      
      // Check for magnitude words
      if (requirements.toLowerCase().includes(`${match[1]} million ${key}`)) {
        value *= 1000000;
      } else if (requirements.toLowerCase().includes(`${match[1]} billion ${key}`)) {
        value *= 1000000000;
      } else if (requirements.toLowerCase().includes(`${match[1]} thousand ${key}`)) {
        value *= 1000;
      }
      
      return value;
    }
    
    return defaultValue;
  }

  /**
   * Parse percentage values from requirements
   * @param requirements User requirements
   * @param key The key to look for (e.g., "fee")
   * @param defaultValue Default value if not found
   * @returns Parsed percentage value
   */
  private parsePercentageValue(requirements: string, key: string, defaultValue: number): number {
    const regex = new RegExp(`(\\d+(?:\\.\\d+)?)\\s*%\\s*${key}`, 'i');
    const match = requirements.match(regex);
    
    if (match && match[1]) {
      return parseFloat(match[1]);
    }
    
    return defaultValue;
  }

  /**
   * Extract a name for the contract from requirements
   * @param requirements User requirements
   * @param defaultName Default name if none is found
   * @returns Extracted name
   */
  private extractName(requirements: string, defaultName: string): string {
    const nameMatches = [
      requirements.match(/called\s+([A-Za-z0-9]+)/i),
      requirements.match(/named\s+([A-Za-z0-9]+)/i),
      requirements.match(/create(?:s|ed)?\s+(?:a|an)?\s+([A-Za-z0-9]+)/i)
    ].filter(Boolean);
    
    if (nameMatches.length > 0 && nameMatches[0] && nameMatches[0][1]) {
      return nameMatches[0][1];
    }
    
    return defaultName;
  }

  /**
   * Check if a feature is requested in the requirements
   * @param requirements User requirements
   * @param feature Feature to check for
   * @returns True if the feature is requested
   */
  private hasFeature(requirements: string, feature: string): boolean {
    const lowercaseRequirements = requirements.toLowerCase();
    const featureRegex = new RegExp(`\\b${feature.toLowerCase()}\\b`, 'i');
    return featureRegex.test(lowercaseRequirements);
  }

  /**
   * Get ERC-20 token schema based on requirements
   * @param requirements User requirements
   * @returns ERC-20 schema
   */
  private getERC20Schema(requirements: string) {
    const name = this.extractName(requirements, 'MyToken');
    const symbol = name.substring(0, 4).toUpperCase();
    const initialSupply = this.parseNumericValue(requirements, 'supply', 1000000);
    
    // Check for specific features
    const features = {
      mintable: this.hasFeature(requirements, 'mint') || this.hasFeature(requirements, 'minting'),
      burnable: this.hasFeature(requirements, 'burn') || this.hasFeature(requirements, 'burning'),
      pausable: this.hasFeature(requirements, 'pause') || this.hasFeature(requirements, 'pausing'),
      capped: this.hasFeature(requirements, 'cap') || this.hasFeature(requirements, 'maximum'),
      ownable: this.hasFeature(requirements, 'owner') || this.hasFeature(requirements, 'ownable'),
      votable: this.hasFeature(requirements, 'vote') || this.hasFeature(requirements, 'voting'),
      taxable: this.hasFeature(requirements, 'tax') || this.hasFeature(requirements, 'fee'),
      upgradeable: this.hasFeature(requirements, 'upgrade') || this.hasFeature(requirements, 'upgradeability'),
    };
    
    return {
      type: 'erc20',
      name,
      symbol,
      initialSupply,
      decimals: 18, // Default for most ERC-20 tokens
      features
    };
  }

  /**
   * Get ERC-721 (NFT) schema based on requirements
   * @param requirements User requirements
   * @returns ERC-721 schema
   */
  private getERC721Schema(requirements: string) {
    const name = this.extractName(requirements, 'MyNFT');
    const symbol = name.substring(0, 4).toUpperCase();
    
    // Parse royalty percentage if specified
    const royaltyPercentage = this.parsePercentageValue(requirements, 'royalty', 0);
    
    // Check for specific features
    const features = {
      mintable: this.hasFeature(requirements, 'mint') || this.hasFeature(requirements, 'minting'),
      burnable: this.hasFeature(requirements, 'burn') || this.hasFeature(requirements, 'burning'),
      pausable: this.hasFeature(requirements, 'pause') || this.hasFeature(requirements, 'pausing'),
      enumerable: this.hasFeature(requirements, 'enumerate') || this.hasFeature(requirements, 'enumerable'),
      uriStorage: true, // Always include URI storage for NFTs
      royalties: royaltyPercentage > 0 || this.hasFeature(requirements, 'royalty'),
      upgradeable: this.hasFeature(requirements, 'upgrade') || this.hasFeature(requirements, 'upgradeability'),
      metadata: this.hasFeature(requirements, 'metadata') || this.hasFeature(requirements, 'properties')
    };
    
    return {
      type: 'erc721',
      name,
      symbol,
      baseUri: 'ipfs://',
      royaltyPercentage: royaltyPercentage || 2.5, // Default to 2.5% if royalties are requested but no percentage specified
      features
    };
  }

  /**
   * Get Marketplace schema based on requirements
   * @param requirements User requirements
   * @returns Marketplace schema
   */
  private getMarketplaceSchema(requirements: string) {
    const name = this.extractName(requirements, 'MyMarketplace');
    
    // Parse fee percentage if specified
    const feePercentage = this.parsePercentageValue(requirements, 'fee', 0);
    
    // Check for specific features
    const features = {
      listings: true, // Always include listings
      offers: this.hasFeature(requirements, 'offer') || this.hasFeature(requirements, 'bid'),
      auction: this.hasFeature(requirements, 'auction') || this.hasFeature(requirements, 'bidding'),
      escrow: this.hasFeature(requirements, 'escrow'),
      royalties: this.hasFeature(requirements, 'royalty') || this.hasFeature(requirements, 'royalties'),
      curation: this.hasFeature(requirements, 'curation') || this.hasFeature(requirements, 'curate'),
      dispute: this.hasFeature(requirements, 'dispute') || this.hasFeature(requirements, 'resolution'),
      upgradeable: this.hasFeature(requirements, 'upgrade') || this.hasFeature(requirements, 'upgradeability')
    };
    
    return {
      type: 'marketplace',
      name,
      feePercentage: feePercentage || 1, // Default to 1% if no fee specified
      feeRecipient: '0x0000000000000000000000000000000000000000', // Default to zero address
      features
    };
  }

  /**
   * Get DAO Governance schema based on requirements
   * @param requirements User requirements
   * @returns DAO schema
   */
  private getDAOSchema(requirements: string) {
    const name = this.extractName(requirements, 'MyDAO');
    
    // Parse threshold and majority values if specified
    const proposalThreshold = this.parseNumericValue(requirements, 'threshold', 0);
    const majorityPercentage = this.parsePercentageValue(requirements, 'majority', 0);
    
    // Check for specific features
    const features = {
      voting: true, // Always include voting
      proposals: true, // Always include proposals
      execution: true, // Always include execution
      timelock: this.hasFeature(requirements, 'timelock') || this.hasFeature(requirements, 'time lock'),
      delegation: this.hasFeature(requirements, 'delegate') || this.hasFeature(requirements, 'delegation'),
      quorum: this.hasFeature(requirements, 'quorum'),
      upgradeable: this.hasFeature(requirements, 'upgrade') || this.hasFeature(requirements, 'upgradeability')
    };
    
    return {
      type: 'dao',
      name,
      votingToken: '', // To be provided by the implementation
      proposalThreshold: proposalThreshold || 100000, // Default to 100,000 tokens
      majorityPercentage: majorityPercentage || 60, // Default to 60%
      votingPeriod: 3, // Default to 3 days
      features
    };
  }

  /**
   * Get a generic contract schema for when no specific type is detected
   * @param requirements User requirements
   * @returns Generic contract schema
   */
  private getGenericContractSchema(requirements: string) {
    const name = this.extractName(requirements, 'MyContract');
    
    return {
      type: 'generic',
      name,
      features: {
        ownable: true, // Default to ownable
        upgradeable: this.hasFeature(requirements, 'upgrade') || this.hasFeature(requirements, 'upgradeability')
      }
    };
  }
}