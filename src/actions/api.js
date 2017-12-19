import Api from '../api/index'
import performLogin from '../api/login'
import queryString from 'query-string';

const storageAvailable = (type) => {
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

export const SET_LOGIN = 'SET_LOGIN';

function createSetLoginAction(apiKey, userName, licenseKeys, licenseKey) {
  return {
    type: SET_LOGIN,
    apiKey,
    userName,
    licenseKeys,
    licenseKey
  }
}

export const LOGIN_FAILED = 'LOGIN_FAILED';
export function createLoginfailedAction() {
  return {
    type: LOGIN_FAILED
  }
}

export const API_KEY_INVALID = 'API_KEY_INVALID';
export function createApiKeyInvalidAction() {
  return {
    type: API_KEY_INVALID
  }
}

export const START_LOGIN = 'START_LOGIN';
export function createStartLoginAction() {
  return {
    type: START_LOGIN,
  };
}

const removeLoginFromLocalStorage = () => {
  if (storageAvailable('localStorage')) {
    let storage = window.localStorage;
    storage.removeItem('apiKey');
    storage.removeItem('analyticsLicenseKey');
  }
}

export const UNSET_LOGIN = 'UNSET_LOGIN';
export function unsetApiKey() {
  removeLoginFromLocalStorage();
  return {
    type: UNSET_LOGIN
  }
}

export const SELECT_ANALYTICS_LICENSE_KEY = 'SELECT_ANALYTICS_LICENSE_KEY';
export const selectAnalyticsLicenseKey = (analyticsLicenseKey) => {
  if (storageAvailable('localStorage')) {
    const storage = window.localStorage;
    storage.setItem('licenseKey', analyticsLicenseKey);
  }

  return (dispatch) => {
    dispatch({
      type: SELECT_ANALYTICS_LICENSE_KEY,
      analyticsLicenseKey
    })
  }
};

export function persistLogin(apiKey) {
  if (storageAvailable('localStorage')) {
    const storage = window.localStorage;
    storage.setItem('apiKey', apiKey);
  }
}

function getApiKeyFromLocalStorage() {
  if (!storageAvailable('localStorage')) {
    return null
  }
  return localStorage.getItem('apiKey');
}

function getLicenseKeyFromLocalStorage() {
  if (!storageAvailable('localStorage')) {
    return null;
  }
  return localStorage.getItem('licenseKey');
}

function getAccountInformation(apiKey) {
  const api = new Api(apiKey)
  return api.bitmovin.account.information().then(info => {
    return { apiKey: apiKey, userName: info.email }
  })
}

export const loadAnalyticsLicenseKeys = (apiKey) => {
    const api = new Api(apiKey);
    return api.getAnalyticsLicenseKeys()
};

async function loginThroughApiKey(dispatch, apiKey, userName) {
  persistLogin(apiKey);
  const licenseKeys = await loadAnalyticsLicenseKeys(apiKey);
  const storedKey = getLicenseKeyFromLocalStorage();
  const licenseKey = licenseKeys.map(l => l.licenseKey).find(k => k === storedKey) || licenseKeys[0].licenseKey;
  dispatch(createSetLoginAction(apiKey, userName, licenseKeys, licenseKey));
}

const getApiKeyFromQueryParam = () => queryString.parse(location.search).apiKey;

export const initializeApplication = () => async (dispatch) => {
  try {
    const apiKey = getApiKeyFromQueryParam() || getApiKeyFromLocalStorage();
    if (!apiKey) {
      return;
    }

    const { userName } = await getAccountInformation(apiKey);
    loginThroughApiKey(dispatch, apiKey, userName);
  } catch (error) {
    dispatch(createApiKeyInvalidAction())
  }
}

export const login = (userName, password) => async (dispatch, getState) => {
  dispatch(createStartLoginAction());

  try {
    const { data } = await performLogin(userName, password);
    const apiKey = data.result.apiKeys[0].value;
    loginThroughApiKey(dispatch, apiKey, userName);
  } catch (err) {
    dispatch(createLoginfailedAction());
  }
}
