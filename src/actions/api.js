import {createApiFromParameters} from '../api/index';
import performLogin from '../api/login';
import queryString from 'query-string';

const storageAvailable = type => {
  try {
    let storage = window[type],
      x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
};

export const SET_LOGIN = 'SET_LOGIN';

export function createSetLoginAction(apiKey, tenantOrgId, userName, licenseKeys) {
  return {
    type: SET_LOGIN,
    apiKey: apiKey,
    tenantOrgId: tenantOrgId,
    userName,
    licenseKeys,
  };
}

export const LOGIN_FAILED = 'LOGIN_FAILED';
export function createLoginfailedAction() {
  return {
    type: LOGIN_FAILED,
  };
}

export const PERMISSION_DENIED = 'PERMISSION_DENIED';
export function createPermissionDeniedAction() {
  return {
    type: PERMISSION_DENIED,
  };
}

export const API_KEY_INVALID = 'API_KEY_INVALID';
export function createApiKeyInvalidAction() {
  return {
    type: API_KEY_INVALID,
  };
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
  }
};

export const UNSET_LOGIN = 'UNSET_LOGIN';
export function unsetApiKey() {
  removeLoginFromLocalStorage();
  return {
    type: UNSET_LOGIN,
  };
}

export const SELECT_ANALYTICS_LICENSE_KEY = 'SELECT_ANALYTICS_LICENSE_KEY';
export const selectAnalyticsLicenseKey = analyticsLicenseKey => {
  return dispatch => {
    dispatch({
      type: SELECT_ANALYTICS_LICENSE_KEY,
      analyticsLicenseKey,
    });
  };
};

export function persistLogin(apiKey, tenantOrgId) {
  if (storageAvailable('localStorage')) {
    const storage = window.localStorage;
    storage.setItem('apiKey', apiKey);
    if (tenantOrgId) {
      storage.setItem('tenantOrgId', tenantOrgId);
    } else {
      storage.removeItem('tenantOrgId');
    }
  }
}

function getKeyFromLocalStorage() {
  if (!storageAvailable('localStorage')) {
    return false;
  }
  const storage = window.localStorage;
  const apiKey = storage.getItem('apiKey');
  const tenantOrgId = storage.getItem('tenantOrgId');
  return {apiKey: apiKey, tenantOrgId: tenantOrgId};
}

function getAccountInformation(apiKey) {
  const api = createApiFromParameters(apiKey);
  return api.bitmovin.account.information().then(info => {
    return {apiKey: apiKey, userName: info.email};
  });
}

export const loadAnalyticsLicenseKeys = (apiKey, tenantOrgId) => {
  const api = createApiFromParameters(apiKey, tenantOrgId);
  return api.getAnalyticsLicenseKeys();
};

function loginThroughApiKey(dispatch, apiKey, tenantOrgId, userName) {
  return loadAnalyticsLicenseKeys(apiKey, tenantOrgId)
    .then(licenseKeys => {
      dispatch(createSetLoginAction(apiKey, tenantOrgId, userName, licenseKeys));
    })
    .catch(error => {
      dispatch(createLoginfailedAction());
    });
}

const tryLoginFromQueryParam = () => {
  const apiKey = queryString.parse(location.search).apiKey;
  const tenantOrgId = queryString.parse(location.search).tenantOrgId;

  if (apiKey) {
    return {apiKey: apiKey, tenantOrgId: tenantOrgId};
  }

  return null;
};

export function initializeApplication() {
  return dispatch => {
    {
      const keyFromLocalStorage = getKeyFromLocalStorage();
      const loginFromQueryString = tryLoginFromQueryParam() || keyFromLocalStorage;

      if (loginFromQueryString) {
        const {apiKey, tenantOrgId} = loginFromQueryString;
        getAccountInformation(apiKey)
          .then(info => {
            loginThroughApiKey(dispatch, apiKey, tenantOrgId);
            persistLogin(apiKey, tenantOrgId);
          })
          .catch(error => {
            dispatch(createApiKeyInvalidAction());
          });
      }
    }
  };
}

export function setLogin(apiKey, userName) {
  return (dispatch, getState) => {
    if (getState().api.apiKey === apiKey) {
      return;
    }

    loadAnalyticsLicenseKeys(apiKey)
      .then(licenseKeys => {
        dispatch(createSetLoginAction(apiKey, userName, licenseKeys));
      })
      .catch(err => {
        removeLoginFromLocalStorage();
        dispatch(createApiKeyInvalidAction(apiKey));
      });
  };
}

export function login(userName, password) {
  return (dispatch, getState) => {
    dispatch(createStartLoginAction());

    performLogin(userName, password)
      .then(response => {
        const apiKey = response.data.result.apiKeys[0].value;

        loadAnalyticsLicenseKeys(apiKey).then(licenseKeys => {
          dispatch(createSetLoginAction(apiKey, userName, licenseKeys));
        });
        persistLogin(apiKey);
      })
      .catch(err => {
        dispatch(createLoginfailedAction());
      });
  };
}
