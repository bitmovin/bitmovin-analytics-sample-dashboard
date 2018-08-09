import React, {Component, PropTypes} from 'react';

class Card extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    children: PropTypes.element.isRequired,
    switchDisplay: PropTypes.func,
    switchIcon: PropTypes.string,
    width: PropTypes.object.isRequired,
    cardHeight: PropTypes.string,
    login: PropTypes.bool,
  };
  render() {
    let switchDisplay = null;
    if (this.props.switchDisplay) {
      switchDisplay = (
        <a onClick={this.props.switchDisplay}>
          <i className={'fa fa-' + this.props.switchIcon} />
        </a>
      );
    }
    const {width} = this.props;
    const sizes = [];
    for (let key of Object.keys(width)) {
      sizes.push(`col-${key}-${width[key]}`);
    }
    sizes.push(this.props.className);
    const className = sizes.join(' ');
    let cardHeight = '500px';
    if (this.props.cardHeight) {
      cardHeight = this.props.cardHeight;
    }
    let backgroundColor = {
      'data-background-color': 'blue',
    };
    let innerCardClassName = 'card';
    if (this.props.login === true) {
      innerCardClassName += ' card-login';
    }
    let cardHeaderClassName = 'card-header';
    if (this.props.centerHeader === true) {
      cardHeaderClassName += ' text-center';
    }
    return (
      <div className={className} style={this.props.style}>
        <div className={innerCardClassName} style={{height: cardHeight}}>
          <div className={cardHeaderClassName} {...backgroundColor}>
            <h4 className="title">{this.props.title}</h4>
            {this.props.subtitle && <span className="subtitle">{this.props.subtitle}</span>}
            <p className="category">{switchDisplay}</p>
          </div>
          <div className="card-content">{this.props.children}</div>
          <div className="footer text-center">{this.props.footer}</div>
        </div>
      </div>
    );
  }
}

export default Card;
