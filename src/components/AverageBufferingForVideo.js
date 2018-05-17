import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import * as stats from '../api/stats';
import Card from './Card';
import ReactHighcharts from 'react-highcharts';
import LoadingIndicator from './LoadingIndicator';
import Api from '../api';

class AverageBufferingForVideo extends Component {
  static propTypes = {
    video: PropTypes.object.isRequired
  }

  state = {
    data: [],
    loading: false,
  }

  componentDidMount() {
    this.loadData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.loadData(nextProps);
  }

  async loadData({ api, video }) {
    this.setState({ loading: true });
    let range = this.props.ranges.primaryRange;
    const result = await stats.fetchVideoHeatMapBuffering(api, video, range);
    this.setState({ data: result.seconds, loading: false });
  }

  renderChart () {
    const { data } = this.state;

    const chartConfig = {
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
        max: 1000,
        title: {
          text: 'Milliseconds'
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
          return '<b>' + this.y + ' milliseconds buffered</b> at <b>' + this.x + ' seconds</b>';
        }
      },
      legend: {
        enabled: false
      },
      series: [{ name: 'Buffering', data }],
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return <ReactHighcharts config={chartConfig} />
  }
  render () {
    return (
      <Card title="Average Buffering" width={{md:6, sm: 6, xs: 12}} cardHeight="320px">
        <LoadingIndicator loading={this.state.loading}>
          {this.renderChart()}
        </LoadingIndicator>
      </Card>);
  }
}
const mapStateToProps = (state) => {
  return {
    api: new Api(state),
    ranges: state.ranges,
  }
};

export default connect(mapStateToProps)(AverageBufferingForVideo);
