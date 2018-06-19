import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import * as topstats from './api/topstats'
import TopStatMetric from './components/TopStatMetric'
import { push } from 'react-router-redux'
import Api from './api';

function TopStatsForVideo({ api, primaryRange, secondaryRange, videoId, licenseKey }) {
  const baseQuery = { licenseKey };

  return (
    <div>
      <div className="row tile_count">
        <TopStatMetric
          title={"Users for video " + videoId}
          videoId={videoId}
          icon="users"
          fetchData={() => topstats.fetchTotalUsersThisWeek(api, primaryRange, secondaryRange, baseQuery, videoId)}
        />
        <TopStatMetric
          title={"Impressions for video " + videoId}
          videoId={videoId}
          icon="user"
          fetchData={() => topstats.fetchTotalImpressionsThisWeek(api, primaryRange, secondaryRange, baseQuery, videoId)}
        />
        <TopStatMetric
          format="pct"
          title={"Errors for video " + videoId}
          videoId={videoId}
          icon="exclamation-triangle"
          inverse
          compareUserBase
          fetchData={() => topstats.fetchErrorPercentageThisWeek(api, primaryRange, secondaryRange, baseQuery, videoId)}
        />
        <TopStatMetric
          format="pct"
          title={"Buffering for video " + videoId}
          videoId={videoId}
          icon="spinner"
          compareUserBase
          inverse
          fetchData={() => topstats.fetchRebufferPercentageThisWeek(api, primaryRange, secondaryRange, baseQuery, videoId)}
        />
        <TopStatMetric
          format="ms"
          title={"Delay for video " + videoId}
          videoId={videoId}
          icon="clock-o"
          inverse
          compareUserBase
          fetchData={() => topstats.fetchAverageStartupDelayThisWeek(api, primaryRange, secondaryRange, baseQuery, videoId)}
        />
        <TopStatMetric
          format="pct"
          title={"Bounce Rate for video " + videoId}
          videoId={videoId}
          icon="eject"
          inverse
          compareUserBase
          fetchData={() => topstats.fetchBounceRateThisWeek(api, primaryRange, secondaryRange, baseQuery, videoId)}
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
    api: new Api(state),
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
