
export function averagePlayedTimePerVideo(api, videoId, baseQuery = {}) {
  const query = {
    ...baseQuery,
    dimension: 'PLAYED',
    filters: [api.filter('PLAYED', 'GT', 0)]
  };

  if (videoId) {
    query.filters.push(api.filter('VIDEO_ID', 'EQ', videoId));
  }

  return new Promise((resolve) => {
    api.fetchAnalytics('AVG', query).then(res => {
      resolve(res[0][0]);
    });
  });
}
