import React, {Component} from 'react';
import {connect} from 'react-redux';
import TopStats from './TopStats';
import BitrateChart from './components/charts/quality/BitrateChart';
import Scaling from './components/Scaling';
import ScalingGrouped from './components/charts/scaling/ScalingGrouped';

class QualityDashboard extends Component {
  render() {
    return (
      <div>
        <TopStats />
        <div className="row">
          <BitrateChart />
        </div>
        <br />
        <div className="row">
          <Scaling height="300" />
          <ScalingGrouped grouping="STREAM_FORMAT" title="Scaling Percentage by Stream Format" height="300" />
        </div>
        <div className="row">
          <ScalingGrouped grouping="BROWSER" title="Scaling Percentage by Browser" height="300" />
          <ScalingGrouped grouping="OPERATINGSYSTEM" title="Scaling Percentage by Operating System" height="300" />
        </div>
      </div>
    );
  }
}

export default connect(state => {
  return {apiKey: state.api.apiKey};
})(QualityDashboard);
