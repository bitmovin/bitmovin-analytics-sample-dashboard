import React, { Component, PropTypes } from 'react'
import {connect} from 'react-redux'
import * as stats from '../../../api/stats'
import ReactHighcharts from 'react-highcharts'
import Card from '../../Card'
import _ from 'underscore'

class Scaling extends Component {
  static propTypes = {
    grouping: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired
  }
  constructor(props) {
    super(props);
    this.state = {
      scalingSeries: {
        data: [],
        name: 'Scaling percentage'
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
    const query = {
      ...props.range,
      interval: props.interval,
      groupBy: [this.props.grouping],
      licenseKey: props.licenseKey
    };

    stats.fetchScalingLastDays(this.props.apiKey, query).then((scaling) => {
      scaling = scaling.map((row) => {
        row[2] = Math.round(row[2] * 100);
        return row;
      });
      scaling = _.groupBy(scaling, (row) => {
        return row[1];
      })
      const series = [];
      for (let os of Object.keys(scaling)) {
        const s = {
          name: os,
          type: 'spline',
          data: scaling[os].map(row => {
            return [row[0], row[2]];
          })
        };
        series.push(s);
      }

      this.setState(prevState => {
        return {
          ...prevState,
          scalingSeries: series
        }
      });
    });

  }
  render () {
    const chartConfig = {
      chart: {
        height: this.props.height
      },
      title : {
        text: ''
      },
      tooltip: {
        shared: true
      },
      xAxis : {
        type : 'datetime',
        dateTimeLabelFormats: {
          month: '%e. %b',
          year : '%b'
        }
      },
      yAxis : {
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }],
        title    : {
          text: 'Percent'
        }
      },
      series: this.state.scalingSeries,
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return (
    <Card title={this.props.title} width={this.props.width || {md:6, sm: 6, xs: 12}} cardHeight="auto">
      <div className="x_content">
        <div className="dashboard-widget-content">
          <ReactHighcharts config={chartConfig}/>
        </div>
      </div>
    </Card>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    apiKey: state.api.apiKey,
    range: state.ranges.primaryRange,
    interval: state.ranges.interval,
    licenseKey: state.api.analyticsLicenseKey
  }
};

export default connect(mapStateToProps)(Scaling);
