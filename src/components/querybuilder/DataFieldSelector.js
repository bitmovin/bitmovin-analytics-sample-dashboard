import React, { Component, PropTypes } from 'react'
import { nameOptions }  from '../../constants/queryfields'

class DataFieldSelector extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired
  }
  render () {
    const fieldNames = Object.keys(nameOptions);
    return <div className={this.props.className}>
      <label>{this.props.label}</label>
      <select className="form-control" value={this.props.value} onChange={this.props.onChange}>
        {fieldNames.map((name) => <option key={name} value={name}>{name}</option>)}
      </select>
    </div>
  }
}

export default DataFieldSelector
