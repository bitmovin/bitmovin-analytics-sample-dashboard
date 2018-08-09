import ChartDashboard from '../../components/querybuilder/ChartDashboard';
import {connect} from 'react-redux';
import {loadDashboardData, removeDashboard, editDashboard} from '../../actions/dashboard';

const mapStateToProps = (state, ownProps) => {
  const boardIndex = state.dashboard.boards.findIndex(board => board.boardId === ownProps.id);
  const {data, query, editing} = state.dashboard.boards[boardIndex];
  const renderColumns = query.columns
    .map((col, index) => {
      return [col.renderInGraph, col.title, index];
    })
    .filter(x => x[0] === true);
  return {
    data,
    query,
    editing,
    renderColumns,
  };
};
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    refresh: () => {
      dispatch(loadDashboardData(ownProps.data.boardId, ownProps.data.query));
    },
    remove: () => {
      dispatch(removeDashboard(ownProps.data.boardId));
    },
    edit: () => {
      dispatch(editDashboard(ownProps.data.boardId, ownProps.data.query));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChartDashboard);
