import React, { Component } from 'react';
import { connect } from 'react-redux';
import TopStats from './TopStats'
import TopContentsAdvanced from './components/TopContentsAdvanced'
import TopPaths from './components/TopPaths'
import StreamType from './components/StreamType'

class ContentDashboard extends Component {
  render () {
    return (<div>
      <TopStats />
      <div className="row">
        <StreamType/>
      </div>
      <div className="row">
        <TopContentsAdvanced width={{md: 7, sm: 7, xs: 12}}/>
        <TopPaths width={{md: 5, sm: 5, xs: 12}}/>
      </div>
    </div>);
  }
}

export default connect((state) => { return {apiKey: state.api.apiKey };})(ContentDashboard);
