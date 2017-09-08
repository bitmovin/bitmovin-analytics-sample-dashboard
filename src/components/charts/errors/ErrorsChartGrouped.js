import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Card from '../../Card'
import ReactHighcharts from 'react-highcharts'
import * as errors from '../../../api/metrics/errors'
import * as ranges from '../../../api/ranges'
import * as d3 from 'd3'
import * as util from '../../../api/util'
import _ from 'underscore'

class ErrorsChartGrouped extends Component {
  constructor (props) {
    super(props);
    this.state = {
      errors: [],
      display: 'chart'
    }
  }
  static propTypes = {
    width: PropTypes.object,
    title: PropTypes.string.isRequired,
    groupBy: PropTypes.string.isRequired,
    primaryRange: PropTypes.object.isRequired,
    interval: PropTypes.string.isRequired
  }
  loadData (props) {
    errors.fetchErrorPercentageGrouped(props.apiKey, props.groupBy.toUpperCase(), props.interval, props.primaryRange).then(data => {
      data = util.sortByFirstColumn(data);
      const grouped = _.groupBy(data, (row) => { return row[1]; });
      let series = [];
      for (let os of Object.keys(grouped)) {
        const total = grouped[os].map(row => {
          return row[2];
        }).reduce((acc, val) => {
          return acc + val;
        }, 0);
        series.push({
          name: os,
          type: 'spline',
          data: grouped[os].map(row => {
            return [row[0], util.roundTo(row[4], 4) * 100]
          }),
          total
        })
      }
      series = series.sort((a, b) => {
        return a.total - b.total;
      });
      series = series.slice(0, 5);
      this.setState(prevState => {
        return {
          ...prevState,
          errors: series,
          maxErrorPercentage: this.getMaxErrorPercentage(series)
        }
      })
    });
  }
  componentDidMount () {
    this.loadData(this.props);
  }
	componentWillReceiveProps (nextProps) {
		this.loadData(nextProps);
	}
  getMaxErrorPercentage (data) {
    return d3.max(data, (series) => {
      return d3.max(series.data, (row) => {return row[1]; });
    }) * 3;
  }
  render () {
    const chartConfig = {
      chart: {
        height: 400
      },
      title : {
        text: ''
      },
      xAxis : {
        type : 'datetime',
        dateTimeLabelFormats: {
          month: '%e. %b',
          year : '%b'
        }
      },
      tooltip: {
        shared: true,
        crosshairs: true
      },
      yAxis : {
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }],
        min: 0,
        max: this.state.maxErrorPercentage,
        title    : {
          text: 'Error Percentage'
        }
      },
      series: this.state.errors,
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE'],
    };
    return <Card fixedHeight={true} title={this.props.title} width={ this.props.width || { md: 8, sm: 8, xs: 12 }} cardHeight={"480px"}>
      <ReactHighcharts config={chartConfig} />
    </Card>
  }
}

const mapStateToProps = (state) => {
  return {
    apiKey: state.api.apiKey,
    primaryRange: state.ranges.primaryRange,
    interval: state.ranges.interval
  };
}
export default connect(mapStateToProps)(ErrorsChartGrouped);
