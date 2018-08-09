import React, {Component} from 'react';
import {connect} from 'react-redux';
import Card from '../../Card';
import * as ranges from '../../../api/ranges';
import ReactHighcharts from 'react-highcharts';
import moment from 'moment';
import * as rebuffer from '../../../api/metrics/rebuffer';
import _ from 'underscore';
import scale from './scale';

class RebufferDurationByBrowser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      series: [],
    };
  }
  componentDidMount() {
    const convertResultToSeries = (results, column) => {
      results.sort((a, b) => {
        return a[0] - b[0];
      });
      return results.map(row => {
        const ts = moment(row[0]).format('dddd');
        const val = Math.round(row[column]);
        return [ts, val];
      });
    };
    const convertResultToBrowserSeries = result => {
      const series = [];
      for (let os of Object.keys(result)) {
        series.push({
          name: os,
          type: 'spline',
          data: convertResultToSeries(result[os], 4),
        });
      }
      return series;
    };
    const filterUninterestingBrowsers = result => {
      let systems = [];
      let max = 0;
      for (let os of Object.keys(result)) {
        let osMax = result[os].reduce((memo, item) => {
          return item[2] + memo;
        }, 0);
        systems.push({os: os, impressions: osMax});
        max = Math.max(max, osMax);
      }

      const treshhold = max * 0.05;
      const newResult = {};
      systems.forEach(sys => {
        if (sys.impressions > treshhold) {
          newResult[sys.os] = result[sys.os];
        }
      });
      return newResult;
    };
    rebuffer.rebufferDurationGrouped(this.props.api, {...ranges.thisWeek}, 'BROWSER').then(result => {
      result.sort((a, b) => {
        return a[0] - b[0];
      });
      result = _.groupBy(result, row => {
        return row[1];
      });
      result = filterUninterestingBrowsers(result);

      const series = convertResultToBrowserSeries(result);
      this.setState(prevState => {
        return {
          ...prevState,
          series: series,
        };
      });
    });
  }
  getMax() {
    const max = (memo, item) => {
      return Math.max(memo, item);
    };
    let m = this.state.series
      .map(series => {
        return series.data
          .map(point => {
            return point[1];
          })
          .reduce(max, 0);
      })
      .reduce(max, 0);
    return m * scale;
  }
  getSeries() {
    return this.state.series;
  }
  chartConfig() {
    return {
      chart: {
        height: this.props.height,
      },
      plotOptions: {
        column: {
          stacking: 'normal',
        },
      },
      title: {
        text: '',
      },
      xAxis: {
        type: 'category',
        stackLabels: {
          enabled: true,
        },
      },
      yAxis: [
        {
          plotLines: [
            {
              value: 0,
              width: 1,
            },
          ],
          max: this.getMax(),
          title: {
            text: 'Milliseconds',
          },
        },
      ],
      tooltip: {
        crosshairs: true,
        shared: true,
      },
      series: this.getSeries(),
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
  }
  render() {
    return (
      <Card
        cardHeight="auto"
        title="Rebuffer Duration per Impression by Browser"
        width={this.props.width || {md: 6, sm: 6, xs: 12}}>
        <ReactHighcharts config={this.chartConfig()} />
      </Card>
    );
  }
}
const mapStateToProps = state => {
  return {
    api: new Api(state),
  };
};
export default connect(mapStateToProps)(RebufferDurationByBrowser);
