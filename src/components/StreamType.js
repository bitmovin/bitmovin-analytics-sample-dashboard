import React, { Component } from 'react'
import {connect} from 'react-redux'
import * as stats from '../api/stats'
import ReactHighcharts from 'react-highcharts'
import Card from './Card'

class StreamType extends Component {
  constructor(props) {
    super(props);
    this.state = {
      vodSeries: {
        data: [],
        name: 'VOD'
      },
      liveSeries: {
        data: [],
        name: 'Live'
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
      groupBy: [], orderBy: [{ name: props.interval, order: 'ASC'}],
      licenseKey: props.licenseKey
    };

    stats.fetchStreamTypesLastDays(this.props.apiKey, baseQuery).then((streamTypes) => {
      this.setState(prevState => {
        const convertResultToSeriesData = (series) => {
          return series.map(row => {
            return [row[0], row[1]];
          })
        };

        return {
          ...prevState,
          vodSeries: {
            ...prevState.vodSeries,
            data: convertResultToSeriesData(streamTypes[0])
          },
          liveSeries: {
            ...prevState.liveSeries,
            data: convertResultToSeriesData(streamTypes[1])
          }
        }
      });
    });

  }
  render () {
    const chartConfig = {
      chart: {
        type: 'spline'
      },
      title : {
        text: ''
      },
      tooltip: {
        shared: true
      },
      xAxis : {
        type: 'datetime',
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
          text: 'Impressions'
        }
      },
      series: [this.state.vodSeries, this.state.liveSeries],
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return (
    <Card title="Stream Type" width={{md:12, sm: 12, xs: 12}}>
      <ReactHighcharts config={chartConfig}/>
    </Card>
    );
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

export default connect(mapStateToProps)(StreamType);
