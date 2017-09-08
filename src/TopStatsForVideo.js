import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import * as topstats from './api/topstats'
import TopStatMetric from './components/TopStatMetric'
import { push } from 'react-router-redux'

class TopStatsForVideo extends Component {
  static propTypes = {
    videoId: PropTypes.string
  };

  constructor(props) {
    super(props);
    const defaultState = {
      primary: 0,
      secondary: 0,
      change: 0,
      userbase: 0
    };
    this.state = {
      impressions: defaultState,
      users: defaultState,
      errors: defaultState,
      bounceRate: defaultState,
      startupDelay: defaultState,
      rebufferPercentage: defaultState
    }
  }

  loadData (props) {
    const baseQuery = {
      licenseKey: props.licenseKey
    };

    topstats.fetchTotalUsersThisWeek(props.apiKey, props.ranges, baseQuery, props.videoId).then((data) => {
      this.setState(prevState => {
        return {
          ...prevState,
          users: data
        }
      });
    });

    topstats.fetchTotalImpressionsThisWeek(props.apiKey, props.ranges, baseQuery, props.videoId).then((data) => {
      this.setState(prevState => {
        return {
          ...prevState,
          impressions: data
        }
      })
    });

    topstats.fetchErrorPercentageThisWeek(props.apiKey, props.ranges, baseQuery, props.videoId).then((data) => {
      this.setState(prevState => {
        return {
          ...prevState,
          errors: data
        }
      })
    });

    topstats.fetchBounceRateThisWeek(props.apiKey, props.ranges, baseQuery, props.videoId).then((data) => {
      this.setState(prevState => {
        return {
          ...prevState,
          bounceRate: data
        }
      })
    });

    topstats.fetchAverageStartupDelayThisWeek(props.apiKey, props.ranges, baseQuery, props.videoId).then((data) => {
      this.setState(prevState => {
        return {
          ...prevState,
          startupDelay: data
        }
      })
    });

    topstats.fetchRebufferPercentageThisWeek(props.apiKey, props.ranges, baseQuery, props.videoId).then((data) => {
      this.setState(prevState => {
        return {
          ...prevState,
          rebufferPercentage: data
        }
      })
    })
  }

	componentDidMount () {
		this.loadData(this.props);
	}

	componentWillReceiveProps (nextProps) {
		this.loadData(nextProps);
	}

  metricColor(val) {
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
          <TopStatMetric title="Users" metric={this.state.users} icon="users"/>
          <TopStatMetric title="Impressions" metric={this.state.impressions} icon="user" />
          <TopStatMetric format="pct" title="Errors" metric={this.state.errors} icon="exclamation-triangle" inverse={true} compareUserBase={true} />
          <TopStatMetric format="pct" title="Buffering" metric={this.state.rebufferPercentage} icon="spinner" compareUserBase={true} inverse={true} />
          <TopStatMetric format="ms" title="Delay" metric={this.state.startupDelay} icon="clock-o" inverse={true} compareUserBase={true} />
          <TopStatMetric format="pct" title="Bounce Rate" metric={this.state.bounceRate} icon="eject" inverse={true} compareUserBase={true} />
      </div>
    </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(TopStatsForVideo);
