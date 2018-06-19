import * as actions from '../actions/topstats'

const defaultState = {};

export default function query(state = defaultState, action) {
  switch (action.type) {
    case actions.START_LOADING_TOPSTATS: {
      return {
        ...state,
        [action.name]: {
          loading: true,
          loaded: false
        }
      };
    }
    case actions.FINISHED_LOADING_TOPSTATS: {
      return {
        ...state,
        [action.name]: {
          loading: false,
          loaded: true,
          metric: action.metric
        }
      };
    }
    default:
      return state;
  }
}
