import React, {Component} from 'react'
import {connect} from 'react-redux'
import * as stats from '../../../api/stats'
import ReactHighcharts from 'react-highcharts'
import Card from '../../Card'

class QualityChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      maxBitrateSeries: {
        data: [],
        type: 'spline',
        name: 'Max Bitrate'
      },
      minBitrateSeries: {
        data: [],
        type: 'spline',
        name: 'Min Bitrate'
      },
      avgBitrateSeries: {
        data: [],
        type: 'spline',
        name: 'Avg Bitrate'
      }
    }
  }

  componentDidMount () {
    this.loadData(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this.loadData(nextProps);
  }

  loadData(props) {
    const baseQuery = {
      ...props.range,
      interval: props.interval,
      licenseKey: props.licenseKey
    };
    stats.fetchMinMaxAvgBitrate(props.apiKey, baseQuery).then((bitrates) => {
      this.setState(prevState => {
        return {
          ...prevState,
          maxBitrateSeries: {
            ...prevState.minBitrateSeries,
            data: bitrates[0]
          },
          minBitrateSeries: {
            ...prevState.maxBitrateSeries,
            data: bitrates[1]
          },
          avgBitrateSeries: {
            ...prevState.avgBitrateSeries,
            data: bitrates[2]
          }
        }
      });
    });
  }

  render() {
    const chartConfig = {
      title : {
        text: '',
        type: 'spline'
      },
      xAxis : {
        type                : 'datetime',
        dateTimeLabelFormats: {
          month: '%e. %b',
          year : '%b'
        }
      },
      yAxis : {
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }],
        title    : {
          text: 'Bit/sec'
        }
      },
      tooltip    : {
        shared    : true,
        crosshairs: true
      },
      series: [this.state.maxBitrateSeries, this.state.minBitrateSeries, this.state.avgBitrateSeries],
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return (
      <Card title="Video Bitrate" width={{md:12, sm: 12, xs: 12}} cardHeight={"500px"}>
        <ReactHighcharts config={chartConfig}/>
      </Card>);
  }
}

const mapStateToProps = (state) => {
  return {
    apiKey: state.api.apiKey,
    range: state.ranges.primaryRange,
    interval: state.ranges.interval,
    licenseKey: state.api.analyticsLicenseKey
  }
};

export default connect(mapStateToProps)(QualityChart);
