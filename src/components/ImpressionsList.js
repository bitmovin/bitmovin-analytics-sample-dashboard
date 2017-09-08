import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as stats from '../api/stats';
import Card from './Card';
import {push} from 'react-router-redux';
import ReactPaginate from 'react-paginate';

class VideoInspection extends Component {
  static propTypes = {
    baseQuery: React.PropTypes.object
  };

  constructor(props) {
    super(props);
    this.syncTimeout = null;

    this.state = {
      limit: 20,
      offset: 0,
      impressions: []
    };
  }

  componentDidMount () {
    this.loadImpressions(this.props, this.state.offset);
  }

  componentWillReceiveProps (nextProps) {
    this.loadImpressions(nextProps, this.state.offset);
  }

  handlePageClick(pagination) {
    const newOffset = pagination.selected * this.state.limit;
    this.loadImpressions(this.props, newOffset);
  }

  loadImpressions(props, offset) {
    const query = {
      ...this.props.baseQuery,
      ...props.primaryRange,
      limit: this.state.limit,
      offset,
      licenseKey: props.licenseKey
    };
    stats.fetchLastImpressions(props.apiKey, query, this.props.video).then(impressions => {
      this.setState(prevState => {
        return {
          ...prevState,
          offset: offset,
          impressions: impressions
        }
      })
    });
  }

  render () {
    const rows = this.state.impressions.map((impression, index) => {
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
    return (
      <div>
        <div className="row">
          <Card title={this.props.title} width={{md:12, sm: 12, xs: 12}} cardHeight="auto">
            <div>
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

export default connect(mapStateToProps, mapDispatchToProps)(VideoInspection);
