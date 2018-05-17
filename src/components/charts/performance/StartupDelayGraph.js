import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import Card from '../../Card'
import ReactHighcharts from 'react-highcharts'
import * as startupDelay from '../../../api/metrics/startupdelay'
import * as ranges from '../../../api/ranges'
import moment from 'moment'

class StartupDelayGraph extends Component {
  static propTypes = {
    width: PropTypes.object
  }
  constructor (props) {
    super(props);
    this.state = {
      thisWeek: [],
      lastWeek: []
    }
  }
  componentDidMount () {
    const convertResultToSeries = (result) => {
      result.sort((a,b) => { return a[0] - b[0]; });
      return result.map(row => {
        row[0] = moment(row[0]).format('dddd')
        row[1] = Math.round(row[1]);
        return row;
      })
    }
    Promise.all([
      startupDelay.videoStartupDelayOverTime(this.props.api, ranges.thisWeek),
      startupDelay.videoStartupDelayOverTime(this.props.api, ranges.lastWeek)
    ]).then(results => {
      this.setState(prevState => {
        return {
          ...prevState,
          thisWeek: convertResultToSeries(results[0]),
          lastWeek: convertResultToSeries(results[1])
        }
      });
    })
  }
  getSeries () {
    return [{
      name: 'This Week',
      data: this.state.thisWeek
    }, {
      name: 'Last Week',
      data: this.state.lastWeek
    }];
  }
  chartConfig () {
    return {
      chart: {
        height: 250,
        type: 'spline'
      },
      title : {
        text: ''
      },
      xAxis : {
        type                : 'category'
      },
      yAxis : {
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
    return <Card title="Startup Delay over Time" width={this.props.width || {md: 12, sm: 12, xd: 12}} cardHeight="auto">
      <ReactHighcharts config={this.chartConfig()} />
    </Card>;
  }
}

const mapStateToProps = (state) => {
  return {
    api: new Api(state)
  };
};

export default connect(mapStateToProps)(StartupDelayGraph);
