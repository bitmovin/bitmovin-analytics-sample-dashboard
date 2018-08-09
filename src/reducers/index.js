import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'

import api from './api'
import impressionDetail from './impressionDetail'
import ranges from './ranges'
import query from './query'
import dashboard from './dashboard'
import topstats from './topstats'

const bitanalytics = combineReducers({
	api,
	routing: routerReducer,
	impressionDetail: impressionDetail,
  ranges,
  query,
  dashboard,
  topstats
});

export default bitanalytics;
