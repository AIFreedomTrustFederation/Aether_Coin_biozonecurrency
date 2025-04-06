/**
 * Schema Manager Service
 * This service manages contract schemas and templates, including parameter substitution,
 * validation, and code generation.
 */

import { db } from '../../storage';
import { contractSchemas, contractTemplates } from '../../../shared/dapp-schema';
import { eq, desc } from 'drizzle-orm';

interface SchemaValidationResult {
  isValid: boolean;
  errors: string[];
}

interface GeneratedCode {
  code: string;
  testCode?: string;
  uiCode?: string;
  documentation?: string;
}

/**
 * Template parameter types for schema code generation
 */
export enum ParameterType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ADDRESS = 'address',
  ARRAY = 'array',
  ENUM = 'enum',
  OBJECT = 'object'
}

/**
 * Parameter definition for schema templates
 */
export interface ParameterDefinition {
  name: string;
  type: ParameterType;
  description: string;
  default?: any;
  required: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: string[];
  };
}

export class SchemaManager {
  /**
   * Get a contract schema by ID
   * @param schemaId Schema ID
   * @returns Contract schema
   */
  async getSchemaById(schemaId: number): Promise<any> {
    try {
      return await db.query.contractSchemas.findFirst({
        where: eq(contractSchemas.id, schemaId)
      });
    } catch (error) {
      console.error('Error getting schema by ID:', error);
      return null;
    }
  }

  /**
   * Get all schemas, optionally filtered by category
   * @param category Optional category filter
   * @returns Array of contract schemas
   */
  async getAllSchemas(category?: string): Promise<any[]> {
    try {
      let query;
      
      if (category) {
        query = db.query.contractSchemas.findMany({
          where: eq(contractSchemas.category, category)
        });
      } else {
        query = db.query.contractSchemas.findMany();
      }
      
      return await query;
    } catch (error) {
      console.error('Error getting schemas:', error);
      return [];
    }
  }

  /**
   * Validate parameters against a schema's parameter definitions
   * @param schemaId Schema ID
   * @param parameters Parameters to validate
   * @returns Validation result
   */
  async validateParameters(schemaId: number, parameters: Record<string, any>): Promise<SchemaValidationResult> {
    try {
      const schema = await db.query.contractSchemas.findFirst({
        where: eq(contractSchemas.id, schemaId)
      });
      
      if (!schema) {
        return {
          isValid: false,
          errors: ['Schema not found']
        };
      }
      
      const paramDefs = schema.parameters as ParameterDefinition[];
      const errors: string[] = [];
      
      // Check for required parameters
      paramDefs.forEach(param => {
        if (param.required && (parameters[param.name] === undefined || parameters[param.name] === null)) {
          errors.push(`Missing required parameter: ${param.name}`);
          return;
        }
        
        // Skip validation if parameter is not provided and not required
        if (parameters[param.name] === undefined || parameters[param.name] === null) {
          return;
        }
        
        // Type validation
        const value = parameters[param.name];
        switch (param.type) {
          case ParameterType.STRING:
            if (typeof value !== 'string') {
              errors.push(`Parameter ${param.name} must be a string`);
            } else if (param.validation?.pattern) {
              const regex = new RegExp(param.validation.pattern);
              if (!regex.test(value)) {
                errors.push(`Parameter ${param.name} doesn't match the required pattern`);
              }
            }
            break;
            
          case ParameterType.NUMBER:
            if (typeof value !== 'number') {
              errors.push(`Parameter ${param.name} must be a number`);
            } else {
              if (param.validation?.min !== undefined && value < param.validation.min) {
                errors.push(`Parameter ${param.name} must be at least ${param.validation.min}`);
              }
              
              if (param.validation?.max !== undefined && value > param.validation.max) {
                errors.push(`Parameter ${param.name} must be at most ${param.validation.max}`);
              }
            }
            break;
            
          case ParameterType.BOOLEAN:
            if (typeof value !== 'boolean') {
              errors.push(`Parameter ${param.name} must be a boolean`);
            }
            break;
            
          case ParameterType.ADDRESS:
            // Basic Ethereum address validation
            if (typeof value !== 'string' || !value.match(/^0x[a-fA-F0-9]{40}$/)) {
              errors.push(`Parameter ${param.name} must be a valid Ethereum address`);
            }
            break;
            
          case ParameterType.ARRAY:
            if (!Array.isArray(value)) {
              errors.push(`Parameter ${param.name} must be an array`);
            }
            break;
            
          case ParameterType.ENUM:
            if (param.validation?.options && !param.validation.options.includes(value)) {
              errors.push(`Parameter ${param.name} must be one of: ${param.validation.options.join(', ')}`);
            }
            break;
        }
      });
      
      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error) {
      console.error('Error validating parameters:', error);
      return {
        isValid: false,
        errors: ['Error validating parameters']
      };
    }
  }

