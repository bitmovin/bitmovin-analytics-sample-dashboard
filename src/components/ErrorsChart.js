import React, {PureComponent, PropTypes} from 'react';
import {connect} from 'react-redux';
import Card from './Card';
import ReactHighcharts from 'react-highcharts';
import * as errors from '../api/metrics/errors';
import moment from 'moment';
import * as d3 from 'd3';
import * as util from '../api/util';
import * as formats from '../formats';
import Api from '../api';

class ErrorsChart extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      errors: [],
      display: 'chart',
    };
  }
  static propTypes = {
    width: PropTypes.object,
  };
  componentDidMount() {
    this.loadData(this.props);
  }
  componentWillReceiveProps(nextProps) {
    this.loadData(nextProps);
  }
  loadData(props) {
    Promise.all([errors.fetchErrorPercentage(props.api, {...props.primaryRange, interval: props.interval})]).then(
      data => {
        this.setState(prevState => {
          data[0] = util.sortByFirstColumn(data[0]);
          return {
            ...prevState,
            errors: [
              {
                data: data[0].map(day => {
                  return {name: moment(day[0]).format(formats[props.interval]), y: util.roundTo(day[3], 4)};
                }),
                type: 'spline',
                name: props.rangeName,
              },
            ],
            maxErrorPercentage: this.getMaxErrorPercentage(data),
          };
        });
      }
    );
  }
  getMaxErrorPercentage(data) {
    return (
      Math.max(
        d3.max(data[0], x => {
          return util.roundTo(x[3], 4);
        })
      ) * 3
    );
  }
  render() {
    const chartConfig = {
      chart: {
        height: 400,
      },
      title: {
        text: '',
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
        min: 0,
        max: this.state.maxErrorPercentage,
        title: {
          text: 'Error Percentage',
        },
      },
      series: this.state.errors,
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
      <Card fixedHeight={true} title="Errors" width={this.props.width || {md: 8, sm: 8, xs: 12}} cardHeight={'480px'}>
        <ReactHighcharts config={chartConfig} />
      </Card>
    );
  }
}

const mapStateToProps = state => {
  return {
    api: new Api(state),
    rangeName: state.ranges.name,
    interval: state.ranges.interval,
    primaryRange: state.ranges.primaryRange,
  };
};
export default connect(mapStateToProps)(ErrorsChart);
