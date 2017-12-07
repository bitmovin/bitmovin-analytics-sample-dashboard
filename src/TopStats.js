import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as topstats from './api/topstats'
import TopStatMetric from './components/TopStatMetric'
import { push } from 'react-router-redux'

class TopStats extends Component {
  metricColor(val) {
    if (val > 0) {
      return 'green';
    } else if (val === 0) {
      return '';
    }
    return 'red';
  }

  render () {
    const { licenseKey, apiKey, ranges } = this.props;
    const baseQuery = { licenseKey };

    return (
      <div>
        <div className="row tile_count">
          <TopStatMetric
            title="Users"
            icon="users"
            fetchData={() => topstats.fetchTotalUsersThisWeek(apiKey, ranges, baseQuery)}
          />
          <TopStatMetric
            title="Impressions"
            icon="user"
            fetchData={() => topstats.fetchTotalImpressionsThisWeek(apiKey, ranges, baseQuery)}
          />
          <TopStatMetric
            format="pct"
            title="Errors"
            icon="exclamation-triangle"
            inverse
            fetchData={() => topstats.fetchErrorPercentageThisWeek(apiKey, ranges, baseQuery)}
          />
          <TopStatMetric
            format="pct"
            onClick={this.props.navigateToRebuffer}
            title="Buffering"
            icon="spinner"
            compareUserBase
            inverse
            fetchData={() => topstats.fetchRebufferPercentageThisWeek(apiKey, ranges, baseQuery)}
          />
          <TopStatMetric
            format="ms"
            onClick={this.props.navigateToPerformance}
            title="Delay"
            icon="clock-o"
            inverse
            compareUserBase
            fetchData={() => topstats.fetchAverageStartupDelayThisWeek(apiKey, ranges, baseQuery)}
          />
          <TopStatMetric
            format="pct"
            title="Bounce Rate"
            icon="eject"
            inverse
            compareUserBase
            fetchData={() => topstats.fetchBounceRateThisWeek(apiKey, ranges, baseQuery)}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
	return {
		apiKey: state.api.apiKey,
		ranges: state.ranges,
    licenseKey: state.api.analyticsLicenseKey
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

export default connect(mapStateToProps, mapDispatchToProps)(TopStats);
