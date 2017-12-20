import * as apiAction from '../actions/api.js'

const defaultState = {
  apiKey                       : '',
  isSetup                      : false,
  validationSuccess            : false,
  isValidating                 : true,
  validationError              : false,
  apiKeyInvalid                : false,
  loginFailed                  : false,
  processingLogin              : false,
  analyticsLicenseKey          : '',
  isLoadingAnalyticsLicenseKeys: false,
  loadedAnalyticsLicenseKeys   : false,
  analyticsLicenseKeys         : []
};

function api(state = defaultState, action) {
  switch (action.type) {
    case apiAction.SET_LOGIN:
      const { apiKey, userName, licenseKeys, licenseKey } = action;
      const selectedLicenseKey = licenseKey || licenseKeys[0].licenseKey;
      window.bitmovinAnalyticsLicenseKey = selectedLicenseKey;
      return {
        ...state,
        apiKey: action.apiKey,
        userName: action.userName,
        isSetup: true,
        verifyingApiKey: false,
        apiKeyInvalid: false,
        processingLogin: false,
        loginFailed: false,
        analyticsLicenseKeys: licenseKeys,
        analyticsLicenseKey: selectedLicenseKey
      };

    case apiAction.UNSET_LOGIN:
      return defaultState;

    case apiAction.LOGIN_FAILED:
      return {
        ...state, processingLogin: false, loginFailed: true
      };

    case apiAction.START_LOGIN:
      return {
        ...state, processingLogin: true, loginFailed: false
      };

    case apiAction.SELECT_ANALYTICS_LICENSE_KEY:
      window.bitmovinAnalyticsLicenseKey = action.analyticsLicenseKey;
      return {
        ...state,
        analyticsLicenseKey: action.analyticsLicenseKey
      };
    case apiAction.API_KEY_INVALID:
      return {
        ...state,
        processingLogin: false,
        loginFailed: true
      }

    default:
      return state;
  }
}

export default api;
