import React, { Component } from 'react'
import { connect } from 'react-redux'
import * as rangeActions from './actions/ranges'

class TimeFrameDialog extends Component {
	render () {
		return (<div>
      <div onClick={::this.props.hideChangeRangeDialog} className="modal-backdrop fade in" style={{zIndex: 1040 }}></div>
      <div className="modal bootstrap-dialog type-primary fade size-normal in" role="dialog" aria-hidden="true" style={{zIndex: 1250, display: 'block', paddingRight: '15px'}}>
        <div onClick={::this.props.hideChangeRangeDialog} className="modal fade" style={{ display: 'block', opacity: 1 }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <bold>Change Timeframe</bold>
              </div>
              <div className="modal-body">
                <button onClick={() => { this.props.changeRange({ name: 'Last Week', range: [7, 'days'], interval: 'DAY' }) }} className="btn btn-primary">Last Week</button>
                <button onClick={() => { this.props.changeRange({ name: 'Last 3 Days', range: [3, 'days'], interval: 'DAY' }) }} className="btn btn-primary">Last 3 Days</button>
                <button onClick={() => { this.props.changeRange({ name: 'Last 24 Hours', range: [1, 'days'], interval: 'HOUR' }) }} className="btn btn-primary">Last 24 Hours</button>
                <button onClick={() => { this.props.changeRange({ name: 'Last Hour', range: [1, 'hours'], interval: 'MINUTE' }) }} className="btn btn-primary">Last Hour</button>
                <button onClick={() => { this.props.changeRange({ name: 'Last 15 Minutes', range: [15, 'minutes'], interval: 'MINUTE' }) }} className="btn btn-primary">Last 15 Minutes</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>)
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
    hideChangeRangeDialog: () => {
      dispatch(rangeActions.hideChangeRangeDialog())
    },
    changeRange: (range) => {
      dispatch(rangeActions.changeRangeRelative(range));
    }
	};
}

export default connect(undefined, mapDispatchToProps)(TimeFrameDialog);
