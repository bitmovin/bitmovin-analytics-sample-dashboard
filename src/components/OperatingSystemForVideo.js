import React, { Component, PropTypes } from 'react'
import {connect} from 'react-redux'
import * as stats from '../api/stats'
import Card from './Card'
import ReactHighcharts from 'react-highcharts'
import { groupToNBuckets } from '../api/util'
import LoadingSpinner from './LoadingSpinner'

class OperatingSystemForVideo extends Component {
  static propTypes = {
    videoId: PropTypes.string
  };

  constructor (props) {
    super(props);
    this.state = {
      operatingSystems: [],
      display: 'chart'
    }
  }

  componentDidMount () {
    this.loadData(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this.loadData(nextProps);
  }

  loadData(props) {
    stats.fetchOperatingSystemsLastDaysForVideo(props.apiKey, {...props.range}, props.videoId).then((operatingSystems) => {
      this.setState(prevState => {
        return {
          ...prevState,
          operatingSystems
        }
      });
    });
  }

  renderChart () {
    const selector = (browser, browser2) => {
      return browser[1] - browser2[1];
    };

    const reducer = (others) => {
      return others.reduce((memo, one) => {
        memo[1] += one[1];
        return memo;
      }, ['Others', 0])
    };

    const data = groupToNBuckets(this.state.operatingSystems, 5, selector, reducer).map((x) => {
      return { name: x[0], y: x[1] }
    });
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
      series: [{ name: 'Operating System', data: data }],
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return <ReactHighcharts config={chartConfig} />
  }
  render () {
    return (
      <Card title="Operating System" width={{md:6, sm: 6, xs: 12}} cardHeight={"auto"}>
        {this.props.isLoading ? <LoadingSpinner height={220} /> : (this.renderChart())}
      </Card>);
  }
}

const mapStateToProps = (state) => {
  return {
    apiKey: state.api.apiKey,
    range: state.ranges.primaryRange
  }
};

export default connect(mapStateToProps)(OperatingSystemForVideo);
