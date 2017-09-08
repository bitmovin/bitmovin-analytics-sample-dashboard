import React, { Component } from 'react'
import {connect} from 'react-redux'
import TopStatsForVideo from '../TopStatsForVideo'
import * as stats from '../api/stats'
import Card from './Card'
import ReactHighcharts from 'react-highcharts'
import VideoImpressionsChart from './VideoImpressionsChart'
import OperatingSystemForVideo from './OperatingSystemForVideo'
import BrowserForVideo from './BrowserForVideo'
import { push } from 'react-router-redux'
import LoadingSpinner from './LoadingSpinner'
import ImpressionsList from './ImpressionsList'

class VideoInspection extends Component {
  constructor(props) {
    super(props);
    this.syncTimeout = null;

    this.state = {
      isLoading: true,
      video: this.props.location.query.video,
      videoLength: 0,
      impressionsHeatmapSeries: {
        data: [],
        name: 'Engagement'
      },
      avgBitrateHeatmapSeries: {
        data: [],
        name: 'Average Bitrate'
      },
      errorsHeatmapSeries: {
        data: [],
        type: 'column',
        name: 'Errors'
      },
      bufferingHeatmapSeries: {
        data: [],
        name: 'Buffering'
      }
    };
  }

  componentDidMount() {
    stats.fetchVideoDetails(this.props.apiKey, this.state.video).then((video) => {
      this.setState(prevState => {
        return {
          ...prevState,
          videoLength: video.length
        }
      });

      video.videoId = this.state.video;

      Promise.all([
        stats.fetchVideoHeatMapImpressions(this.props.apiKey, video),
        stats.fetchVideoHeatMapAvgBitrate(this.props.apiKey, video),
        stats.fetchVideoHeatMapErrors(this.props.apiKey, video),
        stats.fetchVideoHeatMapBuffering(this.props.apiKey, video)
      ]).then(results => {
        this.setState(prevState => {
          return {
            ...prevState,
            isLoading: false,
            impressionsHeatmapSeries: {
              ...prevState.impressionsHeatmapSeries,
              data: results[0].seconds
            },
            avgBitrateHeatmapSeries: {
              ...prevState.avgBitrateHeatmapSeries,
              data: results[1].seconds
            },
            errorsHeatmapSeries: {
              ...prevState.errorsHeatmapSeries,
              data: results[2].seconds
            },
            bufferingHeatmapSeries: {
              ...prevState.bufferingHeatmapSeries,
              data: results[3].seconds
            }
          }
        })
      });
    });
  }

  render () {
    const impressionsChartConfig = {
      chart: {
        type: 'spline',
        height: 200
      },
      title: {
        text: ''
      },
      yAxis: {
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }],
        title    : {
          text: 'Impressions'
        }
      },
      xAxis: {
        title: {
          text: 'Seconds'
        }
      },
      plotOptions: {
        spline: {
          marker: {
            enabled: false
          }
        }
      },
      tooltip: {
        crosshairs: true,
        formatter: function() {
          return '<b>' + this.y + ' ' + this.series.name + '</b> at <b>' + this.x + ' seconds</b>';
        }
      },
      legend: {
        enabled: false
      },
      series: [this.state.impressionsHeatmapSeries],
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    const avgBitrateChartConfig = {
      ...impressionsChartConfig,
      yAxis: {
        ...impressionsChartConfig.yAxis,
        title: {
          text: 'Mbit/s'
        }
      },
      tooltip: {
        ...impressionsChartConfig.tooltip,
        formatter: function() {
          return '<b>' + this.y + ' MBit/s</b> at <b>' + this.x + ' seconds</b>';
        }
      },
      series: [this.state.avgBitrateHeatmapSeries]
    };
    const errorsChartConfig = {
      ...impressionsChartConfig,
      yAxis: {
        ...impressionsChartConfig.yAxis,
        title: {
          text: 'Number of Errors'
        }
      },
      series: [this.state.errorsHeatmapSeries]
    };
    const bufferingChartConfig = {
      ...impressionsChartConfig,
      yAxis: {
        ...impressionsChartConfig.yAxis,
        max: 1000,
        title: {
          text: 'Milliseconds'
        }
      },
      tooltip: {
        ...impressionsChartConfig.tooltip,
        formatter: function() {
          return '<b>' + this.y + ' milliseconds buffered</b> at <b>' + this.x + ' seconds</b>';
        }
      },
      series: [this.state.bufferingHeatmapSeries]
    };

    return (
      <div>
        <TopStatsForVideo videoId={this.state.video}/>
        <br></br>
        <div className="row">
          <VideoImpressionsChart isLoading={this.state.isLoading} videoId={this.state.video}/>
        </div>
        <br></br>
        <div className="row">
          <OperatingSystemForVideo isLoading={this.state.isLoading} videoId={this.state.video}/>
          <BrowserForVideo isLoading={this.state.isLoading} videoId={this.state.video}/>
        </div>
        <div className="row">
          <Card title="Engagement" width={{md:6, sm: 6, xs: 12}} cardHeight="320px">
            {this.state.isLoading ? <LoadingSpinner /> : <ReactHighcharts config={impressionsChartConfig} />}
          </Card>
          <Card title="Average Bitrate" width={{md:6, sm: 6, xs: 12}} cardHeight="320px">
            {this.state.isLoading ? <LoadingSpinner /> : <ReactHighcharts config={avgBitrateChartConfig} />}
          </Card>
        </div>
        <div className="row">
          <Card title="Errors" width={{md:6, sm: 6, xs: 12}} cardHeight="320px">
            {this.state.isLoading ? <LoadingSpinner /> : <ReactHighcharts config={errorsChartConfig} />}
          </Card>
          <Card title="Average Buffering" width={{md:6, sm: 6, xs: 12}} cardHeight="320px">
            {this.state.isLoading ? <LoadingSpinner /> : <ReactHighcharts config={bufferingChartConfig} />}
          </Card>
        </div>
        <div className="row">
          <ImpressionsList title="Last Impressions for this video" video={this.state.video} />
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
