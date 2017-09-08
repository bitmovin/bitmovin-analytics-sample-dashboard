import * as actions from '../actions/ranges'
import moment from 'moment'

const defaultState = {
  dialogVisible: false,
  name: 'Last 24 Hours',
  primaryRange: {
    start: moment.utc().subtract(1, 'day').startOf('hour').format(),
    end: moment.utc().endOf('hour').format()
  },
  secondaryRange: {
    start: moment.utc().subtract(2, 'day').startOf('hour').format(),
    end: moment.utc().subtract(1, 'day').endOf('hour').format()
	},
	interval: 'HOUR'
}

export default function ranges(state = defaultState, action) {
  switch(action.type) {
    case actions.SHOW_CHANGE_RANGE_DIALOG:
      return { ...state, dialogVisible: true }
    case actions.HIDE_CHANGE_RANGE_DIALOG:
      return { ...state, dialogVisible: false }
    case actions.CHANGE_RANGE_RELATIVE:
			const primaryRange = {
				start: moment.utc().subtract(action.range[0], action.range[1]).endOf(action.interval).format(),
				end: moment.utc().format()
			};
			const secondaryRange = {
				start: moment.utc().subtract(action.range[0] * 2, action.range[1]).endOf(action.interval).format(),
				end: moment.utc().subtract(action.range[0], action.range[1]).format()
			}

      return {
        ...state,
        name: action.name,
        primaryRange: primaryRange,
        secondaryRange: secondaryRange,
				interval: action.interval
      }
    default:
      return state;
  }
}
