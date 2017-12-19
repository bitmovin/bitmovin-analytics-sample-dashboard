import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import Card from '../../Card';
import LoadingIndicator from '../../LoadingIndicator';
import ReactHighmaps from 'react-highcharts/ReactHighmaps.src';
import mapdata from '../../../mapdata/world';
import * as startupdelay from '../../../api/metrics/startupdelay';
import ReactPaginate from 'react-paginate';

class StartupTimeWorldmap extends Component {
  static propTypes = {
    width: PropTypes.object
  };

  state = {
    data: [],
    tableData: [],
    limit: 7,
    offset: 0,
    pageCount: 0,
    page: 0,
    orderByOrder: 'DESC',
    loading: false,
  };

  componentDidMount () {
		this.loadData(this.props);
  }

	componentWillReceiveProps(nextProps) {
		this.loadData(nextProps);
	}

  async loadData (props) {
    this.setState({ loading: true });

    const baseQuery = {
      ...props.primaryRange,
      licenseKey: props.licenseKey
    };

    const data = await startupdelay.videoStartupTimeByCountry(props.apiKey, baseQuery)
    const newData = data.map(row => ({
      'hc-key': row[0].toLowerCase(),
      value: Math.round(row[1])
    }));
    const tableData = data.sort((a, b) => b[1] - a[1]);

    this.setState(prevState => ({
      data: newData,
      tableData,
      pageCount: Math.ceil(tableData.length / prevState.limit),
      loading: false,
    }));
  }

  toggleSorting = () => {
    const { orderByOrder } = this.state;

    let sorting = (a, b) => a[1] - b[1];
    if (orderByOrder === 'ASC') {
      sorting = (a, b) => b[1] - a[1];
    }

    const tableData = this.state.tableData.sort(sorting);

    this.setState({
      tableData,
      orderByOrder: orderByOrder === 'DESC' ? 'ASC' : 'DESC',
      offset: 0,
      page: 0,
    });
  }

  handlePageClick = (pagination) => {
    const offset = this.state.limit * pagination.selected;
    this.setState({ offset, page: pagination.selected });
  }

  renderTable () {
    const top = this.state.tableData.slice(this.state.offset, this.state.offset + this.state.limit);
    const rows = top.map((row, index) => {
      return <tr key={index}><td><div className={'img-thumbnail flag flag-icon-background flag-icon-' + row[0].toLowerCase()} style={{border: "none", width: "15px", height: "15px", marginRight: "10px"}}></div>{row[0]}</td><td>{Math.round(row[1]) + 'ms'}</td></tr>;
    });
    return (
      <div>
        <table className="table table-hover">
          <thead>
          <tr>
            <th>Country</th>
            <th>Average Startup Delay <i className="fa fa-sort table-metric-sort" aria-hidden="true" onClick={this.toggleSorting}></i></th>
          </tr>
          </thead>
          <tbody>
          {rows}
          </tbody>
        </table>
        <ReactPaginate
          ref="table_pagination"
          previousLabel={"previous"}
          nextLabel={"next"}
          pageCount={this.state.pageCount}
          forcePage={this.state.page}
          marginPagesDisplayed={0}
          pageRangeDisplayed={0}
          onPageChange={this.handlePageClick}
          containerClassName={"pagination"}
          subContainerClassName={"pages pagination"}
          activeClassName={"active"}
        />
      </div>);
  }

  renderChart () {
    const chartConfig = {
      chart: {
        height: 400
      },
      title : {
        text: ''
      },
      colorAxis: {
        min: 0
      },
      plotOptions: {
        map: {
          joinBy : ['hc-key'],
          dataLabels: {
            enabled: false
          },
          mapData: mapdata,
          tooltip: {
            headerFormat: '',
            pointFormat: '{point.name}: <b>{point.value} ms</b>'
          }
        }
      },
      series: [this.state]
    };
    return <ReactHighmaps config={chartConfig}/>
  }
  render () {
    return (
      <Card title="Median startup time by country" width={this.props.width || { md: 12, sm: 12, xs: 12 }}>
        <LoadingIndicator loading={this.state.loading}>
          <div className="col-md-6 col-sm-6 col-xs-12">
            { this.renderTable() }
          </div>
          <div className="col-md-6 col-sm-6 col-xs-12">
            { this.renderChart() }
          </div>
        </LoadingIndicator>
      </Card>
    );
  }
}

const mapStateToProps = (state) => {
  return {
		apiKey: state.api.apiKey,
		primaryRange: state.ranges.primaryRange,
		secondaryRange: state.ranges.secondaryRange,
		interval: state.ranges.interval,
    licenseKey: state.api.analyticsLicenseKey
  }
};

export default connect(mapStateToProps)(StartupTimeWorldmap)
