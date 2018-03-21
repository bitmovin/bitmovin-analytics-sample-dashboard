import * as actions from '../actions/ranges'
import moment from 'moment'

const defaultState = {
  dialogVisible: false,
  name: 'Last 24 Hours',
  primaryRange: {
    start: moment.utc().subtract(1, 'day').startOf('hour').format(),
    end: moment.utc().startOf('hour').format()
  },
  secondaryRange: {
    start: moment.utc().subtract(2, 'day').startOf('hour').format(),
    end: moment.utc().subtract(1, 'day').startOf('hour').format()
	},
	interval: 'HOUR'
}

export default function ranges(state = defaultState, action) {
  switch(action.type) {
    case actions.SHOW_CHANGE_RANGE_DIALOG:
      return { ...state, dialogVisible: true }
    case actions.HIDE_CHANGE_RANGE_DIALOG:
      return { ...state, dialogVisible: false }
    case actions.CHANGE_RANGE: {
      // TODO: Make ranges dates instead of strings
      const { name, start, end } = { end: new Date(), ...action };
      console.log("TIMERANGE", name, start, end)
      const primaryRange = { start: moment(start).format(), end: moment(end).format() };
      const duration = moment(end).diff(start);
      const secondaryRange = { start: moment(start).subtract(duration).format(), end: moment(start).format() }
      const intervalMin = [
        ['DAY', moment.duration(1, 'days')],
        ['HOUR', moment.duration(2, 'hours')],
        ['MINUTE', moment.duration(0, 'minutes')],
      ];
      const [interval] = intervalMin.find(([, minMoment]) => duration > minMoment.asMilliseconds());

      return { ...state, name, primaryRange, secondaryRange, interval };
    }
    default:
      return state;
  }
}
