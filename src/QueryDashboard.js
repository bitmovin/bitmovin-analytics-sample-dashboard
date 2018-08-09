import React, {Component} from 'react';
import {connect} from 'react-redux';
import {addDashboard} from './actions/dashboard';
import QueryBuilder from './components/querybuilder/QueryBuilder';
import DashboardList from './containers/querybuilder/DashboardList';

class QueryDashboard extends Component {
  componentDidMount() {
    this.props.setupDefaultDashboard();
  }
  render() {
    return (
      <div>
        <DashboardList />
        <QueryBuilder />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {};
};
const mapDispatchToProps = dispatch => {
  return {
    setupDefaultDashboard: () => {
      dispatch((dispatch, getState) => {
        if (getState().dashboard.boards.length === 0) {
          dispatch(addDashboard(getState().query, 'chart'));
        }
      });
    },
  };
};
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(QueryDashboard);
