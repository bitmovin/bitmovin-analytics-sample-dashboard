export const SHOW_CHANGE_RANGE_DIALOG = 'SHOW_CHANGE_RANGE_DIALOG'
export const HIDE_CHANGE_RANGE_DIALOG = 'HIDE_CHANGE_RANGE_DIALOG'
export const CHANGE_RANGE_RELATIVE = 'CHANGE_RANGE_RELATIVE'
export const CHANGE_RANGE = 'CHANGE_RANGE'

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

// TODO: Remove if unused
export function changeRangeRelative(range) {
  return {
    type: CHANGE_RANGE_RELATIVE,
    ...range
  }
}

export function changeRange(range) {
  return {
    type: CHANGE_RANGE,
    ...range
  }
}
