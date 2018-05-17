import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import * as stats from '../api/stats';
import Card from './Card';
import ReactHighcharts from 'react-highcharts';
import { groupToNBuckets } from '../api/util';
import LoadingIndicator from './LoadingIndicator';
import Api from '../api';

class BrowserForVideo extends Component {
  static propTypes = {
    videoId: PropTypes.string.isRequired
  }

  state = {
    browsers: [],
    display: 'chart',
    loading: false,
  }

  componentDidMount() {
    this.loadData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.loadData(nextProps);
  }

  async loadData({ api, range, videoId }) {
    this.setState({ loading: true });
    const browsers = await stats.fetchBrowsersLastDaysForVideo(api, range, videoId);
    this.setState({ browsers, loading: false });
  }

  renderChart () {
    const selector = (browser, browser2) => browser[1] - browser2[1];
    const reducer = (others) => {
      const sum = others.reduce((memo, one) => memo + one[1], 0);
      return ['Others', sum];
    };
    const data = groupToNBuckets(this.state.browsers, 5, selector, reducer)
      .map(x => ({ name: x[0], y: x[1] }));
    const chartConfig = {
      chart: {
        type: 'pie',
        height: 220
      },
      title : {
        text: ''
      },
      xAxis : {
        type                : 'datetime',
        dateTimeLabelFormats: {
          month: '%e. %b',
          year : '%b'
        },
        title               : {
          text: 'Date'
        }
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          }
        }
      },
      series: [{ name: 'Browser', data: data }],
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return <ReactHighcharts config={chartConfig} />
  }
  render () {
    return (
      <Card title="Browser" width={{md:6, sm: 6, xs: 12}} cardHeight="auto">
        <LoadingIndicator loading={this.state.loading}>
          {this.renderChart()}
        </LoadingIndicator>
      </Card>);
  }
}
const mapStateToProps = (state) => {
  return {
    api: new Api(state),
    range: state.ranges.primaryRange
  }
};

export default connect(mapStateToProps)(BrowserForVideo);
