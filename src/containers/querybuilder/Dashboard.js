import Dashboard from '../../components/querybuilder/Dashboard';
import {connect} from 'react-redux';
import {loadDashboardData} from '../../actions/dashboard';

const mapStateToProps = (state, ownProps) => {
  const boardIndex = state.dashboard.boards.findIndex(board => board.boardId === ownProps.id);
  const {data, query} = state.dashboard.boards[boardIndex];
  return {
    data,
    query,
  };
};
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    refresh: () => {
      dispatch(loadDashboardData(ownProps.data.boardId, ownProps.data.query));
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard);
