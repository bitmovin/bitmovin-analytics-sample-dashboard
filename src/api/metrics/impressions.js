import Bitmovin from 'bitmovin-javascript';

export function groupedQuery(apiKey) {
  const bitmovin = new Bitmovin({apiKey});
  return bitmovin.analytics.queries.builder
    .count('IMPRESSION_ID')
    .filter('VIDEO_STARTUPTIME', 'GT', 0);
}
