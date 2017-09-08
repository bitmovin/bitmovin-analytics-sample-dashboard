import urljoin from 'url-join'
import 'whatwg-fetch'
import { storageAvailable } from '../utils'

const checkResponseStatus = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    const error = new Error(response.statusText);
    error.response = response;
    throw error
  }
};

const parseJson = (response) => {
  return response.json()
};

export function iplookup(apiKey, ip) {
  const url = urljoin('https://api.bitmovin.com/v1/internal/analytics/ip', ip);

  return new Promise((resolve) => {
    fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      }}).then((response) => {
      return checkResponseStatus(response)
    })
    .then(parseJson)
    .then(response => {
      resolve(response);
    });
  })
}

const getFromCache = (ip) => {
  const storage = window.localStorage;
  return storage.getItem('ip-' + ip)
};

const isInCache = (ip) => {
  return (getFromCache(ip) !== null)
};

const saveInCache = (ip, value) => {
  const storage = window.localStorage;
  storage.setItem('ip-' + ip, JSON.stringify(value));
};

export default function lookupWithLocalStorageCache(apiKey, ip) {
  return new Promise((resolve, reject) => {
    if (storageAvailable('localStorage')) {
      if (isInCache(ip)) {
        resolve(JSON.parse(getFromCache(ip)));
      } else {
        iplookup(apiKey, ip).then(data => {
          saveInCache(ip, data);
          resolve(data);
        })
      }
    }
  })
}
