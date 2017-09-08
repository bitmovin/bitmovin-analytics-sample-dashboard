import React, { Component, PropTypes } from 'react'

class TopStatImpressionMetric extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    metric: PropTypes.object.isRequired,
    icon: PropTypes.string.isRequired,
    inverse: PropTypes.bool,
    onClick: PropTypes.func
  };

  metricColor() {
    let colors = ['green', '', 'red'];
    if (this.props.inverse) {
      colors.reverse();
    }
    if (this.props.metric.change > 0) {
      return colors[0];
    } else if (this.props.metric.change === 0) {
      return colors[1];
    }
    return colors[2];
  }

  metricIcon () {
    if (this.props.metric.change === 0)
      return 'fa fa-caret-right';
    if (this.props.metric.change > 0)
      return 'fa fa-sort-asc';

    return 'fa fa-sort-desc'
  }

  formatMetricNumber () {
    if (this.props.metric.change > 0) {
      return `+${this.props.metric.change} %`;
    }
    return `${this.props.metric.change} %`
  }

  moreOrLess() {
    if (this.props.metric.change > 0) {
      return 'more'
    }
    return 'less'
  }

  render () {
    const metric = this.props.metric;
    let color = {
      'data-background-color': this.metricColor()
    };
    return <div className='col-lg-3 col-md-6 col-sm-4 col-xs-6 tile_stats_count' onClick={this.props.onClick}>
        <div className='card card-stats'>
          <div className='card-header' {...color}>
            <i className={ 'fa fa-' + this.props.icon }></i>
          </div>
          <div className='card-content'>
            <p className='category'>{this.props.title}</p>
            <h3 className='title'>{metric.impression}</h3>
          </div>
          <div className='card-footer'>
            <div className='stats'>
              <span><i className={this.metricColor()}><i className={this.metricIcon()}></i>{this.formatMetricNumber()} </i> From average ({metric.average})</span>
            </div>
          </div>
        </div>
    </div>
  }
}

export default TopStatImpressionMetric;
