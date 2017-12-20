import Api from './index'
import * as ranges from './ranges'
import * as util from './util'
import * as played from './metrics/played'
import { mean } from 'd3-array'

function exctractPlayedTimeFromImpression(impression) {
  return impression.reduce((total, row) => {
    return total + row.played;
  }, 0);
}

export function fetchTotalTimePlayedThisWeek(apiKey, impression, videoId) {
  return new Promise((resolve) => {
    const totalPlayedTime = exctractPlayedTimeFromImpression(impression);
    played.averagePlayedTimePerVideo(apiKey, videoId, ranges.thisWeek)
    .then((result) => {
      resolve(formatResult(totalPlayedTime, result, (value) => {
        return Math.round(value / 1000) + ' sec';
      }))
    })
  })
}

function filterStartupImpression(impression) {
  return impression.filter((imp) => { return imp.player_startuptime === 0; })
}

function extractRebufferTimeFromImpression (impression) {
  return filterStartupImpression(impression).reduce((memo, item) => {
    if (item.buffered > 0) {
      return memo += item.buffered
    }
    return memo;
  }, 0);
}

export function fetchRebufferPercentage(apiKey, impression, videoId) {
  return new Promise((resolve) => {
    const rebufferPercentage = extractRebufferTimeFromImpression(impression);
    const api = new Api(apiKey);

    const filters = [api.filter('PLAYER_STARTUPTIME', 'EQ', 0),
      api.filter('VIDEO_STARTUPTIME', 'EQ', 0)];

    if (videoId) {
      filters.push(api.filter('VIDEO_ID', 'eq', videoId));
    }

    const promises = [];
    promises.push(api.fetchAnalytics('COUNT', {
      ...ranges.last7Days,
      filters,
      dimension: 'IMPRESSION_ID'
    }));

    promises.push(api.fetchAnalytics('SUM', {
      ...ranges.last7Days,
      filters,
      dimension: 'BUFFERED'
    }));

    Promise.all(promises).then((result) => {
      const averageRebufferTimePerImpression = result[1][0][0] / result[0][0][0];
      resolve(formatResult(rebufferPercentage, averageRebufferTimePerImpression, (value) => {
        if (value > 10000) {
          return util.round10(value / 1000) + ' sec'
        }
        return Math.round(value) + ' ms'
      }));
    });
  });
}

export function fetchTimeToFirstFrame(apiKey, impression, videoId) {
  const timeToFirstFrame = impression.find((x) => { return x.video_startuptime > 0; }).video_startuptime;
  return new Promise((resolve) => {
    const api = new Api(apiKey);

    const filters = [api.filter('VIDEO_STARTUPTIME', 'GT', 0)];
    if (videoId) {
      filters.push(api.filter('VIDEO_ID', 'EQ', videoId))
    }

    api.fetchAnalytics('AVG', {
      ...ranges.last7Days,
      filters,
      dimension: 'VIDEO_STARTUPTIME'
    }).then((result) => {
      resolve(formatResult(timeToFirstFrame, result[0][0], (value) => {
        if (value > 10000) {
          return util.round10(value / 1000) + ' sec'
        }
        return Math.round(value) + ' ms'
      }));
    })
  })
}

export function fetchStartupTime(apiKey, impression, videoId) {
  const startupTime = impression.find((x) => { return x.startuptime > 0; }).startuptime;
  return new Promise((resolve) => {
    const api = new Api(apiKey);

    const filters = [api.filter('STARTUPTIME', 'GT', 0),
      api.filter('PAGE_LOAD_TYPE', 'EQ', 1)];

    if (videoId) {
      filters.push(api.filter('VIDEO_ID', 'EQ', videoId));
    }

    api.fetchAnalytics('AVG', {
      ...ranges.last7Days,
      filters,
      dimension: 'STARTUPTIME'
    }).then((result) => {
      resolve(formatResult(startupTime, result[0][0], (value) => {
        if (value > 10000) {
          return util.round10(value / 1000) + ' sec'
        }
        return Math.round(value) + ' ms'
      }));
    })
  })
}

export function fetchAverageBitrate(apiKey, impressions, videoId) {
  const avgBitrate = mean(impressions.map(imp => { return imp.video_bitrate; }).filter(imp => { return imp > 0; }))
  return new Promise(resolve => {
    const api = new Api(apiKey);

    const filters = [api.filter('VIDEO_BITRATE', 'GT', 0)];

    if (videoId) {
      filters.push(api.filter('VIDEO_ID', 'EQ', videoId));
    }

    api.fetchAnalytics('AVG', {
      ...ranges.last7Days,
      filters,
      dimension: 'VIDEO_BITRATE'
    }).then(result => {
      resolve(formatResult(avgBitrate, result[0][0], value => {
        return (Math.round(value / 1000) || 0) + ' kbit';
      }))
    })
  })
}

function formatResult(impression, average, format = (x) => { return x; }) {
    let change = 0;
    if (impression !== average) {
      change = Math.round(((impression / average) - 1) * 100);
    }
    return {
      impression: format(impression),
      average: format(average),
      change
    };
}
