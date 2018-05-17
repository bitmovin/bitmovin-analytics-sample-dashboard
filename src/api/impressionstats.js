import Api from './index'
import * as ranges from './ranges'
import * as rebuffer from './metrics/rebuffer'
import * as util from './util'
import * as played from './metrics/played'
import * as startupDelay from './metrics/startupdelay'
import { mean } from 'd3-array'
import { bounceRate } from './metrics/bounce'
import moment from 'moment'

function fetchMetric(api, metric, aQuery = {}) {
  const query = {
    ...aQuery,
    ...ranges.thisWeek,
    dimension: metric
  };
  const previousWeekQuery = {
    ...aQuery,
    ...ranges.lastWeek,
    dimension: metric
  };
  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('COUNT', query), api.fetchAnalytics('COUNT', previousWeekQuery)])
    .then((results) => {
      const thisWeek = results[0][0][0];
      const lastWeek = results[1][0][0];
      const change = thisWeek === lastWeek ? 0 : Math.round(((thisWeek / lastWeek) - 1) * 100);
      resolve({ thisWeek, lastWeek, change });
    })
  });
}

function exctractPlayedTimeFromImpression(impression) {
  return impression.reduce((total, row) => {
    return total + row.played;
  }, 0);
}

export function fetchTotalTimePlayedThisWeek(api, impression, videoId) {
  return new Promise((resolve) => {
    const totalPlayedTime = exctractPlayedTimeFromImpression(impression);
    played.averagePlayedTimePerVideo(api, videoId, ranges.thisWeek)
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

export function fetchRebufferPercentage(api, impression, videoId) {
  return new Promise((resolve) => {
    const rebufferPercentage = extractRebufferTimeFromImpression(impression);

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

export function fetchTimeToFirstFrame(api, impression, videoId) {
  const timeToFirstFrame = impression.find((x) => { return x.video_startuptime > 0; }).video_startuptime;
  return new Promise((resolve) => {
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

export function fetchStartupTime(api, impression, videoId) {
  const startupTime = impression.find((x) => { return x.startuptime > 0; }).startuptime;
  return new Promise((resolve) => {
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

export function fetchAverageBitrate(api, impressions, videoId) {
  const avgBitrate = mean(impressions.map(imp => { return imp.video_bitrate; }).filter(imp => { return imp > 0; }))
  return new Promise(resolve => {
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

export function fetchTotalImpressionsThisWeek(api) {
  return fetchMetric(api, 'IMPRESSION_ID');
}

export function fetchTotalUsersThisWeek(api, timeRange) {
  return fetchMetric(api, timeRange, 'USER_ID');
}

export function fetchRebufferPercentageThisWeek(api) {
  return new Promise((resolve) => {
    Promise.all([rebuffer.rebufferPercentage(api, ranges.thisWeek),
    rebuffer.rebufferPercentage(api, ranges.lastWeek)]).then(result => {
      resolve(formatResult(result[0], result[1], (value) => {
        return util.round10(util.convertToPercentNumber(value));
      }));
    });
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

export function fetchTotalErrorsThisWeek(api) {
  return fetchMetric(api, 'ERROR_CODE');
}

export function fetchImpressionsLastDaysPerDay(api, days, offset = 0) {
  const lastDaysQuery = (days, offset = 0) => {
    return {
      dimension: 'IMPRESSION_ID',
      start: moment.utc().startOf('day').subtract(days + offset, 'day').format(),
      end: moment.utc().startOf('day').subtract(offset, 'day').format(),
      interval: 'DAY'
    }
  }

  return new Promise((resolve) => {
    api.fetchAnalytics('COUNT', lastDaysQuery(days, offset))
    .then((results) => {
      const data = results.sort((a,b) => {
        return a[0] - b[0];
      }).map((row) => {
        row[0] = moment(row[0]).format('dddd');
        return row;
      });
      resolve(data);
    })
  });
}

export function fetchOperatingSystemsLastDays(api, days) {
  const operatingSystemsQuery = {
    dimension: 'IMPRESSION_ID',
    start: moment.utc().startOf('day').subtract(days, 'day').format(),
    end: moment.utc().startOf('day').format(),
    groupBy: ['OPERATINGSYSTEM']
  };

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('COUNT', operatingSystemsQuery)])
    .then((results) => {
      const data = results[0];
      data.sort(function(a,b) {
        return b[1] - a[1];
      });
      resolve(data);
    })
  });
}

export function fetchTopContentsLastDays(api, days, limit = 10) {
  const operatingSystemsQuery = {
    dimension: 'IMPRESSION_ID',
    start: moment.utc().startOf('day').subtract(days, 'day').format(),
    end: moment.utc().startOf('day').format(),
    groupBy: ['VIDEO_ID']
  };

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('COUNT', operatingSystemsQuery)])
    .then((results) => {
      const data = results[0];
      data.sort(function(a,b) {
        return b[1] - a[1];
      });

      const topData = data.slice(0, limit);

      const shortenedData = topData.map(row => {
        row[0] = row[0] || '';
        return [row[0].substring(0, 50), row[1]]
      });

      resolve(shortenedData);
    })
  });
}

export function fetchTopPathsLastDays(api, days) {
  const operatingSystemsQuery = {
    dimension: 'IMPRESSION_ID',
    start: moment.utc().startOf('day').subtract(days, 'day').format(),
    end: moment.utc().startOf('day').format(),
    groupBy: ['PATH']
  };

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('COUNT', operatingSystemsQuery)])
    .then((results) => {
      const data = results[0];
      data.sort(function(a,b) {
        return b[1] - a[1];
      });
      resolve(data);
    })
  });
}

export function fetchUserLocationLastDays(api, days) {
  const operatingSystemsQuery = {
    dimension: 'IMPRESSION_ID',
    start: moment.utc().startOf('day').subtract(days, 'day').format(),
    end: moment.utc().startOf('day').format(),
    groupBy: ['COUNTRY']
  };

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('COUNT', operatingSystemsQuery)])
    .then((results) => {
      var locations = results[0].map(location => {
        return {
          'hc-key': location[0].toLowerCase(),
          'value': location[1]
        };
      });

      resolve({data: locations});
    })
  });
}

export function averagePlayTime(api) {
}

function percentageRenderer(value) {
  return util.roundTo(util.convertToPercentNumber(value), 2);
}

export function fetchBounceRateThisWeek(api) {
  return new Promise((resolve) => {
    Promise.all([bounceRate(api, ranges.thisWeek),
                 bounceRate(api, ranges.lastWeek)])
    .then((result) => {
      resolve(formatResult(result[0], result[1], percentageRenderer));
    })
  })
}

export function fetchBrowsersLastDays(api, days) {
  const lastDaysQuery = {
    dimension: 'IMPRESSION_ID',
    start: moment.utc().startOf('day').subtract(days, 'day').format(),
    end: moment.utc().startOf('day').format(),
    groupBy:['BROWSER']
  };

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('COUNT', lastDaysQuery)])
    .then((results) => {
      const data = results[0].map(browser => {
        return {
          'name': browser[0],
          'y': browser[1]
        };
      });

      resolve(data);
    })
  });
}

