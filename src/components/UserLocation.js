import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactPaginate from 'react-paginate';
import * as impressions from '../api/metrics/impressions';
import ReactHighmaps from 'react-highcharts/ReactHighmaps.src';
import mapdata from '../mapdata/world';
import Card from './Card';
import LoadingIndicator from './LoadingIndicator';
import Api from '../api';

const limit = 7;

class UserLocation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userLocationSeries: {
        data: [],
      },
      tableData: [],
      offset: 0,
      pageCount: 0,
      page: 0,
      orderByOrder: 'DESC',
      loading: false,
    };
  }

  componentDidMount() {
    this.loadData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.loadData(nextProps);
  }

  async loadData({api, primaryRange, licenseKey}) {
    this.setState({loading: true});
    const query = impressions
      .groupedQuery(api)
      .licenseKey(licenseKey)
      .between(primaryRange.start, primaryRange.end)
      .groupBy('COUNTRY')
      .orderBy('FUNCTION', 'DESC');

    const {rows} = await query.query();

    const mapData = rows.map(([hcKey, value]) => ({
      'hc-key': hcKey.toLowerCase(),
      value,
    }));
    this.setState({
      userLocationSeries: {data: mapData},
      tableData: rows,
      pageCount: Math.ceil(rows.length / limit),
      loading: false,
    });
  }

  toggleSorting() {
    const {orderByOrder} = this.state;
    let sorting = (a, b) => {
      return a[1] - b[1];
    };
    if (orderByOrder === 'ASC') {
      sorting = (a, b) => {
        return b[1] - a[1];
      };
    }

    const tableData = this.state.tableData.sort(sorting);

    this.setState({
      tableData,
      orderByOrder: orderByOrder === 'DESC' ? 'ASC' : 'DESC',
      offset: 0,
      page: 0,
    });
  }

  handlePageClick(pagination) {
    const offset = limit * pagination.selected;
    this.setState({offset, page: pagination.selected});
  }

  renderTable() {
    const top = this.state.tableData.slice(this.state.offset, this.state.offset + limit);

    const rows = top.map((row, index) => {
      return (
        <tr key={index}>
          <td>
            <div
              className={'img-thumbnail flag flag-icon-background flag-icon-' + row[0].toLowerCase()}
              style={{border: 'none', width: '15px', height: '15px', marginRight: '10px'}}
            />
            {row[0]}
          </td>
          <td>{row[1]}</td>
        </tr>
      );
    });

    return (
      <div>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Country</th>
              <th>
                Impressions{' '}
                <i className="fa fa-sort table-metric-sort" aria-hidden="true" onClick={::this.toggleSorting} />
              </th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
        <ReactPaginate
          ref="table_pagination"
          previousLabel={'previous'}
          nextLabel={'next'}
          pageCount={this.state.pageCount}
          forcePage={this.state.page}
          marginPagesDisplayed={0}
          pageRangeDisplayed={0}
          onPageChange={::this.handlePageClick}
          containerClassName={'pagination'}
          subContainerClassName={'pages pagination'}
          activeClassName={'active'}
        />
      </div>
    );
  }

  renderChart() {
    const chartConfig = {
      chart: {
        height: 400,
      },
      title: {
        text: '',
      },
      colorAxis: {
        min: 0,
      },
      plotOptions: {
        map: {
          joinBy: ['hc-key'],
          dataLabels: {
            enabled: false,
          },
          mapData: mapdata,
          tooltip: {
            headerFormat: '',
            pointFormat: '{point.name}: <b>{point.value}</b>',
          },
        },
      },
      series: [this.state.userLocationSeries],
    };
    return <ReactHighmaps config={chartConfig} />;
  }

  render() {
    return (
      <Card width={this.props.width || {md: 8, sm: 8, xs: 12}} title="Visitor Location" cardHeight="500px">
        <LoadingIndicator loading={this.state.loading}>
          <div className="col-md-6 col-sm-6 col-xs-12">{this.renderTable()}</div>
          <div className="col-md-6 col-sm-6 col-xs-12">{this.renderChart()}</div>
        </LoadingIndicator>
      </Card>
    );
  }
}

const mapStateToProps = state => {
  return {
    api: new Api(state),
    licenseKey: state.api.analyticsLicenseKey,
    interval: state.ranges.interval,
    rangeName: state.ranges.name,
    primaryRange: state.ranges.primaryRange,
  };
};

export default connect(mapStateToProps)(UserLocation);
