import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';

import api from './api';
import impressionDetail from './impressionDetail';
import ranges from './ranges';

const bitanalytics = combineReducers({
  api,
  routing: routerReducer,
  impressionDetail: impressionDetail,
  ranges,
});

export default bitanalytics;
