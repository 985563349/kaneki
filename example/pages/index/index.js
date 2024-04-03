const { useQuery } = require('kaneki');
const request = require('../../request');

Component({
  behaviors: [
    useQuery({
      queryKey: ['mock'],
      queryFn: () =>
        request({
          url: '/mock',
          method: 'GET',
        }),
    }),
  ],
});
