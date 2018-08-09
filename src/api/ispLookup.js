import urljoin from 'url-join';
import 'whatwg-fetch';

const checkResponseStatus = response => {
  if (response.status >= 200 && response.status < 300) {
    return response;
  } else {
    const error = new Error(response.statusText);
    error.response = response;
    throw error;
  }
};

const parseJson = response => {
  return response.json();
};

export function iplookup(apiKey, ip) {
  const url = urljoin('https://api.bitmovin.com/v1/internal/analytics/ip', ip);

  return new Promise(resolve => {
    fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
    })
      .then(response => {
        return checkResponseStatus(response);
      })
      .then(parseJson)
      .then(response => {
        resolve(response);
      });
  });
}
