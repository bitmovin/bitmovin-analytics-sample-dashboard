import React, { Component } from 'react';
import { connect } from 'react-redux';
import Card from './Card';
import LoadingIndicator from './LoadingIndicator';
import Api from '../api/index';
import { round10, leftJoinOnTwoColumns } from '../api/util.js';

class ErrorsByBrowserTable extends Component {
  state = {
    rows: [],
    loading: false,
  }

  componentDidMount () {
    this.loadData(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this.loadData(nextProps);
  }

  async loadData (props) {
    this.setState({ loading: true });

    const api = props.api;
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

    const [total, error] = await Promise.all([
      api.fetchAnalytics('COUNT', totalQuery),
      api.fetchAnalytics('COUNT', query)
    ]);

    const rows = leftJoinOnTwoColumns(total, error)
      .map(row => {
        const ratio = round10(row[3] / row[2] * 100);
        return [...row, ratio];
      })
      .sort((a, b) => b[3] - a[3]);

    this.setState({ rows, loading: false });
  }

  render () {
    const { rows, loading } = this.state;
    const errorTable = rows.slice(0, 8).map((row) => {
      return <tr key={row[0] + "-" + row[1]}>
        <td>{row[0]}</td>
        <td>{row[1]}</td>
        <td>{row[2]}</td>
        <td>{row[3]}</td>
        <td>{row[4]} %</td>
      </tr>;
    });

    return (
      <Card title="Errors by Browser and OS" width={this.props.width}>
        <LoadingIndicator loading={loading}>
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
        </LoadingIndicator>
      </Card>
    )
  }
}

const mapStateToProps = (state) => {
  const { primaryRange, interval } = state.ranges;
  return {
    api: new Api(state),
    primaryRange,
    interval,
    licenseKey: state.api.analyticsLicenseKey
  }
};
export default connect(mapStateToProps)(ErrorsByBrowserTable);
