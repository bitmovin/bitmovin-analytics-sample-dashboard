import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as stats from '../api/stats';
import {push} from 'react-router-redux';
import VideoInspectionView from './VideoInspectionView';
import Api from '../api';

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

  async loadData({location, licenseKey, api}) {
    try {
      const videoId = location.query.video;
      const range = this.props.ranges.primaryRange;
      const isLive = await stats.isVideoLive(api, licenseKey, videoId, range);
      let video = undefined;
      let videoLength = 0;
      if (!isLive) {
        video = await stats.fetchVodVideoDetails(api, licenseKey, videoId, range);
        videoLength = video.length;
      }

      this.setState({
        isLoading: false,
        isLive: isLive,
        isNotFound: false,
        videoLength: videoLength,
        video: {...video, videoId},
      });
    } catch (e) {
      this.setState({
        isLoading: false,
        isNotFound: true,
      });
    }
  }

  render() {
    const {video, isLive, isLoading, isNotFound} = this.state;
    if (isLoading === true) {
      return <div>Loading...</div>;
    }
    if (isNotFound === true) {
      return <div>Could not find Video - have you selected the correct License?</div>;
    }
    return <VideoInspectionView video={video} isLive={isLive} />;
  }
}

const mapDispatchToProps = dispatch => {
  return {
    openImpression: impressionId => {
      dispatch(push('/impressions/' + impressionId));
    },
  };
};
const mapStateToProps = state => {
  return {
    api: new Api(state),
    licenseKey: state.api.analyticsLicenseKey,
    ranges: state.ranges,
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(VideoInspection);
