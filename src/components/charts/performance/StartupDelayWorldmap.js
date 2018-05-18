import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux';
import Card from '../../Card'
import ReactHighmaps from 'react-highcharts/ReactHighmaps.src'
import mapdata from '../../../mapdata/world'
import * as ranges from '../../../api/ranges'
import * as startupdelay from '../../../api/metrics/startupdelay'

class StartupDelayWorldmap extends Component {
  constructor (props) {
    super(props);
    this.state = {
      data: []
    }
  }
  static propTypes = {
    width: PropTypes.object
  }
  componentDidMount () {
    startupdelay.videoStartupDelayByCountry(this.props.api, ranges.thisWeek).then((data) => {
      this.setState(prevState => {
        const newData = data.map(row => {
          return {
            'hc-key': row[0].toLowerCase(),
            value: Math.round(row[1])
          };
        });
        return {
          ...prevState,
          data: newData
        };
      });
    });
  }
  renderTable () {
    const sorted = this.state.data.sort((a, b) => {
      return b.value - a.value
    });
    const top = sorted.slice(0, 8);

    const rows = top.map((row, index) => {
      return <tr key={index}>
        <td>
          <div className={'img-thumbnail flag flag-icon-background flag-icon-' + row['hc-key']} style={{border: "none", width: "15px", height: "15px", marginRight: "10px"}}></div>
          {row['hc-key'].toUpperCase()}
        </td>
        <td>{row.value} ms</td>
        </tr>;
    })
    return (
      <table className="table table-hover">
        <thead>
        <tr>
          <th>Country</th>
          <th>Average Startup Delay</th>
        </tr>
        </thead>
        <tbody>
        {rows}
        </tbody>
      </table>);
  }
  renderChart () {
    const chartConfig = {
      chart: {
        height: 400
      },
      title : {
        text: ''
      },
      colorAxis: {
        min: 0
      },
      plotOptions: {
        map: {
          joinBy : ['hc-key'],
          dataLabels: {
            enabled: false
          },
          mapData: mapdata,
          tooltip: {
            headerFormat: '',
            pointFormat: '{point.name}: <b>{point.value} ms</b>'
          }
        }
      },
      series: [this.state]
    };
    return <ReactHighmaps config={chartConfig}/>
  }
  render () {
    return (
    <Card title="Average startup delay by country" width={this.props.width || { md: 12, sm: 12, xs: 12 }}>
      <div>
        <div className="col-md-6 col-sm-6 col-xs-12">
          { this.renderTable() }
        </div>
        <div className="col-md-6 col-sm-6 col-xs-12">
          { this.renderChart() }
        </div>
      </div>
    </Card>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    api: new Api(state)
  }
}

export default connect(mapStateToProps)(StartupDelayWorldmap)
