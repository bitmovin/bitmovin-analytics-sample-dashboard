import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import * as startupdelay from '../api/metrics/startupdelay';
import Card from './Card';
import VideoLink from './VideoLink';
import LoadingIndicator from './LoadingIndicator';
import * as util from '../api/util';
import ReactPaginate from 'react-paginate';
import Api from '../api';

class TopContentsDelay extends PureComponent {
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

    const startupDelayQuery = {
      ...props.primaryRange,
      interval: null,
      groupBy: ['VIDEO_ID'],
      orderBy: [{name: 'FUNCTION', order: orderByOrder}, {name: 'VIDEO_ID', order: 'DESC'}],
      limit,
      offset,
      licenseKey: props.licenseKey
    };

    const data = await startupdelay.videoStartupTimeByCountry(props.api, startupDelayQuery)

    this.setState({
      topContents: data,
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
    const rows = this.state.topContents.map((video, index) =>
      <tr key={index}><td><VideoLink videoId={video[0]} /></td><td>{util.roundTo(video[1],0) + ' ms'}</td></tr>);

    let tbody = null;
    if (rows.length > 0) {
      tbody = <tbody>{rows}</tbody>;
    }

    return (
      <LoadingIndicator loading={this.state.loading}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Video id</th>
              <th>Median Startup Delay <i className="fa fa-sort table-metric-sort" aria-hidden="true" onClick={this.toggleSorting}></i></th>
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
          containerClassName={"pagination"}
          subContainerClassName={"pages pagination"}
          activeClassName={"active"}
        />
      </LoadingIndicator>
    );
  }

  render () {
    return (
      <Card title="Top Contents" width={ this.props.width || {md:4, sm: 4, xs: 12}} cardHeight={"480px"}>
        {this.renderTable()}
      </Card>
    );
  }
}

const mapStateToProps = (state) => {
	return {
		api: new Api(state),
		interval: state.ranges.interval,
		rangeName: state.ranges.name,
		primaryRange: state.ranges.primaryRange,
    licenseKey: state.api.analyticsLicenseKey
	}
};

export default connect(mapStateToProps)(TopContentsDelay);
