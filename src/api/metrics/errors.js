import Api from '../index'
import * as util from '../util'

export function videosByErrorCode(apiKey, interval, errorCode, baseQuery = {}) {
  const api = new Api(apiKey);
  const query = {
    dimension: 'IMPRESSION_ID',
    interval: 'MONTH',
    ...baseQuery,
    groupBy: ['VIDEO_ID'],
    filters: [
      api.filter('ERROR_CODE', 'EQ', errorCode)
    ],
    orderBy: [api.orderBy('FUNCTION', 'DESC')]
  }
  return api.fetchAnalytics('COUNT', query);
}

export function errorDetailsForVideoId(apiKey, errorCode, videoId, baseQuery = {}) {
  const api = new Api(apiKey);

  const query = {
    ...baseQuery,
    filters: [
      api.filter('VIDEO_ID', 'EQ', videoId),
      api.filter('ERROR_CODE', 'EQ', errorCode)
    ],
    orderBy: [{name: 'FUNCTION', order: 'DESC'}]
  };

  const browsersQuery = {
    dimension: 'IMPRESSION_ID',
    groupBy: ['BROWSER'],
    ...query
  };

  const ossQuery = {
    dimension: 'IMPRESSION_ID',
    groupBy: ['OPERATINGSYSTEM'],
    ...query
  };

  const streamFormatQuery = {
    dimension: 'IMPRESSION_ID',
    groupBy: ['STREAM_FORMAT'],
    ...query
  };

  const playerTechQuery = {
    dimension: 'IMPRESSION_ID',
    groupBy: ['PLAYER_TECH'],
    ...query
  };

  const errorsQuery = {
    dimension: 'ERROR_CODE',
    interval: 'DAY',
    ...query,
    orderBy: [{
      name: 'DAY',
      order: 'DESC'
    }]
  };

  const impressionsQuery = {
    dimension: 'IMPRESSION_ID',
    interval: 'DAY',
    ...query,
    filters: [
      api.filter('VIDEO_ID', 'EQ', videoId)
    ],
    orderBy: [{
      name: 'DAY',
      order: 'DESC'
    }]
  };

  const browsersPromise = api.fetchAnalytics('COUNT', browsersQuery);
  const ossPromise = api.fetchAnalytics('COUNT', ossQuery);
  const streamFormatPromise = api.fetchAnalytics('COUNT', streamFormatQuery);
  const playerTechPromise = api.fetchAnalytics('COUNT', playerTechQuery);
  const errorsPromise = api.fetchAnalytics('COUNT', errorsQuery);
  const impressionsPromise = api.fetchAnalytics('COUNT', impressionsQuery);


  return Promise.all([
    browsersPromise,
    ossPromise,
    streamFormatPromise,
    playerTechPromise,
    errorsPromise,
    impressionsPromise
  ]).then(responses => {
    const [browsers, oss, streamFormat, playerTech, errors, impressions] = responses;

    return {
      browsers,
      oss,
      streamFormat,
      playerTech,
      errors,
      impressions
    };
  })
}

export function fetchErrorCount(apiKey, interval, baseQuery = {}) {
  const api = new Api(apiKey);
  return api.fetchAnalytics('COUNT', {
    dimension: 'ERROR_CODE',
    interval: interval,
    ...baseQuery
  })
}

export function fetchErrorPercentage(apiKey, name, baseQuery = {}) {
  const api = new Api(apiKey);
  return new Promise(resolve => {
    const impressions = {
      dimension: 'IMPRESSION_ID',
      ...baseQuery
    };
    Promise.all([
      fetchErrorCount(apiKey, 'day', baseQuery),
      api.fetchAnalytics('COUNT', impressions)
    ]).then(data => {
      const rows = util.leftJoin(data[0], data[1]);
      const result = rows.map(row => {
        return [row[0], util.roundTo((row[1] / row[2]) * 100, 2)];
      });
      resolve({ data: result, name: name});
    })
  });
}

export function errorSessions(apiKey, baseQuery = {}, limit, offset) {
  const api = new Api(apiKey);
  const query = {
    ...baseQuery,
    dimension: 'MINUTE',
    groupBy: ['IMPRESSION_ID', 'VIDEO_ID', 'ERROR_CODE'],
    limit: limit,
    offset: offset,
    filters: [
      api.filter('ERROR_CODE', 'GT', 0)
    ],
    orderBy: [
      {
        name: 'FUNCTION',
        order: 'DESC'
      }
    ]
  };

  return new Promise((resolve) => {
    api.fetchAnalytics('MIN', query).then((result) => {
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

export function errorsByVideo(apiKey, baseQuery = {}) {
  const api = new Api(apiKey);
  return new Promise(resolve => {
    api.fetchAnalytics('COUNT', {
      dimension: 'IMPRESSION_ID',
      ...baseQuery,
      filters: [
        api.filter('ERROR_CODE', 'GT', 0),
        ...(baseQuery.filters || [])
      ]
    }).then(data => {
      resolve(data);
    })
  });
}
