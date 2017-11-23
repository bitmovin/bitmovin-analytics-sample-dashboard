import React from 'react';
import { Link } from 'react-router';
import { shortenString } from '../utils';

export default function VideoLink({ videoId, maxLength }) {
  if (videoId) {
    return <Link to={`/videoinspection?video=${videoId}`}>{shortenString(videoId, maxLength)}</Link>;
  }
  return <span>{shortenString(videoId, maxLength)}</span>;
}

VideoLink.defaultProps = {
  maxLength: 50,
};
