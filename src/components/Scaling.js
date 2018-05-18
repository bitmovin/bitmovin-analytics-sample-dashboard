import React, { Component } from 'react';
import {connect} from 'react-redux';
import * as stats from '../api/stats';
import ReactHighcharts from 'react-highcharts';
import Card from './Card';
import LoadingIndicator from './LoadingIndicator';
import Api from '../api';

class Scaling extends Component {
  state = {
    data: [],
    loading: true,
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
    const data = await stats.fetchScalingLastDays(props.api, baseQuery)

    this.setState({ data, loading: false });
  }
  render () {
    const { data, loading } = this.state;

    const roundScalingSeries = (data) => data.map(row => {
      row[1] = Math.round(row[1] * 100);
      return row;
    });

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
        type : 'datetime',
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
          text: 'Percent'
        }
      },
      plotOptions: {
        series: {
          animation: !loading && { duration: 2000 },
        },
      },
      series: [{ type: 'spline', name: 'Scaling percentage', data: roundScalingSeries(data) }],
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return (
      <Card title="Scaling Percentage Last 7 Days" width={this.props.width || {md:6, sm: 6, xs: 12}} cardHeight="auto">
        <LoadingIndicator loading={loading}>
          <div className="x_content">
            <div className="dashboard-widget-content">
              <ReactHighcharts config={chartConfig}/>
            </div>
          </div>
        </LoadingIndicator>
      </Card>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    api: new Api(state),
    range: state.ranges.primaryRange,
    interval: state.ranges.interval,
    licenseKey: state.api.analyticsLicenseKey
  }
};

export default connect(mapStateToProps)(Scaling);
