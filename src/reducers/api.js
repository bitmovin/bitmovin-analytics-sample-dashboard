import * as apiAction from '../actions/api.js';

const defaultState = {
  apiKey: '',
  tenantOrgId: '',
  isSetup: false,
  validationSuccess: false,
  isValidating: true,
  validationError: false,
  apiKeyInvalid: false,
  loginFailed: false,
  processingLogin: false,
  analyticsLicenseKey: '',
  isLoadingAnalyticsLicenseKeys: false,
  loadedAnalyticsLicenseKeys: false,
  analyticsLicenseKeys: [],
};

function api(state = defaultState, action) {
  switch (action.type) {
    case apiAction.SET_LOGIN:
      const firstLicenseKey = action.licenseKeys[0].licenseKey;
      window.bitmovinAnalyticsLicenseKey = firstLicenseKey;
      return {
        ...state,
        apiKey: action.apiKey,
        tenantOrgId: action.tenantOrgId,
        userName: action.userName,
        isSetup: true,
        verifyingApiKey: false,
        apiKeyInvalid: false,
        processingLogin: false,
        loginFailed: false,
        analyticsLicenseKeys: action.licenseKeys,
        analyticsLicenseKey: firstLicenseKey,
      };

    case apiAction.UNSET_LOGIN:
      return defaultState;

    case apiAction.LOGIN_FAILED:
      return {
        ...state,
        processingLogin: false,
        loginFailed: true,
      };

    case apiAction.START_LOGIN:
      return {
        ...state,
        processingLogin: true,
        loginFailed: false,
      };

    case apiAction.SELECT_ANALYTICS_LICENSE_KEY:
      window.bitmovinAnalyticsLicenseKey = action.analyticsLicenseKey;
      return {
        ...state,
        analyticsLicenseKey: action.analyticsLicenseKey,
      };
    case apiAction.API_KEY_INVALID:
      return {
        ...state,
        processingLogin: false,
        loginFailed: true,
      };

    default:
      return state;
  }
}

export default api;
