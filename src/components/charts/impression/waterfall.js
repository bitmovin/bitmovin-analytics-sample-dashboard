import React, {Component} from 'react';
import * as d3 from 'd3';

class Waterfall extends Component {
  drawWaterfall() {
    if (this.state.impression.length === 0) return;

    var durations = this.state.impression.map(function(row) {
      return {
        videoTimeStart: row.videotime_start,
        videoTimeEnd: row.videotime_end,
        buffered: row.buffered,
        time: row.time,
        duration: row.duration,
        played: row.played,
        videoDuration: row.video_duration,
        src: row,
        player_startuptime: row.player_startuptime,
        seeked: row.seeked,
      };
    });
    durations = durations.sort((a, b) => {
      return a.time - b.time;
    });

    const filterStartupSample = samples => {
      return samples.filter(sample => {
        return sample.player_startuptime === 0;
      });
    };

    const container = this.refs.container;
    const data = durations;

    var margin = {top: 20, left: 20, bottom: 20, right: 20};
    var width = 800 - margin.left - margin.right;
    var height = 300 - margin.top - margin.bottom;

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([0, height]);
    var z = d3.scaleSequential(d3.interpolateCool);

    var x2 = d3.scaleLinear().range([0, width]);
    var hue = d3.scaleLinear().range([0, 1]);

    d3.select(container)
      .selectAll('svg')
      .remove();
    const parentSvg = d3
      .select(container)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.bottom + margin.top)
      .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')');
    var svg = parentSvg.append('g');

    x.domain([
      0,
      d3.max(data, function(d) {
        return d.videoDuration;
      }),
    ]);
    y.domain([
      d3.min(filterStartupSample(data), function(d) {
        return d.time - d.duration;
      }),
      d3.max(filterStartupSample(data), d => {
        return d.time;
      }),
    ]);

    var seconds = [];
    var videoDuration = d3.max(data, function(d) {
      return d.videoDuration;
    });
    const addSecond = (second, data) => {
      data.forEach(function(row) {
        if (row.videoTimeStart <= second * 1000 && row.videoTimeEnd > second * 1000) {
          seconds[second].count += 1;
        }
      });
    };
    for (var second = 0; second < Math.ceil(videoDuration / 1000); second += 1) {
      seconds[second] = {second: second, count: 0};
      addSecond(second, data);
    }

    x2.domain([0, Math.ceil(videoDuration / 1000)]);
    hue.domain([
      0,
      d3.max(seconds, function(d) {
        return d.count;
      }),
    ]);

    // svg.selectAll('.tile2')
    //   .data(seconds)
    //   .enter().append('rect')
    //   .attr('class', 'tile2')
    //   .attr('transform', function (d) { return 'translate(' + margin.left + ', ' + (margin.top) + ')';})
    //   .attr('x', function (d) { return x2(d.second); })
    //   .attr('y', 0)
    //   .attr('second', function (d) { return d.second; })
    //   .attr('count', function (d) { return d.count; })
    //   .attr('width', function (d) { return x2(1); })
    //   .attr('height', height)
    //   .style('fill', function (d) { return d3.rgb(250, 121, 33, hue(d.count)); })
    //   .append('svg:title')
    //     .text(function (d) { return 'Buffered: ' + d.count; });

    const fixedDurations = filterStartupSample(durations).map(x => {
      return {
        old: x,
        start: Math.min(x.videoTimeStart, x.videoTimeEnd),
        end: Math.max(x.videoTimeEnd, x.videoTimeEnd),
        duration: x.duration,
        time: x.time,
        buffered: x.buffered,
        seeked: x.seeked,
        played: x.played,
      };
    });
    const color = type => {
      switch (type) {
        case 'SEEKED':
          return '#d2347f';
        case 'BUFFERED':
          return '#E8440C';
        case 'PLAYBACK':
          return '#35ae73';
        default:
          return '#2eabe2';
      }
    };
    const type = row => {
      if (row.seeked > 0) {
        return 'SEEKED';
      } else if (row.buffered > 0) {
        return 'BUFFERED';
      } else if (row.played > 0) {
        return 'PLAYBACK';
      } else {
        return 'IDLE';
      }
    };
    const dd = fixedDurations.map(d => {
      return {
        x: x(d.start),
        y: y(d.time - d.duration),
        xValue: d.start,
        yValue: d.time - d.duration,
        width: Math.max(4, x(d.end) - x(d.start)),
        height: Math.max(4, y(d.time) - y(d.time - d.duration)),
        type: type(d),
        color: color(type(d)),
        buffered: d.buffered,
        time: d.time,
        played: d.played,
        old: d.old,
        fixed: d,
      };
    });
    const defs = parentSvg.append('defs');

    defs
      .append('pattern')
      .attr('id', 'pattern-stripe')
      .attr('width', 4)
      .attr('height', 4)
      .attr('patternUnits', 'userSpaceOnUse')
      .attr(
        'patternTransform',
        'roRebuffer Duration is the amount of time in seconds that viewers wait for rebuffering per video view. Videos with longer durations have more opportunities for rebuffing events to occur and can make comparisons with shorter videos difficult, making Total Rebuffer Percentage the safer metric to optimize with. However Rebuffer Duration can be a useful metric for understanding the true viewer experience because it’s measured in seconds as opposed to a percentage.tate(45)'
      )
      .append('rect')
      .attr('width', 2)
      .attr('height', 4)
      .attr('transform', 'translate(0,0)')
      .attr('fill', 'white');

    defs
      .append('mask')
      .attr('id', 'mask-stripe')
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#pattern-stripe)');

    svg
      .selectAll('.time')
      .data(dd)
      .enter()
      .append('rect')
      .attr('class', 'time')
      .attr('transform', function(d) {
        return 'translate(' + margin.left + ', ' + margin.top + ')';
      })
      .attr('x', d => {
        return d.x;
      })
      .attr('y', d => {
        return d.y;
      })
      .attr('width', d => {
        return d.width;
      })
      .attr('height', d => {
        return d.height;
      })
      .attr('data-buffered', d => {
        return d.buffered;
      })
      .attr('data-time', d => {
        return d.time;
      })
      .attr('fill', d => {
        return d.color;
      })
      .attr('mask', d => {
        return d.played > 0 && d.buffered > 0 ? 'url(#mask-stripe)' : null;
      })
      .attr('data-type', d => {
        return d.type;
      })
      .append('svg:title')
      .text(function(d) {
        return d.type + ' ' + d.buffered;
      });

    svg
      .append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(' + margin.left + ', ' + (height + margin.top) + ')')
      .call(d3.axisBottom(x).scale(x))
      .attr('color', 'black')
      .append('text')
      .attr('class', 'label')
      .attr('x', width)
      .attr('y', -6)
      .attr('text-anchor', 'end')
      .text('Seconds');
  }
  componentDidUpdate() {
    this.drawHeatmap2();
  }

  render() {
    return <div ref="container" style={{width: 800, height: 400}} />;
  }
}
