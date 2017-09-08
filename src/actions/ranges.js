export const SHOW_CHANGE_RANGE_DIALOG = 'SHOW_CHANGE_RANGE_DIALOG'
export const HIDE_CHANGE_RANGE_DIALOG = 'HIDE_CHANGE_RANGE_DIALOG'
export const CHANGE_RANGE_RELATIVE = 'CHANGE_RANGE_RELATIVE'

export function showChangeRangeDialog() {
  return {
    type: SHOW_CHANGE_RANGE_DIALOG
  }
}

export function hideChangeRangeDialog() {
  return {
    type: HIDE_CHANGE_RANGE_DIALOG
  }
}

export function changeRangeRelative(range) {
  return {
    type: CHANGE_RANGE_RELATIVE,
    ...range
  }
}