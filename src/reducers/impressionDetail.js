import * as impressionDetailActions from '../actions/impressionDetailActions.js';

const defaultState = {
  impressionId: '',
  isLoaded: false,
  impressionData: [],
  videoId: null,
  isLive: false,
  topBar: {},
  ipinfo: {
    loaded: false,
    isp: null,
    as: null,
  },
};

function impressionDetail(state = defaultState, action) {
  switch (action.type) {
    case impressionDetailActions.LOAD_IMPRESSION: {
      const isLive = action.impressionData.filter(x => x.is_live === true).length > 0;
      const newState = {
        ...state,
        impressionId: action.impressionId,
        impressionData: action.impressionData,
        isLoaded: true,
        topBar: {},
        loadedInBackground: action.loadedInBackground,
        isLive,
      };
      return newState;
    }
    case impressionDetailActions.LOADED_TOPBAR_METRIC: {
      const newState = {
        ...state,
        topBar: {
          ...state.topBar,
        },
      };
      newState.topBar[action.metric] = action.metricData;
      return newState;
    }
    case impressionDetailActions.LOADED_IP_INFORMATION: {
      return {
        ...state,
        ipinfo: {
          loaded: true,
          isp: action.ipData.isp,
          as: action.ipData.as,
          city: action.ipData.city,
          country: action.ipData.country,
        },
      };
    }
    default:
      return state;
  }
}

export default impressionDetail;
