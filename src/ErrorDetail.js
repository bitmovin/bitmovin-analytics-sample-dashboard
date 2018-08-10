import React, {Component} from 'react';
import {videosByErrorCode, errorDetailsForVideoId} from './api/metrics/errors';
import {connect} from 'react-redux';
import Card from './components/Card';
import ReactHighcharts from 'react-highcharts';
import ReactPaginate from 'react-paginate';
import {ErrorCodes} from './utils.js';
import ImpressionsList from './components/ImpressionsList';
import Api from './api';
import {disconnect} from 'cluster';

class ErrorDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: false,
      limit: 6,
      offset: 0,
      page: 0,
      videoId: null,
      errorDetails: {
        loaded: false,
        browsers: [],
        oss: [],
        streamFormat: [],
        playerTech: [],
        errors: {
          name: 'Errors',
          data: [],
        },
        impressions: {
          name: 'Impressions',
          data: [],
        },
        impressionList: [],
      },
    };
  }

  componentDidMount() {
    this.loadData(this.props);
  }

  componentWillReceiveProps(nextProps) {
    this.loadData(nextProps);
  }

  handlePageClick(pagination) {
    const offset = this.state.limit * pagination.selected;
    this.loadData(this.props, this.state.limit, offset);
  }

  loadData(props, limit = this.state.limit, offset = this.state.offset) {
    videosByErrorCode(props.api, props.interval, parseInt(props.errorCode, 10), {
      ...props.primaryRange,
      limit,
      offset,
    }).then(data => {
      this.setState(prevState => {
        return {
          ...prevState,
          loaded: true,
          videos: data.map(p => {
            return {video: p[1], errors: p[2]};
          }),
        };
      });
    });

    if (this.state.videoId) {
      this.loadErrorDetailsForVideoId(props, this.state.videoId);
    }
  }

  loadErrorDetailsForVideoId(props, videoId) {
    errorDetailsForVideoId(props.api, parseInt(props.errorCode, 10), videoId, props.primaryRange).then(data => {
      this.setState(prevState => {
        return {
          ...prevState,
          errorDetails: {
            ...prevState.errorDetails,
            loaded: true,
            ...data,
            errors: {
              name: 'Errors',
              data: data.errors,
            },
            impressions: {
              name: 'Impressions',
              data: data.impressions,
            },
          },
        };
      });
    });
  }

  renderErrorsTable() {
    if (!this.state.loaded) {
      return <div>Loading...</div>;
    }

    const videos = this.state.videos.map((video, index) => {
      return (
        <tr key={index}>
          <td>
            <a
              className="error-detail-video-id"
              onClick={() => {
                this.setState({videoId: video.video});
                this.loadErrorDetailsForVideoId(this.props, video.video);
              }}>
              {video.video}
            </a>
          </td>
          <td>{video.errors}</td>
        </tr>
      );
    });

    return (
      <div>
        <Card
          title={'Error #' + this.props.errorCode + ' - ' + ErrorCodes[this.props.errorCode]}
          width={{xs: 12}}
          cardHeight={'180px'}>
          <div>
            <p>
              This View gives you an overview where Error #{this.props.errorCode} - {ErrorCodes[this.props.errorCode]}{' '}
              occured and gives you a breakdown of what Technology caused the Error.
            </p>
            <p>Click a Video ID to see details for this Error in the clicked Video</p>
            <p>
              See documentation about the Error:{' '}
              <a target="_blank" href={'https://bitmovin.com/errors/?post_type=errors&s=' + this.props.errorCode}>
                Bitmovin Error Documentation
              </a>
            </p>
          </div>
        </Card>
        <Card title="Errors per Video Id" width={{xs: 12}} cardHeight={'480px'}>
          <div>
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Video id</th>
                  <th>Errors</th>
                </tr>
              </thead>
              <tbody>{videos}</tbody>
            </table>
            <ReactPaginate
              ref="table_pagination"
              previousLabel={'previous'}
              nextLabel={'next'}
              pageCount={300}
              forcePage={this.state.page}
              marginPagesDisplayed={0}
              pageRangeDisplayed={0}
              onPageChange={::this.handlePageClick}
              containerClassName={'pagination'}
              subContainerClassName={'pages pagination'}
              activeClassName={'active'}
            />
          </div>
        </Card>
      </div>
    );
  }

  renderChart(title, series) {
    const config = {
      chart: {
        height: 400,
        type: 'spline',
      },
      title: {
        text: '',
      },
      xAxis: {
        type: 'datetime',
      },
      yAxis: {
        plotLines: [
          {
            value: 0,
            width: 1,
            color: '#808080',
          },
        ],
        title: {
          text: title,
        },
      },
      tooltip: {
        shared: true,
        crosshairs: true,
      },
      series: [series],
      colors: [
        '#2eabe2',
        '#35ae73',
        '#f3922b',
        '#d2347f',
        '#ad5536',
        '#2f66f2',
        '#bd37d1',
        '#32e0bf',
        '#670CE8',
        '#FF0000',
        '#E8900C',
        '#9A0DFF',
        '#100CE8',
        '#FF0000',
        '#E8B00C',
        '#0DFF1A',
        '#E8440C',
        '#E80CCE',
      ],
    };

    return (
      <Card title={title} width={this.props.width || {md: 12, sm: 12, xd: 12}} cardHeight="500px">
        <ReactHighcharts config={config} />
      </Card>
    );
  }

  renderTable(title, data) {
    const videos = data.map((stat, index) => {
      return (
        <tr key={index}>
          <td>{stat[0] || 'UNKNOWN'}</td>
          <td>{stat[1]}</td>
        </tr>
      );
    });

    return (
      <Card title={title} width={{xs: 6}} cardHeight={'480px'}>
        <table className="table table-hover">
          <thead>
            <tr>
              <th>{title}</th>
              <th>Impressions</th>
            </tr>
          </thead>
          <tbody>{videos}</tbody>
        </table>
      </Card>
    );
  }

  renderImpressionsList(props, state) {
    if (state.videoId) {
      const baseQuery = {
        filters: [
          {
            name: 'ERROR_CODE',
            operator: 'EQ',
            value: parseInt(props.errorCode, 10),
          },
          {
            name: 'VIDEO_ID',
            operator: 'EQ',
            value: state.videoId,
          },
        ],
      };
      return <ImpressionsList title="Last Impressions" baseQuery={baseQuery} />;
    }
    return <div />;
  }

  renderVideoIdErrorDetails() {
    if (!this.state.errorDetails.loaded) {
      return;
    }

    return (
      <div>
        {this.renderTable('Browsers', this.state.errorDetails.browsers)}
        {this.renderTable('Operating Systems', this.state.errorDetails.oss)}
        {this.renderTable('Stream Format', this.state.errorDetails.streamFormat)}
        {this.renderTable('Player Tech', this.state.errorDetails.playerTech)}
        {this.renderChart('Errors', this.state.errorDetails.errors)}
        {this.renderChart('Impressions for video', this.state.errorDetails.impressions)}
        {this.renderImpressionsList(this.props, this.state)}
      </div>
    );
  }

  render() {
    return (
      <div>
        {this.renderErrorsTable()}
        {this.renderVideoIdErrorDetails()}
      </div>
    );
  }
}

export default connect((state, ownProps) => {
  return {
    errorCode: ownProps.params.errorCode,
    api: new Api(state),
    primaryRange: state.ranges.primaryRange,
    interval: state.ranges.interval,
  };
})(ErrorDetail);
