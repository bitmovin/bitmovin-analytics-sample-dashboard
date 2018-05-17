import Bitmovin from 'bitmovin-javascript';

export function groupedQuery(api) {
  const bitmovin = api.bitmovin;
  return bitmovin.analytics.queries.builder
    .count('IMPRESSION_ID')
    .filter('VIDEO_STARTUPTIME', 'GT', 0);
}
