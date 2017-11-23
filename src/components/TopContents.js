import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import * as impressions from '../api/metrics/impressions';
import Card from './Card';
import {Link} from 'react-router';
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
    const baseQuery = {
      ...props.primaryRange,
      licenseKey: props.licenseKey,
      groupBy: ['VIDEO_ID'],
      orderBy: [{name: 'FUNCTION', order: orderByOrder}, {name: 'VIDEO_ID', order: 'DESC'}],
      limit,
      offset
    };

		impressions.fetchGrouped(props.apiKey, 'Top Contents', baseQuery).then(data => {
      this.setState(prevState => {
        return {
          ...prevState,
          limit,
          offset,
          orderByOrder,
          page: offset / limit,
          topContents: data.data
        }
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
      const fullVideoId = video[0];
      let shortenedVideoId = video[0];
      if (typeof shortenedVideoId !== 'string') {
        shortenedVideoId = '<UNKNOWN>';
      }
      if (shortenedVideoId.length > 35) {
        const copy  = shortenedVideoId;
        shortenedVideoId = shortenedVideoId.substring(0, 12);
        shortenedVideoId += '...';
        shortenedVideoId += copy.substring(copy.length - 12, copy.length);
      }

      return <tr key={index}><td><Link to="/videoinspection" query={{video: fullVideoId }}>{shortenedVideoId}</Link></td><td>{video[1]}</td></tr>;
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
