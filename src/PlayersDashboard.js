import React, {Component} from 'react';
import {connect} from 'react-redux';
import TopStats from './TopStats';
import StartupDelayByPlayer from './components/charts/performance/StartupDelayByPlayerVersion';
import RebufferDurationByPlayerVersion from './components/charts/performance/RebufferDurationByPlayerVersion';

class PlayersDashboard extends Component {
  render () {
    return <div>
      <TopStats />
      <div className="row">
        <StartupDelayByPlayer/>
      </div>
      <div className="row">
        <RebufferDurationByPlayerVersion/>
      </div>
    </div>
  }
}

const mapStateToProps = (state) => {
  return {
    apiKey: state.api.apiKey
  }
};

export default connect(mapStateToProps)(PlayersDashboard);
