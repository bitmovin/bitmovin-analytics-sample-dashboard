import React, {Component, PropTypes} from 'react';
import GoogleMap from 'google-map-react';

class Point extends Component {
  static propTypes = {
    point: PropTypes.object,
  };

  render() {
    return (
      <div
        style={{position: 'absolute', width: '40px', height: '40px', left: '-20px', top: '-40px', textAlign: 'center'}}>
        <i className="fa fa-map-marker" style={{fontSize: '40px', color: 'black'}} aria-hidden="true" />
      </div>
    );
  }
}

class PointLocationMap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      lat: 0,
      lng: 0,
      center: null,
    };
  }
  googleMapApiLoaded() {
    const geocoder = new google.maps.Geocoder(); // eslint-disable-line no-undef
    geocoder.geocode({address: this.props.point}, (result, status) => {
      if (status === 'OK') {
        const location = result[0].geometry.location;
        this.setState(prevState => {
          return {
            ...prevState,
            loaded: true,
            lat: location.lat(),
            lng: location.lng(),
            center: [location.lat(), location.lng()],
          };
        });
      } else {
        alert('error geocoding');
      }
    });
  }
  render() {
    let point = null;
    if (this.state.loaded === true) {
      point = (
        <Point lat={this.state.lat} lng={this.state.lng} text={this.props.name}>
          {this.props.name}
        </Point>
      );
    }
    return (
      <div style={{height: this.props.height}}>
        <GoogleMap
          onGoogleApiLoaded={::this.googleMapApiLoaded}
          center={this.state.center || [59.938043, 30.337157]}
          zoom={12}
          bootstrapURLKeys={{
            key: 'AIzaSyCNpi-ZJ7UWM1A1LbJPhBEYVJD-4o393ug',
          }}>
          {point}
        </GoogleMap>
        <div className="clearfix" />
      </div>
    );
  }
}

export default PointLocationMap;
