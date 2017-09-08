import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import DataFieldSelector from './DataFieldSelector';
import TextField from '../TextField';
import * as actions from '../../actions/query';
import FormSelect from '../FormSelect';

class DataFilter extends Component {
  static propTypes = {
    colIndex: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
    filter: PropTypes.object.isRequired,
    changeName: PropTypes.func.isRequired,
    changeOperator: PropTypes.func.isRequired,
    changeValue: PropTypes.func.isRequired
  }
  render () {
    return <div>
      <div className="col-md-10">
        <DataFieldSelector className="col-md-4" onChange={(src) => { this.props.changeName(src.target.value); }} value={this.props.filter.name} label="Dimension" />

        <FormSelect className="col-md-4" label="Operator" defaultValue={ this.props.filter.operator } onChange={(src) => { this.props.changeOperator(src.target.value); }}>
          <option value="EQ">EQ</option>
          <option value="NE">NE</option>
          <option value="GT">GT</option>
          <option value="GTE">GTE</option>
          <option value="LT">LT</option>
          <option value="LTE">LTE</option>
        </FormSelect>

        <TextField className="col-md-4" defaultValue={this.props.filter.value} label="Value" onBlur={(src) => { this.props.changeValue(src.target.value); }} />
      </div>
      <div className="col-md-2">
        <label>Remove</label>
        <a className="btn btn-danger btn-xs" onClick={this.props.remove}>
          <i className="fa fa-trash"></i>
        </a>
      </div>
    </div>
  }
}

const mapStateToProps = (state, ownProps) => {
  const colIndex = ownProps.colIndex;
  const index = ownProps.index;
  return {
    filter: state.query.columns[colIndex].filters[index]
  }
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    changeName: (value) => { dispatch(actions.changeQueryColumnFilterName(ownProps.colIndex, ownProps.index, value)); },
    changeOperator: (value) => { dispatch(actions.changeQueryColumnFilterOperator(ownProps.colIndex, ownProps.index, value)); },
    changeValue: (value) => { dispatch(actions.changeQueryColumnFilterValue(ownProps.colIndex, ownProps.index, value)); },
    remove: () => { dispatch(actions.removeColumnFilter(ownProps.colIndex, ownProps.index))}
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(DataFilter)
