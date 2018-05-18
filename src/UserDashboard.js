import React, {Component} from 'react';
import UsersChart from './components/UsersChart';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import TopStats from './TopStats';
import ImpressionsList from './components/ImpressionsList';
import * as impressions from './api/metrics/impressions';
import Chart from './Chart';
import Api from './api';

class UserDashboard extends Component {
  render () {
    const impressionsDataFunction = async (api, groupBy, baseQuery) => {
      const intervalQuery = impressions.groupedQuery(api)
        .licenseKey(this.props.licenseKey)
        .interval(baseQuery.interval)
        .between(baseQuery.start, baseQuery.end)

      const orderedQuery = baseQuery.orderBy
        .reduce((query, { name, order }) => query.orderBy(name, order), intervalQuery);

      const filteredQuery = baseQuery.filters
        .reduce((query, { name, operator, value }) => query.filter(name, operator, value), orderedQuery);

      const { rows } = await filteredQuery.query();

      return { data: rows, name: groupBy };
    };
    const converter = (name, interval, data) => {
      return {
        data: data,
        type: 'spline',
        name: name
      };
    };
    return (
    <div>
      <TopStats />
      <div className="row">
        <Chart title="Impressions" width={{md: 6, sm: 6, xs: 12}} height={300} defaultSeriesName="Impressions" dataFunction={impressionsDataFunction} convertResultToSeries={converter} />
        <UsersChart height={300} width={{md: 6, sm: 6, xs: 12}} />
      </div>
      <div className="row">
        <ImpressionsList title="Last Impressions"/>
      </div>
    </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    api: new Api(state),
    licenseKey: state.api.analyticsLicenseKey
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    openImpression: (impressionId) => {
      dispatch(push('/impressions/' + impressionId))
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(UserDashboard)
