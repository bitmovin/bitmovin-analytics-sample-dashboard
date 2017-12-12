import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import * as impressions from '../api/metrics/impressions';
import Card from './Card';
import LoadingIndicator from './LoadingIndicator';
import VideoLink from './VideoLink';
import * as rebuffer from '../api/metrics/rebuffer';
import * as util from '../api/util';
import * as errors from '../api/metrics/errors';
import * as startupdelay from '../api/metrics/startupdelay';
import ReactPaginate from 'react-paginate';

class TopContentsAdvanced extends PureComponent {
  state = {
    topContents: [],
    limit: 6,
    offset: 0,
    page: 0,
    orderByOrder: 'DESC',
    loading: false,
  };

	componentDidMount () {
		this.loadData(this.props);
	}

	componentWillReceiveProps (nextProps) {
		this.loadData(nextProps);
	}

  async loadData (props, limit = this.state.limit, offset = this.state.offset, orderByOrder = this.state.orderByOrder) {
    this.setState({ loading: true });

    const query = impressions.groupedQuery(props.apiKey)
      .licenseKey(props.licenseKey)
      .between(props.primaryRange.start, props.primaryRange.end)
      .groupBy('VIDEO_ID')
      .orderBy('FUNCTION', orderByOrder)
      .orderBy('VIDEO_ID', 'DESC')
      .limit(limit)
      .offset(offset)

    const { rows } = await query.query();

    const videoImpressionsPromises = rows.map(videoImpression => {
      const filters = [];
      if (typeof videoImpression[0] === 'string') {
        filters.push({'name': 'VIDEO_ID', operator: 'EQ', value: videoImpression[0]});
      }

      const rebufferPercentageQuery    = {...props.primaryRange, interval: null, filters};
      const videoStartupTimeByCountray = {...props.primaryRange, interval: null, filters};
      const errorsByVideo              = {...props.primaryRange, filters};

      return Promise.all([
        Promise.resolve(videoImpression),
        rebuffer.rebufferPercentageOverTime(props.apiKey, rebufferPercentageQuery),
        startupdelay.fetchStartupDelay(props.apiKey, videoStartupTimeByCountray),
        errors.errorsByVideo(props.apiKey, errorsByVideo)
      ]);
    });

    const videos = await Promise.all(videoImpressionsPromises);
    const videosForState = videos.map(video => {
      console.log(video[1]);
      const rebufferPercentage = video[1].length > 0 ? util.roundTo(video[1][0][2] * 100, 2) : 0;
      const startuptime = video[2] ? util.roundTo(video[2], 0) : 0;
      const errors = video[3].length > 0 ? video[3][0][0] : 0;

      return {
        name       : video[0][0],
        impressions: video[0][1],
        rebufferPercentage,
        startuptime,
        errors
      };
    });

    this.setState({
      topContents: videosForState,
      limit,
      offset,
      orderByOrder,
      page: offset / limit,
      loading: false,
    });
  }

  toggleSorting = () => {
    const orderByOrder = this.state.orderByOrder === 'DESC' ? 'ASC' : 'DESC';
    this.loadData(this.props, undefined, 0, orderByOrder);
  }

  handlePageClick = (pagination) => {
    const offset = this.state.limit * pagination.selected;
    this.loadData(this.props, this.state.limit, offset);
  }

  renderTable () {
    const rows = this.state.topContents.map((video, index) => {

      return <tr key={index}>
        <td>
          <VideoLink videoId={video.name} />
        </td>
        <td>
          {video.impressions}
        </td>
        <td>
          {video.rebufferPercentage + ' %'}
        </td>
        <td>
          {video.startuptime + ' ms'}
        </td>
        <td>
          {video.errors}
        </td>
      </tr>;
    });
    let tbody = null;
    if (rows.length > 0) {
      tbody = <tbody>{rows}</tbody>;
    }
    return <div>
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Video id</th>
            <th>Impressions <i className="fa fa-sort table-metric-sort" aria-hidden="true" onClick={this.toggleSorting}></i></th>
            <th>Rebufferpercentage</th>
            <th>Startup delay</th>
            <th>Errors</th>
          </tr>
        </thead>
        {tbody}
      </table>
      <ReactPaginate
        ref="table_pagination"
        previousLabel="previous"
        nextLabel="next"
        pageCount={300}
        forcePage={this.state.page}
        marginPagesDisplayed={0}
        pageRangeDisplayed={0}
        onPageChange={this.handlePageClick}
        containerClassName="pagination"
        subContainerClassName="pages pagination"
        activeClassName="active"
      />
    </div>;
  }

  render () {
    return (
      <Card title="Top Contents" width={ this.props.width || {md:12, sm: 12, xs: 12}} cardHeight={"480px"}>
        <LoadingIndicator loading={this.state.loading}>
          {this.renderTable()}
        </LoadingIndicator>
      </Card>);
  }
}

const mapStateToProps = (state) => {
	return {
		apiKey: state.api.apiKey,
		interval: state.ranges.interval,
		rangeName: state.ranges.name,
		primaryRange: state.ranges.primaryRange,
    licenseKey: state.api.analyticsLicenseKey
	}
};

export default connect(mapStateToProps)(TopContentsAdvanced);
