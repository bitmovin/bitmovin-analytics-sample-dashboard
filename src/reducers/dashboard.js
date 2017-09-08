import * as actions from '../actions/dashboard.js'

const defaultState = {
  boards: []
}

export default function dashboard(state = defaultState, action) {
  switch (action.type) {
    case actions.ADD_DASHBOARD: {
      const board = {
        boardId: action.boardId,
        query: action.query,
        data: [],
        boardType: action.boardType,
        isLoading: false,
        isLoaded: false
      };
      const newState = {
        ...state,
        boards: [...state.boards, board]
      };
      return newState;
    }
    case actions.START_LOADING_DASHBOARD_DATA: {
      const index = state.boards.findIndex(board => board.boardId === action.boardId)
      const newState = {
        ...state,
        boards: [
          ...state.boards.slice(0, index),
          {
            ...state.boards[index],
            isLoading: true,
            data: []
          },
          ...state.boards.slice(index + 1)
        ]
      };
      return newState;
    }
    case actions.FINISHED_LOADING_DASHBOARD_DATA: {
      const index = state.boards.findIndex(board => board.boardId === action.boardId)
      const newState = {
        ...state,
        boards: [
          ...state.boards.slice(0, index),
          {
            ...state.boards[index],
            isLoading: false,
            isLoaded: true,
            data: action.data
          },
          ...state.boards.slice(index + 1)
        ]
      };

      return newState;
    }
    case actions.REMOVE_DASHBOARD: {
      const index = state.boards.findIndex(board => board.boardId === action.boardId)
      return {
        ...state,
        boards: [
          ...state.boards.slice(0, index),
          ...state.boards.slice(index + 1)
        ]
      }
    }
    case actions.EDIT_DASHBOARD: {
      const index = state.boards.findIndex(board => board.boardId === action.boardId)
      return {
        ...state,
        boards: [
          ...state.boards.slice(0, index),
          {
            ...state.boards[index],
            editing: true,
          },
          ...state.boards.slice(index + 1)
        ]
      }
    }
    case actions.FINISH_EDIT_DASHBOARD: {
      const index = state.boards.findIndex(board => board.boardId === action.boardId)
      return {
        ...state,
        boards: [
          ...state.boards.slice(0, index),
          {
            ...state.boards[index],
            editing: false,
            query: action.query,
            data: [],
            isLoading: false,
            isLoaded: false
          },
          ...state.boards.slice(index + 1)
        ]
      }
    }
    default:
      return state
  }
}
