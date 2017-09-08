import Api from './index'
import * as rebuffer from './metrics/rebuffer'
import * as util from './util'
import * as startupDelay from './metrics/startupdelay'
import { bounceRate } from './metrics/bounce'
import * as userbase from './userbase'

function fetchMetric(apiKey, metric, ranges, aQuery = {}, filters = []) {
  const api = new Api(apiKey);
  const query = {
    ...aQuery,
    ...ranges.primaryRange,
    dimension: metric,
    filters
  };
  const secondaryQuery = {
    ...aQuery,
    ...ranges.secondaryRange,
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

export function fetchErrorPercentageThisWeek(apiKey, ranges, baseQuery, videoId) {
  const api = new Api(apiKey);
  const errorQuery = {
    dimension: 'ERROR_CODE',
  };
  const impressionsQuery = {
    dimension: 'IMPRESSION_ID'
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
      fetchErrorPercentage(ranges.primaryRange),
      fetchErrorPercentage(ranges.secondaryRange),
      userbase.errors(apiKey, {...ranges.primaryRange, ...baseQuery}),
      userbase.impressions(apiKey, {...ranges.primaryRange, ...baseQuery})
    ]).then(data => {
      const errorPercentagePrimaryRange = checkIfNaNAndSetZero(data[0].errors / data[0].impressions) * 100;
      const errorPercentageSecondaryRange = checkIfNaNAndSetZero(data[1].errors / data[1].impressions) * 100;
      const globalErrorPercentage = checkIfNaNAndSetZero(data[2][0][0] / data[3][0][0]) * 100;

      const change = errorPercentagePrimaryRange - errorPercentageSecondaryRange;

      resolve({
        primary: util.round10(errorPercentagePrimaryRange),
        secondary: util.round10(errorPercentageSecondaryRange),
        change: util.round10(change),
        userbase: util.round10(globalErrorPercentage)
      });
    })
  })
}

function checkIfNaNAndSetZero(variable) {
  if (isNaN(variable))
    variable = 0;

  return variable;
}

export function fetchTotalImpressionsThisWeek(apiKey, ranges, baseQuery, videoId = '') {
  const filters = [{
    name: 'PLAYED',
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

  return fetchMetric(apiKey, 'IMPRESSION_ID', ranges, baseQuery, filters);
}

export function fetchTotalUsersThisWeek(apiKey, ranges, baseQuery, videoId = '') {
  const filters = [{
    name: 'PLAYED',
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

  return fetchMetric(apiKey, 'USER_ID', ranges, baseQuery, filters);
}

export function fetchRebufferPercentageThisWeek(apiKey, ranges, baseQuery, videoId) {
  return new Promise((resolve) => {
    Promise.all([
      rebuffer.rebufferPercentage(apiKey, {...ranges.primaryRange, ...baseQuery}, videoId),
      rebuffer.rebufferPercentage(apiKey, {...ranges.secondaryRange, ...baseQuery}, videoId),
      userbase.rebufferPercentage(apiKey, {...ranges.primaryRange, ...baseQuery})
    ]).then(result => {
      const rebufferPercentagePrimaryRage = checkIfNaNAndSetZero(result[0] * 100);
      const rebufferPercentageSecondaryRage = checkIfNaNAndSetZero(result[1] * 100);
      const rebufferPercentageGlobal = checkIfNaNAndSetZero(result[2][0][0]);

      const change = rebufferPercentagePrimaryRage - rebufferPercentageSecondaryRage;

      resolve({
        primary: util.round10(rebufferPercentagePrimaryRage),
        secondary: util.round10(rebufferPercentageSecondaryRage),
        change: util.round10(change),
        userbase: util.round10(rebufferPercentageGlobal)
      });
    });
  })
}

function formatResult(primary, secondary, userbase, format = (x) => { return x; }) {
    let change = 0;
    if (primary !== secondary) {
      change = Math.round(((primary / secondary) - 1) * 100);
    }
    return {
      primary: format(primary),
      secondary: format(secondary),
      change,
      userbase: format(userbase)
    };
}

export function fetchBounceRateThisWeek(apiKey, ranges, baseQuery, videoId) {
  return new Promise((resolve) => {
    Promise.all([
      bounceRate(apiKey, {...ranges.primaryRange, ...baseQuery}, videoId),
      bounceRate(apiKey, {...ranges.secondaryRange, ...baseQuery}, videoId),
      userbase.bounceRate(apiKey, {...ranges.primaryRange, ...baseQuery})
    ])
    .then((result) => {
      const bounceRatePrimaryRage = checkIfNaNAndSetZero(result[0] * 100);
      const bounceRateSecondaryRage = checkIfNaNAndSetZero(result[1] * 100);
      const bounceRateGlobal = checkIfNaNAndSetZero(result[2][0][0]);

      const change = bounceRatePrimaryRage - bounceRateSecondaryRage;

      resolve({
        primary: util.round10(bounceRatePrimaryRage),
        secondary: util.round10(bounceRateSecondaryRage),
        change: util.round10(change),
        userbase: util.round10(bounceRateGlobal)
      });
    })
  })
}

export function fetchAverageStartupDelayThisWeek(apiKey, ranges, baseQuery, videoId) {
  return new Promise((resolve) => {
    Promise.all([startupDelay.fetchStartupDelay(apiKey, {...ranges.primaryRange, ...baseQuery}, videoId),
      startupDelay.fetchStartupDelay(apiKey, {...ranges.secondaryRange, ...baseQuery}, videoId),
      userbase.startuptime(apiKey, {...ranges.primaryRange, ...baseQuery})])
      .then((results) => {
				resolve(formatResult(results[0], results[1], results[2][0][0], (val) => {
					return Math.round(val);
				}));
      });
  });
}

export function fetchAverageVideoStartupDelayThisWeek(apiKey, ranges, videoId) {
  return new Promise((resolve) => {
    Promise.all([startupDelay.fetchVideoStartupDelay(apiKey, ranges.primaryRange, videoId),
      startupDelay.fetchVideoStartupDelay(apiKey, ranges.secondaryRange, videoId),
      userbase.startuptime(apiKey, ranges.primaryRange)])
      .then((results) => {
        resolve(formatResult(results[0], results[1], results[2], (val) => {
          return Math.round(val);
        }));
      });
  });
}
