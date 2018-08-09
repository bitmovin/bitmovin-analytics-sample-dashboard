import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as stats from '../api/stats';
import ReactHighcharts from 'react-highcharts';
import Card from './Card';
import LoadingIndicator from './LoadingIndicator';
import moment from 'moment';
import * as formats from '../formats';
import Api from '../api';

class UsersChart extends Component {
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
      ...props.primaryRange,
      interval: props.interval,
      groupBy: [],
      orderBy: [{name: props.interval, order: 'ASC'}],
      licenseKey: this.props.licenseKey,
    };

    const rows = await stats.fetchUsersLastDaysPerDay(this.props.api, baseQuery);
    const data = rows.map(row => [moment(row[0]).format(formats[props.interval]), row[1]]);

    this.setState({data, loading: false});
  }

  render() {
    const {data, loading} = this.state;
    const chartConfig = {
      chart: {
        height: this.props.height,
      },
      title: {
        text: '',
      },
      tooltip: {
        shared: true,
      },
      xAxis: {
        type: 'category',
        dateTimeLabelFormats: {
          month: '%e. %b',
          year: '%b',
        },
      },
      yAxis: {
        plotLines: [
          {
            value: 0,
            width: 1,
            color: '#808080',
          },
        ],
        title: {
          text: 'Users',
        },
      },
      plotOptions: {
        series: {
          animation: !loading && {duration: 2000},
        },
      },
      series: [
        {
          name: 'Users',
          type: 'spline',
          data,
        },
      ],
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
      <Card title="Users" width={this.props.width || {md: 12, sm: 12, xs: 12}} fixedHeight={false} cardHeight="auto">
        <LoadingIndicator loading={loading}>
          <ReactHighcharts config={chartConfig} />
        </LoadingIndicator>
      </Card>
    );
  }
}

const mapStateToProps = state => {
  const {name, interval, primaryRange, secondaryRange} = state.ranges;
  return {
    api: new Api(state),
    name,
    interval,
    primaryRange,
    secondaryRange,
    licenseKey: state.api.analyticsLicenseKey,
  };
};

export default connect(mapStateToProps)(UsersChart);
