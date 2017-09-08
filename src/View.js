import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import TopStats from './TopStats'
import Chart from './Chart'

class View extends Component {
  static propTypes = {
    top: PropTypes.object.isRequired,
    middleLeft: PropTypes.object.isRequired,
    middleRight: PropTypes.object.isRequired,
    bottomLeft: PropTypes.object.isRequired,
    bottomRight: PropTypes.object.isRequired
  };
  componentDidMount() {
  }
  render () {
    return (
      <div>
      <TopStats />

      <br></br>

      <div className="row">
        <Chart title={this.props.top.title} defaultSeriesName="Impressions" dataFunction={this.props.top.dataFunction} convertResultToSeries={this.props.top.convertResultToSeries}/>
      </div>

      <br/>

      <div className="row">
        <Chart title={this.props.middleLeft.title} defaultSeriesName="Impressions" dataFunction={this.props.middleLeft.dataFunction} convertResultToSeries={this.props.middleLeft.convertResultToSeries} width={{md:4, sm: 4, xs: 12}}/>
        <Chart title={this.props.middleRight.title} defaultSeriesName="Impressions" dataFunction={this.props.middleRight.dataFunction} convertResultToSeries={this.props.middleRight.convertResultToSeries} width={{md:8, sm: 8, xs: 12}}/>
      </div>

      <div className="row">
        <Chart title={this.props.bottomLeft.title} defaultSeriesName="Impressions" dataFunction={this.props.bottomLeft.dataFunction} convertResultToSeries={this.props.bottomLeft.convertResultToSeries} width={{md:8, sm: 8, xs: 12}}/>
        <Chart title={this.props.bottomRight.title} defaultSeriesName="Impressions" dataFunction={this.props.bottomRight.dataFunction} convertResultToSeries={this.props.bottomRight.convertResultToSeries} width={{md:4, sm: 4, xs: 12}}/>
      </div>
    </div>)
  }
}

const mapStateToProps = (state) => {
  return {apiKey: state.api.apiKey}
};

export default connect(mapStateToProps)(View);
