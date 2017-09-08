import React, { PropTypes, Component } from 'react';
import Card from '../Card'

class Dashboard extends Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    headers: PropTypes.array.isRequired,
    refresh: PropTypes.func.isRequired
  }
  render () {
    const headers = this.props.headers.map((header, index) => {
      return <th key={index}>{header}</th>
    });
    const rows = this.props.data.map(row => {
      let index = 0;
      const cols = row.map(col => {
        index++;
        return <td key={index}>{col}</td>;
      })
      return <tr key={row[0]}>
        {cols}
      </tr>;
    });
    return <Card title={this.props.query.title} width={{ md: 12, sm: 12, xs: 12 }}>
      <div>
        <button className="btn btn-info btn-xs" onClick={this.props.refresh}>Refresh</button>
        <table className="table">
          <thead>
            <tr>{headers}</tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    </Card>;
  }
}

export default Dashboard;
