import Api from '../api/index'

export function errors(apiKey, baseQuery) {
  const api = new Api(apiKey);

  return new Promise(resolve => {
    api.fetchGlobalAnalytics('errors', { ...baseQuery }).then(data => {
      resolve(data);
    })
  });
}

export function impressions(apiKey, baseQuery) {
  const api = new Api(apiKey);

  return new Promise(resolve => {
    api.fetchGlobalAnalytics('impressions', { ...baseQuery }).then(data => {
      resolve(data);
    })
  });
}

export function rebufferPercentage (apiKey, baseQuery) {
  const api = new Api(apiKey);

  return new Promise(resolve => {
    api.fetchGlobalAnalytics('rebufferpercentage', { ...baseQuery }).then(data => {
      resolve(data);
    })
  });
}

export function startuptime (apiKey, baseQuery) {
  const api = new Api(apiKey);

  return new Promise(resolve => {
    api.fetchGlobalAnalytics('startuptime', { ...baseQuery }).then(data => {
      resolve(data);
    })
  });
}

export function bounceRate (apiKey, baseQuery) {
  const api = new Api(apiKey);

  return new Promise(resolve => {
    api.fetchGlobalAnalytics('bouncerate', { ...baseQuery }).then(data => {
      resolve(data);
    })
  });
}
