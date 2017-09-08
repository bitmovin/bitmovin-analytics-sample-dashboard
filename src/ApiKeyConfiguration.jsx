import React, { Component } from 'react'
import { connect } from 'react-redux'
import Card from './components/Card'
import * as actions from './actions/api'
import LinearProgress from 'material-ui/LinearProgress';

class ApiKeyConfiguration extends Component {
  submitClicked () {
    const username = this.refs.username.value;
    const password = this.refs.password.value;
    this.props.login(username, password);
  }
  render () {
    if (this.props.isSetup) {
      return this.props.children;
    }
    const handleKeyPress = (evt) => {
      if (evt.key === 'Enter') {
        this.submitClicked();
      }
    }
    const footer = <button onClick={::this.submitClicked} className="btn btn-simple btn-wd btn-lg" role="button">Continue</button>;
    const invalidText = !this.props.invalid ? null : <p className="text-danger">Your Credentials seem to be invalid. Please try again</p>;
    const progress = !this.props.loading ? null : <LinearProgress mode="indeterminate" />;
    return (
    <div className="container">
      <div className="row">
        <Card width={{md: 4, sm: 6, xs: 12}} title="Please enter your credentials" className="col-md-offset-4 col-sm-offset-3 card-login" login={true} cardHeight="auto" footer={footer} centerHeader={true} style={{ marginTop: '50px' }}>
          <div style={{ marginTop: '30px' }}>
            <div className="input-group">
              <span className="input-group-addon">
                <i className="fa fa-user" aria-hidden="true"></i>
              </span>
              <div className={ "form-group label-floating" + (this.props.invalid ? " has-error" : "") }>
                <label className="control-label">Username</label>
                <input ref="username" type="text" className="form-control" placeholder="Username" onKeyPress={handleKeyPress} />
              </div>
            </div>
            <div className="input-group">
              <span className="input-group-addon">
                <i className="fa fa-key" aria-hidden="true"></i>
              </span>
              <div className={ "form-group label-floating" + (this.props.invalid ? " has-error" : "") }>
                <label className="control-label">Password</label>
                <input ref="password" type="password" className="form-control" placeholder="Password" onKeyPress={handleKeyPress} />
              </div>
              {invalidText}
              {progress}
            </div>
          </div>
        </Card>
      </div>
    </div>);
  }
}

const mapStateToProps = (state) => {
  return {
    isSetup: state.api.isSetup,
    loading: state.api.processingLogin,
    invalid: state.api.loginFailed
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: (username, password) => {
      dispatch(actions.login(username, password));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(ApiKeyConfiguration)
