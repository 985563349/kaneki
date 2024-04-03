export class CacheStore {
  constructor({ staleTime = 0, cacheTime = 5 * 60 * 1000 } = {}) {
    this.staleTime = staleTime;
    this.cacheTime = cacheTime;
    this.store = new Map();
  }

  set(key, value, options) {
    const { staleTime = this.staleTime, cacheTime = this.cacheTime } = options ?? {};

    this.gc();

    return this.store.set(key, {
      value,
      lastModify: Date.now(),
      cacheTime,
      staleTime,
      stale: false,
    });
  }

  get(key) {
    const value = this.store.get(key);

    if (value) {
      value.stale = Date.now() - value.lastModify >= value.staleTime;
    }

    return value;
  }

  has(key) {
    return this.store.has(key);
  }

  delete(key) {
    return this.store.delete(key);
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
