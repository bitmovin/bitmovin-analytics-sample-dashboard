import React, {Component, PropTypes} from 'react';

class ExpandableNavigation extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
  };
  constructor(props) {
    super(props);
    this.state = {
      expanded: props.expanded === true,
    };
  }
  toggle() {
    this.setState(prevState => {
      return {
        expanded: !prevState.expanded,
      };
    });
  }
  render() {
    const children = React.Children.toArray(this.props.children);
    return (
      <li className={this.state.expanded ? 'active' : ''}>
        <a onClick={::this.toggle}>
          <i className={'fa ' + this.props.icon} /> {this.props.title} <span className="fa fa-chevron-down" />
        </a>
        <ul className="nav child_menu" style={{display: this.state.expanded ? 'block' : 'none'}}>
          {children.map((child, index) => {
            return <li key={index}>{child}</li>;
          })}
        </ul>
      </li>
    );
  }
}

export default ExpandableNavigation;
