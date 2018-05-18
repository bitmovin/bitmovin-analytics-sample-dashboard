import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Card from './Card';
import LoadingIndicator from './LoadingIndicator';
import * as rebuffer from '../api/metrics/rebuffer';
import * as Metrics from '../services/MetricsCalculation';
import {push} from 'react-router-redux';
import moment from 'moment';
import ReactPaginate from 'react-paginate';
import { shortenString } from '../utils';
import Api from '../api';

class RebufferingSessionsList extends Component {
  static propTypes = {
    width: PropTypes.object
  };

  state = {
    limit: 20,
    offset: 0,
    sessions: [],
    loading: false,
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

  async loadRebufferingSessions(props, offset) {
    this.setState({ loading: true });

    const baseQuery = {
      ...props.primaryRange,
      licenseKey: props.licenseKey
    };
    const sessions = await rebuffer
      .rebufferingSessions(props.api, baseQuery, this.state.limit, offset);

    this.setState({ offset, sessions, loading: false });
  }

  render () {
    const getInfo = (rows) => {
      return {
        os: rows[0].operatingsystem,
        browser: rows[0].browser,
        ip: rows[0].ip_address,
        time: moment(rows[0].time).local().format('YYYY-MM-DD HH:mm:ss'),
        country: rows[0].country,
        city: rows[0].city,
        page: rows[0].path,
        startuptime: (rows[1] || rows[0]).startuptime,
        completionRate: Metrics.calculateCompletionRate(rows)
      }
    };

    const sessions = this.state.sessions.map((session, index) => {
      const info = getInfo(session[3]);
      const playedVideo = shortenString(session[1], 50, 22);
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
    return (
      <Card title="Sessions rebuffering" width={this.props.width || { md: 4, sm: 4, xs: 12 }} cardHeight="auto">
        <LoadingIndicator loading={this.state.loading}>
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
          <ReactPaginate
            previousLabel="previous"
            nextLabel="next"
            pageCount={300}
            marginPagesDisplayed={0}
            pageRangeDisplayed={0}
            onPageChange={::this.handlePageClick}
            containerClassName="pagination"
            subContainerClassName="pages pagination"
            activeClassName="active"
          />
       </LoadingIndicator>
      </Card>
    )  
  }
}

const mapStateToProps = (state) => {
  const { primaryRange } = state.ranges;
  return {
    api: new Api(state),
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

export default connect(mapStateToProps, mapDispatchToProps)(RebufferingSessionsList);
