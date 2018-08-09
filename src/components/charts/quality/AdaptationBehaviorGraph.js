import React, {Component} from 'react';
import ReactHighcharts from 'react-highcharts';
import * as d3 from 'd3-array';

class AdaptationBehaviorGraph extends Component {
  capVideoLength(length) {
    const ONE_HOUR = 3600000;
    return Math.min(length, 6 * ONE_HOUR);
  }
  isLive() {
    return this.props.impressions.filter(x => x.is_live === true).length > 0;
  }
  getStartTimestamp() {
    if (!this.isLive()) {
      return 0;
    }
    return d3.min(this.props.impressions.map(x => x.videotime_start).filter(x => x > 0));
  }
  getBitrateSeries() {
    const data = [];
    if (!this.props.impressions) {
      return {
        name: 'Video Bitrate',
        data: [],
        yAxis: 0,
      };
    }
    const startTimeStamp = this.getStartTimestamp();
    let videoLength = d3.max(this.props.impressions, imp => {
      return imp.video_duration;
    });
    if (!videoLength) {
      const maxVideoTimeEnd = d3.max(this.props.impressions, imp => {
        return imp.videotime_end;
      });
      videoLength = maxVideoTimeEnd - startTimeStamp;
    }
    //videoLength = this.capVideoLength(videoLength)
    for (let time = startTimeStamp; time <= startTimeStamp + videoLength; time += 1000) {
      const available = this.props.impressions.filter(imp => {
        return imp.videotime_start <= time && imp.videotime_end >= time && imp.state.indexOf('seeking') < 0;
      });
      const bitrate = d3.max(available, x => {
        return x.video_bitrate;
      });
      data.push([Math.round(time / 1000), Math.round(bitrate / 1024)]);
    }

    // this.props.impressions.forEach((impression) => {
    //   if (impression.video_bitrate > 0) {
    //     data.push([impression.videotime_start / 1000, impression.video_bitrate, impression]);
    //     data.push([impression.videotime_end / 1000, impression.video_bitrate, impression]);
    //   }
    // });
    // data.sort((a,b) => { return a[0] - b[0]; })
    return {
      name: 'Video Bitrate',
      data: data,
      yAxis: 0,
    };
  }
  getRebufferingSeries() {
    const data = [];
    this.props.impressions.forEach(impression => {
      if (impression.videotime_end > 0 && impression.buffered > 0 && impression.player_startuptime === 0) {
        data.push([impression.videotime_start / 1000, impression.buffered]);
      }
    });

    return {
      name: 'Rebuffering',
      type: 'column',
      color: '#E8440C',
      data: data,
      yAxis: 1,
    };
  }
  maxBuffering() {
    return d3.max(this.props.impressions, imp => {
      return imp.buffered;
    });
  }
  getConfig() {
    const chartConfig = {
      chart: {
        zoomType: 'x',
      },
      title: {
        text: '',
      },
      xAxis: {
        type: 'linear',
        description: 'Seconds',
        dateTimeLabelFormats: {
          month: '%e. %b',
          year: '%b',
        },
      },
      yAxis: [
        {
          plotLines: [
            {
              value: 0,
              width: 1,
              color: '#808080',
            },
          ],
          title: {
            text: 'Kbit/sec',
          },
          min: 0,
          max: 6100,
        },
        {
          title: {
            text: 'Milliseconds',
          },
          min: 0,
          max: Math.max(2000, this.maxBuffering()),
          opposite: true,
        },
      ],
      tooltip: {
        shared: false,
        crosshairs: true,
      },
      series: [this.getBitrateSeries(), this.getRebufferingSeries()],
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
    return chartConfig;
  }
  render() {
    return (
      <div>
        <ReactHighcharts config={this.getConfig()} />
      </div>
    );
  }
}

export default AdaptationBehaviorGraph;
