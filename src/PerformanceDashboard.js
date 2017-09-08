import React, {Component} from 'react';
import {connect} from 'react-redux';
import MultiChart from './MultiChart';
import TopStats from './TopStats';
import StartupTimeWorldmap from './components/charts/performance/StartupTimeWorldmap';
import DelaySessions from './components/DelaySessionsList';
import * as startupdelay from './api/metrics/startupdelay';
import TopContentsDelay from './components/TopContentsDelay';

class PerformanceDashboard extends Component {
  render () {
    const dataFunction = (apiKey, name, baseQuery) => {
      baseQuery = {
        ...baseQuery,
        licenseKey: this.props.licenseKey
      };
      return new Promise(resolve => {
        Promise.all([
          startupdelay.genericStartupTimeOverTime('median', apiKey, undefined, baseQuery),
          startupdelay.genericStartupTimeOverTime('percentile', apiKey, undefined, { ...baseQuery, percentile: 80 }),
          startupdelay.genericStartupTimeOverTime('percentile', apiKey, undefined, { ...baseQuery, percentile: 95 }),
        ]).then(data => {
          resolve([{
            data: data[0],
            name: name + " Median"
          }, {
            data: data[1],
            name: name + " 80th Percentile"
          }, {
            data: data[2],
            name: name + " 95th Percentile"
          }])
        });
      });
    };
    const converter = (name, interval, data) => {
      return {
        name,
        type: 'spline', 
        data: data.map(x => { return [x[0], Math.round(x[1])]; })
      }
    };
    return <div>
      <TopStats />
      <div className="row">
        <MultiChart title="Median Startup Time"
                    defaultSeriesName="Startup Time"
                    dataFunction={dataFunction}
                    convertResultToSeries={converter}
                    width={{md: 12, sm: 12, xs: 12}}
                    yAxisTitle="Milliseconds"
        />
      </div>
      <div className="row">
        <TopContentsDelay/>
        <StartupTimeWorldmap width={{md: 8, sm: 8, xs: 12 }} />
      </div>
      <div className="row">
        <DelaySessions width={{md: 12, sm: 12, xs: 12 }}/>
      </div>
    </div>
  }
}

const mapStateToProps = (state) => {
  return {
    apiKey: state.api.apiKey,
    interval: state.ranges.interval,
    licenseKey: state.api.analyticsLicenseKey
  };
};

export default connect(mapStateToProps)(PerformanceDashboard);
