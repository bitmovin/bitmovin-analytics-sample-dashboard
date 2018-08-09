import moment from 'moment';
import * as actions from '../actions/query';
import {EDIT_DASHBOARD, FINISH_EDIT_DASHBOARD} from '../actions/dashboard';

const defaultState = {
  visible: true,
  title: 'Impressios vs Playback',
  start: moment
    .utc()
    .subtract(7, 'days')
    .startOf('day'),
  end: moment.utc(),
  interval: 'DAY',
  editing: false,
  editingDashboard: null,
  columns: [
    {
      type: 'query',
      queryFunction: 'COUNT',
      queryField: 'IMPRESSION_ID',
      title: 'Total Impressions',
      renderInGraph: true,
      filters: [],
    },
    {
      type: 'query',
      queryFunction: 'COUNT',
      queryField: 'IMPRESSION_ID',
      title: 'Impressions that started playback',
      renderInGraph: true,
      filters: [
        {
          key: '1245',
          name: 'PLAYED',
          operator: 'GT',
          value: 0,
        },
      ],
    },
  ],
};

export default function query(state = defaultState, action) {
  switch (action.type) {
    case actions.CHANGE_QUERY_INTERVAL: {
      return {
        ...state,
        interval: action.interval,
      };
    }
    case actions.CHANGE_START_TIME: {
      return {
        ...state,
        start: moment(action.time),
      };
    }
    case actions.CHANGE_END_TIME: {
      return {
        ...state,
        end: moment(action.time),
      };
    }
    case actions.REMOVE_COLUMN: {
      let columns = [...state.columns.slice(0, action.index), ...state.columns.slice(action.index + 1)];
      let x = {
        ...state,
        columns: columns,
      };
      return x;
    }
    case actions.CHANGE_COLUMN_QUERY_FUNCTION: {
      let columns = [
        ...state.columns.slice(0, action.index),
        {
          ...state.columns[action.index],
          queryFunction: action.queryFunction,
        },
        ...state.columns.slice(action.index + 1),
      ];
      return {
        ...state,
        columns: columns,
      };
    }
    case actions.CHANGE_COLUMN_QUERY_FIELD: {
      let columns = [
        ...state.columns.slice(0, action.index),
        {
          ...state.columns[action.index],
          queryField: action.queryField,
        },
        ...state.columns.slice(action.index + 1),
      ];
      return {
        ...state,
        columns: columns,
      };
    }
    case actions.REMOVE_COLUMN_FILTER: {
      let columns = [
        ...state.columns.slice(0, action.columnIndex),
        {
          ...state.columns[action.columnIndex],
          filters: [
            ...state.columns[action.columnIndex].filters.slice(0, action.filterIndex),
            ...state.columns[action.columnIndex].filters.slice(action.filterIndex + 1),
          ],
        },
        ...state.columns.slice(action.columnIndex + 1),
      ];
      return {
        ...state,
        columns: columns,
      };
    }
    case actions.ADD_BLANK_QUERY_COLUMN: {
      return {
        ...state,
        columns: [
          ...state.columns,
          {
            type: 'query',
            queryFunction: 'COUNT',
            queryField: 'IMPRESSION_ID',
            title: 'New Field',
            filters: [],
          },
        ],
      };
    }
    case actions.ADD_BLANK_FUNC_COLUMN: {
      return {
        ...state,
        columns: [
          ...state.columns,
          {
            type: 'func',
            name: 'div',
            args: ['$1', '$1'],
            title: 'Ratio',
            format: 'PCT',
            renderInGraph: true,
          },
        ],
      };
    }
    case actions.ADD_COLUMN_FILTER: {
      return {
        ...state,
        columns: [
          ...state.columns.slice(0, action.columnIndex),
          {
            ...state.columns[action.columnIndex],
            filters: [
              ...state.columns[action.columnIndex].filters,
              {
                key: action.key,
                name: 'PLAYED',
                operator: 'GT',
                value: 0,
              },
            ],
          },
          ...state.columns.slice(action.columnIndex + 1),
        ],
      };
    }
    case actions.CHANGE_QUERY_COLUMN_FILTER_OPERATOR: {
      return {
        ...state,
        columns: [
          ...state.columns.slice(0, action.columnIndex),
          {
            ...state.columns[action.columnIndex],
            filters: [
              ...state.columns[action.columnIndex].filters.slice(0, action.filterIndex),
              {
                ...state.columns[action.columnIndex].filters[action.filterIndex],
                operator: action.operator,
              },
              ...state.columns[action.columnIndex].filters.slice(action.filterIndex + 1),
            ],
          },
          ...state.columns.slice(action.columnIndex + 1),
        ],
      };
    }
    case actions.CHANGE_QUERY_COLUMN_FILTER_NAME: {
      return {
        ...state,
        columns: [
          ...state.columns.slice(0, action.columnIndex),
          {
            ...state.columns[action.columnIndex],
            filters: [
              ...state.columns[action.columnIndex].filters.slice(0, action.filterIndex),
              {
                ...state.columns[action.columnIndex].filters[action.filterIndex],
                name: action.name,
              },
              ...state.columns[action.columnIndex].filters.slice(action.filterIndex + 1),
            ],
          },
          ...state.columns.slice(action.columnIndex + 1),
        ],
      };
    }
    case actions.CHANGE_QUERY_COLUMN_FILTER_VALUE: {
      return {
        ...state,
        columns: [
          ...state.columns.slice(0, action.columnIndex),
          {
            ...state.columns[action.columnIndex],
            filters: [
              ...state.columns[action.columnIndex].filters.slice(0, action.filterIndex),
              {
                ...state.columns[action.columnIndex].filters[action.filterIndex],
                value: action.value,
              },
              ...state.columns[action.columnIndex].filters.slice(action.filterIndex + 1),
            ],
          },
          ...state.columns.slice(action.columnIndex + 1),
        ],
      };
    }
    case actions.HIDE_QUERY_BUILDER: {
      return {
        ...state,
        visible: false,
      };
    }
    case actions.SHOW_QUERY_BUILDER: {
      return {
        ...state,
        visible: true,
      };
    }
    case actions.CHANGE_QUERY_TITLE: {
      return {
        ...state,
        title: action.title,
      };
    }
    case actions.CHANGE_FUNCTION_COLUMN_NAME: {
      return {
        ...state,
        columns: [
          ...state.columns.slice(0, action.columnIndex),
          {
            ...state.columns[action.columnIndex],
            name: action.name,
          },
          ...state.columns.slice(action.columnIndex + 1),
        ],
      };
    }
    case actions.CHANGE_FUNCTION_ARGUMENT: {
      return {
        ...state,
        columns: [
          ...state.columns.slice(0, action.columnIndex),
          {
            ...state.columns[action.columnIndex],
            args: [
              ...state.columns[action.columnIndex].args.slice(0, action.index),
              action.value,
              ...state.columns[action.columnIndex].args.slice(action.index + 1),
            ],
          },
          ...state.columns.slice(action.columnIndex + 1),
        ],
      };
    }
    case actions.CHANGE_COLUMN_TITLE: {
      return {
        ...state,
        columns: [
          ...state.columns.slice(0, action.columnIndex),
          {
            ...state.columns[action.columnIndex],
            title: action.title,
          },
          ...state.columns.slice(action.columnIndex + 1),
        ],
      };
    }
    case actions.START_EDIT_COLUMN_TITLE: {
      return {
        ...state,
        columns: [
          ...state.columns.slice(0, action.columnIndex),
          {
            ...state.columns[action.columnIndex],
            editingTitle: true,
          },
          ...state.columns.slice(action.columnIndex + 1),
        ],
      };
    }
    case actions.END_EDIT_COLUMN_TITLE: {
      return {
        ...state,
        columns: [
          ...state.columns.slice(0, action.columnIndex),
          {
            ...state.columns[action.columnIndex],
            editingTitle: false,
          },
          ...state.columns.slice(action.columnIndex + 1),
        ],
      };
    }
    case actions.CHANGE_COLUMN_RENDER_IN_GRAPH: {
      return {
        ...state,
        columns: [
          ...state.columns.slice(0, action.columnIndex),
          {
            ...state.columns[action.columnIndex],
            renderInGraph: action.visibility,
          },
          ...state.columns.slice(action.columnIndex + 1),
        ],
      };
    }
    case EDIT_DASHBOARD: {
      return {
        ...state,
        ...action.query,
        editing: true,
        editingDashboard: action.boardId,
      };
    }
    case FINISH_EDIT_DASHBOARD: {
      return defaultState;
    }
    default:
      return state;
  }
}
