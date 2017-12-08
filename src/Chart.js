import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import ReactHighcharts from 'react-highcharts';
import Card from './components/Card';
import FiltersDialog from './FiltersDialog';
import LoadingIndicator from './components/LoadingIndicator';

class Chart extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    width: PropTypes.object,
    dataFunction: PropTypes.func,
    convertResultToSeries: PropTypes.func,
    defaultSeriesName: PropTypes.string.isRequired,
    maxYAxis: PropTypes.number,
    yAxisTitle: PropTypes.string
  };
  constructor(props) {
    super(props);
    this.state = {
      series: [{
        name: props.defaultSeriesName,
        data: []
      }],
      showFiltersDialog: false,
      loading: false,
    }
  }

  defaultQueries = () => [{
    name: this.props.defaultQueriesName,
    filters: []
  }];

  componentDidMount () {
    this.loadData(this.props, this.defaultQueries());
  }

  componentWillReceiveProps (nextProps) {
    this.loadData(nextProps, this.defaultQueries());
  }

  async loadData(props, queries) {
    this.setState({ loading: true });
    const results = await Promise.all(queries.map(query => {
      const baseQuery = {
        ...props.primaryRange,
        interval: props.interval,
        orderBy: [{ name: props.interval, order: 'ASC'}],
        filters: [...query.filters],
      };

      return props.dataFunction(props.apiKey, query.name, baseQuery)

    }));

    const series = results.map(series => {
      return this.props.convertResultToSeries(series.name, props.interval, series.data);
    });

    this.setState({ showFiltersDialog: false, loading: false, series });
  }
  showFiltersDialog() {
    this.setState(prevState => {
      return {
        ...prevState,
        showFiltersDialog: true
      }
    });
  }
  callback(queries) {
    this.loadData(this.props, queries);
  }
  renderFilters() {
    if (this.state.showFiltersDialog !== true) {
      return null
    }
    return <FiltersDialog callback={::this.callback} queries={this.defaultQueries()}/>
  }
  render () {
    const { series, loading } = this.state;
    const chartConfig = {
      chart: {
        height: this.props.height,
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
        max: this.props.maxYAxis,
        title: {
          text: this.props.yAxisTitle || ''
        }
      },
      plotOptions: {
        series: {
          animation: !loading && { duration: 2000 },
        },
      },
      series,
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return (
      <Card title={this.props.title} width={this.props.width || { md:12, sm: 12, xs: 12}} fixedHeight={false} cardHeight="auto">
        <div>
          <div>
            <a className="btn btn-info filters-button" onClick={::this.showFiltersDialog}>
              <i className="fa fa-filter"></i>
              <span>Filters</span>
            </a>
            {this.renderFilters()}
          </div>
          <LoadingIndicator loading={loading}>
            <ReactHighcharts config={chartConfig}/>
          </LoadingIndicator>
        </div>
      </Card>);
  }
}

const mapStateToProps = ({ api, ranges }) => {
  const { name, interval, primaryRange, secondaryRange } = ranges;
  return {
    apiKey: api.apiKey,
    licenseKey: api.analyticsLicenseKey,
    name,
    interval,
    primaryRange,
    secondaryRange
  }
};

export default connect(mapStateToProps)(Chart);
