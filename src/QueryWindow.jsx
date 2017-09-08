import React from 'react'
import { connect } from 'react-redux'
import QueryBuilder from './components/querybuilder/QueryBuilder'
const QueryWindow = ({visible}) => {
  if (visible) {
    return (<div className="QueryBuilderWindow"><QueryBuilder /></div>);
  }
  return null;
}

const mapStateToProps = (state) => {
  return {
    visible: state.query.visible
  }
}
export default connect(mapStateToProps)(QueryWindow);
