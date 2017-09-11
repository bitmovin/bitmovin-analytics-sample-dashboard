import React, {Component} from 'react';
import {connect} from 'react-redux';
import Title from 'react-title-component';
import Sidebar from './Sidebar';
import TimeFrameDialog from './TimeFrameDialog';
import GitHubForkRibbon from 'react-github-fork-ribbon'

class App extends Component {
  static propTypes = {
  }
  navigateTo(path) {
    this.props.navigate(path);
  }
  renderTimeframe() {
    if (this.props.showChangeRangeDialog !== true) {
      return null
    }
		return <TimeFrameDialog />
  }
  toggleNavbar() {

    if (document.getElementsByTagName('html')[0].className === 'nav-open') {
      document.getElementsByTagName('html')[0].className = '';
    } else {
      document.getElementsByTagName('html')[0].className = 'nav-open';
    }
  }
  render() {
    return (
			<div className="wrapper">
        {this.renderTimeframe()}

        <Sidebar />

        <div className="main-panel perfect-scrollbar-off">
          <nav className="navbar navbar-transparent navbar-absolute">
            <div className="container-fluid">
              <div className="navbar-header">
                <button type="button" className="navbar-toggle" onClick={this.toggleNavbar}>
                  <span className="sr-only">Toggle navigation</span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                  <span className="icon-bar"></span>
                </button>
              </div>
            </div>
          </nav>
          <div className="content">
            <GitHubForkRibbon href="https://github.com/bitmovin/bitmovin-analytics-sample-dashboard" target="_blank" position="right" color="black">View on GitHub</GitHubForkRibbon>
            <div className="container-fluid">
              {this.props.children}
            </div>
          </div>
        </div>

        <Title render="Bitmovin Analytics" />
			</div>
    );
  }
}

const mapStateToProps = (state) => {
	return {
    showChangeRangeDialog: state.ranges.dialogVisible
	}
};
export default connect(mapStateToProps)(App);
