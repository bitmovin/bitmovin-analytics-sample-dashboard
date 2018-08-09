import React, {PropTypes, Component} from 'react';

class FormCard extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    bgColor: PropTypes.string.isRequired,
    children: PropTypes.array.isRequired,
  };
  render() {
    return (
      <div className="card">
        <div className="card-header card-header-icon" data-background-color={this.props.bgColor}>
          <i className={`fa fa-${this.props.icon}`} />
        </div>
        <div className="card-content">
          <h4 className="card-title">{this.props.title}</h4>
          <div>{this.props.children}</div>
        </div>
      </div>
    );
  }
}

export default FormCard;
