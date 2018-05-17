import * as rebuffer from './metrics/rebuffer'
import * as util from './util'
import * as startupDelay from './metrics/startupdelay'
import { bounceRate } from './metrics/bounce'
import deepEqual from 'deep-equal'

function fetchMetric(api, metric, primaryRange, secondaryRange, aQuery = {}, filters = []) {
  const query = {
    ...aQuery,
    ...primaryRange,
    dimension: metric,
    filters
  };
  const secondaryQuery = {
    ...aQuery,
    ...secondaryRange,
    dimension: metric,
    filters
  };
  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('COUNT', query), api.fetchAnalytics('COUNT', secondaryQuery)])
    .then((results) => {
      const primary = results[0][0][0];
      const secondary = results[1][0][0];
      const change = primary === secondary ? 0 : Math.round(((primary / secondary) - 1) * 100);
      resolve({ primary, secondary, change });
    })
  });
}

export const fetchErrorPercentageThisWeek = cached((api, primaryRange, secondaryRange, baseQuery, videoId) => {
  const errorQuery = {
    dimension: 'ERROR_CODE',
  };
  const impressionsQuery = {
    dimension: 'IMPRESSION_ID',
  };

  if (videoId) {
    const filter = api.filter('VIDEO_ID', 'EQ', videoId);
    errorQuery.filters = [filter];
    impressionsQuery.filters = [filter];
  }

  const fetchErrorPercentage = (range) => {
    return new Promise(resolve => {
      Promise.all([
        api.fetchAnalytics('COUNT', { ...errorQuery, ...range, ...baseQuery }),
        api.fetchAnalytics('COUNT', { ...impressionsQuery, ...range, ...baseQuery })
      ]).then(data => {
        resolve({
          errors: data[0][0][0],
          impressions: data[1][0][0]
        });
      })
    })
  };

  return new Promise(resolve => {
    Promise.all([
      fetchErrorPercentage(primaryRange),
      fetchErrorPercentage(secondaryRange),
    ]).then(data => {
      const errorPercentagePrimaryRange = checkIfNaNAndSetZero(data[0].errors / data[0].impressions) * 100;
      const errorPercentageSecondaryRange = checkIfNaNAndSetZero(data[1].errors / data[1].impressions) * 100;

      const change = errorPercentagePrimaryRange - errorPercentageSecondaryRange;

      resolve({
        primary: util.round10(errorPercentagePrimaryRange),
        secondary: util.round10(errorPercentageSecondaryRange),
        change: util.round10(change),
      });
    })
  })
})

function checkIfNaNAndSetZero(variable) {
  if (isNaN(variable))
    variable = 0;

  return variable;
}

export const fetchTotalImpressionsThisWeek = cached((api, primaryRange, secondaryRange, baseQuery, videoId = '') => {
  const filters = [{
    name: 'VIDEO_STARTUPTIME',
    operator: 'GT',
    value: 0
  }];

  if (videoId) {
    filters.push({
      name    : 'VIDEO_ID',
      operator: 'EQ',
      value   : videoId
    });
  }

  return fetchMetric(api, 'IMPRESSION_ID', primaryRange, secondaryRange, baseQuery, filters);
})

export const fetchTotalUsersThisWeek = cached((api, primaryRange, secondaryRange, baseQuery, videoId = '') => {
  const filters = [{
    name: 'VIDEO_STARTUPTIME',
    operator: 'GT',
    value: 0
  }];

  if (videoId) {
    filters.push({
      name    : 'VIDEO_ID',
      operator: 'EQ',
      value   : videoId
    });
  }

  return fetchMetric(api, 'USER_ID', primaryRange, secondaryRange, baseQuery, filters);
})

export const fetchRebufferPercentageThisWeek = cached((api, primaryRange, secondaryRange, baseQuery, videoId) => {
  return new Promise((resolve) => {
    Promise.all([
      rebuffer.rebufferPercentage(api, {...primaryRange, ...baseQuery}, videoId),
      rebuffer.rebufferPercentage(api, {...secondaryRange, ...baseQuery}, videoId),
    ]).then(result => {
      const rebufferPercentagePrimaryRage = checkIfNaNAndSetZero(result[0] * 100);
      const rebufferPercentageSecondaryRage = checkIfNaNAndSetZero(result[1] * 100);

      const change = rebufferPercentagePrimaryRage - rebufferPercentageSecondaryRage;

      resolve({
        primary: util.round10(rebufferPercentagePrimaryRage),
        secondary: util.round10(rebufferPercentageSecondaryRage),
        change: util.round10(change),
      });
    });
  })
})

function formatResult(primary, secondary, format = (x) => { return x; }) {
    let change = 0;
    if (primary !== secondary) {
      change = Math.round(((primary / secondary) - 1) * 100);
    }
    return {
      primary: format(primary),
      secondary: format(secondary),
      change,
    };
}

export const fetchBounceRateThisWeek = cached((api, primaryRange, secondaryRange, baseQuery, videoId) => {
  return new Promise((resolve) => {
    Promise.all([
      bounceRate(api, {...primaryRange, ...baseQuery}, videoId),
      bounceRate(api, {...secondaryRange, ...baseQuery}, videoId),
    ])
    .then((result) => {
      const bounceRatePrimaryRage = checkIfNaNAndSetZero(result[0] * 100);
      const bounceRateSecondaryRage = checkIfNaNAndSetZero(result[1] * 100);

      const change = bounceRatePrimaryRage - bounceRateSecondaryRage;

      resolve({
        primary: util.round10(bounceRatePrimaryRage),
        secondary: util.round10(bounceRateSecondaryRage),
        change: util.round10(change),
      });
    })
  })
})

export const fetchAverageStartupDelayThisWeek = cached((api, primaryRange, secondaryRange, baseQuery, videoId) => {
  return new Promise((resolve) => {
    Promise.all([
      startupDelay.fetchStartupDelay(api, {...primaryRange, ...baseQuery}, videoId),
      startupDelay.fetchStartupDelay(api, {...secondaryRange, ...baseQuery}, videoId)
    ]).then((results) => {
				resolve(formatResult(results[0], results[1], (val) => {
					return Math.round(val);
				}));
      });
  });
})

export const fetchAverageVideoStartupDelayThisWeek = cached((api, primaryRange, secondaryRange, videoId) => {
  return new Promise((resolve) => {
    Promise.all([
      startupDelay.fetchVideoStartupDelay(api, primaryRange, videoId),
      startupDelay.fetchVideoStartupDelay(api, secondaryRange, videoId)
    ]).then((results) => {
        resolve(formatResult(results[0], results[1], (val) => {
          return Math.round(val);
        }));
      });
  });
});


export function cached(fn) {
  let cache = null;
  let cachedArgs = [];
  return function() {
    const args = [...arguments];
    if (deepEqual(cachedArgs, args)) {
      return cache;
    }
    cache = fn(...args);
    cachedArgs = args;
    return cache;
  }
}
