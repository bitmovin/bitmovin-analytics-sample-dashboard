import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as stats from '../../../api/stats';
import ReactHighcharts from 'react-highcharts';
import Card from '../../Card';
import LoadingIndicator from '../../LoadingIndicator';
import Api from '../../../api';

class PlayerTechnologyChart extends Component {
  state = {
    data: [],
    loading: false,
  };

  componentDidMount() {
    this.loadData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.loadData(nextProps);
  }

  async loadData(props) {
    this.setState({loading: true});

    const baseQuery = {
      ...props.range,
      licenseKey: props.licenseKey,
    };

    const result = await stats.fetchPlayerTechnologyGrouped(this.props.api, baseQuery);
    const data = result.filter(x => x[0] !== null);

    this.setState({data, loading: false});
  }

  render() {
    const {data, loading} = this.state;

    const chartConfig = {
      title: {
        text: '',
      },
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie',
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          },
        },
      },
      series: [{name: 'Impressions', data}],
      colors: [
        '#2eabe2',
        '#35ae73',
        '#f3922b',
        '#d2347f',
        '#ad5536',
        '#2f66f2',
        '#bd37d1',
        '#32e0bf',
        '#670CE8',
        '#FF0000',
        '#E8900C',
        '#9A0DFF',
        '#100CE8',
        '#FF0000',
        '#E8B00C',
        '#0DFF1A',
        '#E8440C',
        '#E80CCE',
      ],
    };
    return (
      <Card title="Player Technology Usage" width={{md: 6, sm: 6, xs: 12}}>
        <LoadingIndicator loading={loading}>
          <ReactHighcharts config={chartConfig} />
        </LoadingIndicator>
      </Card>
    );
  }
}

const mapStateToProps = state => {
  return {
    api: new Api(state),
    range: state.ranges.primaryRange,
    licenseKey: state.api.analyticsLicenseKey,
  };
};

export default connect(mapStateToProps)(PlayerTechnologyChart);
