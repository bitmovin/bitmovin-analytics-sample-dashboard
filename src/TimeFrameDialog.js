import React, { Component } from 'react';
import { Modal, Button, FormGroup, ControlLabel } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { connect } from 'react-redux';
import { hideChangeRangeDialog, changeRange } from './actions/ranges';
import 'react-datepicker/dist/react-datepicker.css';
import './TimeFrameDialog.css';

const utcOffset = new Date().getTimezoneOffset() / 60;

class TimeFrameDialog extends Component {
  handleDateChange = (attr) => (dateMoment) => {
    const { changeRange, primaryRange } = this.props;
    const { start, end } = {
      start: moment(primaryRange.start),
      end: moment(primaryRange.end),
      [attr]: dateMoment[`${attr}Of`]('day').subtract(utcOffset, 'hours'),
    };
    const name = `${start.utc().format('D. MMM')} – ${end.utc().format('D. MMM')}`;
    changeRange({ name, start: start.toDate(), end: end.toDate() });
  };

  changePredefinedRange = ({ name, start, end }) => () => {
    const { changeRange, hideChangeRangeDialog } = this.props;
    changeRange({ name, start, end });
    hideChangeRangeDialog();
  }

  render () {
    const yesterdayMidnight = moment.utc().subtract(1, 'days').endOf('day').toDate();
    const predefinedRanges = [
      { name: 'Last Week', start: moment.utc().subtract(7, 'days').startOf('day').toDate(), end: yesterdayMidnight },
      { name: 'Last 3 Days', start: moment.utc().subtract(3, 'days').startOf('day').toDate(), end: yesterdayMidnight  },
      { name: 'Last 24 Hours', start: moment.utc().subtract(1, 'day').startOf('hour').toDate(), end: moment.utc().startOf('hour').toDate() },
      { name: 'Last Hour', start: moment.utc().subtract(1, 'hour').startOf('minute').toDate() },
      { name: 'Last 15 Minutes', start: moment.utc().subtract(15, 'minutes').endOf('minute').toDate() },
    ];
    const { dialogVisible, primaryRange } = this.props;
    const { start, end } = primaryRange;
    const [startMoment, endMoment] = [start, end].map(d => moment(d).add(utcOffset, 'hours'));
    console.log(endMoment);

    return (
      <Modal show={dialogVisible} onHide={this.props.hideChangeRangeDialog}>
        <Modal.Header>
          <Modal.Title>Change Timeframe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="TimeFrameDialog-dateSelection">
            <FormGroup controlId="TimeFrameDialog-fromDate">
              <ControlLabel>From</ControlLabel>
              <DatePicker
                selected={startMoment}
                startDate={startMoment}
                endDate={endMoment}
                dateFormat="D. MMM"
                selectsStart
                onChange={this.handleDateChange('start')}
                id="TimeFrameDialog-fromDate"
              />
            </FormGroup>
            <FormGroup controlId="TimeFrameDialog-toDate">
              <ControlLabel>To</ControlLabel>
              <DatePicker
                selected={endMoment}
                startDate={startMoment}
                endDate={endMoment}
                dateFormat="D. MMM"
                selectsStart
                onChange={this.handleDateChange('end')}
                id="TimeFrameDialog-toDate"
              />
            </FormGroup>
          </div>
          {predefinedRanges.map(({ name, start, end }) =>
          	<Button
              bsStyle="primary"
              onClick={this.changePredefinedRange({ name, start, end })}
              key={name}
            >
              {name}
            </Button>
          )}
        </Modal.Body>
      </Modal>
    );
	}
}

const mapStateToProps = ({ ranges }) => ranges;

const mapDispatchToProps = (dispatch) => ({
  hideChangeRangeDialog: () => dispatch(hideChangeRangeDialog()),
  changeRange: range => dispatch(changeRange(range)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TimeFrameDialog);
