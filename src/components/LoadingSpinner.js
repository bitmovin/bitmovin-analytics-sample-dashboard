import React, {Component, PropTypes} from 'react';

class LoadingSpinner extends Component {
  static propTypes = {
    height: PropTypes.number,
  };
  render() {
    return (
      <div className="LoadingSpinner" style={{height: this.props.height}}>
        <div className="inner">
          <i className="fa fa-spinner fa-pulse fa-fw" /> <span>Loading...</span>
        </div>
      </div>
    );
  }
}
export default LoadingSpinner;
