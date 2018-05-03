import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as stats from '../api/stats';
import Card from './Card';
import LoadingIndicator from './LoadingIndicator';
import {push} from 'react-router-redux';
import ReactPaginate from 'react-paginate';

class ImpressionsList extends Component {
  static propTypes = {
    baseQuery: React.PropTypes.object
  };

  state = {
    limit: 20,
    offset: 0,
    impressions: [],
    hasMissingImpressions: false,
  }

  componentDidMount () {
    this.loadImpressions(this.props, this.state.offset);
  }

  componentWillReceiveProps (nextProps) {
    this.loadImpressions(nextProps, this.state.offset);
  }

  handlePageClick = (pagination) => {
    const newOffset = pagination.selected * this.state.limit;
    this.loadImpressions(this.props, newOffset);
  }

  async loadImpressions({ baseQuery, primaryRange, apiKey, video, licenseKey }, offset) {
    this.setState({ loading: true });

    const query = {
      ...baseQuery,
      ...primaryRange,
      limit: this.state.limit,
      offset,
      licenseKey,
    };

    const {impressions, hasMissingImpressions} = await stats.fetchLastImpressions(apiKey, query, video && video.videoId);
    this.setState({ offset: offset, impressions: impressions, hasMissingImpressions: hasMissingImpressions, loading: false });
  }

  render () {
    const { impressions, loading, hasMissingImpressions } = this.state;
    const rows = impressions.map((impression, index) => {
      return <tr onClick={() => { this.props.openImpression(impression.impression_id); }}
                 key={index}
                 className="impression-row">
        <td>{impression.time}</td>
        <td>{impression.domain + impression.path}</td>
        <td>{impression.operatingsystem} / {impression.browser}</td>
        <td>{impression.city}, {impression.country}</td>
        <td>{impression.video_startuptime + 'ms'}</td>
        <td>{impression.buffered + 'ms'}</td>
        <td>{impression.completion_rate}</td>
      </tr>;
    });
    let missingImpressionsText = hasMissingImpressions ? "Some Impressions are missing": '';
    return (
      <div>
        <div className="row">
          <Card title={this.props.title} subtitle={missingImpressionsText} width={{md:12, sm: 12, xs: 12}} cardHeight="auto">
            <LoadingIndicator loading={loading}>
              <table className="table table-hover" style={{width:"100%"}}>
                <thead className="text-warning">
                <tr>
                  <th>Date</th>
                  <th>Page</th>
                  <th>Device</th>
                  <th>Location</th>
                  <th>Startup Delay</th>
                  <th>Buffered</th>
                  <th>Completion Rate</th>
                </tr>
                </thead>
                <tbody>
                  {rows}
                </tbody>
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
        </div>
      </div>
    );
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
    openImpression: (impressionId) => {
      dispatch(push('/impressions/' + impressionId))
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(ImpressionsList);
