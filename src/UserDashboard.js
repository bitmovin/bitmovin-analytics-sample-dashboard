import React, {Component} from 'react';
import UsersChart from './components/UsersChart';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';
import TopStats from './TopStats';
import ImpressionsList from './components/ImpressionsList';
import * as impressions from './api/metrics/impressions';
import Chart from './Chart';

class UserDashboard extends Component {
  render () {
    const impressionsDataFunction = (apiKey, groupBy, baseQuery) => {
      baseQuery = {
        ...baseQuery,
        licenseKey: this.props.licenseKey
      };
      return impressions.fetchGrouped(apiKey, groupBy, baseQuery)
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
    apiKey: state.api.apiKey,
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
