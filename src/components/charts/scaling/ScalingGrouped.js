import React, { Component, PropTypes } from 'react';
import {connect} from 'react-redux';
import * as stats from '../../../api/stats';
import ReactHighcharts from 'react-highcharts';
import Card from '../../Card';
import LoadingIndicator from '../../LoadingIndicator';
import _ from 'underscore';
import Api from '../../../api';

class ScalingGrouped extends Component {
  static propTypes = {
    grouping: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
  }

  state = {
    series: [],
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

    const query = {
      ...props.range,
      interval: props.interval,
      groupBy: [this.props.grouping],
      licenseKey: props.licenseKey
    };

    const scaling = await stats.fetchScalingLastDays(this.props.api, query);
    const groups = [...new Set(scaling.map(row => row[1]))];
    const series = groups.map(group => {
      const rows = scaling.filter(row => row[1] === group);
      return {
        name: group,
        data: rows.map(row => [row[0], Math.round(row[2] * 100)])
      };
    })

    this.setState({ series, loading: false });
  }
  render () {
    const { series, loading } = this.state;

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
      series: series.map(s => ({ ...s, type: 'spline' })),
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return (
      <Card title={this.props.title} width={this.props.width || {md:6, sm: 6, xs: 12}} cardHeight="auto">
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

export default connect(mapStateToProps)(ScalingGrouped);
