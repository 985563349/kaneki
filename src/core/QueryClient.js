import { CacheStore } from './CacheStore';
import { Fetcher } from './Fetcher';

export class QueryClient {
  constructor(options = {}) {
    this.options = options;
    this.cacheStore = new CacheStore(this.options);
  }

  buildFetcher(options) {
    return new Fetcher({ client: this, options });
  }
}
