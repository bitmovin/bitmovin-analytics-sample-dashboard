import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as rebuffer from '../../../api/metrics/rebuffer'
import * as ranges from '../../../api/ranges'
import moment from 'moment'
import Card from '../../Card'
import ReactHighcharts from 'react-highcharts'
import scale from './scale'

class RebufferDurationGraph extends Component {
  constructor (props) {
    super(props);
    this.state = {
      series: []
    }
  }
  componentDidMount () {
    const convertResultToSeries = (results, column) => {
      results.sort((a,b) => { return a[0] - b[0]; });
      return results.map(row => {
        const ts = moment(row[0]).format('dddd')
        const val = Math.round(row[column]);
        return [ts, val];
      });
    }
    Promise.all([
      rebuffer.rebufferDuration(this.props.apiKey, ranges.thisWeek),
      rebuffer.rebufferDuration(this.props.apiKey, ranges.lastWeek)
    ]).then(results => {
      this.setState(prevState => {
        return {
          ...prevState,
          series: [{
            name: 'Rebuffer Duration this week',
            type: 'spline',
            data: convertResultToSeries(results[0], 3)
          },{
            name: 'Rebuffer Duration last week',
            type: 'spline',
            data: convertResultToSeries(results[1], 3)
          }]
        }
      })
    })
  }
  getMax () {
    const max = (memo, item) => {
      return Math.max(memo, item);
    }
    let m = this.state.series.map((series) => {
      return series.data.map(point => { return point[1]; }).reduce(max, 0);
    }).reduce(max, 0);
    return m * scale;
  }
  getSeries () {
    return this.state.series
  }
  chartConfig () {
    return {
      chart: {
        height: this.props.height
      },
      plotOptions: {
        column: {
          stacking: 'normal'
        }
      },
      title : {
        text: ''
      },
      xAxis : {
        type                : 'category',
        stackLabels: {
          enabled: true
        }
      },
      yAxis : [{
        plotLines: [{
          value: 0,
          width: 1,
        }],
        max: this.getMax(),
        title    : {
          text: 'Milliseconds'
        }
      }],
      tooltip    : {
        crosshairs: true,
        shared: true
      },
      series: this.getSeries(),
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
  }
  render () {
    return <Card cardHeight="auto" title="Rebuffer Duration per Impression" width={ this.props.width || { md: 6, sm: 6, xs: 12 }}>
      <ReactHighcharts config={this.chartConfig()} />
    </Card>
  }
}
const mapStateToProps = (state) => {
  return {
    apiKey: state.api.apiKey
  }
}
export default connect(mapStateToProps)(RebufferDurationGraph);
