/**
 * NLP Processor Service
 * This service processes natural language inputs into structured contract requirements,
 * extracts intents, entities, and relationships, and manages the conversation history.
 */

import { db } from '../../storage';
import { conversationMessages, dappCreationChats } from '../../../shared/dapp-schema';
import { eq, desc, and, sql } from 'drizzle-orm';

interface EntityData {
  name: string;
  entityType: string;
  confidence: number;
  properties: string[];
  relationships: {
    entity: string;
    relation: string;
  }[];
}

interface IntentAnalysis {
  intent: string;
  confidence: number;
  entities: EntityData[];
  actions: string[];
  constraints: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  tokenStandard?: string;
  suggestedTemplate?: string;
}

export class NlpProcessor {
  /**
   * Process a natural language input into structured contract requirements
   * @param input Natural language input
   * @returns Processed requirements
   */
  async processInput(input: string): Promise<IntentAnalysis> {
    try {
      // In a real implementation, this would call an LLM API like GPT-4
      // For now, we'll use some simple keyword extraction and heuristics
      
      // Analyze intent
      const intent = this.extractIntent(input);
      
      // Extract entities
      const entities = this.extractEntities(input);
      
      // Extract actions
      const actions = this.extractActions(input);
      
      // Extract constraints
      const constraints = this.extractConstraints(input);
      
      // Estimate complexity
      const complexity = this.estimateComplexity(entities, actions, constraints);
      
      // Detect token standard if applicable
      const tokenStandard = this.detectTokenStandard(input);
      
      // Suggest template if applicable
      const suggestedTemplate = this.suggestTemplate(intent, entities, tokenStandard);
      
      return {
        intent,
        confidence: 0.85, // Would be provided by the LLM in real implementation
        entities,
        actions,
        constraints,
        complexity,
        tokenStandard,
        suggestedTemplate
      };
    } catch (error) {
      console.error('Error processing NLP input:', error);
      // Return a minimal valid structure in case of error
      return {
        intent: 'unknown',
        confidence: 0,
        entities: [],
        actions: [],
        constraints: [],
        complexity: 'simple'
      };
    }
  }

  /**
   * Extract the primary intent from the input
   * @param input Natural language input
   * @returns Extracted intent
   */
  private extractIntent(input: string): string {
    const input_lower = input.toLowerCase();
    
    if (input_lower.includes('token') || input_lower.includes('erc20') || input_lower.includes('coin')) {
      return 'TokenCreation';
    } else if (input_lower.includes('nft') || input_lower.includes('collectible') || input_lower.includes('erc721')) {
      return 'NFTCreation';
    } else if (input_lower.includes('marketplace') || input_lower.includes('auction') || input_lower.includes('buy') || input_lower.includes('sell')) {
      return 'Marketplace';
    } else if (input_lower.includes('dao') || input_lower.includes('governance') || input_lower.includes('vote')) {
      return 'Governance';
    } else if (input_lower.includes('staking') || input_lower.includes('yield') || input_lower.includes('farming')) {
      return 'Staking';
    } else if (input_lower.includes('bridge') || input_lower.includes('cross-chain') || input_lower.includes('multichain')) {
      return 'Bridge';
    } else if (input_lower.includes('swap') || input_lower.includes('exchange') || input_lower.includes('liquidity')) {
      return 'Exchange';
    } else if (input_lower.includes('multisig') || input_lower.includes('wallet') || input_lower.includes('safe')) {
      return 'MultiSigWallet';
    } else {
      return 'CustomContract';
    }
  }

