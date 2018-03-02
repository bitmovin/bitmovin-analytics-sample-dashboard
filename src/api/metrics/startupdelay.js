import Api from '../index'

export function fetchStartupDelay(apiKey, baseQuery = {}, videoId) {
  const api = new Api(apiKey);
  const query = {
    ...baseQuery,
    dimension: 'STARTUPTIME',
    filters: [
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

export function fetchVideoStartupDelay(apiKey, baseQuery = {}, videoId) {
  const api = new Api(apiKey);
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

export function genericStartupTimeOverTime(aggregation, apiKey, interval, baseQuery = {}) {
  const api = new Api(apiKey);
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
    debugger;
  });
  return promise;
}
export function startupTimeOverTime(apiKey, interval, baseQuery = {}) {
  return genericStartupTimeOverTime('median', apiKey, interval, baseQuery);
}

export function videoStartupTimeByCountry(apiKey, baseQuery = {}) {
  const api = new Api(apiKey);
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

export function videoStartupDelayByPlayerVersion(apiKey, baseQuery = {}) {
  const api = new Api(apiKey);
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

export function delayedSessions(apiKey, baseQuery = {}, limit, offset) {
  const api = new Api(apiKey);
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
