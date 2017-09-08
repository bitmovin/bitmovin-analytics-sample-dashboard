import React, { Component, PropTypes } from 'react'


class Select extends Component {
  static propTypes = {
    options: PropTypes.object.isRequired,
    selectedOption: PropTypes.string.isRequired,
    onChange: PropTypes.func
  };
  constructor(props) {
    super(props);
    this.state = {
      refName: String(Math.random())
    };
  }
  getSelectedOption() {
    const operatorSelect = this.refs[this.state.refName];
    return operatorSelect.options[operatorSelect.selectedIndex].value;
  }
  renderOptions() {
    const options = [];
    for (let option of Object.keys(this.props.options)) {
      options.push(<option key={option} value={option}>{this.props.options[option].displayValue || option}</option>)
    }
    return options;
  }
  changed() {
    if (this.props.onChange) {
      this.props.onChange(this.getSelectedOption());
    }
  }
  render () {
    return (  
      <select className="form-control" ref={this.state.refName} defaultValue={this.props.selectedOption} onChange={::this.changed} >
        {this.renderOptions()}
      </select>
    );
  }
}

export default Select
