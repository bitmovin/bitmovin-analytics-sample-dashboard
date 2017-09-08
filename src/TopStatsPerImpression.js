import React, { Component } from 'react'
import { connect } from 'react-redux'
import TopStatImpressionMetric from './components/TopStatImpressionMetric'
import { push } from 'react-router-redux'

class TopStatsPerImpression extends Component {
  static metricColor(val) {
    if (val > 0) {
      return 'green';
    } else if (val === 0) {
      return '';
    }
    return 'red';
  }

  render () {
      return <div>
        <div className="row tile_count">
        <TopStatImpressionMetric title="Time Played" metric={this.props.metrics.timePlayed} icon="clock-o" />
        <TopStatImpressionMetric title="Time spent rebuffering" metric={this.props.metrics.rebuffering} icon="spinner" inverse={true} />
        <TopStatImpressionMetric title="Delay" metric={this.props.metrics.startupTime} icon="hourglass-half" inverse={true} />
        <TopStatImpressionMetric title="Average Bitrate" metric={this.props.metrics.avgBitrate} icon="wifi" inverse={false} />
      </div>
    </div>
  }
}

const mapStateToProps = (state) => {
  const defaultMetric = {
    impression: 0,
    average: 0,
    change: 0
  };

  const getMetricFromState = (metric) => {
    if (state.impressionDetail.topBar[metric]) {
      return state.impressionDetail.topBar[metric];
    }
    return defaultMetric;
  };

  return {
    metrics: {
      timePlayed: getMetricFromState('timePlayed'),
      rebuffering: getMetricFromState('rebuffering'),
      startupTime: getMetricFromState('startupTime'),
      avgBitrate: getMetricFromState('avgBitrate')
    }
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    navigateToPerformance: () => {
      dispatch(push('/performance'));
    },
    navigateToRebuffer: () => {
      dispatch(push('/performance/rebuffer'))
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(TopStatsPerImpression);
