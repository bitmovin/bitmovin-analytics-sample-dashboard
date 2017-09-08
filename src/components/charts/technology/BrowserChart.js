import React, { Component } from 'react'
import {connect} from 'react-redux'
import * as stats from '../../../api/stats'
import ReactHighcharts from 'react-highcharts'
import Card from '../../Card'

class BrowserChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      impressionSeries: {
        data: [],
        name: 'Impressions'
      }
    }
  }

  componentDidMount () {
    this.loadData(this.props);
  }

  componentWillReceiveProps (nextProps) {
    this.loadData(nextProps);
  }

  loadData(props) {
    const baseQuery = {
      ...props.range,
      licenseKey: props.licenseKey
    };
    const fetchBrowser = (browser) => {
      return new Promise((resolve, reject) => {
        stats.fetchBrowserLastDays(this.props.apiKey, baseQuery, browser).then((data) => {
          const slice = {
            name: browser,
            y   : data
          };

          resolve(slice);
        });
      });
    };

    Promise.all([fetchBrowser('Chrome'),
    fetchBrowser('Firefox'),
    fetchBrowser('IE'),
    fetchBrowser('Safari'),
    fetchBrowser('Edge')]).then(browsers => {
      this.setState(prevState => {
        return {
          ...prevState,
          impressionSeries: {
            ...prevState.impressionSeries,
            data: browsers
          }
        }
      });
    })
  }
  render () {
    const chartConfig = {
      title : {
        text: ''
      },
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: 'pie'
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
          }
        }
      },
      series: [this.state.impressionSeries],
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return (
      <Card title="Browser Usage" width={{md:6, sm: 6, xs: 12}} fixedHeight={false}>
        <ReactHighcharts config={chartConfig}/>
      </Card>);
  }
}

const mapStateToProps = (state) => {
  return {
    apiKey: state.api.apiKey,
    range: state.ranges.primaryRange,
    licenseKey: state.api.analyticsLicenseKey
  }
};

export default connect(mapStateToProps)(BrowserChart);
