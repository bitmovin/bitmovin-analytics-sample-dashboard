import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as ranges from './api/ranges';
import Api from './api/';
import ReactHighcharts from 'react-highcharts';
import Card from './components/Card';

class CountGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {graphData: []};
  }
  buildQuery(timeRange) {
    const props = ['dimension', 'function', 'interval', 'filters', 'groupBy'];
    const propQuery = Object.assign({}, ...props.map(prop => ({[prop]: this.props[prop]})));
    return {
      ...propQuery,
      ...timeRange,
      orderBy: [
        {
          name: 'DAY',
          order: 'ASC',
        },
      ],
    };
  }
  componentDidMount() {
    const api = this.props.api;
    let timeRanges = [this.props.range];
    if (this.props.compareTimeRange) {
      timeRanges.push(this.props.secondRange);
    }
    const requests = timeRanges.map(range => {
      const query = this.buildQuery(range);
      return api.fetchAnalytics('count', query);
    });
    Promise.all(requests).then(results => {
      this.setState(prevState => {
        return {
          ...prevState,
          graphData: results,
        };
      });
    });
  }
  formatSeries() {
    return this.state.graphData.map(series => {
      return series.map(row => {
        return row.map((col, index) => {
          return this.props.renderers[index].render(col);
        });
      });
    });
  }
  collectSeries() {}
  getHighChartsConfig() {
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
          text: 'Impressions',
        },
      },
      series: this.formatSeries().map(x => {
        return {data: x};
      }),
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
    return chartConfig;
  }
  render() {
    return (
      <Card
        title={this.props.title}
        width={this.props.width || {md: 12, sm: 12, xs: 12}}
        fixedHeight={false}
        cardHeight="auto">
        <ReactHighcharts config={::this.getHighChartsConfig()} />
      </Card>
    );
  }
}

const mapStateToProps = state => {
  return {
    api: new Api(state),
  };
};
export default connect(mapStateToProps)(CountGraph);
