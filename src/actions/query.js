export const CHANGE_QUERY_INTERVAL = 'CHANGE_QUERY_INTERVAL';
export const CHANGE_START_TIME = 'CHANGE_START_TIME';
export const CHANGE_END_TIME = 'CHANGE_END_TIME';
export const REMOVE_COLUMN = 'REMOVE_COLUMN';
export const CHANGE_COLUMN_QUERY_FUNCTION = 'CHANGE_COLUMN_QUERY_FUNCTION';
export const CHANGE_COLUMN_QUERY_FIELD = 'CHANGE_COLUMN_QUERY_FIELD';
export const REMOVE_COLUMN_FILTER = 'REMOVE_COLUMN_FILTER';

export function changeInterval(interval) {
  return {
    type: CHANGE_QUERY_INTERVAL,
    interval,
  };
}

export function changeStartTime(time) {
  return {
    type: CHANGE_START_TIME,
    time,
  };
}

export function changeEndTime(time) {
  return {
    type: CHANGE_END_TIME,
    time,
  };
}

export function removeColumn(index) {
  return {
    type: REMOVE_COLUMN,
    index,
  };
}

export function changeColumnQueryFunction(index, queryFunction) {
  return {
    type: CHANGE_COLUMN_QUERY_FUNCTION,
    index,
    queryFunction,
  };
}

export function changeColumnQueryField(index, queryField) {
  return {
    type: CHANGE_COLUMN_QUERY_FIELD,
    index,
    queryField,
  };
}

export function removeColumnFilter(columnIndex, filterIndex) {
  return {
    type: REMOVE_COLUMN_FILTER,
    columnIndex,
    filterIndex,
  };
}

export const CHANGE_QUERY_COLUMN_FILTER_NAME = 'CHANGE_QUERY_COLUMN_FILTER_NAME';
export function changeQueryColumnFilterName(columnIndex, filterIndex, name) {
  return {
    type: CHANGE_QUERY_COLUMN_FILTER_NAME,
    columnIndex,
    filterIndex,
    name,
  };
}

export const CHANGE_QUERY_COLUMN_FILTER_OPERATOR = 'CHANGE_QUERY_COLUMN_FILTER_OPERATOR';
export function changeQueryColumnFilterOperator(columnIndex, filterIndex, operator) {
  return {
    type: CHANGE_QUERY_COLUMN_FILTER_OPERATOR,
    columnIndex,
    filterIndex,
    operator,
  };
}

export const CHANGE_QUERY_COLUMN_FILTER_VALUE = 'CHANGE_QUERY_COLUMN_FILTER_VALUE';
export function changeQueryColumnFilterValue(columnIndex, filterIndex, value) {
  return {
    type: CHANGE_QUERY_COLUMN_FILTER_VALUE,
    columnIndex,
    filterIndex,
    value,
  };
}

export const ADD_BLANK_QUERY_COLUMN = 'ADD_BLANK_COLUMN';
export function addBlankQueryColumn() {
  return {
    type: ADD_BLANK_QUERY_COLUMN,
  };
}
export const ADD_BLANK_FUNC_COLUMN = 'ADD_BLANK_FUNC_COLUMN';
export function addBlankFunctionColumn() {
  return {
    type: ADD_BLANK_FUNC_COLUMN,
  };
}

export const ADD_COLUMN_FILTER = 'ADD_COLUMN_FILTER';
export function addColumnFilter(columnIndex) {
  return {
    type: ADD_COLUMN_FILTER,
    columnIndex,
    key: Math.round(Math.random() * 100000),
  };
}

export const SHOW_QUERY_BUILDER = 'SHOW_QUERY_BUILDER';
export function showQueryBuilder() {
  return {
    type: SHOW_QUERY_BUILDER,
  };
}

export const HIDE_QUERY_BUILDER = 'HIDE_QUERY_BUILDER';
export function hideQueryBuilder() {
  return {
    type: HIDE_QUERY_BUILDER,
  };
}

export function toggleQueryBuilder() {
  return (dispatch, getState) => {
    if (getState().query.visible) {
      dispatch(hideQueryBuilder());
    } else {
      dispatch(showQueryBuilder());
    }
  };
}

export const CHANGE_FUNCTION_COLUMN_NAME = 'CHANGE_FUNCTION_COLUMN_NAME';
export function changeFunctionColumnName(columnIndex, name) {
  return {
    type: CHANGE_FUNCTION_COLUMN_NAME,
    columnIndex,
    name,
  };
}

export const CHANGE_FUNCTION_ARGUMENT = 'CHANGE_FUNCTION_ARGUMENT';
export function changeFunctionArgument(columnIndex, index, value) {
  return {
    type: CHANGE_FUNCTION_ARGUMENT,
    columnIndex,
    index,
    value,
  };
}

export const CHANGE_COLUMN_TITLE = 'CHANGE_COLUMN_TITLE';
export const END_EDIT_COLUMN_TITLE = 'END_EDIT_COLUMN_TITLE';
export function changeColumnTitle(columnIndex, title) {
  return dispatch => {
    dispatch({
      type: CHANGE_COLUMN_TITLE,
      columnIndex,
      title,
    });
    dispatch({
      type: END_EDIT_COLUMN_TITLE,
      columnIndex,
    });
  };
}

export const START_EDIT_COLUMN_TITLE = 'START_EDIT_COLUMN_TITLE';
export function startEditColumnTitle(columnIndex) {
  return {
    type: START_EDIT_COLUMN_TITLE,
    columnIndex,
  };
}

export const CHANGE_COLUMN_RENDER_IN_GRAPH = 'CHANGE_COLUMN_RENDER_IN_GRAPH';
export function changeColumnRenderInGraph(columnIndex, visibility) {
  return {
    type: CHANGE_COLUMN_RENDER_IN_GRAPH,
    columnIndex,
    visibility,
  };
}

export const CHANGE_QUERY_TITLE = 'CHANGE_QUERY_TITLE';
export function changeQueryTitle(title) {
  return {
    type: CHANGE_QUERY_TITLE,
    title,
  };
}
