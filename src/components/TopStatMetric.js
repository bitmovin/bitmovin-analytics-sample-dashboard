import React, { Component, PropTypes } from 'react'
import LoadingIndicator from './LoadingIndicator';

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

  state = {
    primary: 0,
    secondary: 0,
    change: 0,
    loading: false,
  };

  loadData = async ({ fetchData }) => {
    this.setState({ loading: true })
    const metric = await fetchData();
    if (!isFinite(metric.change)) {
      metric.change = 100;
    }
    if (metric.change > 100) {
      metric.change = 100;
    }
    this.setState({ ...metric, loading: false });
  }

  componentDidMount() {
    this.loadData(this.props);
  }

  componentWillReceiveProps(newProps) {
    this.loadData(newProps);
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
    return this.getColor(this.state.change)
  }
  getIcon(change) {
    if (change === 0)
      return 'fa fa-caret-right';
    if (change > 0)
      return 'fa fa-sort-asc';
    return 'fa fa-sort-desc';
  }
  metricIcon () {
    return this.getIcon(this.state.change);
  }

  formatMetricNumber () {
    const { change } = this.state;
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
    const { primary, secondary, loading } = this.state;
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

export default TopStatMetric;
