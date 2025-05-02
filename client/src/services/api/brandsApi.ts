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
}

export default BrandsApi;