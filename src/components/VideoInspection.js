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

  async loadData({ location, apiKey }) {
    const videoId = location.query.video;
    const video = await stats.fetchVideoDetails(apiKey, videoId);

    this.setState({
      isLoading: false,
      videoLength: video.length,
      video: { ...video, videoId }
    });
  }

  render () {
    const videoId = this.props.location.query.video;
    const { video, isLoading } = this.state;
    if (isLoading === true) {
      return <div>Loading...</div>
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
export default connect((state) => { return {apiKey: state.api.apiKey };}, mapDispatchToProps)(VideoInspection);
