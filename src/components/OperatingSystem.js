import React, { Component } from 'react'
import {connect} from 'react-redux'
import * as stats from '../api/stats'
import Card from './Card'
import ReactHighcharts from 'react-highcharts'
import { groupToNBuckets } from '../api/util'
import Api from '../api';

class OperatingSystem extends Component {
  constructor (props) {
    super(props);
    this.state = {
      operatingSystems: [],
      display: 'chart'
    }
  }
  componentDidMount () {
    stats.fetchOperatingSystemsLastDays(this.props.api, 7).then((operatingSystems) => {
      this.setState(prevState => {
        return {
          ...prevState,
          operatingSystems
        }
      });
    });
  }
  switchDisplay () {
    this.setState(prevState => {
      const options = ['chart', 'table'];
      const newDisplay = options[(options.indexOf(prevState.display) + 1) % 2];
      return {
        ...prevState,
        display: newDisplay
      }
    })
  }
  renderTable () {
    const rows = this.state.operatingSystems.map((os, index) => {
      return <tr key={index}><td>{os[0]}</td><td>{os[1]}</td></tr>;
    });
    return <table className="" style={{width:"100%"}}>
              <tbody>
                <tr>
                  <th>
                    <div className="col-lg-7 col-md-7 col-sm-7 col-xs-7">
                      <p className="">OS</p>
                    </div>
                  </th>
                  <th>
                    <div className="col-lg-5 col-md-5 col-sm-5 col-xs-5">
                      <p className="">Impressions</p>
                    </div>
                  </th>
                </tr>
                {rows}
              </tbody>
            </table>;
  }
  renderChart () {
    const selector = (browser, browser2) => {
      return browser[1] - browser2[1];
    }
    const reducer = (others) => {
      return others.reduce((memo, one) => {
        memo[1] += one[1];
        return memo;
      }, ['Others', 0])
    }
    const data = groupToNBuckets(this.state.operatingSystems, 5, selector, reducer).map((x) => {
      return { name: x[0], y: x[1] }
    });
    const chartConfig = {
      chart: {
        type: 'pie',
        height: 220
      },
      title : {
        text: ''
      },
      xAxis : {
        type                : 'datetime',
        dateTimeLabelFormats: {
          month: '%e. %b',
          year : '%b'
        },
        title               : {
          text: 'Date'
        }
      },
      plotOptions: {
        pie: {
          dataLabels: {
            enabled: true,
            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          }
        }
      },
      series: [{ name: 'Operating System', data: data }],
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
    return <ReactHighcharts config={chartConfig} />
  }
  render () {
    const switchIcon = this.state.display === 'chart' ? 'table' : 'pie-chart';
    return (
      <Card title="Operating System Usage last 7 days" switchDisplay={() => { this.switchDisplay() }} switchIcon={switchIcon} width={{md:4, sm: 4, xs: 12}} fixedHeight={true}>
        {this.state.display === 'table' ? this.renderTable() : this.renderChart()}
      </Card>);
  }
}
const mapStateToProps = (state) => {
  return {
    api: new Api(state)
  }
}

export default connect(mapStateToProps)(OperatingSystem);
