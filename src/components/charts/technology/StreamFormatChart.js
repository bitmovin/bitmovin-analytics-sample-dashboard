import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import * as impressions from '../../../api/metrics/impressions';
import ReactHighcharts from 'react-highcharts';
import Card from '../../Card';
import LoadingIndicator from '../../LoadingIndicator';

class StreamFormatChart extends Component {
  static propTypes = {
    width: PropTypes.object.isRequired
  };

  state = {
    data: [],
    loading: false,
  }

  componentDidMount () {
    this.loadData(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this.loadData(nextProps);
  }

  async loadData({ apiKey, licenseKey, range }) {
    this.setState({ loading: true });
    const query = impressions.groupedQuery(apiKey)
      .licenseKey(licenseKey)
      .between(range.start, range.end)
      .groupBy('STREAM_FORMAT')
      .orderBy('FUNCTION', 'DESC')
      .filter('STREAM_FORMAT', 'NE', 'unknown');

    const { rows } = await query.query();

    const data = rows.map(([name, y]) => ({ name, y }));

    this.setState({ data, loading: false });
  }

  render () {
    const { data, loading } = this.state;
    const chartConfig = {
      title : {
        text: ''
      },
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
          }
        }
      },
      series: [{ name: 'Impressions', data }],
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return (
    <Card title="Impressions by Stream Format" width={this.props.width}>
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
    licenseKey: state.api.analyticsLicenseKey
  }
};

export default connect(mapStateToProps)(StreamFormatChart);
