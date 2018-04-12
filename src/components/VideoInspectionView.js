import React, { Component } from 'react';
import TopStatsForVideo from '../TopStatsForVideo'
import VideoImpressionsChart from './VideoImpressionsChart'
import VideoConcurrentViewersChart from './VideoConcurrentViewersChart'
import OperatingSystemForVideo from './OperatingSystemForVideo'
import EngagementForVideo from './EngagementForVideo'
import AverageBitrateForVideo from './AverageBitrateForVideo'
import ErrorsForVideo from './ErrorsForVideo'
import AverageBufferingForVideo from './AverageBufferingForVideo'
import BrowserForVideo from './BrowserForVideo'
import ImpressionsList from './ImpressionsList'

class VideoInpsectionView extends Component {
  render() {
    const video = this.props.video;
    const videoId = video.videoId;

    if(this.props.isLive) {
      return this.renderLiveVideoStats(videoId);
    }

    return <div>
        <TopStatsForVideo videoId={videoId}/>
        <div className="alert alert-light">
          We detected that this video is Vod
        </div>
        <div className="row">
          <VideoImpressionsChart videoId={videoId}/>
        </div>
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
  }

  renderLiveVideoStats(videoId) {
    return <div>
        <TopStatsForVideo videoId={videoId}/>
        <div className="alert alert-light">
          We detected that this video is live
        </div>
        <div className="row">
          <VideoImpressionsChart videoId={videoId}/>
        </div>
        <div className="row">
          <VideoConcurrentViewersChart videoId={videoId}/>
        </div>
        <br></br>
        <div className="row">
          <OperatingSystemForVideo videoId={videoId}/>
          <BrowserForVideo videoId={videoId}/>
        </div>
    </div>
  }
}

export default VideoInpsectionView