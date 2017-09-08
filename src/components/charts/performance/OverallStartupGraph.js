
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Card from '../../Card'
import ReactHighcharts from 'react-highcharts'
import * as startupDelay from '../../../api/metrics/startupdelay'
import moment from 'moment'

class OverallStartupGraph extends Component {
  static propTypes = {
    width: PropTypes.object
  }
  constructor (props) {
    super(props);
    this.state = {
      videoStartup: [],
      playerStartup: []
    }
  }
	loadData (props) {
		const format = {
			MINUTE: 'HH:mm',
			DAY: 'dddd',
			HOUR: 'HH:00'
		}
    const convertResultToSeries = (result) => {
      result.sort((a,b) => { return a[0] - b[0]; });
      return result.map(row => {
        row[0] = moment(row[0]).format(format[props.interval])
        row[1] = Math.round(row[1]);
        return row;
      })
    }
    Promise.all([
      startupDelay.startupTimeOverTime(props.apiKey, props.interval, { ...props.primaryRange }),
			startupDelay.videoStartupDelayOverTime(props.apiKey, { ...props.primaryRange, interval: props.interval }),
			startupDelay.playerStartupDelayOverTime(props.apiKey, props.interval, props.primaryRange)
    ]).then(results => {
      this.setState(prevState => {
        const state = {
          ...prevState,
          overall: convertResultToSeries(results[0]),
          videoStartup: convertResultToSeries(results[1]),
          playerStartup: convertResultToSeries(results[2])
        }
        const formatState = (series) => {
        }
        formatState(state.overall);
        formatState(state.videoStartup);
        formatState(state.playerStartup);
        return state;
      });
    })
	}
  componentDidMount () {
		this.loadData(this.props);
  }
	componentWillReceiveProps(nextProps) {
		this.loadData(nextProps);
	}
  getSeries () {
    return [{
      name: 'Overall Pageload',
      type: 'spline',
      data: this.state.overall
    },{
      name: 'Player Startup',
      data: this.state.playerStartup
    },{
      name: 'Video Startup',
      data: this.state.videoStartup
    }];
  }
  chartConfig () {
    return {
      chart: {
        height: 250,
        type: 'areaspline'
      },
      title : {
        text: ''
      },
      xAxis : {
				type: 'category',
				stackLabels: {
					enabled: true
				}
      },
      plotOptions: {
        areaspline: {
          stacking: 'normal'
        }
      },
      yAxis : {
        min: 0,
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }],
        title    : {
          text: 'Milliseconds'
				}
      },
      tooltip    : {
        shared    : true,
        crosshairs: true
      },
      series: this.getSeries(),
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
  }
  render () {
    return <Card title="Detailed Startup Time" width={this.props.width || {md: 12, sm: 12, xd: 12}} cardHeight="auto">
      <ReactHighcharts config={this.chartConfig()} />
    </Card>;
  }
}

const mapStateToProps = (state) => {
	return {
		apiKey: state.api.apiKey,
		primaryRange: state.ranges.primaryRange,
		secondaryRange: state.ranges.secondaryRange,
		interval: state.ranges.interval
	};
}

export default connect(mapStateToProps)(OverallStartupGraph);
