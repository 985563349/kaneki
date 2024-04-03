const { parseQueryKey, hashQueryKey } = require('./utils');

export function useQuery({ refetchOnShow = true, ...options } = {}) {
  if (typeof getApp !== 'function') {
    throw new Error('The current running environment is not a mini program environment.');
  }

  const { queryClient } = getApp();

  if (!queryClient) {
    throw new Error('Not QueryClient set, please set one on the application instance.');
  }

  const fetcher = Symbol('fetcher');

  return Behavior({
    lifetimes: {
      attached() {
        const globalOptions = queryClient.options;
        const queryMeta = {};

        queryMeta.queryKey = parseQueryKey(options.queryKey, this.data);
        queryMeta.queryHash = hashQueryKey(queryMeta.queryKey);

        const originSetData = this.setData.bind(this);

        Object.defineProperty(this, 'setData', {
          configurable: true,
          enumerable: false,
          value: (data, callback) => {
            originSetData(data, () => {
              const queryKey = parseQueryKey(options.queryKey, this.data);
              const queryHash = hashQueryKey(queryKey);

              if (queryHash !== queryMeta.queryHash) {
                Object.assign(queryMeta, { queryKey, queryHash });
                this[fetcher].setOptions(queryMeta);
                this[fetcher].refetch();
              }

              callback?.();
            });
          },
        });

        this[fetcher] = queryClient.buildFetcher({
          ...globalOptions,
          ...options,
          ...queryMeta,
          subscribe: originSetData,
        });

        this[fetcher].fetch();
      },

      detached() {
        this[fetcher].destroy();
      },
    },

    pageLifetimes: {
      show() {
        if (this.data.isPending === false && refetchOnShow) {
          this[fetcher].refetch();
        }
      },
    },

    methods: {
      refetch() {
        this[fetcher].refetch();
      },
    },
  });
}
