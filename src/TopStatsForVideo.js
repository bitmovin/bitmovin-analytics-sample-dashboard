import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import * as topstats from './api/topstats'
import TopStatMetric from './components/TopStatMetric'
import { push } from 'react-router-redux'

function TopStatsForVideo({ apiKey, primaryRange, secondaryRange, videoId, licenseKey }) {
  const baseQuery = { licenseKey };

  return (
    <div>
      <div className="row tile_count">
        <TopStatMetric
          title="Users"
          icon="users"
          fetchData={() => topstats.fetchTotalUsersThisWeek(apiKey, primaryRange, secondaryRange, baseQuery, videoId)}
        />
        <TopStatMetric
          title="Impressions"
          icon="user"
          fetchData={() => topstats.fetchTotalImpressionsThisWeek(apiKey, primaryRange, secondaryRange, baseQuery, videoId)}
        />
        <TopStatMetric
          format="pct"
          title="Errors"
          icon="exclamation-triangle"
          inverse
          compareUserBase
          fetchData={() => topstats.fetchErrorPercentageThisWeek(apiKey, primaryRange, secondaryRange, baseQuery, videoId)}
        />
        <TopStatMetric
          format="pct"
          title="Buffering"
          icon="spinner"
          compareUserBase
          inverse
          fetchData={() => topstats.fetchRebufferPercentageThisWeek(apiKey, primaryRange, secondaryRange, baseQuery, videoId)}
        />
        <TopStatMetric
          format="ms"
          title="Delay"
          icon="clock-o"
          inverse
          compareUserBase
          fetchData={() => topstats.fetchAverageStartupDelayThisWeek(apiKey, primaryRange, secondaryRange, baseQuery, videoId)}
        />
        <TopStatMetric
          format="pct"
          title="Bounce Rate"
          icon="eject"
          inverse
          compareUserBase
          fetchData={() => topstats.fetchBounceRateThisWeek(apiKey, primaryRange, secondaryRange, baseQuery, videoId)}
        />
      </div>
    </div>
  )
}
TopStatsForVideo.propTypes = {
  videoId: PropTypes.string,
};

const mapStateToProps = (state) => {
	return {
		apiKey: state.api.apiKey,
		primaryRange: state.ranges.primaryRange,
		secondaryRange: state.ranges.secondaryRange,
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