export function fetchBrowserLastDays(api, days, browser) {
  const lastDaysQuery = {
    dimension: 'IMPRESSION_ID',
    start: moment.utc().startOf('day').subtract(days, 'day').format(),
    end: moment.utc().startOf('day').format(),
    filters: [
      {
        name: 'BROWSER',
        operator: 'CONTAINS',
        value: browser
      }
    ]
  };

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('COUNT', lastDaysQuery)])
    .then((results) => {
      resolve(results[0][0][0]);
    })
  });
}

export function fetchOperatingSystemLastDays(api, days, os) {
  const lastDaysQuery = {
    dimension: 'IMPRESSION_ID',
    start: moment.utc().startOf('day').subtract(days, 'day').format(),
    end: moment.utc().startOf('day').format(),
    filters: [
      {
        name: 'OPERATINGSYSTEM',
        operator: 'CONTAINS',
        value: os
      }
    ]
  };

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('COUNT', lastDaysQuery)])
    .then((results) => {
      resolve(results[0][0][0]);
    })
  });
}

export function fetchStreamFormatLastDays(api, days, streamFormat) {
  const lastDaysQuery = {
    dimension: 'IMPRESSION_ID',
    start: moment.utc().startOf('day').subtract(days, 'day').format(),
    end: moment.utc().startOf('day').format(),
    filters: [
      {
        name: 'STREAM_FORMAT',
        operator: 'EQ',
        value: streamFormat
      }
    ]
  };

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('COUNT', lastDaysQuery)])
    .then((results) => {
      resolve(results[0][0][0]);
    })
  });
}

