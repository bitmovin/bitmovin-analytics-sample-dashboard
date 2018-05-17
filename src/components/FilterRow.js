import React, {Component, PropTypes} from 'react';
import ReactSelect from 'react-select';
import 'react-select/dist/react-select.css';
import * as stats from '../api/stats';
import Api, { createApiFromParameters } from '../api';
import connect from 'react-redux/lib/connect/connect';

class FilterRow extends Component {
  static propTypes = {
    queryIndex: PropTypes.number.isRequired,
    filterIndex: PropTypes.number.isRequired,
    filterName: PropTypes.string.isRequired,
    filterOperator: PropTypes.string.isRequired,
    filterValue: PropTypes.string.isRequired,
    remove: PropTypes.func.isRequired
  };
  constructor(props) {
    super(props);
    const filterParams = this.getFilterParams(this.props.filterName);
    this.state = {
      filterName    : this.props.filterName,
      filterOperator: this.props.filterOperator,
      filterValue   : this.props.filterValue,
      filterValueType: filterParams.filterValueType,
      possibleValues: filterParams.possibleValues
    };
  }

  getFilterParams(filterName) {
    const filterParams = {
      filterValueType: 'text',
      possibleValues: []
    };

    for(let i = 0; i < this.nameOptions.length; i++) {
      if (this.nameOptions[i].value === filterName) {
        filterParams.filterValueType = this.nameOptions[i].type;
        filterParams.possibleValues = this.nameOptions[i].possibleValues;

        if (filterParams.possibleValues.length <= 0 && filterName !== '' && this.nameOptions[i].loadPossibleValues !== false) {
          this.loadPossibleValues(filterName);
        }

        break;
      }
    }

    return filterParams;
  }
  getFilter() {
    const name = this.state.filterName;
    const operator = this.state.filterOperator;
    let uncastedValue;

    if (this.state.possibleValues.length <= 0) {
      const valueInput = this.refs['filterValue_' + this.props.queryIndex + '_' + this.props.filterIndex];
      uncastedValue = valueInput.value;
    } else {
      uncastedValue = this.state.filterValue;
    }

    const value = this.getCastedFilterValue(uncastedValue);

    return {name, operator, value};
  }
  remove() {
    this.props.remove(this.props.queryIndex, this.props.filterIndex);
  }
  nameOptions = [
    {value: 'ANALYTICS_VERSION', label: 'ANALYTICS VERSION', type: 'text', possibleValues: []},
    {value: 'LICENSE_KEY', label: 'LICENSE KEY', type: 'text', possibleValues: []},
    {value: 'PLAYER_KEY', label: 'PLAYER KEY', type: 'text', possibleValues: []},
    {value: 'IMPRESSION_ID', label: 'IMPRESSION ID', type: 'text', possibleValues: []},
    {value: 'USER_ID', label: 'USER ID', type: 'text', possibleValues: []},
    {value: 'DOMAIN', label: 'DOMAIN', type: 'text', possibleValues: []},
    {value: 'PATH', label: 'PATH', type: 'text', possibleValues: []},
    {value: 'LANGUAGE', label: 'LANGUAGE', type: 'text', possibleValues: []},
    {
      value         : 'PLAYER_TECH',
      label         : 'PLAYER TECHNOLOGY',
      type          : 'text',
      possibleValues: [
        {value: 'html5', label: 'html5'},
        {value: 'flash', label: 'flash'},
        {value: 'native', label: 'native'}
      ]
    },
    {value: 'SCREEN_WIDTH', label: 'SCREEN WIDTH', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'SCREEN_HEIGHT', label: 'SCREEN HEIGHT', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'IP_ADDRESS', label: 'IP ADDRESS', type: 'text', possibleValues: []},
    {
      value         : 'STREAM_FORMAT',
      label         : 'STREAM FORMAT',
      type          : 'text',
      possibleValues: [
        {value: 'dash', label: 'dash'},
        {value: 'hls', label: 'hls'},
        {value: 'progressive', label: 'progressive'},
        {value: 'unknown', label: 'unknown'}
      ]
    },
    {value: 'PLAYER', label: 'PLAYER', type: 'text', possibleValues: []},
    {value: 'PLAYER_VERSION', label: 'PLAYER VERSION', type: 'text', possibleValues: []},
    {value: 'VIDEO_DURATION', label: 'VIDEO DURATION', type: 'number', possibleValues: []},
    {
      value         : 'IS_LIVE',
      label         : 'LIVE',
      type          : 'boolean',
      possibleValues: [{value: 'true', label: 'true'}, {value: 'false', label: 'false'}]
    },
    {
      value         : 'IS_CASTING',
      label         : 'CASTING',
      type          : 'boolean',
      possibleValues: [{value: 'true', label: 'true'}, {value: 'false', label: 'false'}]
    },
    {value: 'VIDEO_ID', label: 'VIDEO ID', type: 'text', possibleValues: []},
    {value: 'PLAYER_STARTUPTIME', label: 'PLAYER STARTUPTIME', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'VIDEO_STARTUPTIME', label: 'VIDEO STARTUPTIME', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'CUSTOM_USER_ID', label: 'CUSTOM USER ID', type: 'text', possibleValues: []},
    {value: 'CLIENT_TIME', label: 'CLIENT TIME', type: 'number', possibleValues: [], loadPossibleValues: false},
    {
      value         : 'SIZE',
      label         : 'SIZE',
      type          : 'text',
      possibleValues: [{value: 'WINDOW', label: 'WINDOW'}, {value: 'FULLSCREEN', label: 'FULLSCREEN'}]
    },
    {value: 'VIDEO_WINDOW_WIDTH', label: 'VIDEO WINDOW WIDTH', type: 'number', possibleValues: []},
    {value: 'VIDEO_WINDOW_HEIGHT', label: 'VIDEO WINDOW HEIGHT', type: 'number', possibleValues: []},
    {value: 'DROPPED_FRAMES', label: 'DROPPED FRAMES', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'PLAYED', label: 'PLAYED', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'PAUSED', label: 'PAUSED', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'BUFFERED', label: 'BUFFERED', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'AD', label: 'AD', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'SEEKED', label: 'SEEKED', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'VIDEO_PLAYBACK_WIDTH', label: 'VIDEO PLAYBACK WIDTH', type: 'number', possibleValues: []},
    {value: 'VIDEO_PLAYBACK_HEIGHT', label: 'VIDEO PLAYBACK HEIGHT', type: 'number', possibleValues: []},
    {value: 'VIDEO_BITRATE', label: 'VIDEO BITRATE', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'AUDIO_BITRATE', label: 'AUDIO BITRATE', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'VIDEOTIME_START', label: 'VIDEOTIME START', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'VIDEOTIME_END', label: 'VIDEOTIME END', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'DURATION', label: 'DURATION', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'STARTUPTIME', label: 'STARTUPTIME', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'BROWSER', label: 'BROWSER', type: 'text', possibleValues: []},
    {value: 'BROWSER_VERSION_MAJOR', label: 'BROWSER VERSION MAJOR', type: 'text', possibleValues: []},
    {value: 'OPERATINGSYSTEM', label: 'OPERATINGSYSTEM', type: 'text', possibleValues: []},
    {value: 'OPERATINGSYSTEM_VERSION_MAJOR', label: 'OPERATINGSYSTEM VERSION MAJOR', type: 'text', possibleValues: []},
    {value: 'DEVICETYPE', label: 'DEVICETYPE', type: 'text', possibleValues: []},
    {value: 'COUNTRY', label: 'COUNTRY', type: 'text', possibleValues: []},
    {value: 'REGION', label: 'REGION', type: 'text', possibleValues: []},
    {value: 'CITY', label: 'CITY', type: 'text', possibleValues: []},
    {value: 'CDN_PROVIDER', label: 'CDN PROVIDER', type: 'text', possibleValues: []},
    {value: 'MPD_URL', label: 'MPD URL', type: 'text', possibleValues: []},
    {value: 'M3U8_URL', label: 'M3U8 URL', type: 'text', possibleValues: []},
    {value: 'PROG_URL', label: 'PROG URL', type: 'text', possibleValues: []},
    {value: 'ERROR_CODE', label: 'ERROR CODE', type: 'number', possibleValues: []},
    {value: 'MINUTE', label: 'MINUTE', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'HOUR', label: 'HOUR', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'DAY', label: 'DAY', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'MONTH', label: 'MONTH', type: 'number', possibleValues: [], loadPossibleValues: false},
    {value: 'PAGE_LOAD_TIME', label: 'PAGE LOAD TIME', type: 'number', possibleValues: [], loadPossibleValues: false},
    {
      value         : 'PAGE_LOAD_TYPE',
      label         : 'PAGE LOAD TYPE',
      type          : 'number',
      possibleValues: [{value: '1', label: 'Foreground'}, {value: '2', label: 'Background'}]
    }
  ];
  operatorOptions = [
    {value: 'EQ', label: 'equals'},
    {value: 'NE', label: 'not equals'},
    {value: 'LT', label: 'lower than'},
    {value: 'LTE', label: 'lower than or eq'},
    {value: 'GT', label: 'greater than'},
    {value: 'GTE', label: 'greater than or eq'},
    {value: 'CONTAINS', label: 'CONTAINS'},
    {value: 'NOTCONTAINS', label: 'NOTCONTAINS'}
  ];
  renderFilterValueInput() {
    if (this.state.possibleValues.length <= 0) {
      return <input className='form-control' type={this.state.filterValueType} ref={'filterValue_' + this.props.queryIndex + '_' + this.props.filterIndex} defaultValue={this.state.filterValue} />;
    }

    return <ReactSelect
      ref={'filterValue_' + this.props.queryIndex + '_' + this.props.filterIndex}
      name="form-field-name"
      value={this.state.filterValue}
      options={this.state.possibleValues}
      onChange={::this.filterValueChange}
      clearable={false}
    />

  }
  getCastedFilterValue(unCastedValue, filterValueType = this.state.filterValueType) {
    switch (filterValueType) {
      case 'number':
        return parseInt(unCastedValue, 10);
      case 'boolean':
        return unCastedValue === 'true';
      default:
        return String(unCastedValue);
    }
  }
  filterValueChange(value) {
    this.setState(prevState => {
      return {
        ...prevState,
        filterValue: value.value
      }
    });
  }
  filterOperatorChange(operator) {
    this.setState(prevState => {
      return {
        ...prevState,
        filterOperator: operator.value
      }
    });
  }
  filterNameChange(name) {
    this.setState(prevState => {
      let possibleValues = name.possibleValues;
      if (possibleValues.length <= 0 && name.loadPossibleValues !== false) {
        this.loadPossibleValues(name.value);
      }
      return {
        ...prevState,
        filterName: name.value,
        possibleValues,
        filterValueType: name.type
      }
    });
  }
  loadPossibleValues(filterName) {
    stats.fetchPossibleValues(this.props.api, filterName).then(data => {
      const possibleValues = data.map(row => {
        return { value: row[0], label: row[0] };
      });

      this.setState(prevState => {
        return {
          ...prevState,
          possibleValues
        }
      })
    });
  }
  render () {
    return (
      <tr key={this.props.queryIndex + '_' + this.props.filterIndex}>
        <td style={{width: "200px"}}>
          <ReactSelect
            ref={'filterName_' + this.props.queryIndex + '_' + this.props.filterIndex}
            name="form-field-name"
            value={this.state.filterName}
            options={this.nameOptions}
            onChange={::this.filterNameChange}
            clearable={false}
          />
        </td>
        <td style={{width: "116px"}}>
          <ReactSelect
            ref={'filterOperator_' + this.props.queryIndex + '_' + this.props.filterIndex}
            name="form-field-name"
            value={this.state.filterOperator}
            options={this.operatorOptions}
            onChange={::this.filterOperatorChange}
            clearable={false}
            />
        </td>
        <td style={{width: "190px"}}>
          {this.renderFilterValueInput()}
        </td>
        <td style={{width: "66px"}}>
          <button className='btn btn-danger btn-simple btn-xs' onClick={() => {::this.remove()}}><i className='fa fa-times'></i></button>
        </td>
      </tr>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    api: new Api(state)
  }
};
export default connect(mapStateToProps)(FilterRow);
