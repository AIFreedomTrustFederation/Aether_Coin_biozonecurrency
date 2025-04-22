"use strict";
/**
 * AI Freedom Trust Framework API Routes
 * Main router that combines all route modules
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mysterion_1 = __importDefault(require("./mysterion"));
const agents_1 = __importDefault(require("./agents"));
const rewards_1 = __importDefault(require("./rewards"));
const training_data_1 = __importDefault(require("./training-data"));
const router = express_1.default.Router();
// Register all route modules
router.use('/mysterion', mysterion_1.default);
router.use('/agents', agents_1.default);
router.use('/rewards', rewards_1.default);
router.use('/training-data', training_data_1.default);
// Base API info route
router.get('/', (req, res) => {
    res.json({
        name: 'AI Freedom Trust Framework API',
        version: '1.0.0',
        components: [
            {
                name: 'Mysterion Intelligence System',
                endpoints: '/mysterion/*',
                description: 'Knowledge graph and self-improvement system'
            },
            {
                name: 'Autonomous Agent System',
                endpoints: '/agents/*',
                description: 'Agent management and coordination system'
            },
            {
                name: 'Computational Rewards System',
                endpoints: '/rewards/*',
                description: 'FractalCoin and AICoin reward mechanisms'
            },
            {
                name: 'Training Data Bridge',
                endpoints: '/training-data/*',
                description: 'LLM training data management with Filecoin integration'
            }
        ],
        documentation: '/api/docs'
    });
});
// Documentation route - would be implemented with OpenAPI/Swagger in a real application
router.get('/docs', (req, res) => {
    res.json({
        message: 'API documentation is available at https://docs.aifreedomtrust.org/api',
        // In a real implementation, this would serve OpenAPI/Swagger documentation
    });
});
// Status/health check endpoint
router.get('/status', (req, res) => {
    res.json({
        status: 'healthy',
        serverTime: new Date().toISOString(),
        components: {
            mysterion: 'operational',
            agents: 'operational',
            rewards: 'operational',
            trainingData: 'operational',
            database: 'connected'
        }
    });
});
exports.default = router;
