import Bitmovin from 'bitmovin-javascript';

export async function fetchGrouped(apiKey, name, baseQuery = {}) {
  const lastDaysQuery = { dimension: 'IMPRESSION_ID', ...baseQuery };
  const { dimension, groupBy, orderBy, licenseKey, filters, start, end, interval } = lastDaysQuery;
  const bitmovin = new Bitmovin({apiKey});
  const queryBuilder = bitmovin.analytics.queries.builder;

  const allFilters = [
    ...(filters || []),
    { name: 'PLAYED', operator: 'GT', value: 0 }
  ];

  const periodQuery = queryBuilder.count(dimension)
    .licenseKey(licenseKey)
    .between(start, end)
    .interval(interval);

  const filteredQuery = allFilters
    .reduce((query, {name, operator, value}) => query.filter(name, operator, value), periodQuery);

  const groupedQuery = groupBy.reduce((query, group) => query.groupBy(group), filteredQuery);

  const orderedQuery = orderBy
    .reduce((query, {name, order}) => query.orderBy(name, order), groupedQuery);

  const { rows } = await orderedQuery.query();

  return {data: rows, name};
}
