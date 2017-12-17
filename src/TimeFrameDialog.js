import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import * as rangeActions from './actions/ranges';

class TimeFrameDialog extends Component {
  render () {
    const predefinedRanges = [
      { name: 'Last Week', start: moment.utc().subtract(7, 'days').endOf('day').toDate() },
      { name: 'Last 3 Days', start: moment.utc().subtract(3, 'days').endOf('day').toDate() },
      { name: 'Last 24 Hours', start: moment.utc().subtract(1, 'day').endOf('hour').toDate() },
      { name: 'Last Hour', start: moment.utc().subtract(1, 'hour').endOf('minute').toDate() },
      { name: 'Last 15 Minutes', start: moment.utc().subtract(15, 'minutes').endOf('minute').toDate() },
    ];
    return (<div>
      <div onClick={this.props.hideChangeRangeDialog} className="modal-backdrop fade in" style={{zIndex: 1040 }}></div>
      <div className="modal bootstrap-dialog type-primary fade size-normal in" role="dialog" aria-hidden="true" style={{zIndex: 1250, display: 'block', paddingRight: '15px'}}>
        <div onClick={this.props.hideChangeRangeDialog} className="modal fade" style={{ display: 'block', opacity: 1 }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <bold>Change Timeframe</bold>
              </div>
              <div className="modal-body">
                {predefinedRanges.map(({ name, start }) =>
                	<button
                    onClick={() => this.props.changeRange({ name, start })}
                    className="btn btn-primary"
                    key={name}
                  >
                    {name}
                  </button>
                )}
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
      dispatch(rangeActions.changeRange(range));
    }
	};
}

export default connect(undefined, mapDispatchToProps)(TimeFrameDialog);
