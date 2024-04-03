import { Emitter } from './Emitter';

const emitter = new Emitter();
const fetchCacheStore = new Map();

export class Fetcher {
  constructor({ client, options }) {
    this.client = client;
    this.options = options;
    this.state = {};
    this.count = 0;
    this.retry = 0;

    this.setState({
      data: options.initialData ?? null,
      error: null,
      isError: false,
      isFetching: true,
      isPending: true,
    });

    emitter.on(this.options.queryHash, this.options.subscribe);
  }

  setState(state) {
    this.state = Object.assign({}, this.state, state);
    this.options.subscribe(this.state);
  }

  setOptions(options) {
    if (options.queryHash !== this.options.queryHash) {
      emitter.off(this.options.queryHash, this.options.subscribe);
      emitter.on(options.queryHash, this.options.subscribe);
    }

    Object.assign(this.options, options);
  }

  fetch() {
    const { queryFn, queryHash, queryKey } = this.options;
    const cacheData = this.client.cacheStore.get(queryHash);

    this.setState({ error: null, isError: false, isFetching: true });

    if (cacheData) {
      this.setState({ data: cacheData.value, isPending: false, isFetching: cacheData.stale });
    }

    if (cacheData?.stale === false) return;

    const count = (this.count += 1);
    this.retry = 0;

    const run = () => {
      const promise = fetchCacheStore.get(queryHash) ?? queryFn({ queryKey });
      fetchCacheStore.set(queryHash, promise);

      promise.then(
        (data) => {
          fetchCacheStore.delete(queryHash);
          this.client.cacheStore.set(queryHash, data);

          if (count !== this.count) return;

          this.setState({ data, isPending: false, isFetching: false });
          emitter.emit(queryHash, { data });
        },
        (error) => {
          fetchCacheStore.delete(queryHash);

          if (count !== this.count) return;

          if (this.retry < this.options.retry) {
            this.retry += 1;
            const delay = this.options.retryDelay ?? Math.min(1000 * 2 ** this.retry, 30 * 1000);

            setTimeout(() => {
              if (count !== this.count) return;
              run();
            }, delay);
            return;
          }

          this.setState({ error, isError: true, isFetching: false, isPending: false });
        }
      );
    };

    run();
  }

  refetch() {
    this.fetch();
  }

  destroy() {
    this.count += 1;
    emitter.off(this.options.queryHash, this.options.subscribe);
  }
}
