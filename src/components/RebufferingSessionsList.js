import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Card from './Card';
import * as rebuffer from '../api/metrics/rebuffer';
import {push} from 'react-router-redux';
import moment from 'moment';
import ReactPaginate from 'react-paginate';
import * as util from '../api/util';

class RebufferingSessions extends Component {
  static propTypes = {
    width: PropTypes.object
  };

  constructor (props) {
    super(props);
    this.state = {
      limit: 20,
      offset: 0,
      sessions: []
    }
  }

  componentDidMount () {
    this.loadRebufferingSessions(this.props, this.state.offset);
  }

  componentWillReceiveProps (nextProps) {
    this.loadRebufferingSessions(nextProps, this.state.offset);
  }

  handlePageClick(pagination) {
    const newOffset = pagination.selected * this.state.limit;
    this.loadRebufferingSessions(this.props, newOffset);
  }

  loadRebufferingSessions(props, offset) {
    const baseQuery = {
      ...props.primaryRange,
      licenseKey: props.licenseKey
    };
    rebuffer.rebufferingSessions(props.apiKey, baseQuery, this.state.limit, offset).then(data => {
      this.setState(prevState => {
        return {
          ...prevState,
          offset: offset,
          sessions: data
        };
      })
    });
  }

  render () {
    const getInfo = (rows) => {
      let playedSum = 0;
      for (let i = 0; i < rows.length; i++) {
        playedSum += rows[i].played;
      }

      let completionRate;
      if (rows[0].video_duration === null) {
        completionRate = 'Livestream';
      } else if (rows[0].video_duration === 0) {
        completionRate = 'No Data';
      } else {
        completionRate = util.roundTo(playedSum / (rows[0].video_duration*100), 2) + '%';
      }

      return {
        os: rows[0].operatingsystem,
        browser: rows[0].browser,
        ip: rows[0].ip_address,
        time: moment(moment(rows[0].time)).local().format('YYYY-MM-DD HH:mm:ss'),
        country: rows[0].country,
        city: rows[0].city,
        page: rows[0].path,
        startuptime: (rows[1] || rows[0]).startuptime,
        completionRate
      }
    };

    const shortenString = (string) => {
      let shortenedString = string;
      if (typeof shortenedString !== 'string') {
        return '<UNKNOWN>';
      }
      if (string.length > 50) {
        shortenedString = string.substring(0, 22);
        shortenedString += '...';
        shortenedString += string.substring(string.length - 22, string.length);
      }

      return shortenedString;
    };

    const sessions = this.state.sessions.map((session, index) => {
      const info = getInfo(session[3]);
      const playedVideo = shortenString(session[1]);
      return <tr onClick={() => this.props.navigateToSessionDetail(session[0])}
                 key={index}
                 className="impression-row">
          <td>{info.time}</td>
          <td>{info.page}</td>
          <td>{playedVideo}</td>
          <td>{info.city + ', ' + info.country}</td>
          <td>{info.os}</td>
          <td>{info.browser}</td>
          <td>{info.startuptime + 'ms'}</td>
          <td>{session[2] + 'ms'}</td>
          <td>{info.completionRate}</td>
        </tr>
    });
    return <Card title="Sessions rebuffering" width={this.props.width || { md: 4, sm: 4, xs: 12 }} cardHeight="auto">
      <div>
        <table className="table table-hover">
          <thead>
            <tr>
              <th className="col-md-2">Time</th>
              <th className="col-md-2">Page</th>
              <th className="col-md-2">Played Video</th>
              <th className="col-md-1">Location</th>
              <th className="col-md-1">Operating System</th>
              <th className="col-md-1">Browser</th>
              <th className="col-md-1">Startup Delay</th>
              <th className="col-md-1">Time Buffered</th>
              <th className="col-md-1">Completion Rate</th>
            </tr>
          </thead>
          <tbody>
            {sessions}
          </tbody>
        </table>
        <ReactPaginate previousLabel={"previous"}
                       nextLabel={"next"}
                       pageCount={300}
                       marginPagesDisplayed={0}
                       pageRangeDisplayed={0}
                       onPageChange={::this.handlePageClick}
                       containerClassName={"pagination"}
                       subContainerClassName={"pages pagination"}
                       activeClassName={"active"} />
     </div>
    </Card>
  }
}

const mapStateToProps = (state) => {
  const { primaryRange } = state.ranges;
  return {
    apiKey: state.api.apiKey,
    primaryRange,
    licenseKey: state.api.analyticsLicenseKey
  }
};

const mapDispatchToProps = (dispatch) => {
  return {
    navigateToSessionDetail: (impressionId) => {
      dispatch(push(`/impressions/${impressionId}`));
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(RebufferingSessions);
