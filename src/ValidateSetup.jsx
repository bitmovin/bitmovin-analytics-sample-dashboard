import React, {Component} from 'react';
import {connect} from 'react-redux';
import Card from './components/Card';
import * as actions from './actions/api';
import CircularProgress from 'material-ui/CircularProgress';

class ValidateSetup extends Component {
  componentDidMount() {
    this.props.validateSetup();
  }
  validationSuccess() {
    if (!this.props.validationSuccess) {
      return null;
    }
    return (
      <div>
        <div className="swal2-icon swal2-success animate" style={{display: 'block'}}>
          <span className="line tip animate-success-tip" /> <span className="line long animate-success-long" />
          <div className="placeholder" /> <div className="fix" />
        </div>
        <div className="alert alert-success">
          <span>
            <b> Congratulations! - </b> Bitmovin-Analytics is receiving data from your installation
          </span>
        </div>
      </div>
    );
  }
  validationProgress() {
    if (!this.props.isValidating) {
      return null;
    }
    return (
      <div style={{marginTop: '30px'}}>
        <CircularProgress size={60} thickness={5} />
        <br />
        Waiting for analytics data to trickle in...
        <br />
        Leave this page open and visit your configured Bitmovin-Analytics enabled Video page to generate data
      </div>
    );
  }
  validationError() {
    if (!this.props.validationError) {
      return null;
    }
    return (
      <div>
        <div className="swal2-icon swal2-error animate-error-icon" style={{display: 'block'}}>
          <span className="x-mark animate-x-mark">
            <span className="line left" />
            <span className="line right" />
          </span>
        </div>
        <div className="alert alert-danger">
          <span>
            <b>Error - </b> Something seems to be wrong with your API Key
          </span>
        </div>
      </div>
    );
  }
  render() {
    return (
      <div className="row">
        <Card
          width={{md: 6, xs: 12}}
          title="Validating Setup"
          className="col-md-offset-3"
          centerHeader={true}
          cardHeight="auto">
          <div>
            <center>
              Your API Key is {this.props.apiKey} <br />
              {this.validationSuccess()}
              {this.validationError()}
              {this.validationProgress()}
            </center>
          </div>
        </Card>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    apiKey: state.api.apiKey,
    isValidating: state.api.isValidating,
    validationSuccess: state.api.validationSuccess,
    validationError: state.api.validationError,
  };
};
const mapDispatchToProps = dispatch => {
  return {
    validateSetup: () => {
      dispatch(actions.validateSetup());
    },
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ValidateSetup);
