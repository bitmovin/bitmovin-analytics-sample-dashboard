import urljoin from 'url-join'
import * as functions from './functions'
import * as util from './util'
import { nameOptions } from '../constants/queryfields'
import Bitmovin from 'bitmovin-javascript'

export const apiBasePath = 'https://api.bitmovin.com/v1/';
export const analyticsApi = urljoin(apiBasePath, 'analytics');
const globalQueriesApi = urljoin(analyticsApi, 'globalqueries');

export const checkResponseStatus = (response, query, queryFunction) => {
  if (response.status >= 200 && response.status < 300) {
    return response
  } else {
    let error = new Error(response.statusText);
    error.response = response;
    throw error
  }
};

export const parseJson = (response) => { return response.json() };

export function orderBy (column, order) {
  return { name: column, order };
}
export function filter (name, operator, value) {
  return { name, operator: operator.toUpperCase(), value };
}
class Api {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.bitmovin = new Bitmovin({apiKey})
  }

  filter (name, operator, value) {
    return filter(name, operator, value);
  }

  orderBy (column, order) {
    return orderBy(column, order);
  }

  mapFilterColumns(filter) {
    let value = filter.value;
    if (nameOptions[filter.name].type === 'number') {
      value = parseFloat(value);
    }
    return {
      name: filter.name,
      operator: filter.operator,
      value
    }
  }

  query(query) {
    const { start, end, interval } = query;
    const q = { start: start.format(), end: end.format(), interval };
    const promises = [];
    const results = query.columns.map((column) => {
      if (column.type === 'query') {
        const newQuery = {
          ...q,
          dimension: column.queryField,
          filters: column.filters.map(filter => { return this.mapFilterColumns(filter) })
        };
        const promise = this.fetchAnalytics(column.queryFunction.toLowerCase(), newQuery);
        promises.push(promise);
        return promise;
      } else if (column.type === 'func') {
        const promise = functions[column.name](promises, column.args, column.format);
        promises.push(promise);
        return promise;
      }
      return null;
    });
    return new Promise((resolve, reject) => {
      Promise.all(results).then((res) => {
        const combined = res.reduce((total, one) => {
          return util.leftJoin(total, one);
        }, util.sliceRows(res[0], 0, 1));
        resolve(this.formatTimeColumn(combined, query.interval));
      });
    });
  }

  formatTimeColumn(rows, interval) {
    return rows.map(row => {
      row[0] = util.formatTime(row[0], interval);
      return row;
    });
  }

  fetchAnalytics (queryFunction, query) {
    return this.bitmovin.analytics.queries[queryFunction.toLowerCase()]({...query, licenseKey: this.getLicenseKey()}).then(x => x.rows)
  }

  builder () {
    return this.bitmovin.analytics.queries.builder
  }

  fetchGlobalAnalytics(metric, query) {
    const url = urljoin(globalQueriesApi, metric.toLowerCase());

    const promise = fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.apiKey,
      },
      body: JSON.stringify(query)
    })
    .then((response) => {
      return checkResponseStatus(response, metric, query)
    })
    .then(parseJson)
    .then((response) => {
      return response.data.result.rows;
    }).catch(err => {
      console.error(url, query, err);
      throw err;
    });
    return promise;
  }

  getImpression (impressionId) {
    return this.bitmovin.analytics.impressions(impressionId, this.getLicenseKey())
  }

  getAnalyticsLicenseKeys() {
    return this.bitmovin.analytics.licenses.list().then(response => response.items)
  }

  getLicenseKey() {
    return window.bitmovinAnalyticsLicenseKey;
  }
}
export default Api;
