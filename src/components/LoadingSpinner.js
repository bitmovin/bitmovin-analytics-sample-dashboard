import React, { Component, PropTypes } from 'react'

class LoadingSpinner extends Component {
	static propTypes = {
		height: PropTypes.number
	}
  render () {
    return <div className="loading" style={{ height: this.props.height }}><div className="inner"><i className="fa fa-spinner fa-pulse fa-fw"></i> <span>Loading...</span></div></div>;
  }
}
export default LoadingSpinner;
