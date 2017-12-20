import React from 'react'
import thunkMiddelware from 'redux-thunk'
import createLogger from 'redux-logger'
import ReactDOM from 'react-dom'
import App from './App'
import ErrorDashboard from './ErrorDashboard'
import HomeDashboard from './HomeDashboard'
import TechnologyDashboard from './TechnologyDashboard'
import UserDashboard from './UserDashboard'
import QualityDashboard from './QualityDashboard'
import PerformanceDashboard from './PerformanceDashboard'
import ContentDashboard from './ContentDashboard'
import RebufferDashboard from './RebufferDashboard'
import VideoInspection from './components/VideoInspection'
import ImpressionDetail from './ImpressionDetail'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import ValidateSetup from './ValidateSetup'
import ApiKeyConfiguration from './ApiKeyConfiguration'
import QueryDashboard from './QueryDashboard'
import PlayersDashboard from './PlayersDashboard'
import ErrorDetail from './ErrorDetail'

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { Router, Route, IndexRoute, useRouterHistory } from 'react-router';
import { syncHistoryWithStore, routerMiddleware } from 'react-router-redux';
import { createHistory } from 'history'
import { initializeApplication } from './actions/api'

//import injectTapEventPlugin from 'react-tap-event-plugin';

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
//injectTapEventPlugin();

const hist = useRouterHistory(createHistory)({
  basename: '/'
});

import reducers from './reducers/index';


const middleWare = [thunkMiddelware, routerMiddleware(hist)];

if (process.env.NODE_ENV !== 'production') {
  const loggerMiddelware = createLogger();
  middleWare.push(loggerMiddelware);
}

const store = createStore(reducers, applyMiddleware(...middleWare));
const history = syncHistoryWithStore(hist, store);

store.dispatch(initializeApplication());

ReactDOM.render(
	<Provider store={store}>
    <MuiThemeProvider>
      <ApiKeyConfiguration>
        <Router history={history}>
            <Route path="/validate-setup" component={ValidateSetup} />
            <Route path="/" component={App}>
              <IndexRoute component={HomeDashboard} />
              <Route path="errors" component={ErrorDashboard} />
              <Route path="errors/:errorCode" component={ErrorDetail} />
              <Route path="performance" component={PerformanceDashboard} />
              <Route path="performance/rebuffer" component={RebufferDashboard} />
              <Route path="technology" component={TechnologyDashboard} />
              <Route path="users" component={UserDashboard} />
              <Route path="quality" component={QualityDashboard} />
              <Route path="content" component={ContentDashboard} />
              <Route path="videoinspection" component={VideoInspection} />
              <Route path="impressions/:impressionId" component={ImpressionDetail} />
              <Route path="querybuilder" component={QueryDashboard} />
              <Route path="players" component={PlayersDashboard} />
            </Route>
        </Router>
      </ApiKeyConfiguration>
    </MuiThemeProvider>
	</Provider>,
  document.getElementById('root')
);
