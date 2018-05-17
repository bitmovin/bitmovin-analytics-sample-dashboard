export function groupedQuery(api) {
  return api.bitmovin.analytics.queries.builder
    .count('IMPRESSION_ID')
    .filter('PLAYED', 'GT', 0);
}