  /**
   * Extract entities from the input
   * @param input Natural language input
   * @returns Array of extracted entities
   */
  private extractEntities(input: string): EntityData[] {
    const entities: EntityData[] = [];
    const input_lower = input.toLowerCase();
    
    // Token entity detection
    if (input_lower.includes('token') || input_lower.includes('coin')) {
      const name = this.extractEntityName(input, ['token', 'coin']) || 'Token';
      
      entities.push({
        name,
        entityType: 'Token',
        confidence: 0.9,
        properties: ['name', 'symbol', 'totalSupply', 'decimals'],
        relationships: []
      });
    }
    
    // NFT entity detection
    if (input_lower.includes('nft') || input_lower.includes('collectible')) {
      const name = this.extractEntityName(input, ['nft', 'collectible']) || 'NFT';
      
      entities.push({
        name,
        entityType: 'NFT',
        confidence: 0.9,
        properties: ['name', 'symbol', 'tokenURI', 'tokenId'],
        relationships: []
      });
    }
    
    // User entity detection
    if (input_lower.includes('user') || input_lower.includes('account') || input_lower.includes('wallet')) {
      entities.push({
        name: 'User',
        entityType: 'Actor',
        confidence: 0.85,
        properties: ['address', 'balance'],
        relationships: []
      });
    }
    
    // Owner entity detection
    if (input_lower.includes('owner') || input_lower.includes('admin')) {
      entities.push({
        name: 'Owner',
        entityType: 'Actor',
        confidence: 0.85,
        properties: ['address', 'permissions'],
        relationships: []
      });
    }
    
    // Marketplace entity detection
    if (input_lower.includes('marketplace') || input_lower.includes('market') || input_lower.includes('exchange')) {
      entities.push({
        name: 'Marketplace',
        entityType: 'Platform',
        confidence: 0.85,
        properties: ['fee', 'treasuryAddress', 'listings'],
        relationships: []
      });
    }
    
    // Add relationships between entities
    if (entities.length > 1) {
      for (let i = 0; i < entities.length; i++) {
        for (let j = 0; j < entities.length; j++) {
          if (i !== j) {
            // Define relationships based on entity types
            if (entities[i].entityType === 'Actor' && entities[j].entityType === 'Token') {
              entities[i].relationships.push({
                entity: entities[j].name,
                relation: 'owns'
              });
            } else if (entities[i].entityType === 'Platform' && 
                       (entities[j].entityType === 'Token' || entities[j].entityType === 'NFT')) {
              entities[i].relationships.push({
                entity: entities[j].name,
                relation: 'lists'
              });
            }
          }
        }
      }
    }
    
    return entities;
  }

  /**
   * Extract actions from the input
   * @param input Natural language input
   * @returns Array of extracted actions
   */
  private extractActions(input: string): string[] {
    const actions: string[] = [];
    const input_lower = input.toLowerCase();
    
    // Common token actions
    if (input_lower.includes('mint') || input_lower.includes('create') || input_lower.includes('issue')) {
      actions.push('mint');
    }
    
    if (input_lower.includes('burn') || input_lower.includes('destroy')) {
      actions.push('burn');
    }
    
    if (input_lower.includes('transfer') || input_lower.includes('send') || input_lower.includes('move')) {
      actions.push('transfer');
    }
    
    if (input_lower.includes('approve') || input_lower.includes('allowance')) {
      actions.push('approve');
    }
    
    // Market actions
    if (input_lower.includes('buy') || input_lower.includes('purchase')) {
      actions.push('buy');
    }
    
    if (input_lower.includes('sell') || input_lower.includes('list')) {
      actions.push('sell');
    }
    
    if (input_lower.includes('auction') || input_lower.includes('bid')) {
      actions.push('createAuction');
      actions.push('placeBid');
    }
    
    // Governance actions
    if (input_lower.includes('vote') || input_lower.includes('proposal')) {
      actions.push('createProposal');
      actions.push('vote');
    }
    
    // Staking actions
    if (input_lower.includes('stake') || input_lower.includes('deposit')) {
      actions.push('stake');
    }
    
    if (input_lower.includes('unstake') || input_lower.includes('withdraw')) {
      actions.push('unstake');
    }
    
    if (input_lower.includes('claim') || input_lower.includes('reward')) {
      actions.push('claimRewards');
    }
    
    // If no specific actions were detected, add some default ones based on intent
    if (actions.length === 0) {
      const intent = this.extractIntent(input);
      
      switch (intent) {
        case 'TokenCreation':
          actions.push('mint', 'transfer', 'burn');
          break;
        case 'NFTCreation':
          actions.push('mint', 'transfer', 'getTokenURI');
          break;
        case 'Marketplace':
          actions.push('listItem', 'buyItem', 'cancelListing');
          break;
        case 'Governance':
          actions.push('propose', 'vote', 'execute');
          break;
        case 'Staking':
          actions.push('stake', 'unstake', 'getReward');
          break;
        default:
          actions.push('initialize', 'execute');
      }
    }
    
    return actions;
  }

