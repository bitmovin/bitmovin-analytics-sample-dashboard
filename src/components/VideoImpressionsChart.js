import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import ReactHighcharts from 'react-highcharts';
import Card from './Card';
import LoadingIndicator from './LoadingIndicator';
import * as impressions from '../api/metrics/impressions';
import Api from '../api';

class VideoImpressionsChart extends Component {
  static propTypes = {
    videoId: PropTypes.string
  };

  state = {
    data: [],
    loading: false,
  };

  componentDidMount () {
    this.loadData(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this.loadData(nextProps);
  }

  async loadData({ api, licenseKey, primaryRange, interval, videoId, name }) {
    this.setState({ loading: true });

    let query = impressions.groupedQuery(api)
      .licenseKey(licenseKey)
      .between(primaryRange.start, primaryRange.end)
      .interval(interval)
      .orderBy(interval, 'ASC');

    if (videoId) {
      query = query.filter('VIDEO_ID', 'EQ', videoId);
    }

    const { rows } = await query.query();
    const data = rows.map(row => row.slice(0, 2));

    this.setState({ data, loading: false });
  }

  render() {
    const { data, loading } = this.state;
    const { name } = this.props;
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
      plotOptions: {
        series: {
          animation: !this.state.loading && { duration: 2000 },
        },
      },
      series: [{ name, type: 'spline', data }],
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return (
      <Card title="Started Streams" width={{md:12, sm: 12, xs: 12}} fixedHeight={false}>
        <LoadingIndicator loading={loading}>
          <ReactHighcharts config={chartConfig}/>
        </LoadingIndicator>
      </Card>
    );
  }
}

const mapStateToProps = (state) => {
  const { name, interval, primaryRange, secondaryRange } = state.ranges;
  return {
    api: new Api(state),
    licenseKey: state.api.analyticsLicenseKey,
    name,
    interval,
    primaryRange,
    secondaryRange
  }
};

export default connect(mapStateToProps)(VideoImpressionsChart);
