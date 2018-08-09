import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import QueryColumn from '../../containers/querybuilder/QueryColumn';
import DatePicker from 'material-ui/DatePicker';
import * as queryActions from '../../actions/query';
import {addDashboard, updateDashboard} from '../../actions/dashboard';
import moment from 'moment';
import FormCard from '../FormCard';
import FormSelect from '../FormSelect';
import TextField from '../TextField';

class QueryBuilder extends Component {
  static propTypes = {
    query: PropTypes.object.isRequired,
  };
  render() {
    let columns = this.props.query.columns.map((col, index) => {
      return <QueryColumn key={index} index={index} column={col} />;
    });
    const addButtons = [];
    if (this.props.query.editing) {
      addButtons.push(
        <button key={1} onClick={this.props.update} className="btn btn-info">
          Update
        </button>
      );
    } else {
      addButtons.push(
        <button key={1} onClick={this.props.addChart} className="btn btn-info">
          <i className="fa fa-line-chart" /> Add as Chart
        </button>
      );
      addButtons.push(
        <button key={2} onClick={this.props.addTable} className="btn btn-info">
          <i className="fa fa-table" /> Add as Table
        </button>
      );
    }
    return (
      <div className="row">
        <div className="col-xs-12 col-md-4">
          <FormCard title="Sheet Options" icon="puzzle-piece" bgColor="blue">
            <div>
              <TextField
                label="Card name"
                defaultValue={this.props.query.title}
                onBlur={evt => {
                  this.props.changeQueryTitle(evt.target.value);
                }}
              />
            </div>
            <div>
              <label>From</label>
              <DatePicker
                autoOk={true}
                hintText="Begin"
                value={this.props.query.start.toDate()}
                onChange={(nil, date) => this.props.changeStartTime(date)}
              />
            </div>
            <div>
              <label>To</label>
              <DatePicker
                autoOk={true}
                hintText="End"
                value={this.props.query.end.toDate()}
                onChange={(nil, date) => this.props.changeEndTime(date)}
              />
            </div>
            <div>
              <FormSelect
                label="Interval"
                defaultValue={this.props.query.interval}
                onChange={event => {
                  this.props.changeInterval(event.target.value);
                }}>
                <option value="MONTH">Month</option>
                <option value="DAY">Day</option>
                <option value="HOUR">Hour</option>
                <option value="MINUTE">Minute</option>
              </FormSelect>
            </div>
            <div className="text-right">
              <br />
              {addButtons}
            </div>
          </FormCard>
          ;
        </div>
        <div className="col-xs-12 col-md-8">
          {columns}
          <button className="btn btn-info" onClick={this.props.addBlankColumn}>
            Add Query Column
          </button>
          <button className="btn btn-info" onClick={this.props.addBlankFunctionColumn}>
            Add Function Column
          </button>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    query: state.query,
  };
};
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    changeInterval: x => {
      dispatch(queryActions.changeInterval(x));
    },
    changeStartTime: date => {
      dispatch(queryActions.changeStartTime(moment(date).utc()));
    },
    changeEndTime: date => {
      dispatch(queryActions.changeEndTime(moment(date).utc()));
    },
    addBlankColumn: () => {
      dispatch(queryActions.addBlankQueryColumn());
    },
    addBlankFunctionColumn: () => {
      dispatch(queryActions.addBlankFunctionColumn());
    },
    changeQueryTitle: title => {
      dispatch(queryActions.changeQueryTitle(title));
    },
    addChart: () => {
      return dispatch((dispatch, getState) => {
        dispatch(addDashboard(getState().query, 'chart'));
      });
    },
    addTable: () => {
      return dispatch((dispatch, getState) => {
        dispatch(addDashboard(getState().query, 'table'));
      });
    },
    update: () => {
      dispatch(updateDashboard());
    },
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QueryBuilder);
