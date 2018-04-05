import * as util from '../api/util';

export function calculateCompletionRate(video_duration, playedSum) {
  let completionRate;
  if (video_duration === null) {
    completionRate = 'Livestream';
  } else if (video_duration === 0) {
    completionRate = 'No Data';
  } else {
    let rawCompletionRate = util.roundTo((playedSum / video_duration)*100, 2);
    completionRate = Math.min(rawCompletionRate, 100) + '%';
  }
  return completionRate;
}

export function getWatchTimeForImpression(impression_id, rows) {
  console.log(impression_id);
  console.log(rows);
}
