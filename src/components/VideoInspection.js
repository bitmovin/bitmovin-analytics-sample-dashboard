import React, { Component } from 'react'
import {connect} from 'react-redux'
import TopStatsForVideo from '../TopStatsForVideo'
import * as stats from '../api/stats'
import VideoImpressionsChart from './VideoImpressionsChart'
import OperatingSystemForVideo from './OperatingSystemForVideo'
import EngagementForVideo from './EngagementForVideo'
import AverageBitrateForVideo from './AverageBitrateForVideo'
import ErrorsForVideo from './ErrorsForVideo'
import AverageBufferingForVideo from './AverageBufferingForVideo'
import BrowserForVideo from './BrowserForVideo'
import { push } from 'react-router-redux'
import ImpressionsList from './ImpressionsList'

class VideoInspection extends Component {
  constructor(props) {
    super(props);
    this.syncTimeout = null;

    this.state = {
      isLoading: true,
      videoLength: 0,
      video: {},
    };
  }

  componentDidMount() {
    this.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.loadData(newProps);
  }

  async loadData({ location, licenseKey, apiKey }) {
    try {
      const videoId = location.query.video;
      const isLive = await stats.isVideoLive(apiKey, licenseKey, videoId)

      if (!isLive) {
        const video = await stats.fetchVodVideoDetails(apiKey, licenseKey, videoId);
        this.setState({
          isLoading: false,
          isLive: isLive,
          isNotFound: false,
          videoLength: video.length,
          video: { ...video, videoId }
        });
      } else {
        this.setState({
          isLoading: false,
          isLive: true,
          isNotFound: false,
          videoLength: 0,
        });
      }

    } catch (e) {
      this.setState({
        isLoading: false,
        isNotFound: true
      })
    }
  }

  render () {
    const videoId = this.props.location.query.video;
    const { video, isLive, isLoading, isNotFound } = this.state;
    if (isLoading === true) {
      return <div>Loading...</div>
    }
    if (isNotFound === true) {
      return <div>Could not find Video - have you selected the correct License?</div>
    }
    if (isLive === true) {
      return <div>This video is Live</div>
    }

    return (
      <div>
        <TopStatsForVideo videoId={videoId}/>
        <br></br>
        <div className="row">
          <VideoImpressionsChart videoId={videoId}/>
        </div>
        <br></br>
        <div className="row">
          <OperatingSystemForVideo videoId={videoId}/>
          <BrowserForVideo videoId={videoId}/>
        </div>
        <div className="row">
          <EngagementForVideo video={video} />
          <AverageBitrateForVideo video={video} />
        </div>
        <div className="row">
          <ErrorsForVideo video={video} />
          <AverageBufferingForVideo video={video} />
        </div>
        <div className="row">
          <ImpressionsList title="Last Impressions for this video" video={video} />
        </div>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    openImpression: (impressionId) => {
      dispatch(push('/impressions/' + impressionId))
    }
  }
}
const mapStateToProps = (state) => {
  return {
    apiKey: state.api.apiKey,
    licenseKey: state.api.analyticsLicenseKey
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(VideoInspection);
