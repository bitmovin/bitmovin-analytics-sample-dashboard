import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import moment from 'moment';
import Card from './components/Card';
import TopStatsPerImpression from './TopStatsPerImpression';
import urljoin from 'url-join';
import AdaptationBehaviorGraph from './components/charts/quality/AdaptationBehaviorGraph';
import PointLocationMap from './components/charts/maps/PointLocationMap';
import * as actions from './actions/impressionDetailActions';
import Api from './api';

class ImpressionDetail extends PureComponent {
  componentDidMount() {
    this.props.loadImpression(this.props.api, this.props.impressionId);
  }

  impressionList() {
    const list = this.props.impressions.map((row, index) => {
      return (
        <tr key={index}>
          <td>{index}</td>
          <td>
            {moment(moment(row.time))
              .local()
              .format('YYYY-MM-DD HH:mm:ss')}
          </td>
          <td>{row.state}</td>
          <td>{row.player_startuptime}</td>
          <td>{row.video_startuptime}</td>
          <td>{row.duration}</td>
          <td>{row.buffered}</td>
          <td>{row.videotime_start}</td>
          <td>{row.videotime_end}</td>
          <td>{row.played}</td>
          <td>{row.seeked}</td>
          <td>{row.video_bitrate}</td>
        </tr>
      );
    });

    return (
      <div className="row">
        <Card title="Impression Log" width={{md: 12, xs: 12, sm: 12}} cardHeight="auto">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                <th>Time</th>
                <th>State</th>
                <th>Player Startuptime</th>
                <th>Video Startuptime</th>
                <th>Duration</th>
                <th>Buffered</th>
                <th>VideoTime Start</th>
                <th>VideoTime End</th>
                <th>Played</th>
                <th>Seeked</th>
                <th>Video Bitrate</th>
              </tr>
            </thead>
            <tbody>{list}</tbody>
          </table>
        </Card>
      </div>
    );
  }

  impressionBackgroundLoadBanner() {
    if (!this.props.loadedInBackground) {
      return null;
    }
    return (
      <div className="alert alert-primary">
        <span>
          <b>NOTE</b> This impression was loaded in a background tab so it's startuptime is not representative of the
          actual player startuptime. Delay is limited to time to first frame
        </span>
      </div>
    );
  }

  renderUserLocationMap(startupImpression, height) {
    let city = startupImpression.city;
    if (city === '?') {
      if (!this.props.ipinfo.loaded) {
        return <p>Loading...</p>;
      }

      city = this.props.ipinfo.city;
      if (!city) {
        return <p>Location Information not available.</p>;
      }
    }

    return <PointLocationMap point={city} name={city} height={height} />;
  }

  render() {
    const startupImpression = this.props.impressions.find(imp => {
      return imp.player_startuptime > 0;
    });

    const getInfoRow = (name, attribute) => {
      if (this.props.isLoaded === true) {
        let value = '';
        if (typeof attribute === 'function') {
          value = attribute(startupImpression);
        } else {
          value = startupImpression[attribute];
        }
        return (
          <tr>
            <td>{name}</td>
            <td>{value}</td>
          </tr>
        );
      } else {
        return (
          <tr>
            <td>{name}</td>
            <td>Loading...</td>
          </tr>
        );
      }
    };

    if (this.props.isLoaded !== true) {
      return (
        <div>
          <h1>Loading...</h1>
        </div>
      );
    } else if (!startupImpression) {
      return (
        <div>
          <div className="row">{this.impressionList()}</div>
        </div>
      );
    }

    const cardHeight = 700;
    return (
      <div>
        <TopStatsPerImpression />
        {this.impressionBackgroundLoadBanner}
        <div className="row">
          <Card title="User Information" width={{lg: 6, md: 12, sm: 12, xs: 12}} cardHeight={cardHeight + 'px'}>
            <table className="table">
              <tbody>
                <tr>
                  <td>Impression Type</td>
                  <td>{this.props.loadedInBackground ? 'Loaded in Background' : 'Loaded in Foreground'}</td>
                </tr>
                <tr>
                  <td>Live</td>
                  <td>{this.props.isLive ? 'Yes' : 'No'}</td>
                </tr>
                {getInfoRow('Operating System', imp => {
                  let version = '';
                  if (imp.operatingsystem_version_major !== null) {
                    version = `${imp.operatingsystem_version_major}.${imp.operatingsystem_version_minor}`;
                  }
                  return `${imp.operatingsystem} ${version}`;
                })}
                {getInfoRow('Browser', imp => {
                  return `${imp.browser} ${imp.browser_version_major}.${imp.browser_version_minor}`;
                })}
                {getInfoRow('Device Type', 'device_type')}
                {getInfoRow('IP Address', 'ip_address')}
                <tr>
                  <td>ISP</td>
                  <td>{this.props.ipinfo.loaded ? this.props.ipinfo.isp : 'Loading ...'}</td>
                </tr>
                <tr>
                  <td>AS</td>
                  <td>{this.props.ipinfo.loaded ? this.props.ipinfo.as : 'Loading ...'}</td>
                </tr>
                {getInfoRow('Player Technology', 'player_tech')}
                {getInfoRow('Stream Format', 'stream_format')}
                {getInfoRow('Screen Size', imp => {
                  return `${imp.screen_width}x${imp.screen_height}`;
                })}
                {getInfoRow('Language', 'language')}
                {getInfoRow('Visited Page', imp => {
                  return (
                    <a href={urljoin('http://', imp.domain, imp.path)} target="_blank">
                      {urljoin(imp.domain, imp.path)}
                    </a>
                  );
                })}
                {getInfoRow('Custom User Id', 'custom_user_id')}
              </tbody>
            </table>
          </Card>
          <Card title="User Location" width={{lg: 6, md: 12, sm: 12, xs: 12}} cardHeight={cardHeight + 'px'}>
            {this.renderUserLocationMap(startupImpression, cardHeight - 95)}
          </Card>
        </div>
        <div className="row">
          <Card title="Adaptation Behavior" width={{md: 12, xs: 12, sm: 12}}>
            <AdaptationBehaviorGraph impressions={this.props.impressions} />
          </Card>
        </div>
        {this.impressionList()}
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    api: new Api(state),
    impressionId: ownProps.params.impressionId,
    impressions: state.impressionDetail.impressionData,
    isLoaded: state.impressionDetail.isLoaded,
    videoId: state.impressionDetail.videoId,
    ipinfo: state.impressionDetail.ipinfo,
    loadedInBackground: state.impressionDetail.loadedInBackground,
    isLive: state.impressionDetail.isLive,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    loadImpression: (api, impressionId) => {
      dispatch(actions.loadImpression(api, impressionId));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ImpressionDetail);
