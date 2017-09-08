import React, { PropTypes, PureComponent } from 'react'
import ReactHighcharts from 'react-highcharts'
import Card from '../Card'

class Dashboard extends PureComponent {
  static propTypes = {
    data: PropTypes.array.isRequired,
    headers: PropTypes.array.isRequired,
    refresh: PropTypes.func.isRequired
  }
  sliceData(data, column) {
    return data.map((row) => {
      return [row[0], row[column]];
    });
  }
  getChartSeries () {
    const dataSeries = this.props.renderColumns.map(col => {
      return {
        name: col[1],
        data: this.sliceData(this.props.data, col[2] + 1)
      }
    });
    return dataSeries;
  }
  getHighchartsConfig (renderTo, loadFunction) {
    const config = {
      title      : {
        text: ''
      },
      chart      : {
        type: 'spline',
        zoomType: 'x',
        renderTo: renderTo,
        events  : {
          load: loadFunction
        }
      },
      xAxis      : {
        type                : 'datetime',
        dateTimeLabelFormats: {
          month: '%e. %b',
          year : '%b'
        },
        title               : {
          text: 'Date'
        }
      },
      yAxis      : {
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      tooltip    : {
        shared    : true,
        crosshairs: true
      },
      legend     : {
        layout       : 'vertical',
        align        : 'right',
        verticalAlign: 'middle',
        borderWidth  : 0
      },
      plotOptions: {
        line: {
          animation: false
        }
      },
      colors     : ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE'],
      series     : this.getChartSeries()
    };
    return config;
  }
  render () {
    const config = this.getHighchartsConfig();
    const actions = [];
    if (!this.props.editing) {
      actions.push(<button key={1} className="btn btn-info btn-xs" onClick={this.props.refresh}>Refresh</button>);
      actions.push(<button key={2} className="btn btn-info btn-xs" onClick={this.props.edit}>Edit</button>);
      actions.push(<button key={3} className="btn btn-danger btn-xs" onClick={this.props.remove}>Remove</button>);
    }
    return <Card title={this.props.query.title} width={{ md: 12, sm: 12, xs: 12}} cardHeight="auto">
      <div>
        {actions}
        <ReactHighcharts config={config} isPureConfig={true} />
      </div>
    </Card>;
  }
}

export default Dashboard;
