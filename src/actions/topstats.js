export const START_LOADING_TOPSTATS = 'START_LOADING_TOPSTATS'
export const FINISHED_LOADING_TOPSTATS = 'FINISHED_LOADING_TOPSTATS'

export function startLoadingTopstats(name) {
  return {
    type: START_LOADING_TOPSTATS,
    name
  }
}

export function finishedLoadingTopstats(name, metric) {
  return {
    type: FINISHED_LOADING_TOPSTATS,
    name,
    metric
  }
}

export function reLoadTopStat(name, fetchData) {
  return loadTopStat(name, fetchData, true);
}

export function loadTopStat(name, fetchData, reload = false) {
  return (dispatch, getState) => {
    const state = getState().topstats[name];
    if (reload === false && state && state.loaded === true) {
      return;
    }

    dispatch(startLoadingTopstats(name))
    const load = async () => {
      const metric = await fetchData();
      if (!isFinite(metric.change)) {
        metric.change = 100;
      }
      if (metric.change > 100) {
        metric.change = 100;
      }
      dispatch(finishedLoadingTopstats(name, metric))
    }
    load();
  }
}
