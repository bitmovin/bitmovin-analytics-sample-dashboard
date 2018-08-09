export function fetchStartupDelay(api, baseQuery = {}, videoId) {
  const query = {
    ...baseQuery,
    dimension: 'STARTUPTIME',
    filters: [
      ...(baseQuery.filters || []),
      api.filter('STARTUPTIME', 'GT', 0),
      api.filter('PAGE_LOAD_TYPE', 'EQ', 1)
    ]
  };
  if (videoId) {
    query.filters.push(api.filter('VIDEO_ID', 'EQ', videoId));
  }
  return new Promise((resolve) => {
    api.fetchAnalytics('median', query).then(result => {
      resolve(result[0][0]);
    })
  });
}

export function fetchVideoStartupDelay(api, baseQuery = {}, videoId) {
  const query = {
    ...baseQuery,
    dimension: 'VIDEO_STARTUPTIME',
    filters: [
      api.filter('VIDEO_STARTUPTIME', 'GT', 0),
      api.filter('VIDEO_STARTUPTIME', 'LT', 20000)
    ]
  };
  if (videoId) {
    query.filters.push(api.filter('VIDEO_ID', 'EQ', videoId));
  }
  return new Promise((resolve) => {
    api.fetchAnalytics('median', query).then(result => {
      resolve(result[0][0]);
    })
  });
}

export function genericStartupTimeOverTime(aggregation, api, interval, baseQuery = {}) {
  const query = {
    dimension: 'STARTUPTIME',
    interval: interval,
    ...baseQuery,
    filters: [
      api.filter('STARTUPTIME', 'GT', 0),
      api.filter('PAGE_LOAD_TYPE', 'EQ', 1),
      ...(baseQuery.filters || [])
    ],
    orderBy: baseQuery.orderBy || [api.orderBy(interval, 'ASC')]
  };
  const promise = api.fetchAnalytics(aggregation, query);
  promise.catch(() => { 
    console.log(query, baseQuery);
  });
  return promise;
}
export function startupTimeOverTime(api, interval, baseQuery = {}) {
  return genericStartupTimeOverTime('median', api, interval, baseQuery);
}

export function videoStartupTimeByCountry(api, baseQuery = {}) {
  const query = {
    dimension: 'STARTUPTIME',
    filters: [
      api.filter('STARTUPTIME', 'GT', 0),
      api.filter('PAGE_LOAD_TYPE', 'EQ', 1),
      ...(baseQuery.filters || [])
    ],
    groupBy: ['COUNTRY'],
    ...baseQuery
  };

  return api.fetchAnalytics('median', query);
}

export function videoStartupDelayByPlayerVersion(api, baseQuery = {}) {
  const query = {
    ...baseQuery,
    dimension: 'VIDEO_STARTUPTIME',
    filters: [
      api.filter('VIDEO_STARTUPTIME', 'GT', 0)
    ],
    interval: 'DAY',
    groupBy: ['PLAYER_VERSION']
  };

  return api.fetchAnalytics('median', query);
}

export function delayedSessions(api, baseQuery = {}, limit, offset) {
  const query = {
    ...baseQuery,
    dimension: 'STARTUPTIME',
    groupBy: ['IMPRESSION_ID', 'VIDEO_ID'],
    limit: limit,
    offset: offset,
    filters: [
      api.filter('STARTUPTIME', 'GT', 0),
      api.filter('PAGE_LOAD_TYPE', 'EQ', 1)
    ],
    orderBy: [
      {
        name: 'FUNCTION',
        order: 'DESC'
      }
    ]
  };

  return new Promise((resolve) => {
    api.fetchAnalytics('SUM', query).then((result) => {
      Promise.all(result.map(row => {
        return new Promise(resolve => {
          api.getImpression(row[0]).then(imp => {
            resolve([...row, imp]);
          })
        })
      })).then(result => {
        resolve(result);
      })
    });
  });
}
