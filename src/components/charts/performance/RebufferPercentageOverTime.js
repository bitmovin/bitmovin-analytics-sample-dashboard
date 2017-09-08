import React, { PureComponent, PropTypes } from 'react'
import { connect } from 'react-redux'
import Card from '../../Card'
import ReactHighcharts from 'react-highcharts'
import moment from 'moment'
import * as rebuffer from '../../../api/metrics/rebuffer'
import * as formats from '../../../formats'

class RebufferPercentageOverTime extends PureComponent {
  static propTypes = {
    width: PropTypes.object
  };

  constructor (props) {
    super(props);
    this.state = {
      series: []
    }
  }

	componentDidMount () {
		this.loadData(this.props);
	}

	componentWillReceiveProps (nextProps) {
		this.loadData(nextProps);
	}

  loadData (props) {
    const convertResultToSeries = (results, column) => {
      results.sort((a,b) => { return a[0] - b[0]; });
      return results.map(row => {
        const ts = moment(row[0]).format(formats[props.interval]);
				const val = Math.round(row[column] * 100) / 100;
        return [ts, val];
      });
    };

    Promise.all([
			rebuffer.rebufferPercentageOverTime(props.apiKey, { ...props.primaryRange, interval: props.interval })
    ]).then(results => {
      this.setState(prevState => {
				const series = results.map((result, index) => {
					return {
						name: `Rebuffer Percentage ${index === 0 ? props.rangeName : 'Before'}`,
						data: convertResultToSeries(result, 3),
					};
				});
        return {
          ...prevState,
          series: series
        };
      })
    });
  }
  getSeries () {
    return this.state.series
  }
  chartConfig () {
    return {
      plotOptions: {
				areaSpline: {
					fillOpacity: .5
				}
      },
      chart: {
        type: 'areaspline'
      },
      title : {
        text: ''
      },
      xAxis : {
        type: 'category'
      },
      yAxis : {
        title    : {
          text: 'Rebuffer Percentage'
        },
      },
      tooltip    : {
        crosshairs: true,
        shared: true
      },
      series: this.getSeries(),
      colors: ['#2eabe2', '#35ae73', '#f3922b', '#d2347f', '#ad5536', '#2f66f2', '#bd37d1', '#32e0bf', '#670CE8',
        '#FF0000', '#E8900C', '#9A0DFF', '#100CE8', '#FF0000', '#E8B00C', '#0DFF1A', '#E8440C', '#E80CCE']
    };
  }
  render () {
    return <Card title="Rebuffer Time" width={this.props.width || {md: 12, sm: 12, xd: 12}}>
      <ReactHighcharts config={this.chartConfig()} />
    </Card>;
  }
}

const mapStateToProps = (state) => {
	return {
		apiKey: state.api.apiKey,
		interval: state.ranges.interval,
		rangeName: state.ranges.name,
		primaryRange: state.ranges.primaryRange,
		secondaryRange: state.ranges.secondaryRange
	}
};

export default connect(mapStateToProps)(RebufferPercentageOverTime)
