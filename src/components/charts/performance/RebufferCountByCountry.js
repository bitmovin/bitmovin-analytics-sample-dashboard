import React, {Component} from 'react';
import {connect} from 'react-redux';
import Card from '../../Card';
import * as rebuffer from '../../../api/metrics/rebuffer';
import mapdata from '../../../mapdata/world';
import ReactHighmaps from 'react-highcharts/ReactHighmaps.src';
import ReactPaginate from 'react-paginate';
import LoadingIndicator from '../../LoadingIndicator';
import Api from '../../../api';

class RebufferCountByCountry extends Component {
  state = {
    series: { data: [] },
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

  componentWillReceiveProps (nextProps) {
    this.loadData(nextProps);
  }

  async loadData (props) {
    this.setState({ loading: true });

    const convertResultToSeries = (result) => {
      return result.map(row => {
        return {
          'hc-key': row[0].toLowerCase(),
          value: Math.round(row[3] * 10000) / 100
        }
      }).filter((row) => {
        return row.value > 0;
      });
    };
    const baseQuery = {
      ...props.primaryRange,
      interval: null,
      groupBy: ['COUNTRY'],
      licenseKey: props.licenseKey
    };

    const result = await rebuffer.rebufferPercentageOverTime(props.api, baseQuery)
    const series = { data: convertResultToSeries(result) };
    const tableData = result.sort((a, b) => b[3] - a[3]);

    this.setState(prevState => ({
      series: series,
      tableData,
      pageCount: Math.ceil(tableData.length / prevState.limit),
      loading: false,
    }));
  }

  toggleSorting() {
    const { orderByOrder } = this.state;
    let sorting = (a, b) => a[3] - b[3];
    if (orderByOrder === 'ASC') {
      sorting = (a, b) => b[3] - a[3];
    }

    const tableData = this.state.tableData.sort(sorting);

    this.setState({
      tableData,
      orderByOrder: orderByOrder==='DESC' ? 'ASC':'DESC',
      offset: 0,
      page: 0,
    });
  }

  handlePageClick(pagination) {
    const offset = this.state.limit * pagination.selected;
    this.setState({ offset, page: pagination.selected });
  }

  renderTable () {
    const top = this.state.tableData.slice(this.state.offset, this.state.offset + this.state.limit);
    const rows = top.map((row, index) => {
      return <tr key={index}><td><div className={'img-thumbnail flag flag-icon-background flag-icon-' + row[0].toLowerCase()} style={{border: "none", width: "15px", height: "15px", marginRight: "10px"}}></div>{row[0]}</td><td>{(Math.round(row[3] * 10000) / 100) + '%'}</td></tr>;
    });
    return (
    <div>
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Country</th>
            <th>Rebuffer Percentage <i className="fa fa-sort table-metric-sort" aria-hidden="true" onClick={()=>this.toggleSorting()}></i></th>
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
        onPageChange={(pagination)=>this.handlePageClick(pagination)}
        containerClassName={"pagination"}
        subContainerClassName={"pages pagination"}
        activeClassName={"active"}/>
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
            pointFormat: '{point.name}: <b>{point.value}</b>'
          }
        }
      },
      series: [this.state.series]
    };
    return <ReactHighmaps config={chartConfig}/>
  }
  render () {
    return (
      <Card width={this.props.width || { md: 8, sm: 8, xs: 12}} title="Rebuffer Percentage by Country" cardHeight="auto">
        <LoadingIndicator loading={this.state.loading}>
          <div className="col-md-6 col-sm-12 col-xs-12">
            { this.renderTable() }
          </div>
          <div className="col-md-6 col-sm-12 col-xs-12">
            { this.renderChart() }
          </div>
        </LoadingIndicator>
      </Card>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    api: new Api(state),
    interval: state.ranges.interval,
    rangeName: state.ranges.name,
    primaryRange: state.ranges.primaryRange,
    licenseKey: state.api.analyticsLicenseKey
  }
};

export default connect(mapStateToProps)(RebufferCountByCountry);
