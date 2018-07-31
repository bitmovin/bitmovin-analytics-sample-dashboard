import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router';
import { showChangeRangeDialog } from './actions/ranges'
import { withRouter } from 'react-router'
import { unsetApiKey, selectAnalyticsLicenseKey } from './actions/api'

class Sidebar extends Component {
  constructor (props) {
    super(props);
    this.state = {
      performanceExpanded: true
    }
  }

  renderLink(name, icon, path, children) {
    let activeClassName = null;
    if (this.props.router.isActive(path, true)) {
      activeClassName = 'active';
    }
    return <li className={activeClassName}>
      <Link to={path}>
        <i className={`fa fa-${icon}`}></i>
        <p>{name}</p>
      </Link>
      {children}
    </li>
  }

  renderLinkSub(name, path) {
    let activeClassName = null;
    if (this.props.router.isActive(path, true)) {
      activeClassName = 'active';
    }
    return <li className={activeClassName}>
      <Link to={path}>
        {name}
      </Link>
    </li>
  }

  togglePerformanceSubmenu() {
    this.setState(prevState => {
      return {
        ...prevState,
        performanceExpanded: !prevState.performanceExpanded
      };
    })
  }

  renderPerformanceSubmenu() {
    const active = (this.props.router.isActive('/performance') || this.props.router.isActive('/performance/rebuffer'))
    const className = active ? 'active' : '';
    const collapsedClassName = this.state.performanceExpanded ? 'collapse in' : 'collapse';
    return <li className={className}>
      <a onClick={()=>this.togglePerformanceSubmenu()} data-toggle="collapse" aria-expanded={this.state.performanceExpanded}>
        <i className="fa fa-fighter-jet"></i>
        <p>Performance
          <b className="caret"></b>
        </p>
      </a>
      <div className={collapsedClassName}>
        <ul className="nav">
          {this.renderLinkSub('Buffering', '/performance/rebuffer')}
          {this.renderLinkSub('Delay', '/performance')}
        </ul>
      </div>
    </li>
  }

  renderAnalyticsLicenseKeySelect() {
    const options = this.props.licenseKeys.map(license => {
      const {licenseKey} = license;
      const {name} = license;
      let displayName = licenseKey;
      if (name) {
        displayName = name.substring(0, 26);
      }
      return <option key={license.id} value={licenseKey}>{displayName}</option>
    });

    return <select defaultValue={this.props.licenseKey} className="form-control" onChange={(event)=>this.changeAnalyticsLicenseKey(event)} style={{maxWidth: '100%', width: '200px', margin: '0 auto'}}>
      {options}
    </select>
  }

  
  changeAnalyticsLicenseKey(event) {
    this.props.selectAnalyticsLicenseKey(event.target.value);
  }

  render () {
    return (
      <div className="sidebar" data-color="blue" data-active-color="blue" style={{backgroundColor: "white"}}>

        <div className="logo">
          <img src="/theme/logo.png" width="200px" role="presentation"/>
          <div className="apiuser" style={{margin: '10px', marginTop: '15px', textAlign: 'center'}}>
            <i className="fa fa-user"></i>
            <span style={{fontSize: '1em', marginLeft: '10px', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden' }}>{this.props.userName}</span>
          </div>
          <div>
            {this.renderAnalyticsLicenseKeySelect()}
          </div>
        </div>

        <div className="sidebar-wrapper">
          <ul className="nav">
            <li>
              <a onClick={this.props.showChangeRangeDialog}>
                <i className="fa fa-clock-o"></i>
                <p>{this.props.rangeName}</p>
              </a>
            </li>
          </ul>
          <ul className="nav">
            {this.renderLink('Home', 'home', '/')}
            {this.renderPerformanceSubmenu()}
            {this.renderLink('Errors', 'exclamation-triangle', '/errors')}
            {this.renderLink('Technology', 'bolt', '/technology')}
            {this.renderLink('Quality', 'spinner', '/quality')}
            {this.renderLink('Users', 'users', '/users')}
            {this.renderLink('Content', 'file-video-o', '/content')}
            {this.renderLink('Players', 'play', '/players')}
            <li>
              <a onClick={this.props.logout}>
                <i className="fa fa-sign-out"></i>
                <p>Logout</p>
              </a>
            </li>
          </ul>
        </div>
        <div className="sidebar-background"></div>
      </div>);
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    rangeName: state.ranges.name,
    userName: state.api.userName,
    licenseKeys: state.api.analyticsLicenseKeys,
    licenseKey: state.api.analyticsLicenseKey
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    showChangeRangeDialog: () => {
      dispatch(showChangeRangeDialog())
    },
    logout: () => {
      dispatch(unsetApiKey());
    },
    selectAnalyticsLicenseKey: (licenseKey) => {
      dispatch(selectAnalyticsLicenseKey(licenseKey));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Sidebar));
