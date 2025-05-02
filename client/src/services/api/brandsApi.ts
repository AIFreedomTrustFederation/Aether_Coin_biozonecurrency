import ApiClient from './apiClient';

// Brand interfaces for stronger typing
export interface Brand {
  id: number;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  website: string;
  technologies: string[];
  sampleProducts: string[];
  features: string[];
  enhancedDescription?: string;
}

// For technology trends API response
export interface TechnologyTrend {
  title: string;
  description: string;
}

export interface TrendsResponse {
  brand: Brand;
  trends: TechnologyTrend[];
}

// For feature recommendations API response
export interface FeatureRecommendation {
  name: string;
  description: string;
  businessImpact: string;
}

/**
 * BrandsApi - Interface for brand-related API endpoints
 * Follows the same pattern as other API services like FractalCoinApi and GitHubApi
 */
class BrandsApi {
  private apiClient: ApiClient;
  
  constructor(baseURL: string = '/api') {
    this.apiClient = new ApiClient(baseURL);
  }
  
  /**
   * Get all available brands
   */
  async getAllBrands(): Promise<Brand[]> {
    const response = await this.apiClient.client.get('/brands');
    return response.data;
  }
  
  /**
   * Get a specific brand by slug
   */
  async getBrandBySlug(slug: string): Promise<Brand> {
    const response = await this.apiClient.client.get(`/brands/${slug}`);
    return response.data;
  }
  
  /**
   * Get a specific brand by id
   */
  async getBrandById(id: number): Promise<Brand> {
    const response = await this.apiClient.client.get(`/brands/id/${id}`);
    return response.data;
  }
  
  /**
   * Filter brands by various criteria
   */
  async filterBrands(filters: {
    technology?: string;
    keyword?: string;
  }): Promise<Brand[]> {
    const response = await this.apiClient.client.get('/brands', {
      params: filters
    });
    return response.data;
  }
  
  /**
   * Get enhanced description for a brand using AI
   */
  async getEnhancedBrand(slug: string): Promise<Brand> {
    try {
      const response = await this.apiClient.client.get(`/brands/${slug}/enhanced`);
      return response.data;
    } catch (error) {
      console.error('Error fetching enhanced brand description:', error);
      // Fallback to regular brand data if AI enhancement fails
      const fallbackResponse = await this.apiClient.client.get(`/brands/${slug}`);
      return fallbackResponse.data;
    }
  }
  
  /**
   * Get technology trends for a brand using AI
   */
  async getBrandTrends(slug: string): Promise<TrendsResponse> {
    const response = await this.apiClient.client.get(`/brands/${slug}/trends`);
    return response.data;
  }
  
  /**
   * Get subdomain URL for a specific brand
   */
  getSubdomainUrl(slug: string): string {
    return `https://${slug}.aifreedomtrust.com`;
  }
}

export default BrandsApi;