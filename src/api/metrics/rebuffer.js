import Api from '../index'
import * as util from '../util'

export function rebufferPercentage(api, baseQuery = {}, videoId) {
  const query = {
    ...baseQuery,
    dimension: 'IMPRESSION_ID',
    filters      : [
      ...(baseQuery.filters || []),
      {
        name    : 'BUFFERED',
        operator: 'GT',
        value   : 0
      },{
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
    dimension: 'IMPRESSION_ID',
    filters: [
      ...(baseQuery.filters || []),
      api.filter('VIDEO_STARTUPTIME', 'GT', 0)
    ]
  };
  if (videoId) {
    durationQuery.filters.push(api.filter('VIDEO_ID', 'EQ', videoId))
  }

  const promise = Promise.all([
    api.fetchAnalytics('count', query),
    api.fetchAnalytics('count', durationQuery)
  ]);
  return new Promise((resolve, reject) => {
    promise.then(function(results) {
      const buffering = results[0][0][0];
      const duration  = results[1][0][0];
      resolve(buffering/duration);
    });
  });
}

export function rebufferPercentageGrouped(api, baseQuery = {}, groupBy) {
  const query = {
    dimension: 'IMPRESSION_ID',
    interval: 'DAY',
    groupBy: [groupBy],
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
    ],
    ...baseQuery
  };

  const durationQuery = {
    interval: 'DAY',
    dimension: 'IMPRESSION_ID',
    filters: [['VIDEO_STARTUPTIME', 'GT', 0]],
    groupBy: [groupBy],
    ...baseQuery
  };

  const promise = Promise.all([
    api.fetchAnalytics('count', query),
    api.fetchAnalytics('count', durationQuery)
  ]);

  return new Promise((resolve, reject) => {
    promise.then((result) => {
      const joined = util.leftJoinOnTwoColumns(result[1], result[0]);
      resolve(joined.map((row) => {
        row.push(row[3] / row[2]);
        return row;
      }));
    })
  });
}

export function rebufferPercentageOverTime(api, baseQuery = {}) {
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

export function rebufferDurationGrouped(api, baseQuery = {}, groupBy) {
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
      }, {
        name    : 'SEEKED',
        operator: 'EQ',
        value   : 0
      }
    ],
    groupBy: [groupBy]
  };

  const durationQuery = {
    ...baseQuery,
    interval: 'DAY',
    dimension: 'IMPRESSION_ID',
    filter: [api.filter('PLAYED', 'GT', 0)],
    groupBy: [groupBy]
  };

  const promise = Promise.all([
    api.fetchAnalytics('count', durationQuery),
    api.fetchAnalytics('sum', query)
  ]);

  return new Promise((resolve, reject) => {
    promise.then((result) => {
      const joined = util.leftJoinOnTwoColumns(result[0], result[1]);
      resolve(joined.map((row) => {
        if (row[2] === 0) {
          row.push(0);
        } else {
          row.push(row[3] / row[2]);
        }
        return row;
      }));
    })
  });
}

export function rebufferDuration(api, baseQuery = {}) {
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

export function rebufferingSessions(api, baseQuery = {}, limit, offset) {
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
