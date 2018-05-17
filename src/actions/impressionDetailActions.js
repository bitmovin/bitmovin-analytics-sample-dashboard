export const LOAD_IMPRESSION = 'LOAD_IMPRESSION';
export const LOADED_TOPBAR_METRIC = 'LOADED_TOPBAR_METRIC';
export const LOADED_IP_INFORMATION = 'LOADED_IP_INFORMATION';

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

export function loadImpression(api, impressionId) {
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

        impressionstats.fetchTotalTimePlayedThisWeek(api, data, videoId).then((data) => {
          dispatch(loadedTopBarMetric('timePlayed', data))
        });

        impressionstats.fetchRebufferPercentage(api, data, videoId).then((data) => {
          dispatch(loadedTopBarMetric('rebuffering', data));
        });


        if (loadedInBackground !== true) {
          impressionstats.fetchStartupTime(api, data, videoId).then((data) => {
            dispatch(loadedTopBarMetric('startupTime', data))
          })
        } else {
          impressionstats.fetchTimeToFirstFrame(api, data, videoId).then((data) => {
            dispatch(loadedTopBarMetric('startupTime', data))
          })
        }

        impressionstats.fetchAverageBitrate(api, data, videoId).then(data => {
          dispatch(loadedTopBarMetric('avgBitrate', data));
        });

        ipLookup(api.apiKey, data[0].ip_address).then(data => {
          dispatch(loadedIpInformation(impressionId, data));
        })
      })
    }
}
