import React, {Component} from 'react';

class TextField extends Component {
  constructor(props) {
    super(props);
    this.state = {value: props.defaultValue};
  }
  onChange(event) {
    this.setState({value: event.target.value});
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultValue !== this.state.value) {
      this.setState({value: nextProps.defaultValue});
    }
  }
  render() {
    return (
      <div className={this.props.className}>
        <label>{this.props.label}</label>
        <input
          type="text"
          className="form-control"
          value={this.state.value}
          onBlur={this.props.onBlur}
          onChange={::this.onChange}
        />
      </div>
    );
  }
}

export default TextField;
