import Api from '../index';

export function fetchGrouped(apiKey, name, baseQuery = {}) {
  const api = new Api(apiKey);
  const lastDaysQuery = {
    dimension: 'IMPRESSION_ID',
		...baseQuery
  };

  if (!lastDaysQuery.filters)
    lastDaysQuery.filters = [];

  lastDaysQuery.filters.push(api.filter('PLAYED', 'GT', 0));

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('COUNT', lastDaysQuery)])
    .then((results) => {
      resolve({
        data: results[0],
        name
      });
    })
  });
}
