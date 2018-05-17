export function groupedQuery(api) {
  return api.bitmovin.analytics.queries.builder
    .count('IMPRESSION_ID')
    .filter('VIDEO_STARTUPTIME', 'GT', 0);
}
