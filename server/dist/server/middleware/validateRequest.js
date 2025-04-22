"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const zod_validation_error_1 = require("zod-validation-error");
// Middleware to validate request body against a Zod schema
const validateRequest = (schema) => async (req, res, next) => {
    try {
        // Validate request body against the schema
        const validatedData = await schema.parseAsync(req.body);
        // Replace request body with validated data
        req.body = validatedData;
        next();
    }
    catch (error) {
        // Handle Zod validation errors
        if (error instanceof zod_1.ZodError) {
            // Convert to user-friendly error messages
            const validationError = (0, zod_validation_error_1.fromZodError)(error);
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
exports.validateRequest = validateRequest;