  /**
   * Apply parameters to a schema to generate code
   * @param schemaId Schema ID
   * @param parameters Parameters to apply
   * @returns Generated code
   */
  async applyParameters(schemaId: number, parameters: Record<string, any>): Promise<GeneratedCode | null> {
    try {
      // Validate parameters
      const validationResult = await this.validateParameters(schemaId, parameters);
      
      if (!validationResult.isValid) {
        console.error('Parameter validation failed:', validationResult.errors);
        return null;
      }
      
      // Get the schema
      const schema = await this.getSchemaById(schemaId);
      
      if (!schema) {
        console.error('Schema not found');
        return null;
      }
      
      // Set default values for missing parameters
      const paramDefs = schema.parameters as ParameterDefinition[];
      const finalParams: Record<string, any> = {};
      
      paramDefs.forEach(param => {
        if (parameters[param.name] !== undefined) {
          finalParams[param.name] = parameters[param.name];
        } else if (param.default !== undefined) {
          finalParams[param.name] = param.default;
        }
      });
      
      // Apply parameters to the base code template using string replacement
      let code = schema.baseCode;
      
      // Replace template variables in the form {{paramName}}
      for (const [key, value] of Object.entries(finalParams)) {
        const placeholder = new RegExp(`{{${key}}}`, 'g');
        code = code.replace(placeholder, String(value));
      }
      
      // Also apply parameters to test cases, if any
      let testCode;
      if (schema.testCases) {
        testCode = schema.testCases.baseCode || '';
        
        // Replace template variables in the test code
        for (const [key, value] of Object.entries(finalParams)) {
          const placeholder = new RegExp(`{{${key}}}`, 'g');
          testCode = testCode.replace(placeholder, String(value));
        }
      }
      
      // Apply parameters to UI components, if any
      let uiCode;
      if (schema.uiComponents) {
        uiCode = schema.uiComponents.baseCode || '';
        
        // Replace template variables in the UI code
        for (const [key, value] of Object.entries(finalParams)) {
          const placeholder = new RegExp(`{{${key}}}`, 'g');
          uiCode = uiCode.replace(placeholder, String(value));
        }
      }
      
      return {
        code,
        testCode,
        uiCode
      };
    } catch (error) {
      console.error('Error applying parameters:', error);
      return null;
    }
  }

  /**
   * Create a new contract schema
   * @param name Schema name
   * @param description Schema description
   * @param category Schema category
   * @param baseCode Base code template
   * @param parameters Parameter definitions
   * @param dependencies Schema dependencies
   * @param securityConsiderations Security considerations
   * @param testCases Test case templates
   * @param uiComponents UI component templates
   * @returns Created schema
   */
  async createSchema(
    name: string,
    description: string,
    category: string,
    baseCode: string,
    parameters: ParameterDefinition[],
    dependencies: Record<string, any>,
    securityConsiderations: Record<string, any>,
    testCases: Record<string, any>,
    uiComponents: Record<string, any>
  ): Promise<any> {
    try {
      const schema = await db
        .insert(contractSchemas)
        .values({
          name,
          description,
          category,
          compatibility: ['ethereum', 'polygon', 'arbitrum'],
          parameters,
          dependencies,
          securityConsiderations,
          baseCode,
          testCases,
          uiComponents,
          version: '1.0.0',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return schema[0];
    } catch (error) {
      console.error('Error creating schema:', error);
      throw error;
    }
  }

  /**
   * Create a new contract template based on a schema
   * @param schemaId Schema ID
   * @param name Template name
   * @param description Template description
   * @param templateCode Template code
   * @param parameters Parameter definitions
   * @returns Created template
   */
  async createTemplate(
    schemaId: number,
    name: string,
    description: string,
    templateCode: string,
    parameters: ParameterDefinition[]
  ): Promise<any> {
    try {
      const template = await db
        .insert(contractTemplates)
        .values({
          schemaId,
          name,
          description,
          templateCode,
          parameters,
          popularity: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return template[0];
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  /**
   * Get a list of templates for a schema
   * @param schemaId Schema ID
   * @returns Array of templates
   */
  async getTemplatesBySchema(schemaId: number): Promise<any[]> {
    try {
      const templates = await db.query.contractTemplates.findMany({
        where: eq(contractTemplates.schemaId, schemaId)
      });
      
      return templates;
    } catch (error) {
      console.error('Error getting templates by schema:', error);
      return [];
    }
  }

  /**
   * Generate documentation for a schema
   * @param schemaId Schema ID
   * @param parameters Parameters for customizing the documentation
   * @returns Generated documentation
   */
  async generateDocumentation(schemaId: number, parameters: Record<string, any>): Promise<string | null> {
    try {
      const schema = await this.getSchemaById(schemaId);
      
      if (!schema) {
        console.error('Schema not found');
        return null;
      }
      
      // Generate basic documentation template
      let doc = `# ${parameters.contractName || schema.name}

## Overview
${schema.description}

## Parameters

`;
      
      const paramDefs = schema.parameters as ParameterDefinition[];
      paramDefs.forEach(param => {
        const paramValue = parameters[param.name] !== undefined ? 
          parameters[param.name] : 
          param.default !== undefined ? param.default : 'Not specified';
        
        doc += `### ${param.name}
- Type: ${param.type}
- Description: ${param.description}
- Value: \`${JSON.stringify(paramValue)}\`
${param.required ? '- Required: Yes' : '- Required: No'}

`;
      });
      
      doc += `## Security Considerations

${schema.securityConsiderations.description || ''}

### Security Checklist
${(schema.securityConsiderations.checklist || []).map((item: string) => `- ${item}`).join('\n')}

## Dependencies
${Object.entries(schema.dependencies).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

## Usage Examples

\`\`\`solidity
// Example usage of ${parameters.contractName || schema.name}
// Deploy this contract to interact with it
\`\`\`

## Testing Guide

\`\`\`javascript
// Example test for ${parameters.contractName || schema.name}
// Run using your preferred testing framework
\`\`\`
`;
      
      return doc;
    } catch (error) {
      console.error('Error generating documentation:', error);
      return null;
    }
  }
}

export const schemaManager = new SchemaManager();