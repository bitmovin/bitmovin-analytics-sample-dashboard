import Api from '../api/index'
import performLogin from '../api/login'
import moment from 'moment'
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
export const UNSET_LOGIN = 'UNSET_LOGIN';

export function createSetLoginAction(apiKey, userName, licenseKeys) {
  return {
    type: SET_LOGIN,
    apiKey: apiKey,
    userName,
    licenseKeys
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

const removeLoginFromLocalStorage = () => {
  if (storageAvailable('localStorage')) {
    let storage = window.localStorage;
    storage.removeItem('apiKey');
    storage.removeItem('userName');
  }
}

export function unsetApiKey() {
  removeLoginFromLocalStorage();
  return {
    type: UNSET_LOGIN
  }
}

export function persistLogin(apiKey, userName) {
  if (storageAvailable('localStorage')) {
			let storage = window.localStorage;
			storage.setItem('apiKey', apiKey);
			storage.setItem('userName', userName);
  }
}

function checkIfKeyIsPresentInLocalStorage() {
  if (!storageAvailable('localStorage')) {
    return false
  }
  const storage = window.localStorage;
  const apiKey = storage.getItem('apiKey');
  const userName = storage.getItem('userName');
  return (apiKey && userName) ? { apiKey, userName } : false;
}

export function initializeApplication() {
	return (dispatch) => {
   {
     const localInfo = checkIfKeyIsPresentInLocalStorage()
     if (localInfo !== false) {
       loadAnalyticsLicenseKeys(localInfo.apiKey).then(licenseKeys => {
         const { apiKey, userName } = localInfo
         dispatch(setLogin(apiKey, userName, licenseKeys));
       }).catch(error => {
         removeLoginFromLocalStorage();
         dispatch(createApiKeyInvalidAction())
       })
     }
    }
	}
}

const tryLoginFromQueryParam = () => {
  const queryParams = queryString.parse(location.search);
  const {apiKey} = queryParams;
  return apiKey;
};

const ENABLE_EXPERIMENTAL_MODE = 'ENABLE_EXPERIMENTAL_MODE';
export function enableExperimentalMode() {
  return {
    type: ENABLE_EXPERIMENTAL_MODE
  }
}

export function setLogin(apiKey, userName) {
  return (dispatch, getState) => {
    if (getState().api.apiKey === apiKey) {
      return;
    }

    const api = new Api(apiKey);
    loadAnalyticsLicenseKeys(apiKey).then(licenseKeys => {
      dispatch(createSetLoginAction(apiKey, userName, licenseKeys));
    }).catch((err) => {
      removeLoginFromLocalStorage();
      dispatch(createApiKeyInvalidAction(apiKey));
    });
  }
}

export const START_LOGIN = 'START_LOGIN';
export function login(userName, password) {
  return (dispatch, getState) => {
    dispatch({
      type: START_LOGIN,
    });

    performLogin(userName, password).then(response => {
      const apiKey = response.data.result.apiKeys[0].value;

      loadAnalyticsLicenseKeys(apiKey).then(licenseKeys => {
        dispatch(createSetLoginAction(apiKey, userName, licenseKeys));
      });
      persistLogin(apiKey, userName);
    }).catch(err => {
      dispatch(createLoginfailedAction());
    });
  }
}

export const START_LOADING_ANALYTICS_LICENSE_KEYS = 'START_LOADING_ANALYTICS_LICENSE_KEYS';
export const SUCCESS_LOADING_ANALYTICS_LICENSE_KEYS = 'SUCCESS_LOADING_ANALYTICS_LICENSE_KEYS';
export const ERROR_LOADING_ANALYTICS_LICENSE_KEYS = 'ERROR_LOADING_ANALYTICS_LICENSE_KEYS';

export const loadAnalyticsLicenseKeys = (apiKey) => {
    const api = new Api(apiKey);
    return api.getAnalyticsLicenseKeys()
};

export const SELECT_ANALYTICS_LICENSE_KEY = 'SELECT_ANALYTICS_LICENSE_KEY';
export const selectAnalyticsLicenseKey = (analyticsLicenseKey) => {
  return (dispatch) => {
    dispatch({
      type: SELECT_ANALYTICS_LICENSE_KEY,
      analyticsLicenseKey
    })
  }
};
