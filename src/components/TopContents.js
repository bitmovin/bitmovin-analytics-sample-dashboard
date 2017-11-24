import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import * as impressions from '../api/metrics/impressions';
import VideoLink from './VideoLink';
import Card from './Card';
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

  async loadData ({ apiKey, licenseKey, primaryRange }, limit = this.state.limit, offset = this.state.offset, orderByOrder = this.state.orderByOrder) {
    const query = impressions.groupedQuery(apiKey)
      .licenseKey(licenseKey)
      .between(primaryRange.start, primaryRange.end)
      .groupBy('VIDEO_ID')
      .orderBy('FUNCTION', orderByOrder)
      .orderBy('VIDEO_ID', 'DESC')
      .limit(limit)
      .offset(offset);

    const { rows } = await query.query();

    this.setState({
      limit,
      offset,
      orderByOrder,
      page: offset / limit,
      topContents: rows
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
      return <tr key={index}><td><VideoLink videoId={video[0]} maxLength={35} /></td><td>{video[1]}</td></tr>;
    });

    let tbody = null;
    if (rows.length > 0) {
      tbody = <tbody>{rows}</tbody>;
    }

    return (<div>
    <table className="table table-hover">
        <thead>
          <tr>
            <th>Video id</th>
            <th>Impressions <i className="fa fa-sort table-metric-sort" aria-hidden="true" onClick={::this.toggleSorting}></i></th>
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
    </div>);
  }

  render () {
    return (
      <Card title="Top Contents" width={ this.props.width || {md:4, sm: 4, xs: 12}} cardHeight={"480px"}>
        {this.renderTable()}
      </Card>);
  }
}

const mapStateToProps = ({ api, ranges }) => {
  return {
    apiKey: api.apiKey,
    licenseKey: api.analyticsLicenseKey,
    interval: ranges.interval,
    rangeName: ranges.name,
    primaryRange: ranges.primaryRange
  }
};

export default connect(mapStateToProps)(TopContents);
