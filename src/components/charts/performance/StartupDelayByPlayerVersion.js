import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Card from '../../Card';
import LoadingIndicator from '../../LoadingIndicator';
import ReactHighcharts from 'react-highcharts';
import * as startupDelay from '../../../api/metrics/startupdelay';

class StartupDelayByPlayerVersion extends Component {
  static propTypes = {
    width: PropTypes.object
  };

  state = {
    series: [],
    loading: false,
  };

  componentDidMount() {
    this.loadData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.loadData(nextProps);
  }

  async loadData({ primaryRange, licenseKey, apiKey }) {
    this.setState({ loading: true });

    const baseQuery = { ...primaryRange, licenseKey };

    const rows = await startupDelay.videoStartupDelayByPlayerVersion(apiKey, baseQuery);
    const playerVersions = new Set(rows.map(row => row[1]));
    const series = [...playerVersions].map((playerVersion) => ({
      name: playerVersion ? playerVersion.toUpperCase() : 'Unknown',
      data: rows
        .filter(r => r[1] === playerVersion)
        .map(r => [r[0], Math.round(r[2])])
        .sort((a, b) => a[0] - b[0]),
    }));

    this.setState({ series, loading: false });
  }

  chartConfig () {
    return {
      chart: {
        height: 400,
        type: 'spline'
      },
      title : {
        text: ''
      },
      xAxis : {
        type: 'datetime'
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
      plotOptions: {
        series: {
          animation: !this.state.loading && { duration: 2000 },
        },
      },
      tooltip    : {
        shared    : true,
        crosshairs: true
      },
      series: this.state.series,
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
  }

  render () {
    return <Card title="Startup Delay by Player Version" width={this.props.width || {md: 12, sm: 12, xd: 12}} cardHeight="500px">
      <LoadingIndicator loading={this.state.loading}>
        <ReactHighcharts config={this.chartConfig()} />
      </LoadingIndicator>
    </Card>;
  }
}

const mapStateToProps = (state) => {
  return {
    apiKey: state.api.apiKey,
    interval: state.ranges.interval,
    rangeName: state.ranges.name,
    primaryRange: state.ranges.primaryRange,
    licenseKey: state.api.analyticsLicenseKey
  };
};

export default connect(mapStateToProps)(StartupDelayByPlayerVersion);
