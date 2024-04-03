const { useQuery } = require('kaneki');
const request = require('../../request');

Component({
  behaviors: [
    useQuery({
      queryKey: ['mock', { c: '1', a: '2' }],
      queryFn: () =>
        request({
          url: '/mock',
          method: 'GET',
        }),
    }),
  ],
  lifetimes: {
    attached() {
      console.log(this);
    },
  },
});
