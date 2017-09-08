import React, { Component } from 'react'
import { connect } from 'react-redux'
import Card from './Card'
import Api from '../api/index'
import { round10, leftJoinOnTwoColumns } from '../api/util.js'

class ErrorsByBrowserTable extends Component {
  constructor (props) {
    super(props);
    this.state = {
      rows: []
    }
  }
  componentDidMount () {
    this.loadData(this.props);
  }
  componentWillReceiveProps (nextProps) {
    this.loadData(nextProps);
  }
  loadData (props) {
    const api = new Api(props.apiKey);
    const totalQuery = {
      ...props.primaryRange,
      dimension: 'IMPRESSION_ID',
      groupBy: ['OPERATINGSYSTEM', 'BROWSER'],
      licenseKey: props.licenseKey
    };
    const query = {
      ...totalQuery,
      filters: [
        api.filter('ERROR_CODE', 'GT', 0)
      ],
    };

    Promise.all([
      api.fetchAnalytics('COUNT', totalQuery),
      api.fetchAnalytics('COUNT', query)
    ]).then(res => {
      const total = res[0];
      const error = res[1];
      let rows = leftJoinOnTwoColumns(total, error);
      rows = rows.map(row => {
        const ratio = round10(row[3] / row[2] * 100);
        return [...row, ratio];
      });
      rows = rows.sort((a, b) => {
        return b[3] - a[3];
      });
      this.setState(prevState => {
        return {
          ...prevState,
          rows
        }
      });
    });
  }
  render () {
    const errorTable = this.state.rows.slice(0,8).map((row) => {
      return <tr key={row[0] + "-" + row[1]}>
        <td>{row[0]}</td>
        <td>{row[1]}</td>
        <td>{row[2]}</td>
        <td>{row[3]}</td>
        <td>{row[4]} %</td>
      </tr>;
    });
    return <Card title="Errors by Browser and OS" width={this.props.width}>
      <table className="table table-hover">
        <thead>
          <tr>
            <th className="col-md-3">Operating System</th>
            <th className="col-md-3">Browser</th>
            <th className="col-md-2">Impressions</th>
            <th className="col-md-1">Errors</th>
            <th className="col-md-1">Error Percentage</th>
          </tr>
        </thead>
        <tbody>
          {errorTable}
        </tbody>
      </table>
    </Card>
  }
}

const mapStateToProps = (state) => {
  const { primaryRange, interval } = state.ranges;
  const { apiKey } = state.api;
  return {
    primaryRange,
    interval,
    apiKey,
    licenseKey: state.api.analyticsLicenseKey
  }
};
export default connect(mapStateToProps)(ErrorsByBrowserTable);
