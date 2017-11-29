import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import * as errors from '../api/metrics/errors';
import Card from './Card';
import VideoLink from './VideoLink';
import ReactPaginate from 'react-paginate';

class TopContentsErrors extends PureComponent {
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
    const errorsQuery = {
      ...props.primaryRange,
      groupBy: ['VIDEO_ID'],
      orderBy: [{name: 'FUNCTION', order: orderByOrder}, {name: 'VIDEO_ID', order: 'DESC'}],
      limit,
      offset,
      licenseKey: props.licenseKey
    };

    errors.errorsByVideo(props.apiKey, errorsQuery).then((data) => {
      this.setState(prevState => {
        return {
          ...prevState,
          topContents: data,
          limit,
          offset,
          orderByOrder,
          page: offset / limit
        };
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
    const rows = this.state.topContents.map((video, index) =>
      <tr key={index}>
        <td>
          <VideoLink videoId={video[0]} />
        </td>
        <td>{video[1]}</td>
      </tr>
    );
    let tbody = null;
    if (rows.length > 0) {
      tbody = <tbody>{rows}</tbody>;
    }
    return <div>
    <table className="table table-hover">
        <thead>
          <tr>
            <th>Video id</th>
            <th>Errors <i className="fa fa-sort table-metric-sort" aria-hidden="true" onClick={::this.toggleSorting}></i></th>
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

export default connect(mapStateToProps)(TopContentsErrors);
