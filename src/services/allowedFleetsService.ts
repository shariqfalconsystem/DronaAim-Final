// services/allowedFleetsService.ts
import environment from '../environments/environment';

interface AllowedFleetsConfig {
  version: string;
  allowedFleets: string[];
}

const CACHE_KEY = 'allowedFleets';
const CACHE_TIMESTAMP_KEY = 'allowedFleetsTimestamp';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

class AllowedFleetsService {
  private s3Url: string;
  private allowedFleets: string[] = [];
  private isFetching: boolean = false;
  private fetchPromise: Promise<string[]> | null = null;

  constructor(s3Url: string) {
    this.s3Url = s3Url;
  }

  /**
   * Fetch allowed fleets from S3 bucket with caching
   */
  private async fetchFromS3(): Promise<string[]> {
    try {
      const response = await fetch(this.s3Url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch allowed fleets: ${response.statusText}`);
      }

      const data: AllowedFleetsConfig = await response.json();

      if (!data.allowedFleets || !Array.isArray(data.allowedFleets)) {
        throw new Error('Invalid allowed fleets configuration format');
      }

      return data.allowedFleets;
    } catch (error) {
      console.error('Error fetching allowed fleets from S3:', error);
      // Return empty array on error - fail closed
      return [];
    }
  }

  /**
   * Get cached allowed fleets if still valid
   */
  private getCachedFleets(): string[] | null {
    try {
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      const cachedTimestamp = sessionStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (!cachedData || !cachedTimestamp) {
        return null;
      }

      const timestamp = parseInt(cachedTimestamp, 10);
      const now = Date.now();

      // Check if cache is still valid
      if (now - timestamp < CACHE_DURATION) {
        return JSON.parse(cachedData);
      }

      // Cache expired, clear it
      this.clearCache();
      return null;
    } catch (error) {
      console.error('Error reading cached allowed fleets:', error);
      this.clearCache();
      return null;
    }
  }

  /**
   * Cache allowed fleets in sessionStorage
   */
  private cacheFleets(fleets: string[]): void {
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(fleets));
      sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error caching allowed fleets:', error);
    }
  }

  /**
   * Clear the cache
   */
  private clearCache(): void {
    try {
      sessionStorage.removeItem(CACHE_KEY);
      sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  /**
   * Get allowed fleets with caching
   */
  async getAllowedFleets(): Promise<string[]> {
    // Check cache first
    const cachedFleets = this.getCachedFleets();
    if (cachedFleets) {
      this.allowedFleets = cachedFleets;
      return cachedFleets;
    }

    // If already fetching, return the existing promise
    if (this.isFetching && this.fetchPromise) {
      return this.fetchPromise;
    }

    // Start fetching
    this.isFetching = true;
    this.fetchPromise = this.fetchFromS3()
      .then((fleets) => {
        this.allowedFleets = fleets;
        this.cacheFleets(fleets);
        return fleets;
      })
      .finally(() => {
        this.isFetching = false;
        this.fetchPromise = null;
      });

    return this.fetchPromise;
  }

  /**
   * Check if a lonestar ID is in the allowed list
   */
  async isFleetAllowed(lonestarId: string | null | undefined): Promise<boolean> {
    if (!lonestarId) {
      return false;
    }

    const allowedFleets = await this.getAllowedFleets();
    return allowedFleets.includes(lonestarId);
  }

  /**
   * Force refresh the allowed fleets list
   */
  async refreshAllowedFleets(): Promise<string[]> {
    this.clearCache();
    return this.getAllowedFleets();
  }

  /**
   * Get currently cached fleets synchronously (may be stale)
   */
  getCachedFleetsSync(): string[] {
    return this.allowedFleets;
  }
}

// Singleton instance - replace with your actual S3 URL
const S3_BUCKET_URL = environment.masterFleetsUrl;

export const allowedFleetsService = new AllowedFleetsService(S3_BUCKET_URL);
export default allowedFleetsService;
