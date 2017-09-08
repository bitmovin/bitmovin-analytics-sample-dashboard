import React, { Component, PropTypes } from 'react'
import * as util from '../api/util'

class TopStatMetric extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    metric: PropTypes.object.isRequired,
    icon: PropTypes.string.isRequired,
    inverse: PropTypes.bool,
    onClick: PropTypes.func,
    userBaseValue: PropTypes.string,
    formatter: PropTypes.string,
    isPercentage: PropTypes.bool
  };
  componentWillUpdate(nextProps, nextState) {
    if (!isFinite(nextProps.metric.change)) {
      nextProps.metric.change = 100;
    }
    if (nextProps.metric.change > 100) {
      nextProps.metric.change = 100;
    }
  }
  getColor(change) {
    const colors = ['green', '', 'red'];
    if (this.props.inverse) {
      colors.reverse();
    }
    if (change > 0) {
      return colors[0];
    } else if (change === 0) {
      return colors[1];
    }
    return colors[2];
  }
  metricColor() {
    return this.getColor(this.props.metric.change)
  }
  getIcon(change) {
    if (change === 0)
      return 'fa fa-caret-right';
    if (change > 0)
      return 'fa fa-sort-asc';
    return 'fa fa-sort-desc';
  }
  metricIcon () {
    return this.getIcon(this.props.metric.change);
  }
  formatMetricNumber () {
    if (this.props.metric.change > 0) {
      return `+${this.props.metric.change}`;
    }
    return this.props.metric.change
  }
  formatValue (value) {
    if (this.props.format === 'pct') {
      return value + '%';
    } else if (this.props.format === 'ms') {
      return value + 'ms';
    }
    return value;
  }
  render () {
    const metric = this.props.metric;
    const color = {
      'data-background-color': this.metricColor()
    };
    let userBase = null;
    if (this.props.compareUserBase === true ) {
      let changeToUserBase = (( metric.primary / metric.userbase ) - 1) * 100;

      if (this.props.format === 'pct')
        changeToUserBase = metric.primary - metric.userbase;

      const color = this.getColor(changeToUserBase);
      const icon = this.getIcon(changeToUserBase);
      if (this.props.inverse === true) {
        changeToUserBase *= -1;
      }

      const betterOrWorse = changeToUserBase > 0 ? 'better' : 'worse';
      userBase = (<div className="card-footer">
        <div className="stats">
          <i className={color}><i className={icon}></i>{util.round10(changeToUserBase)}% {betterOrWorse}</i> than User Base
        </div>
      </div>);
    }
    return (
    <div className="col-lg-2 col-md-4 col-sm-4 col-xs-6" onClick={this.props.onClick}>
      <div className="card card-stats">
        <div className="card-header" {...color}>
          <i className={ "fa fa-" + this.props.icon }></i>
        </div>
        <div className="card-content">
          <p className="category">{this.props.title}</p>
          <h3 className="title">{this.formatValue(metric.primary)}</h3>
        </div>
        <div className="card-footer">
          <div className="stats">
            <span><i className={this.metricColor()}><i className={this.metricIcon()}></i>{this.formatMetricNumber()}% </i> From before ({this.formatValue(metric.secondary)})</span>
          </div>
        </div>
        {userBase}
      </div>
    </div>
    );
  }
}

export default TopStatMetric;
