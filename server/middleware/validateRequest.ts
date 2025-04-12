import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

// Middleware to validate request body against a Zod schema
export const validateRequest = (schema: AnyZodObject) => 
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body against the schema
      const validatedData = await schema.parseAsync(req.body);
      
      // Replace request body with validated data
      req.body = validatedData;
      
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        // Convert to user-friendly error messages
        const validationError = fromZodError(error);
        return res.status(400).json({ 
          error: 'Validation Error', 
          details: validationError.details 
        });
      }
      
      // Handle other errors
      console.error('Validation error:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };