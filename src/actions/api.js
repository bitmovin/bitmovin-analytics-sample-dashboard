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

export const START_LOGIN = 'START_LOGIN';
export function createStartLoginAction() {
  return {
    type: START_LOGIN,
  };
}
export const UNSET_LOGIN = 'UNSET_LOGIN';
export function unsetApiKey() {
  removeLoginFromLocalStorage();
  return {
    type: UNSET_LOGIN
  }
}

const removeLoginFromLocalStorage = () => {
  if (storageAvailable('localStorage')) {
    let storage = window.localStorage;
    storage.removeItem('apiKey');
  }
}


export const SELECT_ANALYTICS_LICENSE_KEY = 'SELECT_ANALYTICS_LICENSE_KEY';
export const selectAnalyticsLicenseKey = (analyticsLicenseKey) => {
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

function getKeyFromLocalStorage() {
  if (!storageAvailable('localStorage')) {
    return false
  }
  const storage = window.localStorage;
  const apiKey = storage.getItem('apiKey');
  return apiKey ? apiKey : false;
}

function getAccountInformation(apiKey) {
  const api = new Api(apiKey)
  return api.bitmovin.account.information().then(info => {
    return { apiKey: apiKey, userName: info.email }
  })
}

function loginThroughApiKey(dispatch, apiKey, userName) {
  return loadAnalyticsLicenseKeys(apiKey).then(licenseKeys => {
    dispatch(createSetLoginAction(apiKey, userName, licenseKeys));
  })
}

export function initializeApplication() {
	return (dispatch) => {
   {
     const keyFromLocalStorage = getKeyFromLocalStorage()
     const apiKeyFromQueryString = tryLoginFromQueryParam() || keyFromLocalStorage;
     if (apiKeyFromQueryString) {
       getAccountInformation(apiKeyFromQueryString).then(info => {
         const { apiKey, userName } = info
         loginThroughApiKey(dispatch, apiKey, userName)
       }).catch(error => {
         dispatch(createApiKeyInvalidAction())
       });
     }
    }
	}
}

const tryLoginFromQueryParam = () => {
  const {apiKey} = queryString.parse(location.search);
  return apiKey;
};

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

export function login(userName, password) {
  return (dispatch, getState) => {
    dispatch(createStartLoginAction());

    performLogin(userName, password).then(response => {
      const apiKey = response.data.result.apiKeys[0].value;

      loadAnalyticsLicenseKeys(apiKey).then(licenseKeys => {
        dispatch(createSetLoginAction(apiKey, userName, licenseKeys));
      });
      persistLogin(apiKey);
    }).catch(err => {
      dispatch(createLoginfailedAction());
    });
  }
}

export const loadAnalyticsLicenseKeys = (apiKey) => {
    const api = new Api(apiKey);
    return api.getAnalyticsLicenseKeys()
};

