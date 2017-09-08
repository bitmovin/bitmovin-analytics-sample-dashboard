export function storageAvailable(type) {
	try {
		let storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
}

export const shortenString = (string) => {
  let shortenedString = string;
  if (typeof shortenedString !== 'string') {
    return '<UNKNOWN>';
  }
  if (string.length > 50) {
    shortenedString = string.substring(0, 22);
    shortenedString += '...';
    shortenedString += string.substring(string.length - 22, string.length);
  }

  return shortenedString;
};

export const ErrorCodes = {
  3000 : 'Unknown error',
  3001 : 'Unsupported manifest format',
  3002 : 'Segment contains no data',
  3003 : 'Corrupt tfdt version',
  3004 : 'No URL for segment found',
  3005 : 'No URL to manifest given',
  3006 : 'Could not load manifest, got HTTP status code ',
  3007 : '',
  3008 : '',
  3009 : '',
  3010 : '',
  3011 : 'DRM: License request failed with HTTP status ',
  3012 : 'DRM: Invalid header name/value pair for PlayReady license request',
  3013 : 'DRM: Key or KeyID is missing',
  3014 : 'DRM: Key size not supported',
  3015 : '',
  3016 : 'DRM: Unable to instantiate a key system supporting the required combinations',
  3017 : 'DRM: Unable to create or initialize key session',
  3018 : 'DRM: Failed to create and initialize a MediaKeys object',
  3019 : 'DRM: Certificate request failed with HTTP status ',
  3020 : 'DRM: Key Error',
  3021 : 'DRM: Key System not supported',
  3022 : 'Error with the manifest, maybe MPD is not valid',
  3023 : '<strong>A network error occurred. The reason might be:</strong><br><ul><li>No Internet connection</li>'
  + '<li>Domain Name could not be resolved</li><li>The server refused the connection</li><li>CORS is not enabled</li>'
  + '</ul>',
  3024 : 'Manifest download has timed out',
  3025 : 'Segment download has timed out',
  3026 : 'Progressive stream has timed out',
  3027 : 'DRM: Certificate Error',
  3028 : 'Progressive stream type not supported or the stream has an error',
  3029 : 'HLS stream has an error',
  3030 : 'Could not skip gap',
  3031 : 'DRM: Could not parse Fairplay certificate',
  3032 : 'No supported source found within manifest',
  3033 : 'DRM: License server URL not found (LA_URL, getLicenseServerUrl or manifest)',
  3034 : 'DRM: No DRM configuration provided for protected stream',
  3035 : 'Player had too many consecutive errors',

  // FLASH ERRORS
  2000 : 'Unknown error: {{0}}',
  2001 : 'DRM Error occured: {{0}}',

  6000 : 'INTERNAL ONLY: RESTART PLAYER'
};
