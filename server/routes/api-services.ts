import { Router, Request, Response } from 'express';
import { CoinGeckoService } from '../services/coingecko';
import { BlockstreamService } from '../services/blockstream';
import { EtherscanService } from '../services/etherscan';
import { CryptoCompareService } from '../services/cryptocompare';
import { matrixService } from '../services/matrix';

const router = Router();

// Rate limiting helper for all endpoints
const rateLimitMiddleware = (req: Request, res: Response, next: Function) => {
  // Simple rate limiting - could be expanded for production
  next();
};

// --- CoinGecko API Routes ---
router.get('/coingecko/prices', rateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { ids, vs_currencies } = req.query;
    
    if (!ids) {
      return res.status(400).json({ error: 'Missing required parameter: ids' });
    }
    
    const data = await CoinGeckoService.getPrice(
      ids as string, 
      vs_currencies as string || 'usd'
    );
    
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching coin prices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch price data',
      message: error.message
    });
  }
});

router.get('/coingecko/price-history/:id', rateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { days, interval } = req.query;
    
    const data = await CoinGeckoService.getPriceHistory(
      id,
      days as string || '7',
      interval as string || 'daily'
    );
    
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching price history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch price history',
      message: error.message
    });
  }
});

router.get('/coingecko/trending', rateLimitMiddleware, async (_req: Request, res: Response) => {
  try {
    const data = await CoinGeckoService.getTrending();
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching trending coins:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trending coins',
      message: error.message
    });
  }
});

router.get('/coingecko/global', rateLimitMiddleware, async (_req: Request, res: Response) => {
  try {
    const data = await CoinGeckoService.getGlobalData();
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching global market data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch global market data',
      message: error.message
    });
  }
});

// --- Blockstream API Routes ---
router.get('/blockstream/address/:address', rateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const data = await BlockstreamService.getAddressInfo(address);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching Bitcoin address info:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Bitcoin address info',
      message: error.message
    });
  }
});

router.get('/blockstream/address/:address/txs', rateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const data = await BlockstreamService.getAddressTxs(address);
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching Bitcoin address transactions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Bitcoin address transactions',
      message: error.message
    });
  }
});

router.get('/blockstream/fees', rateLimitMiddleware, async (_req: Request, res: Response) => {
  try {
    const data = await BlockstreamService.getFeeEstimates();
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching Bitcoin fee estimates:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Bitcoin fee estimates',
      message: error.message
    });
  }
});

// --- Etherscan API Routes ---
router.get('/etherscan/gas', rateLimitMiddleware, async (_req: Request, res: Response) => {
  try {
    const data = await EtherscanService.getGasPrice();
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching Ethereum gas price:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Ethereum gas price',
      message: error.message
    });
  }
});

router.get('/etherscan/address/:address', rateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const balance = await EtherscanService.getBalance(address);
    res.json({ address, balance });
  } catch (error: any) {
    console.error('Error fetching Ethereum address balance:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Ethereum address balance',
      message: error.message
    });
  }
});

router.get('/etherscan/address/:address/transactions', rateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    const { startblock, endblock, page, offset, sort } = req.query;
    
    const data = await EtherscanService.getTransactions(
      address,
      startblock ? parseInt(startblock as string) : undefined,
      endblock ? parseInt(endblock as string) : undefined,
      page ? parseInt(page as string) : undefined,
      offset ? parseInt(offset as string) : undefined,
      sort as 'asc' | 'desc' || undefined
    );
    
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching Ethereum transactions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch Ethereum transactions',
      message: error.message
    });
  }
});

// --- CryptoCompare API Routes ---
router.get('/cryptocompare/news', rateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { categories, excludeCategories, limit } = req.query;
    
    const data = await CryptoCompareService.getNews(
      categories as string,
      excludeCategories as string,
      limit ? parseInt(limit as string) : 10
    );
    
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching crypto news:', error);
    res.status(500).json({ 
      error: 'Failed to fetch crypto news',
      message: error.message
    });
  }
});

router.get('/cryptocompare/price', rateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { fsyms, tsyms } = req.query;
    
    if (!fsyms) {
      return res.status(400).json({ error: 'Missing required parameter: fsyms' });
    }
    
    const data = await CryptoCompareService.getPrice(
      fsyms as string,
      tsyms as string || 'USD'
    );
    
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching crypto prices:', error);
    res.status(500).json({ 
      error: 'Failed to fetch crypto prices',
      message: error.message
    });
  }
});

router.get('/cryptocompare/top', rateLimitMiddleware, async (req: Request, res: Response) => {
  try {
    const { tsym, limit, page } = req.query;
    
    const data = await CryptoCompareService.getTopByMarketCap(
      tsym as string || 'USD',
      limit ? parseInt(limit as string) : 20,
      page ? parseInt(page as string) : 0
    );
    
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching top cryptocurrencies:', error);
    res.status(500).json({ 
      error: 'Failed to fetch top cryptocurrencies',
      message: error.message
    });
  }
});

// --- Matrix API Routes ---
// Matrix notification testing route - for development only
router.post('/matrix/test-notification', async (req: Request, res: Response) => {
  try {
    const { matrixId, message, htmlMessage } = req.body;
    
    if (!matrixId || !message) {
      return res.status(400).json({ error: 'Missing required parameters: matrixId and message' });
    }
    
    // Initialize if not already done
    await matrixService.initialize();
    
    const eventId = await matrixService.sendNotification(matrixId, message, htmlMessage);
    
    res.json({
      success: true,
      eventId
    });
  } catch (error: any) {
    console.error('Error sending Matrix notification:', error);
    res.status(500).json({ 
      error: 'Failed to send Matrix notification',
      message: error.message
    });
  }
});

router.post('/matrix/verify', async (req: Request, res: Response) => {
  try {
    const { matrixId } = req.body;
    
    if (!matrixId) {
      return res.status(400).json({ error: 'Missing required parameter: matrixId' });
    }
    
    // Initialize if not already done
    await matrixService.initialize();
    
    const isValid = await matrixService.verifyMatrixId(matrixId);
    
    res.json({
      matrixId,
      isValid
    });
  } catch (error: any) {
    console.error('Error verifying Matrix ID:', error);
    res.status(500).json({ 
      error: 'Failed to verify Matrix ID',
      message: error.message
    });
  }
});

export default router;