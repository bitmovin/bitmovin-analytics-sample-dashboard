import Api, {filter} from './index';
import * as ranges from './ranges';
import moment from 'moment';
import * as util from './util';

export function fetchUsersLastDaysPerDay(apiKey, baseQuery = {}) {
  const api = new Api(apiKey);
  const query = {
    dimension: 'USER_ID',
    interval: 'DAY',
    filters: [api.filter('VIDEOTIME_START', 'GT', 0)],
    ...baseQuery
  }
  return api.fetchAnalytics('COUNT', query);
}

export function fetchOperatingSystemsLastDays(apiKey, days) {
  const api = new Api(apiKey);
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

export function fetchOperatingSystemsLastDaysForVideo(apiKey, baseQuery, videoId) {
  const api = new Api(apiKey);
  const operatingSystemsQuery = {
    dimension: 'IMPRESSION_ID',
    ...baseQuery,
    groupBy: ['OPERATINGSYSTEM'],
    filters: [api.filter('PLAYED', 'GT', 0)]
  };

  if (videoId) {
    operatingSystemsQuery.filters.push({
      name    : 'VIDEO_ID',
      operator: 'EQ',
      value   : videoId
    });
  }

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

export function fetchBrowsersLastDaysForVideo(apiKey, baseQuery, videoId) {
  const api = new Api(apiKey);
  const operatingSystemsQuery = {
    dimension: 'IMPRESSION_ID',
    ...baseQuery,
    groupBy: ['BROWSER'],
    filters: [api.filter('PLAYED', 'GT', 0)]
  };

  if (videoId) {
    operatingSystemsQuery.filters.push({
      name    : 'VIDEO_ID',
      operator: 'EQ',
      value   : videoId
    });
  }

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

export function fetchBrowsersGrouped(apiKey, baseQuery) {
  const api = new Api(apiKey);
  const lastDaysQuery = {
    dimension: 'IMPRESSION_ID',
    ...baseQuery,
    filters: [
      api.filter('VIDEO_STARTUPTIME', 'GT', 0)
    ],
    groupBy: 'BROWSER'
  };
  return api.fetchAnalytics('COUNT', lastDaysQuery).then(results => {
    const sorted = results.sort((a,b) => b[1]-a[1]);
    const buckets = util.find80Percent(sorted, x => x[1]);
    return util.groupUnsortedToNBuckets(sorted, buckets, x => {
      const res = ['Others', x.map(x => x[1]).reduce((a,b) => a+b, 0)]
      return res
    });
  });
}

export function fetchBrowserLastDays(apiKey, baseQuery, browser) {
  const api = new Api(apiKey);
  const lastDaysQuery = {
    dimension: 'IMPRESSION_ID',
    ...baseQuery,
    filters: [
      api.filter('BROWSER', 'CONTAINS', browser),
      api.filter('VIDEO_STARTUPTIME', 'GT', 0)
    ]
  };

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('COUNT', lastDaysQuery)])
    .then((results) => {
      resolve(results[0][0][0]);
    })
  });
}

export function fetchOperatingSystemGrouped(apiKey, baseQuery) {
  const api = new Api(apiKey);
  const lastDaysQuery = {
    dimension: 'IMPRESSION_ID',
    ...baseQuery,
    filters: [
      api.filter('PLAYED', 'GT', 0)
    ],
    groupBy: 'OPERATINGSYSTEM'
  };

  return api.fetchAnalytics('COUNT', lastDaysQuery).then((results) => {
    const sorted = results.sort((a,b) => b[1]-a[1]);
    const buckets = util.find80Percent(sorted, x => x[1]);
    return util.groupUnsortedToNBuckets(sorted, buckets, x => {
      const res = ['Others', x.map(x => x[1]).reduce((a,b) => a+b, 0)]
      return res
    });
  })
}

export function fetchOperatingSystemLastDays(apiKey, baseQuery, os) {
  const api = new Api(apiKey);
  const lastDaysQuery = {
    dimension: 'IMPRESSION_ID',
    ...baseQuery,
    filters: [
      api.filter('OPERATINGSYSTEM', 'CONTAINS', os),
      api.filter('PLAYED', 'GT', 0)
    ]
  };

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('COUNT', lastDaysQuery)])
    .then((results) => {
      resolve({
        name: os,
        data: results[0][0][0]
      });
    })
  });
}

