import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as stats from '../../../api/stats';
import ReactHighcharts from 'react-highcharts';
import Card from '../../Card';
import LoadingIndicator from '../../LoadingIndicator';

class BitrateChart extends Component {
  state = {
    maxBitRates: [],
    minBitrates: [],
    avgBitrates: [],
    loading: false,
  };

  componentDidMount () {
    this.loadData(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this.loadData(nextProps);
  }

  async loadData(props) {
    this.setState({ loading: true });

    const baseQuery = {
      ...props.range,
      interval: props.interval,
      licenseKey: props.licenseKey
    };
    const [minBitrates, maxBitRates, avgBitrates] = await stats.fetchMinMaxAvgBitrate(props.apiKey, baseQuery);

    this.setState({ maxBitRates, minBitrates, avgBitrates, loading: false });
  }

  render() {
    const { maxBitRates, minBitrates, avgBitrates, loading } = this.state;
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
      plotOptions: {
        series: {
          animation: !loading && { duration: 2000 },
        },
      },
      tooltip    : {
        shared    : true,
        crosshairs: true
      },
      series: [
        { type: 'spline', name: 'Max Bitrate', data: maxBitRates },
        { type: 'spline', name: 'Min Bitrate', data: minBitrates },
        { type: 'spline', name: 'Avg Bitrate', data: avgBitrates }
      ],
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return (
      <Card title="Video Bitrate" width={{md:12, sm: 12, xs: 12}} cardHeight={"500px"}>
        <LoadingIndicator loading={loading}>
          <ReactHighcharts config={chartConfig}/>
        </LoadingIndicator>
      </Card>
    );
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

export default connect(mapStateToProps)(BitrateChart);
