import React, {Component} from 'react';
import {connect} from 'react-redux';
import TopStats from './TopStats';
import BrowserChart from './components/charts/technology/BrowserChart';
import OperatingSystemChart from './components/charts/technology/OperatingSystemChart';
import StreamFormatChart from './components/charts/technology/StreamFormatChart';
import PlayerTechnologyChart from './components/charts/technology/PlayerTechnologyChart';

class TechnologyDashboard extends Component {
  render() {
    return (
      <div>
        <TopStats />
        <div className="row">
          <BrowserChart />
          <OperatingSystemChart />
          <StreamFormatChart width={{md: 6, sm: 6, xs: 12}} />
          <PlayerTechnologyChart />
        </div>
      </div>
    );
  }
}

export default connect(state => {
  return {apiKey: state.api.apiKey};
})(TechnologyDashboard);