  /**
   * Extract constraints from the input
   * @param input Natural language input
   * @returns Array of extracted constraints
   */
  private extractConstraints(input: string): string[] {
    const constraints: string[] = [];
    const input_lower = input.toLowerCase();
    
    // Access control constraints
    if (input_lower.includes('only owner') || input_lower.includes('admin only') || input_lower.includes('owner only')) {
      constraints.push('Only owner can perform certain actions');
    }
    
    // Time constraints
    if (input_lower.includes('lock') || input_lower.includes('time limit') || input_lower.includes('deadline')) {
      constraints.push('Time-based restrictions on certain actions');
    }
    
    // Amount constraints
    if (input_lower.includes('maximum') || input_lower.includes('minimum') || input_lower.includes('limit')) {
      constraints.push('Amount-based restrictions on certain actions');
    }
    
    // Pausability
    if (input_lower.includes('pause') || input_lower.includes('emergency')) {
      constraints.push('Contract can be paused in emergency situations');
    }
    
    // Upgradability
    if (input_lower.includes('upgrade') || input_lower.includes('proxy')) {
      constraints.push('Contract can be upgraded');
    }
    
    return constraints;
  }

  /**
   * Estimate the complexity of the contract based on requirements
   * @param entities Extracted entities
   * @param actions Extracted actions
   * @param constraints Extracted constraints
   * @returns Complexity estimation
   */
  private estimateComplexity(
    entities: EntityData[],
    actions: string[],
    constraints: string[]
  ): 'simple' | 'moderate' | 'complex' {
    const totalComplexity = entities.length + actions.length + constraints.length;
    
    if (totalComplexity <= 5) {
      return 'simple';
    } else if (totalComplexity <= 10) {
      return 'moderate';
    } else {
      return 'complex';
    }
  }

  /**
   * Detect the token standard if applicable
   * @param input Natural language input
   * @returns Detected token standard or undefined
   */
  private detectTokenStandard(input: string): string | undefined {
    const input_lower = input.toLowerCase();
    
    if (input_lower.includes('erc20')) {
      return 'ERC20';
    } else if (input_lower.includes('erc721')) {
      return 'ERC721';
    } else if (input_lower.includes('erc1155')) {
      return 'ERC1155';
    } else if (input_lower.includes('token') && !input_lower.includes('nft')) {
      return 'ERC20';
    } else if (input_lower.includes('nft') || input_lower.includes('collectible')) {
      return 'ERC721';
    } else if (input_lower.includes('multi-token') || input_lower.includes('multitoken')) {
      return 'ERC1155';
    }
    
    return undefined;
  }

  /**
   * Suggest a template based on the detected intent and entities
   * @param intent Detected intent
   * @param entities Extracted entities
   * @param tokenStandard Detected token standard
   * @returns Suggested template name or undefined
   */
  private suggestTemplate(
    intent: string,
    entities: EntityData[],
    tokenStandard?: string
  ): string | undefined {
    switch (intent) {
      case 'TokenCreation':
        return tokenStandard === 'ERC20' ? 'StandardERC20Token' : 'CustomToken';
        
      case 'NFTCreation':
        return tokenStandard === 'ERC721' ? 'StandardERC721NFT' : 'CustomNFT';
        
      case 'Marketplace':
        const hasNFT = entities.some(e => e.entityType === 'NFT');
        return hasNFT ? 'NFTMarketplace' : 'TokenMarketplace';
        
      case 'Governance':
        return 'DAOGovernance';
        
      case 'Staking':
        return 'TokenStaking';
        
      case 'MultiSigWallet':
        return 'MultiSigWallet';
        
      default:
        return undefined;
    }
  }

