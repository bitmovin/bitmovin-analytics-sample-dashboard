import React, {Component} from 'react'
import {connect} from 'react-redux'
import * as stats from '../api/stats'
import ReactHighcharts from 'react-highcharts'
import Card from './Card'
import moment from 'moment'
import * as formats from '../formats'

class UsersChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      impressionSeries: {
        data: []
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
      ...props.primaryRange,
      interval: props.interval,
      groupBy: [],
      orderBy: [{ name: props.interval, order: 'ASC'}],
      licenseKey: this.props.licenseKey
    };

    stats.fetchUsersLastDaysPerDay(this.props.apiKey, baseQuery).then((data) => {
      const convertResultToSeriesData = (series) => {
        return series.map(row => {
          return [moment(row[0]).format(formats[props.interval]), row[1]];
        })
      };
      const series = [{
        name: 'Users',
        type: 'spline',
        data: convertResultToSeriesData(data)
      }];
      this.setState(prevState => {
        return {
          ...prevState,
          impressionSeries: series
        }
      });
    });
  }

  render() {
    const chartConfig = {
      chart: {
        height: this.props.height
      },
      title : {
        text: ''
      },
      tooltip: {
        shared: true
      },
      xAxis : {
        type : 'category',
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
          text: 'Users'
        }
      },
      series: this.state.impressionSeries,
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return (
      <Card title="Users" width={this.props.width || {md:12, sm: 12, xs: 12}} fixedHeight={false} cardHeight="auto">
        <ReactHighcharts config={chartConfig}/>
      </Card>);
  }
}

const mapStateToProps = (state) => {
  const { name, interval, primaryRange, secondaryRange } = state.ranges;
  return {
    apiKey: state.api.apiKey,
    name,
    interval,
    primaryRange,
    secondaryRange,
    licenseKey: state.api.analyticsLicenseKey
  }
};

export default connect(mapStateToProps)(UsersChart);
