import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Card from '../../Card';
import LoadingIndicator from '../../LoadingIndicator';
import ReactHighcharts from 'react-highcharts';
import * as errors from '../../../api/metrics/errors';
import * as d3 from 'd3-array';
import { ErrorCodes } from '../../../utils';

class FrequentErrors extends Component {
  static propTypes = {
    width: PropTypes.object
  };

  state = {
    categories: [],
    series: [],
    display: 'chart',
    loading: false,
  }

  componentDidMount () {
    this.loadData(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this.loadData(nextProps);
  }

  async loadData(props) {
    this.setState({ loading: true });

    const baseQuery = {
      ...props.primaryRange,
      groupBy: ['ERROR_CODE'],
      interval: null,
      orderBy: [{name: 'FUNCTION', order: 'DESC'}],
      limit: 10,
      licenseKey: props.licenseKey
    };

    const data = await errors.fetchErrorCount(props.apiKey, 'day', baseQuery);
    const filtered = data.filter((row) => row[0] !== null);
    const series = [{
      name: 'Error Codes',
      data: filtered.map((row) => {
        const name = row[0] in ErrorCodes ? `${row[0]} ${ErrorCodes[row[0]]}` : row[0];
        return { foo: 'test', desc: name, code: row[0], name: row[0], y: row[1] }
      })
    }];

    this.setState({
      series,
      categories: filtered.map((row) => row[0].toString(10)),
      maxErrorPercentage: this.getMaxErrorPercentage(series),
      loading: false,
    });
  }

  getMaxErrorPercentage = (data) => d3.max(data, (series) => d3.max(series.data)) * 3;

  render () {
    const { loading, maxErrorPercentage, series } = this.state;
    const chartConfig = {
      chart: {
        type: 'pie',
        height: 400
      },
      title : {
        text: ''
      },
      plotOptions: {
        series: {
          cursor: 'pointer',
          point: {
            events: {
              click: function () {
                window.location = ('/errors/' + this.name);
              }
            }
          }
        }
      },
      xAxis : {
        type : 'categories'
      },
      yAxis : {
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }],
        min: 0,
        max: maxErrorPercentage,
        title    : {
          text: 'Total Errors'
        }
      },
      tooltip: {
        useHTML: true,
        headerFormat: '<span><b>Error {point.key}</b></span>',
        pointFormat: ': <span>{point.desc} : {point.y} Errors</span>'
      },
      series: series,
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE'],
    };

    return (
      <Card fixedHeight={true} title="Frequent Errors" width={ this.props.width || { md: 8, sm: 8, xs: 12 }} cardHeight={"480px"}>
        <LoadingIndicator loading={loading}>
          <ReactHighcharts config={chartConfig} />
        </LoadingIndicator>
      </Card>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    apiKey      : state.api.apiKey,
    primaryRange: state.ranges.primaryRange,
    licenseKey  : state.api.analyticsLicenseKey
  };
};
export default connect(mapStateToProps)(FrequentErrors);