export function fetchPlayerTechnologyLastDays(api, days, playerTechnology) {
  const lastDaysQuery = {
    dimension: 'IMPRESSION_ID',
    start: moment.utc().startOf('day').subtract(days, 'day').format(),
    end: moment.utc().startOf('day').format(),
    filters: [
      {
        name: 'PLAYER_TECH',
        operator: 'EQ',
        value: playerTechnology
      }
    ]
  };

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('COUNT', lastDaysQuery)])
    .then((results) => {
      resolve(results[0][0][0]);
    })
  });
}

export function fetchMinMaxAvgBitrateLastMinutes(api, minutes) {
  const bitrate = {
    dimension: 'VIDEO_BITRATE',
    start: moment.utc().startOf('minute').subtract(minutes, 'minute').format(),
    end: moment.utc().startOf('minute').format(),
    interval: 'MINUTE'
  };

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('MIN', bitrate), api.fetchAnalytics('MAX', bitrate), api.fetchAnalytics('AVG', bitrate)])
    .then((results) => {
      const minBitrate = results[0];
      const byTime = (a,b) => { return a[0] - b[0]; };
      minBitrate.sort(byTime);
      const maxBitrate = results[1];
      maxBitrate.sort(byTime);
      const avgBitrate = results[2];
      avgBitrate.sort(byTime);
      resolve([minBitrate, maxBitrate, avgBitrate]);
    })
  });
}

export function fetchAverageStartupDelayThisWeek(api) {
  return new Promise((resolve) => {
    Promise.all([startupDelay.fetchPlayerStartupDelay(api, ranges.thisWeek),
      startupDelay.fetchPlayerStartupDelay(api, ranges.lastWeek)])
      .then((results) => {
        resolve(formatResult(results[0], results[1], (val) => { return Math.round(val) + " ms"; }));
      });
  });
}

export function fetchAverageVideoStartupDelayThisWeek(api) {
  return new Promise((resolve) => {
    Promise.all([startupDelay.fetchVideoStartupDelay(api, ranges.thisWeek),
      startupDelay.fetchVideoStartupDelay(api, ranges.lastWeek)])
      .then((results) => {
        resolve(formatResult(results[0], results[1], (val) => { return Math.round(val) + " ms"; }));
      });
  });
}

export function fetchStreamTypesLastDays(api, days) {
  const vodQuery = {
    dimension: 'IMPRESSION_ID',
    start: moment.utc().startOf('day').subtract(days, 'day').format(),
    end: moment.utc().startOf('day').format(),
    interval: 'DAY',
    filters: [
      {
        name: 'IS_LIVE',
        operator: 'EQ',
        value: false
      }
    ]
  };

  const liveQuery = {
    ...vodQuery,
    filters: [
      {
        name: 'IS_LIVE',
        operator: 'EQ',
        value: true
      }
    ]
  };

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('COUNT', vodQuery), api.fetchAnalytics('COUNT', liveQuery)])
    .then((results) => {
      const vodData = results[0].sort((a, b) => {
        return a[0] - b[0];
      });

      const liveData = results[1].sort(function(a,b) {
        return a[0] - b[0];
      });
      resolve([vodData, liveData]);
    })
  });
}

