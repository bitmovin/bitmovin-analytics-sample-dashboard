import React, { Component, PropTypes } from 'react'
import {connect} from 'react-redux'
import * as impressions from '../../../api/metrics/impressions'
import ReactHighcharts from 'react-highcharts'
import Card from '../../Card'

class StreamFormatChart extends Component {
  static propTypes = {
    width: PropTypes.object.isRequired
  };

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
    baseQuery.groupBy = ['STREAM_FORMAT'];
    baseQuery.orderBy = [{
      name: 'FUNCTION',
      order: 'DESC'
    }];
    baseQuery.filters = [{
      name: 'STREAM_FORMAT',
      operator: 'NE',
      value: 'unknown'
    }];
		impressions.fetchGrouped(props.apiKey, 'stream format', baseQuery).then(data => {
			const slices = data.data.map((slice) => {
				return {
					name: slice[0],
					y: slice[1]
				}
			});
			this.setState(prevState => {
				return {
					...prevState,
					impressionSeries: {
						...prevState.impressionSeries,
						data: slices
					}
				}
			});
		});
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
    <Card title="Impressions by Stream Format" width={this.props.width}>
      <ReactHighcharts config={chartConfig}/>
    </Card>
    );
  }
}

const mapStateToProps = (state) => {
	return {
		apiKey: state.api.apiKey,
		range: state.ranges.primaryRange,
    licenseKey: state.api.analyticsLicenseKey
	}
};

export default connect(mapStateToProps)(StreamFormatChart);
