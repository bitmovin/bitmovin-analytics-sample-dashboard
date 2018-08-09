import React, {PropTypes, Component} from 'react';
import Dashboard from '../../containers/querybuilder/Dashboard.js';
import ChartDashboard from '../../containers/querybuilder/ChartDashboard';

class DashboardList extends Component {
  static propTypes = {
    dashboards: PropTypes.array.isRequired,
  };
  render() {
    const boards = this.props.dashboards.map(board => {
      const headers = ['Time', ...board.query.columns.map(x => x.title)];
      let dash = <Dashboard key={board.boardId} data={board} id={board.boardId} headers={headers} />;
      if (board.boardType === 'chart') {
        dash = <ChartDashboard key={board.boardId} data={board} id={board.boardId} headers={headers} />;
      }
      return <div key={board.boardId}>{dash}</div>;
    });
    return <div className="row">{boards}</div>;
  }
}

export default DashboardList;
