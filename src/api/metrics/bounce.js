export function bounceRate(api, baseQuery, videoId) {
  const playedImpressionsQuery  = {
    ...baseQuery,
    dimension: 'IMPRESSION_ID',
    filters      : [
      {
        name    : 'VIDEO_STARTUPTIME',
        operator: 'GT',
        value   : 0
      }
    ]
  };
  if (videoId) {
    playedImpressionsQuery.filters.push({
      name: 'VIDEO_ID',
      operator: 'EQ',
      value: videoId
    })
  }
  const totalImpressionsQuery = {
    ...baseQuery,
    dimension: 'IMPRESSION_ID',
    filters: [{
      name: 'PLAYER_STARTUPTIME',
      operator: 'GT',
      value: 0
    }]
  }
  return new Promise(resolve => {
    Promise.all([api.fetchAnalytics('count', playedImpressionsQuery),
                 api.fetchAnalytics('count', totalImpressionsQuery)])
    .then(results => {
      resolve(1 - results[0][0] / results[1][0]);
    })
  })
}
