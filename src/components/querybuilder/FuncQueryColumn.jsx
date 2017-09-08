import React from 'react'
import { connect } from 'react-redux'
import FormSelect from '../FormSelect'
import * as actions from '../../actions/query'
import * as functions from '../../api/functions'

const FuncQueryColumn = ({column, index, changeName, args, changeArgs, changeFormat}) => {
  const argOptions = args.map((arg) => {
    return <option value={arg.value}>{arg.name}</option>
  });
  const formatters = Object.keys(functions.formatters).map(fmt => {
    return <option value={fmt}>{fmt}</option>
  });
  return <div>
    Arguments:
    <FormSelect label="Argument Column 1" defaultValue={column.args[0]} onChange={(evt) => { changeArgs(0, evt.target.value); }}>
      {argOptions}
    </FormSelect>
    <FormSelect label="Argument Column 2" defaultValue={column.args[1]} onChange={(evt) => { changeArgs(1, evt.target.value); }}>
      {argOptions}
    </FormSelect>
    <FormSelect label="Operator" defaultValue={column.name} onChange={(evt) => { changeName(evt.target.value); }}>
      <option value="div">Divide</option>
      <option value="sub">Subtract</option>
      <option value="add">Sum</option>
      <option value="mult">Multiply</option>
    </FormSelect>
    <FormSelect label="Formatter" defaultValue={column.format} onChange={(evt) => { changeFormat(evt.target.value); }}>
      {formatters}
    </FormSelect>
    </div>;
}

const mapStateToProps = (state, ownProps) => {
  return {
    column: state.query.columns[ownProps.index],
    index: ownProps.index,
    args: state.query.columns.slice(0, ownProps.index).map((col, index) => { return { value: "$" + index, name: col.title }; })
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    changeName: (name) => {
      dispatch(actions.changeFunctionColumnName(ownProps.index, name));
    },
    changeArgs: (index, value) => {
      dispatch(actions.changeFunctionArgument(ownProps.index, index, value));
    },
    changeFormat: (format) => { dispatch(actions.changeFunctionColumnFormat(ownProps.index, format)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(FuncQueryColumn);
