export const LOAD_IMPRESSION = 'LOAD_IMPRESSION';
export const LOADED_TOPBAR_METRIC = 'LOADED_TOPBAR_METRIC';
export const LOADED_IP_INFORMATION = 'LOADED_IP_INFORMATION';

import Api from '../api'
import * as impressionstats from '../api/impressionstats'
import ipLookup from '../api/ispLookup'

export function loadedTopBarMetric(metric, metricData) {
  return {
    type: LOADED_TOPBAR_METRIC,
    metric,
    metricData
  }
}

export function loadedIpInformation(impressionId, ipData) {
  return {
    type: LOADED_IP_INFORMATION,
    impressionId,
    ipData
  }
}

export function loadImpression(apiKey, impressionId) {
    const api = new Api(apiKey);
    return (dispatch) => {
      api.getImpression(impressionId).then(data => {
        const videoId = data[0].video_id;
        const loadedInBackground = data.some(x => (x.page_load_type === 2));
        dispatch({
          type: LOAD_IMPRESSION,
          impressionId: impressionId,
          impressionData: data,
          loadedInBackground,
          videoId
        });

        impressionstats.fetchTotalTimePlayedThisWeek(apiKey, data, videoId).then((data) => {
          dispatch(loadedTopBarMetric('timePlayed', data))
        });

        impressionstats.fetchRebufferPercentage(apiKey, data, videoId).then((data) => {
          dispatch(loadedTopBarMetric('rebuffering', data));
        });


        if (loadedInBackground !== true) {
          impressionstats.fetchStartupTime(apiKey, data, videoId).then((data) => {
            dispatch(loadedTopBarMetric('startupTime', data))
          })
        } else {
          impressionstats.fetchTimeToFirstFrame(apiKey, data, videoId).then((data) => {
            dispatch(loadedTopBarMetric('startupTime', data))
          })
        }

        impressionstats.fetchAverageBitrate(apiKey, data, videoId).then(data => {
          dispatch(loadedTopBarMetric('avgBitrate', data));
        });

        ipLookup(apiKey, data[0].ip_address).then(data => {
          dispatch(loadedIpInformation(impressionId, data));
        })
      })
    }
}
