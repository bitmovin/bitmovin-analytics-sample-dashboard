import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import FilterRow from './components/FilterRow'
import Api from './api';

class FiltersDialog extends Component {
  static propTypes = {
    callback: PropTypes.func,
    queries: PropTypes.array
  };
  constructor(props) {
    super(props);
    this.state = {
      queries: this.props.queries || []
    }
  }
  addQuery() {
    this.setState(prevState => {
      const queries = prevState.queries;
      queries.push({
        key    : String(Math.random()),
        name   : 'Series',
        filters: []
      });

      return {
        ...prevState,
        queries
      }
    });

  }
  addFilter(index) {
    this.setState(prevState => {
      return {
        ...prevState,
        queries: [
          ...prevState.queries.slice(0, index),
          {
            ...prevState.queries[index],
            filters: [
              ...prevState.queries[index].filters,
              {
                key     : String(Math.random()),
                name    : '',
                operator: '',
                value   : ''
              }
            ]
          },
          ...prevState.queries.slice(index + 1)
        ]
      };
    });
  }
  removeSeries(queryIndex) {
    this.setState(prevState => {
      const queries = [
        ...prevState.queries.slice(0, queryIndex),
        ...prevState.queries.slice(queryIndex + 1)
      ];
      return {
        ...prevState,
        queries
      };
    });
  }
  removeFilter(queryIndex, filterIndex) {
    this.setState(prevState => {
      const queries = [
        ...prevState.queries.slice(0, queryIndex),
        {
          ...prevState.queries[queryIndex],
          filters: [
            ...prevState.queries[queryIndex].filters.slice(0, filterIndex),
            ...prevState.queries[queryIndex].filters.slice(filterIndex + 1)
          ]
        },
        ...prevState.queries.slice(queryIndex + 1)
      ];
      return {
        ...prevState,
        queries
      };
    });
  }
  saveDialog () {
    const queries = this.state.queries.map((query, queryIndex) => {
      const filters = query.filters.map((filter, filterIndex) => {
        const filterRowRef = this.refs['filter_' + queryIndex + '_' + filterIndex];

        if (typeof filterRowRef.getFilter === 'function') {
          return filterRowRef.getFilter();
        } else {
          return {};
        }
      });
      const filteredFilters = filters.filter(filter => {
        if (filter.name && filter.operator) {
          if (filter.value || typeof filter.value === 'boolean') {
            return true;
          }
        }

        return false;
      });
      const name = this.refs['seriesName_' + queryIndex].value;
      return {
        filters: filteredFilters,
        name: name
      }
    });

    this.props.callback(queries);
  }
  closeDialog() {
    this.props.callback(this.props.queries);
  }
  renderQueriesTables() {
    const tables = this.state.queries.map((series, queryIndex) => {
      const filters = series.filters;
      const rows = filters.map((filter, filterIndex) => {
        return (
          <FilterRow key={filter.key}
                     ref={'filter_' + queryIndex + '_' + filterIndex}
                     queryIndex={queryIndex}
                     filterIndex={filterIndex}
                     filterName={filter.name}
                     filterOperator={filter.operator}
                     filterValue={String(filter.value)}
                     remove={::this.removeFilter}
          />
        );
      });
      return (
        <div key={series.key}>
          <table className='table'>
            <tbody>
              <tr style={{textAlign: 'center'}}>
                <td style={{width: '200px'}}>
                  <input className='form-control' ref={ 'seriesName_' + queryIndex } type='text' defaultValue={series.name} placeholder='Series Name'/>
                </td>
                <td style={{width: '116px'}}>
                  <button className='btn btn-info btn-sm' onClick={() => {::this.addFilter(queryIndex)}}>Add filter</button>
                </td>
                <td style={{width: '190px'}}>
                  <button className='btn btn-danger btn-sm' onClick={() => {::this.removeSeries(queryIndex)}} style={{display: (this.state.queries.length>1?'block':'none')}}>Remove</button>
                </td>
                <td style={{width: '66px'}}>
                </td>
              </tr>
              {rows}
            </tbody>
          </table>
          <hr></hr>
        </div>
      );
    });
    return tables;
  }
  render () {
		return (<div>
      <div onClick={::this.closeDialog} className='modal-backdrop fade in' style={{zIndex: 1040 }}></div>
      <div className='modal bootstrap-dialog type-primary fade size-normal in' role='dialog' aria-hidden='true' style={{zIndex: 1250, display: 'block', paddingRight: '15px'}}>
        <div className='modal fade' style={{ display: 'block', opacity: 1 }}>
          <div className='modal-dialog'>
            <div className='modal-content'>
              <div className='modal-header'>
                <h3 style={{display: 'inline'}}>Filters</h3>
                <button className='close' style={{float: 'right'}} onClick={::this.closeDialog}><i className='fa fa-times'></i></button>
              </div>
              <div className='modal-body'>
                {this.renderQueriesTables()}
                <button onClick={::this.addQuery} className='btn btn-info'>Add Series</button>
                <button onClick={::this.saveDialog} className='btn btn-success' style={{float: 'right'}}>Apply</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>)
	}
}

const mapStateToProps = (state) => {
  return {
    api: new Api(state)
  }
};
export default connect(mapStateToProps)(FiltersDialog);
