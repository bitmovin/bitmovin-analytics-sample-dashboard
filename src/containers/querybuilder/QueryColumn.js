import { connect } from 'react-redux'
import * as actions from '../../actions/query'
import QueryColumn from '../../components/querybuilder/QueryColumn'

const mapStateToProps = (state, ownProps) => {
  return {
    editingTitle: state.query.columns[ownProps.index].editingTitle,
    renderInGraph: state.query.columns[ownProps.index].renderInGraph
  };
}
const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    removeColumn: () => {
      dispatch(actions.removeColumn(ownProps.index));
    },
    startTitleEdit: () => {
      dispatch(actions.startEditColumnTitle(ownProps.index));
    },
    changeTitle: (title) => {
      dispatch(actions.changeColumnTitle(ownProps.index, title));
    },
    changeRenderInGraph: (visibility) => {
      dispatch(actions.changeColumnRenderInGraph(ownProps.index, visibility));
    }
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(QueryColumn)
