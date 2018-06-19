import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux'
import { reLoadTopStat, loadTopStat } from '../actions/topstats';
import LoadingIndicator from './LoadingIndicator';
import deepEqual from 'deep-equal';

class TopStatMetric extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    inverse: PropTypes.bool,
    onClick: PropTypes.func,
    formatter: PropTypes.string,
    isPercentage: PropTypes.bool,
    fetchData: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.props.loadTopStat(this.props.title, this.props.fetchData)
  }

  componentWillReceiveProps(newProps) {
    if (!deepEqual(newProps.dep, this.props.dep)) {
      this.props.reLoadTopStat(this.props.title, this.props.fetchData)
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
    const { change } = this.props.metric;
    return change > 0 ? `+${change}` : change;
  }

  formatValue (value) {
    switch (this.props.format) {
      case 'pct': return `${value}%`;
      case 'ms': return `${value}ms`;
      default: return value;
    }
  }

  render () {
    const { primary, secondary, loading } = this.props.metric;
    const color = {
      'data-background-color': this.metricColor()
    };
    return (
      <LoadingIndicator loading={loading}>
        <div className="col-lg-2 col-md-4 col-sm-4 col-xs-6" onClick={this.props.onClick}>
          <div className="card card-stats">
            <div className="card-header" {...color}>
              <i className={ "fa fa-" + this.props.icon }></i>
            </div>
            <div className="card-content">
              <p className="category">{this.props.title}</p>
              <h3 className="title">{this.formatValue(primary)}</h3>
            </div>
            <div className="card-footer">
              <div className="stats">
                <span><i className={this.metricColor()}><i className={this.metricIcon()}></i>{this.formatMetricNumber()}% </i> From before ({this.formatValue(secondary)})</span>
              </div>
            </div>
          </div>
        </div>
      </LoadingIndicator>
    );
  }
}

const mapStateToProps = (state, ownprops) => {
  const defaultProps = {
    primary: 0,
    secondary: 0,
    change: 0,
    loading: false
  }
  let metric = {
    ...defaultProps
  }
  if (state.topstats[ownprops.title] && state.topstats[ownprops.title].metric) {
    metric = {
      ...defaultProps,
      ...state.topstats[ownprops.title].metric
    }
  }
  const r = {
    dep: {
      primaryRange: state.ranges.primaryRange,
      secondaryRange: state.ranges.secondaryRange,
      licenseKey: state.api.analyticsLicenseKey,
    },
    metric
  }
  return r
}
const mapDispatchToProps = (dispatch) => {
  return {
    loadTopStat: (name, func) => dispatch(loadTopStat(name, func)),
    reLoadTopStat: (name, func) => dispatch(reLoadTopStat(name, func))
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(TopStatMetric);
