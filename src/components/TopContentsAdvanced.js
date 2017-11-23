import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import * as impressions from '../api/metrics/impressions';
import Card from './Card';
import VideoLink from './VideoLink';
import * as rebuffer from '../api/metrics/rebuffer';
import * as util from '../api/util';
import * as errors from '../api/metrics/errors';
import * as startupdelay from '../api/metrics/startupdelay';
import ReactPaginate from 'react-paginate';

class TopContents extends PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      topContents: [],
      limit: 6,
      offset: 0,
      page: 0,
      orderByOrder: 'DESC'
    }
  }

	componentDidMount () {
		this.loadData(this.props);
	}

	componentWillReceiveProps (nextProps) {
		this.loadData(nextProps);
	}

  loadData (props, limit = this.state.limit, offset = this.state.offset, orderByOrder = this.state.orderByOrder) {
    const limitOffsetOrderBy = {
      limit,
      offset,
      orderBy: [{name: 'FUNCTION', order: orderByOrder}, {name: 'VIDEO_ID', order: 'DESC'}],
      licenseKey: props.licenseKey
    };

    const impressionQuery = {
      ...props.primaryRange,
      groupBy: ['VIDEO_ID'],
      ...limitOffsetOrderBy
    };

    impressions.fetchGrouped(props.apiKey, 'Top Contents', impressionQuery).then(videoImpressions => {

      const videoImpressionsPromises = videoImpressions.data.map(videoImpression => {
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

      Promise.all(videoImpressionsPromises).then(videos => {
        const videosForState = videos.map(video => {
          let rebufferPercentage = 0;
          if (video[1].length > 0) {
            rebufferPercentage = util.roundTo(video[1][0][2] * 100, 2);
          }

          let startuptime = 0;
          if (video[2]) {
            startuptime = util.roundTo(video[2], 0);
          }

          let errors = 0;
          if (video[3].length > 0) {
            errors = video[3][0][0];
          }

          return {
            name       : video[0][0],
            impressions: video[0][1],
            rebufferPercentage,
            startuptime,
            errors
          };
        });

        this.setState(prevState => {
          return {
            ...prevState,
            topContents: videosForState,
            limit,
            offset,
            orderByOrder,
            page: offset / limit
          }
        });
      });
    });
  }

  toggleSorting() {
    const orderByOrder = this.state.orderByOrder === 'DESC' ? 'ASC' : 'DESC';
    this.loadData(this.props, undefined, 0, orderByOrder);
  }

  handlePageClick(pagination) {
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
            <th>Impressions <i className="fa fa-sort table-metric-sort" aria-hidden="true" onClick={::this.toggleSorting}></i></th>
            <th>Rebufferpercentage</th>
            <th>Startup delay</th>
            <th>Errors</th>
          </tr>
        </thead>
        {tbody}
      </table>
      <ReactPaginate
        ref="table_pagination"
        previousLabel={"previous"}
        nextLabel={"next"}
        pageCount={300}
        forcePage={this.state.page}
        marginPagesDisplayed={0}
        pageRangeDisplayed={0}
        onPageChange={::this.handlePageClick}
        containerClassName={"pagination"}
        subContainerClassName={"pages pagination"}
        activeClassName={"active"}/>
    </div>;
  }

  render () {
    return (
      <Card title="Top Contents" width={ this.props.width || {md:12, sm: 12, xs: 12}} cardHeight={"480px"}>
        {this.renderTable()}
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

export default connect(mapStateToProps)(TopContents);
