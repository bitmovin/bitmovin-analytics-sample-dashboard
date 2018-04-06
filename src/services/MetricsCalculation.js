import * as util from '../api/util';

const COMPLETION_RATE_ACCURACY = 0.1; // percent in decimal format, must not be null.

function isVideoTimeSegmentInChunk(videotime_start, videotime_end, chunktime_start, chunktime_end) {
  if (videotime_end - videotime_start === 0) { return false; }
  if (videotime_end < chunktime_start || videotime_start > chunktime_end) {
    return false;
  }
  return true;
}

export function calculateCompletionRate(impression) {
  let video_duration = impression[0].video_duration;

  if (video_duration === null) { return 'Livestream'; }
  if(video_duration === 0) { return 'No Data'; }

  let videotime_buckets = [];
  let video_timesegment = video_duration * COMPLETION_RATE_ACCURACY;
  for(var i = 0; i < impression.length; i++) {
    for (var j = 0; j < 1/COMPLETION_RATE_ACCURACY; j++) {
      let chunktime_start = video_timesegment*j;
      let chunktime_end = chunktime_start + video_timesegment;
      videotime_buckets[j] |= isVideoTimeSegmentInChunk(impression[i].videotime_start, impression[i].videotime_end, chunktime_start, chunktime_end);
    }
  }
  let completionRate = videotime_buckets.filter(value => value).length * COMPLETION_RATE_ACCURACY;
  return util.roundTo(completionRate*100, 2) + '%';
}
