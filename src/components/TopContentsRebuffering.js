import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import * as rebuffer from '../api/metrics/rebuffer';
import Card from './Card';
import VideoLink from './VideoLink';
import LoadingIndicator from './LoadingIndicator';
import * as util from '../api/util';
import ReactPaginate from 'react-paginate';

class TopContentsRebuffering extends PureComponent {
  state = {
    topContents: [],
    limit: 6,
    offset: 0,
    page: 0,
    orderByOrder: 'DESC'
  };

	componentDidMount () {
		this.loadData(this.props);
	}

	componentWillReceiveProps (nextProps) {
		this.loadData(nextProps);
	}

  async loadData ({ primaryRange, licenseKey, apiKey }) {
    this.setState({ loading: true });

    const rebufferQuery = {
      ...primaryRange,
      interval: null,
      groupBy: ['VIDEO_ID'],
      orderBy: [{name: 'FUNCTION', order: 'DESC'}],
      licenseKey: licenseKey
    };

    const result = await rebuffer.rebufferPercentageOverTime(apiKey, rebufferQuery);

    this.setState({ topContents: result, loading: false });
  }

  toggleSorting() {
    const orderByOrder = this.state.orderByOrder === 'DESC' ? 'ASC' : 'DESC';
    this.setState({ orderByOrder, offset: 0, page: 0 });
  }

  handlePageClick(pagination) {
    const offset = this.state.limit * pagination.selected;
    this.setState({ offset, page: pagination.selected });
  }

  renderTable () {
    const { loading, orderByOrder, topContents, offset, limit, page } = this.state;
    let sorting = (a, b) =>  b[3] - a[3];
    if (orderByOrder === 'ASC') {
      sorting = (a, b) => a[3] - b[3];
    }

    const sorted = topContents.sort(sorting);

    const top = sorted.slice(offset, offset + limit);

    const rows = top.map((video, index) => {
      return <tr key={index}><td><VideoLink videoId={video[0]} /></td><td>{util.roundTo(video[3]*100, 2) + '%'}</td></tr>;
    });

    let tbody = null;
    if (rows.length > 0) {
      tbody = <tbody>{rows}</tbody>;
    }

    return (
      <LoadingIndicator loading={loading}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Video id</th>
              <th>Rebuffer Percentage <i className="fa fa-sort table-metric-sort" aria-hidden="true" onClick={::this.toggleSorting}></i></th>
            </tr>
          </thead>
          {tbody}
        </table>
        <ReactPaginate
          ref="table_pagination"
          previousLabel="previous"
          nextLabel="next"
          pageCount={300}
          forcePage={page}
          marginPagesDisplayed={0}
          pageRangeDisplayed={0}
          onPageChange={::this.handlePageClick}
          containerClassName="pagination"
          subContainerClassName="pages pagination"
          activeClassName="active"
        />
      </LoadingIndicator>
    );
  }

  render () {
    return (
      <Card title="Top Contents" width={ this.props.width || {md:4, sm: 4, xs: 12}} cardHeight={"480px"}>
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

export default connect(mapStateToProps)(TopContentsRebuffering);