  /**
   * Extract entity name from the input based on keywords
   * @param input Natural language input
   * @param keywords Keywords to look for
   * @returns Extracted entity name or undefined
   */
  private extractEntityName(input: string, keywords: string[]): string | undefined {
    const words = input.split(/\s+/);
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i].toLowerCase();
      
      if (keywords.includes(word) && i > 0) {
        // Check if previous word could be an adjective for the entity
        // This is a simple heuristic and would be more sophisticated in a real NLP system
        return words[i - 1];
      }
    }
    
    // If no name is found, look for words that are likely to be proper nouns
    for (const word of words) {
      if (word.length > 1 && word[0] === word[0].toUpperCase() && word[1] === word[1].toLowerCase()) {
        return word;
      }
    }
    
    return undefined;
  }

  /**
   * Save conversation message for training and auditing
   * @param userId User ID
   * @param message Message content
   * @param sender Message sender
   * @param intent Detected intent
   * @param entities Detected entities
   * @returns Saved message
   */
  async saveConversation(
    userId: number,
    message: string,
    sender: 'user' | 'mysterion',
    intent?: string,
    entities?: EntityData[]
  ): Promise<any> {
    try {
      // First, check if there's an active chat for this user
      let chatId: number | null = null;
      
      const existingChat = await db.query.dappCreationChats.findFirst({
        where: and(
          eq(dappCreationChats.userId, userId),
          eq(dappCreationChats.status, 'active')
        ),
        orderBy: [desc(dappCreationChats.startedAt)]
      });
      
      if (existingChat) {
        chatId = existingChat.id;
      } else if (sender === 'user' && intent) {
        // Create a new chat if this is a user message with intent
        const newChat = await db
          .insert(dappCreationChats)
          .values({
            userId,
            intent: intent || 'general',
            complexity: 'simple',
            status: 'active',
            startedAt: new Date()
          })
          .returning();
        
        chatId = newChat[0].id;
      }
      
      // Save the message
      const savedMessage = await db
        .insert(conversationMessages)
        .values({
          userId,
          dappId: chatId,
          message,
          sender,
          intent: intent || null,
          entities: entities || null,
          timestamp: new Date(),
          processed: false
        })
        .returning();
      
      // Update the chat's last message time
      if (chatId) {
        await db
          .update(dappCreationChats)
          .set({
            lastMessageAt: new Date()
          })
          .where(eq(dappCreationChats.id, chatId));
      }
      
      return savedMessage[0];
    } catch (error) {
      console.error('Error saving conversation:', error);
      return null;
    }
  }

  /**
   * Get conversation history for a user
   * @param userId User ID
   * @param limit Maximum number of messages to retrieve
   * @returns Array of conversation messages
   */
  async getConversationHistory(userId: number, limit: number = 10): Promise<any[]> {
    try {
      const messages = await db.query.conversationMessages.findMany({
        where: eq(conversationMessages.userId, userId),
        orderBy: [desc(conversationMessages.timestamp)],
        limit
      });
      
      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return [];
    }
  }

  /**
   * Get conversation history for a specific DApp creation
   * @param userId User ID
   * @param dappId DApp ID
   * @returns Array of conversation messages
   */
  async getDappConversation(userId: number, dappId: number): Promise<any[]> {
    try {
      const messages = await db.query.conversationMessages.findMany({
        where: and(
          eq(conversationMessages.userId, userId),
          eq(conversationMessages.dappId, dappId)
        ),
        orderBy: [desc(conversationMessages.timestamp)]
      });
      
      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error getting DApp conversation:', error);
      return [];
    }
  }
}

export const nlpProcessor = new NlpProcessor();