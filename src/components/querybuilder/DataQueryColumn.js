import React, {Component} from 'react';
import DataFilter from './DataFilter';
import DataFieldSelector from './DataFieldSelector';
import {connect} from 'react-redux';
import * as actions from '../../actions/query';
import FormSelect from '../FormSelect';

class DataQueryColumn extends Component {
  render() {
    const filters = this.props.column.filters.map((filter, index) => {
      return (
        <DataFilter
          key={filter.key}
          colIndex={this.props.index}
          index={index}
          column={this.props.column}
          filter={filter}
        />
      );
    });
    return (
      <div className="data-query column">
        <div className="col-md-6">
          <legend>Column Settings</legend>
          <FormSelect
            onChange={this.props.changeQueryFunction}
            label="Aggregate Function"
            defaultValue={this.props.column.queryFunction}>
            <option value="MAX">Max</option>
            <option value="MIN">Min</option>
            <option value="SUM">Sum</option>
            <option value="STDDEV">Standard Deviation</option>
            <option value="AVG">Average</option>
            <option value="COUNT">Count</option>
          </FormSelect>
          <br />

          <DataFieldSelector
            label="Dimension"
            value={this.props.column.queryField}
            onChange={this.props.changeQueryField}
          />
        </div>
        <div className="col-md-6" style={{borderLeft: '1px solid #c0c0c0'}}>
          <legend>Filters</legend>
          <div className="row">{filters}</div>
          <center>
            <button className="btn btn-info" onClick={this.props.addFilter}>
              Add another Filter
            </button>
          </center>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {};
};
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    changeQueryFunction: src => {
      dispatch(actions.changeColumnQueryFunction(ownProps.index, src.target.value));
    },
    changeQueryField: src => {
      const value = src.target.value;
      console.log('running');
      dispatch(actions.changeColumnQueryField(ownProps.index, value));
    },
    addFilter: () => {
      dispatch(actions.addColumnFilter(ownProps.index));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DataQueryColumn);
