import React, {Component} from 'react';
import {connect} from 'react-redux';
import TopStats from './TopStats';
import TopContents from './components/TopContents';
import UserLocation from './components/UserLocation';
import Chart from './Chart';
import * as impressions from './api/metrics/impressions';
import * as errors from './api/metrics/errors';
import Api from './api';

class HomeDashboard extends Component {
  render() {
    const impressionsDataFunction = async (api, groupBy, baseQuery) => {
      const intervalQuery = impressions
        .groupedQuery(api)
        .licenseKey(this.props.licenseKey)
        .interval(baseQuery.interval)
        .between(baseQuery.start, baseQuery.end);

      const orderedQuery = baseQuery.orderBy.reduce(
        (query, {name, order}) => query.orderBy(name, order),
        intervalQuery
      );

      const filteredQuery = baseQuery.filters.reduce(
        (query, {name, operator, value}) => query.filter(name, operator, value),
        orderedQuery
      );

      const {rows} = await filteredQuery.query();

      return {data: rows, name: groupBy};
    };
    const errorsDataFunction = (api, name, baseQuery) => {
      baseQuery = {
        ...baseQuery,
        licenseKey: this.props.licenseKey,
      };
      return errors.fetchErrorPercentage(api, name, baseQuery);
    };
    const converter = (name, interval, data) => {
      return {
        data: data,
        type: 'spline',
        name: name,
      };
    };
    return (
      <div>
        <TopStats />

        <br />

        <div className="row">
          <Chart
            title="Impressions"
            defaultSeriesName="Impressions"
            dataFunction={impressionsDataFunction}
            convertResultToSeries={converter}
          />
        </div>

        <br />

        <div className="row">
          <TopContents />
          <Chart
            title="Error percentage"
            defaultSeriesName="Errors"
            dataFunction={errorsDataFunction}
            convertResultToSeries={converter}
            width={{md: 8, sm: 8, xs: 12}}
          />
        </div>
        <div className="row">
          <UserLocation width={{md: 12, sm: 12, xs: 12}} />
        </div>
      </div>
    );
  }
}

export default connect(state => {
  return {
    api: new Api(state),
    licenseKey: state.api.analyticsLicenseKey,
  };
})(HomeDashboard);
