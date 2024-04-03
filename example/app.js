const { QueryClient } = require('kaneki');

App({
  queryClient: new QueryClient({
    retry: 3,
    staleTime: 3000,
    cacheTime: 5 * 60 * 1000,
  }),
});
