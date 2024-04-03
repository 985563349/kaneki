const DEFAULT_STALE_TIME = 0;

const DEFAULT_CACHE_TIME = 5 * 60 * 1000;

export class CacheStore {
  #staleTime;
  #cacheTime;
  #store;

  constructor(options = {}) {
    this.#staleTime = options.staleTime ?? DEFAULT_STALE_TIME;
    this.#cacheTime = options.cacheTime ?? DEFAULT_CACHE_TIME;
    this.#store = new Map();
  }

  set(key, value, options = {}) {
    const { staleTime = this.#staleTime, cacheTime = this.#cacheTime } = options;

    this.gc();

    return this.#store.set(key, {
      value,
      lastModify: Date.now(),
      cacheTime,
      staleTime,
      stale: false,
    });
  }

  get(key) {
    const value = this.#store.get(key);

    if (value) {
      value.stale = Date.now() - value.lastModify >= value.staleTime;
    }

    return value;
  }

  has(key) {
    return this.#store.has(key);
  }

  delete(key) {
    return this.#store.delete(key);
  }

  gc() {
    Promise.resolve().then(() => {
      this.store.forEach((value, key) => {
        if (Date.now() >= value.lastModify + value.cacheTime) {
          this.delete(key);
        }
      });
    });
  }
}
