import moment from 'moment'

export const thisWeek = {
  start: moment.utc().subtract(1, 'week').format(),
  end: moment.utc().format()
}
export const lastWeek = {
  start: moment.utc().subtract(2, 'week').format(),
  end: moment.utc().subtract(1, 'week').format()
}
export const last7Days = {
  start: moment.utc().subtract(1, 'week').format(),
  end: moment.utc().format()
}

export const last3days = {
  start: moment.utc().subtract(3, 'days').format(),
  end: moment.utc().format()
}
