import React, { Component } from 'react';
import { connect } from 'react-redux';
import TopStats from './TopStats'
import TopContents from './components/TopContents'
import UserLocation from './components/UserLocation'
import Chart from './Chart'
import * as impressions from './api/metrics/impressions'
import * as errors from './api/metrics/errors'

class HomeDashboard extends Component {
  render () {
    const impressionsDataFunction = (apiKey, groupBy, baseQuery) => {
      baseQuery = {
        ...baseQuery,
        licenseKey: this.props.licenseKey
      };
      return impressions.fetchGrouped(apiKey, groupBy, baseQuery)
    };
    const errorsDataFunction = (apiKey, name, baseQuery) => {
      baseQuery = {
        ...baseQuery,
        licenseKey: this.props.licenseKey
      };
      return errors.fetchErrorPercentage(apiKey, name, baseQuery);
    };
    const converter = (name, interval, data) => {
      return {
        data: data,
        type: 'spline',
        name: name
      };
    };
    return (<div>
      <TopStats />

      <br></br>

      <div className="row">
        <Chart title="Impressions" defaultSeriesName="Impressions" dataFunction={impressionsDataFunction} convertResultToSeries={converter} /> 
      </div>

      <br />

      <div className="row">
        <TopContents />
        <Chart title="Error percentage" defaultSeriesName="Errors" dataFunction={errorsDataFunction} convertResultToSeries={converter} width={{ md: 8, sm: 8, xs: 12 }} />
      </div>
      <div className="row">
        <UserLocation width={{ md: 12, sm: 12, xs: 12 }}/>
      </div>
    </div>)
  }
}

export default connect((state) => {
  return {
    apiKey: state.api.apiKey,
    licenseKey: state.api.analyticsLicenseKey
  };
})(HomeDashboard);