export function fetchPlayerTechnologyGrouped(apiKey, baseQuery) {
  const api = new Api(apiKey);
  const lastDaysQuery = {
    dimension: 'IMPRESSION_ID',
    ...baseQuery,
    filters: [
      api.filter('VIDEO_STARTUPTIME', 'GT', 0)
    ],
    groupBy: 'PLAYER_TECH'
  };

  return api.fetchAnalytics('COUNT', lastDaysQuery);
}

export function fetchPlayerTechnologyLastDays(apiKey, baseQuery, playerTechnology) {
  const api = new Api(apiKey);
  const lastDaysQuery = {
    dimension: 'IMPRESSION_ID',
    ...baseQuery,
    filters: [
      api.filter('PLAYER_TECH', 'EQ', playerTechnology),
      api.filter('PLAYED', 'GT', 0)
    ]
  };

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('COUNT', lastDaysQuery)])
    .then((results) => {
      resolve(results[0][0][0]);
    })
  });
}

export function fetchMinMaxAvgBitrate(apiKey, baseQuery) {
  const api = new Api(apiKey);
  const bitrate = {
    dimension: 'VIDEO_BITRATE',
    ...baseQuery,
    filters: [
      api.filter('PLAYED', 'GT', 0),
      api.filter('VIDEO_BITRATE', 'GT', 0)
    ]
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

export function fetchStreamTypesLastDays(apiKey, baseQuery = {}) {
  const api = new Api(apiKey);
  const vodQuery = {
    dimension: 'IMPRESSION_ID',
    ...baseQuery,
    filters: [
      api.filter('IS_LIVE', 'EQ', false),
      api.filter('PLAYED', 'GT', 0)
    ]
  };

  const liveQuery = {
    ...vodQuery,
    filters: [
      api.filter('IS_LIVE', 'EQ', true),
      api.filter('PLAYED', 'GT', 0)
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

export function fetchScalingLastDays(apiKey, baseQuery = {}) {
  const api = new Api(apiKey);
  const query  = {
    dimension: 'SCALE_FACTOR',
    interval: 'DAY',
    ...baseQuery
  };

  return new Promise((resolve) => {
    Promise.all([api.fetchAnalytics('AVG', query)])
    .then((results) => {
      const data = results[0].sort((a,b) => {
        return a[0] - b[0];
      });

      resolve(data);
    })
  });
}

export async function fetchVideoDetails(apiKey, videoId) {
  const api = new Api(apiKey);
  const query = {
    dimension: 'VIDEO_DURATION',
    groupBy: ['VIDEO_ID', 'MPD_URL', 'M3U8_URL', 'PROG_URL'],
		...ranges.thisWeek,
    filters: [
      {
        name: 'VIDEO_DURATION',
        operator: 'GT',
        value: 0
      }
    ]
  };

  if (videoId) {
    query.filters.push({
      name: 'VIDEO_ID',
      operator: 'EQ',
      value: videoId
    });
  }

  const [result,] = await api.fetchAnalytics('MAX', query);
  const [, mpdUrl, m3u8Url, progUrl, videoDuration] = result;

  return  { mpdUrl, m3u8Url, progUrl, length: videoDuration / 1000 };
}


export function fetchLastImpressions(apiKey, baseQuery = {}, videoId) {
  const api = new Api(apiKey);
  const impressions = {
    dimension: 'MINUTE',
    ...baseQuery,
    groupBy: ['IMPRESSION_ID'],
    orderBy: [
      {
        name: 'FUNCTION',
        order: 'DESC'
      }
    ],
    filters: baseQuery.filters ? baseQuery.filters : [api.filter('PLAYED', 'GT', 0)]
  };

  if (videoId) {
    impressions.filters.push(api.filter('VIDEO_ID', 'EQ', videoId));
  }

  return new Promise((resolve) => {
    api.fetchAnalytics('MIN', impressions).then((results) => {
      const promises = [];
      for (let i = 0; i < results.length; i++) {
        promises.push(api.getImpression(results[i][0]));
      }

      Promise.all(promises).then(function (impressions) {
        const returnImpressions = impressions.map(impression => {
          const commulatedImpression = {
            ...impression[0]
          };

          for (let i = 1; i < impression.length; i++) {
            commulatedImpression.played += impression[i].played;
            if (impression[i].videotime_end > 0 && impression[i].video_startuptime === 0 && impression[i].player_startuptime === 0) {
              commulatedImpression.buffered += impression[i].buffered;
            }
            commulatedImpression.ad += impression[i].ad;
            commulatedImpression.seeked += impression[i].seeked;
            commulatedImpression.paused += impression[i].paused;

            if (impression[i].video_startuptime > 0) {
              commulatedImpression.video_startuptime = impression[i].video_startuptime;
            }
          }

          let completionRate;
          if (impression[0].video_duration === null) {
            completionRate = 'Livestream';
          } else if (impression[0].video_duration === 0) {
            completionRate = 'No Data';
          } else {
            completionRate = roundToTwo((commulatedImpression.played / impression[0].video_duration*100)) + '%';
          }

          commulatedImpression.completion_rate =  completionRate;
          commulatedImpression.time = moment(moment(commulatedImpression.time)).local().format('YYYY-MM-DD HH:mm:ss');
          commulatedImpression.samples = impression;

          return commulatedImpression;
        });

        resolve(returnImpressions);
      });
    })
  });
}

export function fetchVideoHeatMapImpressions(apiKey, video) {
  return fetchHeatmap(apiKey, video, 'COUNT', 'IMPRESSION_ID', noopFormatter, [filter('PLAYED', 'GT', 0)]);
}

export function fetchVideoHeatMapAvgBitrate(apiKey, video) {
  return fetchHeatmap(apiKey, video, 'AVG', 'VIDEO_BITRATE', avgBitrateFormatter, [filter('VIDEO_BITRATE', 'GT', 0)]);
}

export function fetchVideoHeatMapErrors(apiKey, video) {
  return fetchHeatmap(apiKey, video, 'COUNT', 'ERROR_CODE');
}

export function fetchVideoHeatMapBuffering(apiKey, video) {
  return fetchHeatmap(apiKey, video, 'AVG', 'BUFFERED', bufferingFormatter, [filter('PLAYER_STARTUPTIME', 'EQ', 0), filter('VIDEO_STARTUPTIME', 'EQ', 0)]);
}

function noopFormatter(data) {
  return data;
}

function avgBitrateFormatter(data) {
  return roundToTwo(data / (1024*1024));
}

function bufferingFormatter(data) {
  return roundToTwo(data);
}

function fetchHeatmap(apiKey, video, functionName, dimension, dataFormatter = noopFormatter, filters = []) {
  const api = new Api(apiKey);
  const maxRequests = 20;
  const chunkSize = Math.floor(video.length * 1000 / maxRequests);
  if (!video.length) {
    return Promise.reject({})
  }

  return new Promise((resolve) => {
    const getChunkPromise = function (chunk) {
      const from = chunk * chunkSize;
      const to = (chunk + 1) * chunkSize;
      const query = {
        dimension: dimension,
				...ranges.thisWeek,
        filters: [{
            name: 'VIDEOTIME_START',
            operator: 'LTE',
            value: to
          },
          {
            name: 'VIDEOTIME_END',
            operator: 'GTE',
            value: from
          },
          ...filters
        ]
      };

      if (video.videoId) {
        query.filters.push({
          name: 'VIDEO_ID',
          operator: 'EQ',
          value: video.videoId
        });
      }

      return new Promise(function (resolve, reject) {
        api.fetchAnalytics(functionName, query).then(function (second) {
          resolve({
            from: from,
            to: to,
            bucket: chunk,
            data: dataFormatter(second[0][0])
          });
        }).catch(function(error) {
          resolve({
            from: from,
            to: to,
            bucket: chunk,
            data: dataFormatter(0)
          });
        });
      });
    };

    const promises = [];
    for (let chunk = 0; chunk < Math.ceil(video.length*1000 / chunkSize); chunk++) {
      promises.push(getChunkPromise(chunk));
    }
    Promise.all(promises).then(function (seconds) {
      const data = seconds.map(second => {
        return [(second.bucket * chunkSize) / 1000, second.data];
      });

      const returnVideo = {
        seconds: data,
        mpdUrl: video.mpdUrl,
        m3u8Url: video.m3u8Url,
        progUrl: video.progUrl,
        length: video.length / 1000
      };

      resolve(returnVideo);
    });

  });
}

function roundToTwo(num) {
  return +(Math.round(num + "e+2")  + "e-2");
}

export function fetchVideoImpressionsLastDaysPerDay(apiKey, video, days, offset = 0) {
  const api = new Api(apiKey);
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

export function fetchPossibleValues(apiKey, column) {
  const api = new Api(apiKey);
  const query  = {
    dimension: 'IMPRESSION_ID',
    start: moment.utc().startOf('second').subtract(365, 'day').format(),
    end: moment.utc().startOf('day').format(),
    groupBy: [column],
    limit: 100,
    orderBy: [{
      name: 'FUNCTION',
      order: 'DESC'
    }]
  };

  return new Promise((resolve) => {
    api.fetchAnalytics('COUNT', query).then((data) => {
      resolve(data);
    })
  });
}
