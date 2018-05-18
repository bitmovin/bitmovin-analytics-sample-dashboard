import Api from '../api'
export const ADD_DASHBOARD = 'ADD_DASHBOARD'
export const START_LOADING_DASHBOARD_DATA = 'START_LOADING_DASHBOARD_DATA';
export const FINISHED_LOADING_DASHBOARD_DATA = 'FINISHED_LOADING_DASHBOARD_DATA';

export function loadDashboardData (boardId, query) {
  return (dispatch, getState) => {
    const api = new Api(getState());
    dispatch(startLoadingDashboardData(boardId, query));
    api.query(query).then((result) => {
      dispatch(finishedLoadingDashboardData(boardId, query, result));
    });
  }
}

export function startLoadingDashboardData (boardId, query) {
  return {
    type: START_LOADING_DASHBOARD_DATA,
    boardId: boardId,
    query: query
  };
}
export function finishedLoadingDashboardData (boardId, query, data) {
  return {
    type: FINISHED_LOADING_DASHBOARD_DATA,
    boardId,
    query,
    data
  };
}

export function addDashboard (query, boardType) {
  return function (dispatch, getState) {
    const boardId = Math.round(Math.random() * 100);
    dispatch({
      type: ADD_DASHBOARD,
      query: query,
      boardId,
      boardType: boardType
    })
    dispatch(loadDashboardData(boardId, query));
  }
}

export const REMOVE_DASHBOARD = 'REMOVE_DASHBOARD';
export function removeDashboard (boardId) {
  return {
    type: REMOVE_DASHBOARD,
    boardId
  }
}

export const EDIT_DASHBOARD = 'EDIT_DASHBOARD';
export function editDashboard (boardId, query) {
  return {
    type: EDIT_DASHBOARD,
    boardId,
    query
  }
}

export const FINISH_EDIT_DASHBOARD = 'FINISH_EDIT_DASHBOARD';
export function updateDashboard () {
  return (dispatch, getState) => {
    const boardId = getState().query.editingDashboard;
    const query = getState().query;
    dispatch({
      type: FINISH_EDIT_DASHBOARD,
      boardId,
      query
    });
    dispatch(loadDashboardData(boardId, query));
  };
}
