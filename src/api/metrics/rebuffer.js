import Api from '../index'
import * as util from '../util'

export function rebufferPercentage(apiKey, baseQuery = {}, videoId) {
  const api = new Api(apiKey);
  const query = {
    ...baseQuery,
    dimension: 'BUFFERED',
    filters      : [
      {
        name    : 'BUFFERED',
        operator: 'GT',
        value   : 0
      }, {
        name    : 'VIDEOTIME_START',
        operator: 'GT',
        value   : 0
      }, {
        name    : 'SEEKED',
        operator: 'EQ',
        value   : 0
      }
    ]
  };
  if (videoId) {
    query.filters.push(api.filter('VIDEO_ID', 'EQ', videoId))
  }

  const durationQuery = {
    ...baseQuery,
    dimension: 'PLAYED',
    filters: []
  };
  if (videoId) {
    durationQuery.filters.push(api.filter('VIDEO_ID', 'EQ', videoId))
  }

  const promise = Promise.all([
    api.fetchAnalytics('sum', query),
    api.fetchAnalytics('sum', durationQuery)
  ]);
  return new Promise((resolve, reject) => {
    promise.then(function(results) {
      const buffering = results[0][0][0];
      const duration  = results[1][0][0];
      resolve(buffering/duration);
    });
  });
}

export function rebufferPercentageOverTime(apiKey, baseQuery = {}) {
  const query = {
    dimension: 'BUFFERED',
    interval: 'DAY',
    ...baseQuery,
    filters      : [
      {
        name    : 'BUFFERED',
        operator: 'GT',
        value   : 0
      }, {
        name    : 'VIDEOTIME_START',
        operator: 'GT',
        value   : 0
      },
      ...(baseQuery.filters || [])
    ]
  };

  const durationQuery = {
    dimension: 'PLAYED',
    interval: 'DAY',
    ...baseQuery,
    filters : [
      ...(baseQuery.filters || [])
    ]
  };

  const api = new Api(apiKey);
  const promise = Promise.all([
    api.fetchAnalytics('sum', query),
    api.fetchAnalytics('sum', durationQuery)
  ]);

  return new Promise((resolve, reject) => {
    promise.then((result) => {
			const joined = util.leftJoin(result[1], result[0], (leftRow) => {
				return [0];
			});
      resolve(joined.map((row) => {
        if (row[1] === 0) {
          row.push(0);
        } else {
          row.push(row[2] / row[1]);
        }
        return row;
      }));
    })
  });
}

export function rebufferDuration(apiKey, baseQuery = {}) {
  const query = {
    ...baseQuery,
    dimension: 'BUFFERED',
    interval: 'DAY',
    filters      : [
      ...(baseQuery.filters || []),
      {
        name    : 'BUFFERED',
        operator: 'GT',
        value   : 0
      }, {
        name    : 'VIDEOTIME_START',
        operator: 'GT',
        value   : 0
      }
    ]
  };

  const api = new Api(apiKey);
  const durationQuery = {
    ...baseQuery,
    interval: 'DAY',
    dimension: 'IMPRESSION_ID',
    filter: [api.filter('played', 'GT', 0)]
  };

  const promise = Promise.all([
    api.fetchAnalytics('count', durationQuery),
    api.fetchAnalytics('sum', query)
  ]);

  return new Promise((resolve, reject) => {
    promise.then((result) => {
      const joined = util.leftJoin(result[0], result[1]);
      resolve(joined.map((row) => {
        if (row[2] === 0) {
          row.push(0);
        } else {
          row.push(row[2] / row[1]);
        }
        return row;
      }));
    })
  });
}

export function rebufferingSessions(apiKey, baseQuery = {}, limit, offset) {
  const api = new Api(apiKey);
  const query = {
    ...baseQuery,
    dimension: 'BUFFERED',
    filters: [
      api.filter('BUFFERED', 'GT', 0),
      api.filter('VIDEOTIME_START', 'GT', 0)
    ],
    groupBy: ['IMPRESSION_ID', 'VIDEO_ID'],
    limit: limit,
    offset: offset,
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
