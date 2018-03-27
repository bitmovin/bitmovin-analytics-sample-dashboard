import React, {Component} from 'react';
import Title from 'react-title-component';
import Sidebar from './Sidebar';
import TimeFrameDialog from './TimeFrameDialog';
import GitHubForkRibbon from 'react-github-fork-ribbon'

class App extends Component {
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
        <TimeFrameDialog />
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

export default App;
