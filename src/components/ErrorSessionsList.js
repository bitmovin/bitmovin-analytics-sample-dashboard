import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import Card from './Card';
import LoadingIndicator from './LoadingIndicator';
import * as errors from '../api/metrics/errors';
import {push} from 'react-router-redux';
import moment from 'moment';
import ReactPaginate from 'react-paginate';
import Api from '../api';

class ErrorSessionsList extends Component {
  static propTypes = {
    width: PropTypes.object,
  };

  state = {
    limit: 20,
    offset: 0,
    sessions: [],
    loading: false,
  };

  componentDidMount() {
    this.loadErrorSessions(this.props, this.state.offset);
  }

  componentWillReceiveProps(nextProps) {
    this.loadErrorSessions(nextProps, this.state.offset);
  }

  handlePageClick = pagination => {
    const newOffset = pagination.selected * this.state.limit;
    this.loadErrorSessions(this.props, newOffset);
  };

  async loadErrorSessions(props, offset) {
    this.setState({loading: true});

    const baseQuery = {
      ...props.primaryRange,
      licenseKey: props.licenseKey,
    };

    const sessions = await errors.errorSessions(props.api, baseQuery, this.state.limit, offset);

    this.setState({offset: offset, sessions, loading: false});
  }

  render() {
    const getInfo = rows => {
      return {
        os: rows[0].operatingsystem,
        browser: rows[0].browser,
        ip: rows[0].ip_address,
        time: moment(moment(rows[0].time))
          .local()
          .format('YYYY-MM-DD HH:mm:ss'),
        country: rows[0].country,
        city: rows[0].city,
        page: rows[0].path,
      };
    };

    const sessions = this.state.sessions.map((session, index) => {
      const info = getInfo(session[4]);
      return (
        <tr onClick={() => this.props.navigateToSessionDetail(session[0])} key={index} className="impression-row">
          <td>{info.time}</td>
          <td>{info.page}</td>
          <td>{info.city + ', ' + info.country}</td>
          <td>{info.os}</td>
          <td>{info.browser}</td>
          <td>{session[2]}</td>
        </tr>
      );
    });

    return (
      <Card title="Error Sessions" width={this.props.width || {md: 4, sm: 4, xs: 12}} cardHeight="auto">
        <LoadingIndicator loading={this.state.loading}>
          <table className="table table-hover">
            <thead>
              <tr>
                <th className="col-md-1">Time</th>
                <th className="col-md-2">Page</th>
                <th className="col-md-1">Location</th>
                <th className="col-md-1">Operating System</th>
                <th className="col-md-1">Browser</th>
                <th className="col-md-1">Error Code</th>
              </tr>
            </thead>
            <tbody>{sessions}</tbody>
          </table>
          <ReactPaginate
            previousLabel="previous"
            nextLabel="next"
            pageCount={300}
            marginPagesDisplayed={0}
            pageRangeDisplayed={0}
            onPageChange={this.handlePageClick}
            containerClassName="pagination"
            subContainerClassName="pages pagination"
            activeClassName="active"
          />
        </LoadingIndicator>
      </Card>
    );
  }
}

const mapStateToProps = state => {
  const {primaryRange} = state.ranges;
  return {
    api: new Api(state),
    primaryRange,
    licenseKey: state.api.analyticsLicenseKey,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    navigateToSessionDetail: impressionId => {
      dispatch(push(`/impressions/${impressionId}`));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ErrorSessionsList);
