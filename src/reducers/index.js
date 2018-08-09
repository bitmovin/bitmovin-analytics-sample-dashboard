import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';

import api from './api';
import impressionDetail from './impressionDetail';
import ranges from './ranges';
import query from './query';
import dashboard from './dashboard';

const bitanalytics = combineReducers({
  api,
  routing: routerReducer,
  impressionDetail: impressionDetail,
  ranges,
  query,
  dashboard,
});

export default bitanalytics;
