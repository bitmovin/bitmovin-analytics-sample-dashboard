import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import * as rebuffer from '../api/metrics/rebuffer';
import Card from './Card';
import {Link} from 'react-router';
import * as util from '../api/util';
import {shortenString} from '../utils';
import ReactPaginate from 'react-paginate';

class TopContents extends PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      topContents: [],
      limit: 6,
      offset: 0,
      pageCount: 0,
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

  loadData (props) {
    const rebufferQuery = {
      ...props.primaryRange,
      interval: null,
      groupBy: ['VIDEO_ID'],
      orderBy: [{name: 'FUNCTION', order: 'DESC'}],
      licenseKey: props.licenseKey
    };

    rebuffer.rebufferPercentageOverTime(props.apiKey, rebufferQuery).then(result => {
      this.setState(prevState => {
        return {
          ...prevState,
          topContents: result
        }
      })
    });
  }

  toggleSorting() {
    this.setState(prevState => {
      return {
        ...prevState,
        orderByOrder: prevState.orderByOrder==='DESC' ? 'ASC' : 'DESC',
        offset: 0,
        page: 0
      }
    })
  }

  handlePageClick(pagination) {
    const offset = this.state.limit * pagination.selected;
    this.setState(prevState => {
      return {
        ...prevState,
        offset,
        page: pagination.selected
      }
    })
  }

  renderTable () {
    let sorting = (a, b) => {
      return b[3] - a[3];
    };
    if (this.state.orderByOrder === 'ASC') {
      sorting = (a, b) => {
        return a[3] - b[3];
      }
    }

    const sorted = this.state.topContents.sort((a, b) => {
      return sorting(a, b);
    });

    const top = sorted.slice(this.state.offset, this.state.offset + this.state.limit);

    const rows = top.map((video, index) => {
      const fullVideoId = video[0];
      const shortenedVideoId = shortenString(video[0]);

      return <tr key={index}><td><Link to="/videoinspection" query={{video: fullVideoId }}>{shortenedVideoId}</Link></td><td>{util.roundTo(video[3]*100, 2) + '%'}</td></tr>;
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
            <th>Rebuffer Percentage <i className="fa fa-sort table-metric-sort" aria-hidden="true" onClick={::this.toggleSorting}></i></th>
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

export default connect(mapStateToProps)(TopContents);
