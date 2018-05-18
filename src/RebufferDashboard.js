import React, {Component} from 'react';
import {connect} from 'react-redux';
import TopStats from './TopStats';
import RebufferingSessionsList from './components/RebufferingSessionsList';
import RebufferCountByCountry from './components/charts/performance/RebufferCountByCountry';
import * as rebuffer from './api/metrics/rebuffer';
import Chart from './Chart';
import TopContentsRebuffering from './components/TopContentsRebuffering'
import Api from './api';

class RebufferDashboard extends Component {
  render () {
    const dataFunction = (api, name, baseQuery) => {
      baseQuery = {
        ...baseQuery,
        licenseKey: this.props.licenseKey
      };
      return new Promise(resolve => {
        rebuffer.rebufferPercentageOverTime(api, baseQuery).then(data => {
          resolve({
            data: data,
            name
          })
        });
      });
    };

    const converter = (name, interval, data) => {
      return {
        name,
        type: 'spline', 
        data: data.map(x => { return [x[0], Math.round(x[3] * 10000) / 100]; })
      }
    };

    const chartHeight = 250;
    return <div>
      <TopStats />
      <div className="row">
        <Chart title="Rebuffer Percentage"
               defaultSeriesName="Rebuffer Percentage"
               dataFunction={dataFunction}
               convertResultToSeries={converter}
               width={{md: 12, sm: 12, xs: 12}}
               yAxisTitle="Percent"
        />
      </div>
      <div className="row">

      </div>
      <div className="row">
        <TopContentsRebuffering/>
        <RebufferCountByCountry height={chartHeight} width={{md: 8, sm: 8, xs: 12 }} />
      </div>
      <div className="row">
        <RebufferingSessionsList width={{md: 12, sm: 12, xs: 12 }} />
      </div>
    </div>
  }
}

const mapStateToProps = (state) => {
  return {
    api: new Api(state),
    licenseKey: state.api.analyticsLicenseKey
  }
};

export default connect(mapStateToProps)(RebufferDashboard);
