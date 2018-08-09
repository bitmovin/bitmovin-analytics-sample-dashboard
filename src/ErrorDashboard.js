import React, {Component} from 'react';
import TopStats from './TopStats';
import FrequentErrors from './components/charts/errors/FrequentErrors';
import ErrorSessions from './components/ErrorSessionsList';
import * as errors from './api/metrics/errors';
import Chart from './Chart';
import TopContentsErrors from './components/TopContentsErrors';
import ErrorsByBrowserTable from './components/ErrorsByBrowserTable';

class ErrorDashboard extends Component {
  render() {
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
            title="Error Percentage"
            defaultSeriesName="Error Percentage"
            dataFunction={::errors.fetchErrorPercentage}
            convertResultToSeries={converter}
            maxYAxis={100}
            yAxisTitle="Percent"
          />
        </div>
        <div className="row">
          <TopContentsErrors width={{md: 4, sm: 4, xs: 12}} />
          <FrequentErrors width={{md: 8, sm: 8, xs: 12}} />
        </div>
        <div className="row">
          <ErrorsByBrowserTable width={{md: 12, sm: 12, xs: 12}} />
        </div>
        <div className="row">
          <ErrorSessions width={{md: 12, sm: 12, xs: 12}} />
        </div>
      </div>
    );
  }
}

export default ErrorDashboard;
