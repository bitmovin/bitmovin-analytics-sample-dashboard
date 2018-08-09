export const SHOW_CHANGE_RANGE_DIALOG = 'SHOW_CHANGE_RANGE_DIALOG';
export const HIDE_CHANGE_RANGE_DIALOG = 'HIDE_CHANGE_RANGE_DIALOG';
export const CHANGE_RANGE = 'CHANGE_RANGE';

export function showChangeRangeDialog() {
  return {
    type: SHOW_CHANGE_RANGE_DIALOG,
  };
}

export function hideChangeRangeDialog() {
  return {
    type: HIDE_CHANGE_RANGE_DIALOG,
  };
}

export const changeRange = range => ({type: CHANGE_RANGE, ...range});
