import {connect} from 'react-redux';
import DashboardList from '../../components/querybuilder/DashboardList';

const mapStateToProps = state => {
  return {
    dashboards: state.dashboard.boards,
  };
};
const mapDispatchToProps = (dispatch, getState) => {
  return {};
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashboardList);
