import Bitmovin from 'bitmovin-javascript';

export function groupedQuery(apiKey) {
  const bitmovin = new Bitmovin({ apiKey: apiKey });
  return bitmovin.analytics.queries.builder
    .count('IMPRESSION_ID')
    .filter('PLAYED', 'GT', 0);
}
