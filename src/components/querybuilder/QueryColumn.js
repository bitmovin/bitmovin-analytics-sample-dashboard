import React, {PropTypes, Component} from 'react';
import DataQueryColumn from './DataQueryColumn';
import FuncQueryColumn from './FuncQueryColumn';
import ToggleButton from '../ToggleButton';

class QueryColumn extends Component {
  static propTypes = {
    column: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    removeColumn: PropTypes.func.isRequired,
  };
  render() {
    let columnInfo = null;
    if (this.props.column.type === 'query') {
      columnInfo = <DataQueryColumn column={this.props.column} index={this.props.index} />;
    }
    if (this.props.column.type === 'func') {
      columnInfo = <FuncQueryColumn column={this.props.column} index={this.props.index} />;
    }
    let titleOrEditor = (
      <h4
        className="card-title"
        onClick={() => {
          this.props.startTitleEdit();
        }}>
        {this.props.column.title}
      </h4>
    );
    if (this.props.editingTitle === true) {
      titleOrEditor = (
        <div>
          <input
            ref="title"
            type="text"
            defaultValue={this.props.column.title}
            onBlur={evt => {
              this.props.changeTitle(evt.target.value);
            }}
          />
        </div>
      );
    }
    return (
      <div className="card">
        <div className="card-header card-header-icon" data-background-color="blue">
          <i className={`fa fa-puzzle-piece`} />
        </div>
        <div className="card-content">
          <div className="col-md-6">{titleOrEditor}</div>
          <div className="text-right">
            <ToggleButton
              checked={this.props.renderInGraph}
              onChange={visibility => {
                this.props.changeRenderInGraph(visibility);
              }}
              label="Show as Graph line"
            />
            <button className="btn btn-danger btn-xs removeColumn" onClick={this.props.removeColumn}>
              <i className="fa fa-times-circle" /> Remove Column
            </button>
          </div>

          <div className="row" style={{paddingTop: '30px'}}>
            <div className="column">{columnInfo}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default QueryColumn;
