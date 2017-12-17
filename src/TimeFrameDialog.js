import React, { Component } from 'react';
import { Modal, Button, FormGroup, ControlLabel } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import { connect } from 'react-redux';
import { hideChangeRangeDialog, changeRange } from './actions/ranges';
import 'react-datepicker/dist/react-datepicker.css';

class TimeFrameDialog extends Component {
  handleDateChange = (attr) => (dateMoment) => {
    const { start, end } = this.props.primaryRange;
    const { changeRange, hideChangeRangeDialog } = this.props;
    const update = { [attr]: dateMoment.toDate() };
    const name = `${moment(start).format('L')} – ${moment(end).format('L')}`;
    changeRange({ name, start, end, ...update });
    hideChangeRangeDialog();
  };

  render () {
    const predefinedRanges = [
      { name: 'Last Week', start: moment.utc().subtract(7, 'days').endOf('day').toDate() },
      { name: 'Last 3 Days', start: moment.utc().subtract(3, 'days').endOf('day').toDate() },
      { name: 'Last 24 Hours', start: moment.utc().subtract(1, 'day').endOf('hour').toDate() },
      { name: 'Last Hour', start: moment.utc().subtract(1, 'hour').endOf('minute').toDate() },
      { name: 'Last 15 Minutes', start: moment.utc().subtract(15, 'minutes').endOf('minute').toDate() },
    ];
    const { dialogVisible, primaryRange } = this.props;
    const { start, end } = primaryRange;
    const [startMoment, endMoment] = [start, end].map(d => moment(d));

    return (
      <Modal show={dialogVisible} onHide={this.props.hideChangeRangeDialog}>
        <Modal.Header>
          <Modal.Title>Change Timeframe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="PeriodSelection-dateSelection">
            <FormGroup controlId="PeriodSelection-fromDate">
              <ControlLabel>From</ControlLabel>
              <DatePicker
                selected={startMoment}
                startDate={startMoment}
                endDate={endMoment}
                selectsStart
                onChange={this.handleDateChange('start')}
                id="PeriodSelection-fromDate"
              />
            </FormGroup>
            <FormGroup controlId="PeriodSelection-toDate">
              <ControlLabel>To</ControlLabel>
              <DatePicker
                selected={endMoment}
                startDate={startMoment}
                endDate={endMoment}
                selectsStart
                onChange={this.handleDateChange('end')}
                id="PeriodSelection-toDate"
              />
            </FormGroup>
          </div>
          {predefinedRanges.map(({ name, start }) =>
          	<Button
              bsStyle="primary"
              onClick={() => this.props.changeRange({ name, start })}
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
