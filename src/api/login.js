import urljoin from 'url-join';
import 'whatwg-fetch';
import {apiBasePath, checkResponseStatus, parseJson} from './index';

const login = (email, password) => {
  const url = urljoin(apiBasePath, '/account/login');
  const body = {eMail: email, password};
  const opts = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  return new Promise((resolve, reject) => {
    fetch(url, opts)
      .then(checkResponseStatus)
      .then(parseJson)
      .then(response => resolve(response))
      .catch(err => reject(err));
  });
};

export default login;
