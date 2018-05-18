import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ReactHighcharts from 'react-highcharts';
import Card from './components/Card';
import LoadingIndicator from './components/LoadingIndicator';
import FiltersDialog from './FiltersDialog';
import Api from './api';

class MultiChart extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    width: PropTypes.object,
    dataFunction: PropTypes.func,
    convertResultToSeries: PropTypes.func,
    defaultSeriesName: PropTypes.string.isRequired,
    yAxisTitle: PropTypes.string
  };

  state = {
    queries: [{
      name: this.props.defaultSeriesName,
      filters: []
    }],
    series: [{
      name: this.props.defaultSeriesName,
      data: []
    }],
    showFiltersDialog: false,
    loading: false,
  }

  componentDidMount () {
    this.loadData(this.props, this.state.queries);
  }

  componentWillReceiveProps (nextProps) {
    this.loadData(nextProps, this.state.queries);
  }

  async loadData(props, queries) {
    this.setState({ loading: true });

    const results = await Promise.all(queries.map(query => {
      const baseQuery = {
        ...props.primaryRange,
        interval: props.interval,
        groupBy: [],
        orderBy: [{ name: props.interval, order: 'ASC'}],
        filters: query.filters
      };

      return props.dataFunction(props.api, query.name, baseQuery)
    }))

    const series = results
      .map(res => res.map(s => this.props.convertResultToSeries(s.name, props.interval, s.data)))
      .reduce((allSeries, s) => [...allSeries, ...s], []);

    this.setState({ showFiltersDialog: false, series, loading: false });
  }

  showFiltersDialog = () => this.setState({ showFiltersDialog: true });

  callback = (queries) => this.loadData(this.props, queries);

  renderFilters() {
    if (!this.state.showFiltersDialog) {
      return null
    }
    return <FiltersDialog callback={this.callback} queries={this.state.queries}/>
  }

  render () {
    const { loading } = this.state;

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
          text: this.props.yAxisTitle || ''
        }
      },
      plotOptions: {
        series: {
          animation: !loading && { duration: 2000 },
        },
      },
      series: this.state.series,
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return (
      <Card title={this.props.title} width={this.props.width || { md:12, sm: 12, xs: 12}} fixedHeight={false} cardHeight="auto">
        <LoadingIndicator loading={loading}>
          <div>
            <a className="btn btn-info filters-button" onClick={this.showFiltersDialog}>
              <i className="fa fa-filter"></i>
              <span>Filters</span>
            </a>
            {this.renderFilters()}
          </div>
          <ReactHighcharts config={chartConfig}/>
        </LoadingIndicator>
      </Card>);
  }
}

const mapStateToProps = (state) => {
  const { name, interval, primaryRange, secondaryRange } = state.ranges;
  return {
    api: new Api(state),
    name,
    interval,
    primaryRange,
    secondaryRange
  }
};

export default connect(mapStateToProps)(MultiChart);
