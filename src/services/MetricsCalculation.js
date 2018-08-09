import * as util from '../api/util';

const COMPLETION_RATE_ACCURACY = 0.1; // percent in decimal format, must not be null.

function isVideoTimeSegmentInChunk(videoTimeStart, videoTimeEnd, chunkTimeStart, chunkTimeEnd) {
  if (videoTimeEnd <= videoTimeStart) {
    return false;
  }
  return !(videoTimeEnd < chunkTimeStart || videoTimeStart > chunkTimeEnd);
}

export function calculateCompletionRate(impression) {
  let videoDuration = impression[0].video_duration;

  if (videoDuration === null) {
    return 'Livestream';
  }
  if (videoDuration === 0) {
    return 'No Data';
  }

  let videoTimeBuckets = [];
  let videoTimeSegment = videoDuration * COMPLETION_RATE_ACCURACY;
  for (var i = 0; i < impression.length; i++) {
    for (var j = 0; j < 1 / COMPLETION_RATE_ACCURACY; j++) {
      let chunkTimeStart = videoTimeSegment * j;
      let chunkTimeEnd = chunkTimeStart + videoTimeSegment;
      videoTimeBuckets[j] |= isVideoTimeSegmentInChunk(
        impression[i].videotime_start,
        impression[i].videotime_end,
        chunkTimeStart,
        chunkTimeEnd
      );
    }
  }
  let completionRate = videoTimeBuckets.filter(value => value).length * COMPLETION_RATE_ACCURACY;
  return util.roundTo(completionRate * 100, 2) + '%';
}