export function fetchScalingLastDays(api, days) {
  const query  = {
    dimension: 'UPSCALE_FACTOR',
    start: moment.utc().startOf('day').subtract(days, 'day').format(),
    end: moment.utc().startOf('day').format(),
    interval: 'DAY'
  };

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('AVG', query)])
    .then((results) => {
      const data = results[0].sort((a,b) => {
        return a[0] - b[0];
      });

      const beatifiedData = data.map(row => {
        return [row[0], Math.round(row[1]*100)];
      });

      resolve(beatifiedData);
    })
  });
}

export function fetchVideoHeatMapImpressions(api, videoId) {
  return fetchHeatmap(api, 'COUNT', 'IMPRESSION_ID', videoId);
}

export function fetchVideoHeatMapErrors(api, videoId) {
  return fetchHeatmap(api, 'COUNT', 'ERROR_CODE', videoId);
}


export function fetchVideoHeatMapAvgBitrate(api, videoId) {
  return fetchHeatmap(api, 'AVG', 'VIDEO_BITRATE', videoId, avgBitrateFormatter);
}

function noopFormatter(data) {
  return data;
}

function avgBitrateFormatter(data) {
  return roundToTwo(data / 1000);
}

function fetchHeatmap(api, functionName, dimension, videoId, dataFormatter = noopFormatter) {
  const query = {
    dimension: 'VIDEO_DURATION',
    groupBy: ['VIDEO_ID'],
    start: moment.utc().startOf('day').subtract('7', 'days').format(),
    end: moment.utc().endOf('day').format(),
    filters: [
      {
        name: 'VIDEO_ID',
        operator: 'EQ',
        value: videoId
      }
    ]
  };

  const chunkSize = 5000;

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('MAX', query)])
    .then((results) => {
      const result = results[0];
      const videoDuration = result[0][1];

      var getChunkPromise = function (chunk) {
        var from = chunk * chunkSize;
        var to = (chunk + 1) * chunkSize;
        var query = {
          dimension: dimension,
          start: moment.utc().startOf('day').subtract('7', 'days').format(),
          end: moment.utc().endOf('day').format(),
          filters: [
            {
              name: 'VIDEO_ID',
              operator: 'EQ',
              value: videoId
            },
            {
              name: 'VIDEOTIME_START',
              operator: 'LTE',
              value: to
            },
            {
              name: 'VIDEOTIME_END',
              operator: 'GTE',
              value: from
            }
          ]
        };

        return new Promise(function (resolve, reject) {
          api.fetchAnalytics(functionName, query).then(function (second) {
            resolve({
              from: from,
              to: to,
              bucket: chunk,
              data: dataFormatter(second[0][0])
            });
          });
        });
      };

      var promises = [];
      for (var chunk = 0; chunk < Math.ceil(videoDuration / chunkSize); chunk++) {
        promises.push(getChunkPromise(chunk));
      }
      Promise.all(promises).then(function (seconds) {
        const data = seconds.map(second => {
          return [(second.bucket * chunkSize) / 1000, second.data];
        });

        const video = {
          seconds: data,
          length: videoDuration / 1000
        };

        resolve(video);
      });
    })
  });
}

function roundToTwo(num) {
  return +(Math.round(num + "e+2")  + "e-2");
}

export function fetchVideoImpressionsLastDaysPerDay(api, video, days, offset = 0) {
  const lastDaysQuery = (days, offset = 0) => {
    return {
      dimension: 'IMPRESSION_ID',
      start: moment.utc().startOf('day').subtract(days + offset, 'day').format(),
      end: moment.utc().startOf('day').subtract(offset, 'day').format(),
      interval: 'DAY',
      filters: [
        {
          name: 'VIDEO_ID',
          operator: 'EQ',
          value: video
        }
      ]
    }
  };

  return new Promise((resolve) => {
    api.fetchAnalytics('COUNT', lastDaysQuery(days, offset))
    .then((results) => {
      const data = results.sort((a,b) => {
        return a[0] - b[0];
      }).map((row) => {
        row[0] = moment(row[0]).format('dddd');
        return row;
      });
      resolve(data);
    })
  });
}
