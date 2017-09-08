import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import ReactHighcharts from 'react-highcharts';
import Card from './Card';
import LoadingSpinner from './LoadingSpinner';
import * as impressions from '../api/metrics/impressions';

class VideoImpressionsChart extends Component {
  static propTypes = {
    videoId: PropTypes.string
  };

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
      filters: []
    };

    if (props.videoId) {
      baseQuery.filters.push({name: 'VIDEO_ID', operator: 'EQ', value: props.videoId});
    }

    impressions.fetchGrouped(props.apiKey, 'impressions', baseQuery).then((data) => {
      const convertResultToSeriesData = (series) => {
        return series.map(row => {
          return [row[0], row[1]];
        })
      };

      this.setState(prevState => {
        return {
          ...prevState,
          impressionSeries: [{
            data: convertResultToSeriesData(data.data),
            type: 'spline',
            name: props.name
          }]
        }
      });
    });
  }

  render() {
    const chartConfig = {
      title : {
        text: ''
      },
      tooltip: {
        shared: true
      },
      xAxis : {
        type : 'datetime'
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
      series: this.state.impressionSeries,
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return (
    <Card title="Impressions" width={{md:12, sm: 12, xs: 12}} fixedHeight={false}>
      { this.props.isLoading ? <LoadingSpinner /> : <ReactHighcharts config={chartConfig}/>}
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
    secondaryRange
  }
};

export default connect(mapStateToProps)(VideoImpressionsChart);
