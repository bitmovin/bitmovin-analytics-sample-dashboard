import React from 'react'
import { connect } from 'react-redux'
import FormCard from './components/FormCard'
import TextField from './components/TextField'
import { setLogin, unsetApiKey } from './actions/api'

const SettingsView = ({ apiKey, changeApiKey, logout }) => {
  return <div>
    <div className="col-md-4 col-md-offset-4">
      <div className="row">
        <FormCard title="Settings" icon="cog" bgColor="blue">
          <TextField label="API-Key" defaultValue={apiKey} onBlur={(x => { changeApiKey(x.target.value); })} />
          <div className="form-footer text-right">
            <button className="btn btn-danger" onClick={ logout }>Logout</button>
          </div>
        </FormCard>
      </div>
    </div>
  </div>
}

const mapStateToProps = (state) => {
  return {
    apiKey: state.api.apiKey
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    changeApiKey: (value) => {
      dispatch(setLogin(value));
    },
    logout: () => {
      dispatch(unsetApiKey());
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SettingsView);
