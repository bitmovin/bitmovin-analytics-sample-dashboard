import moment from 'moment';

export function round10(number) {
  return roundTo(number, 2);
}
export function roundTo(number, places) {
  const base = Math.pow(10, places);
  return Math.round(number * base) / base;
}

export function convertToPercentNumber(number) {
  return number * 100;
}

export function convertArrayToObject(rows) {
  return rows.reduce((total, current) => {
    total[current[0]] = current[1];
    return total;
  }, {});
}
export function leftJoin(
  rows1,
  rows2,
  def = () => {
    return 0;
  }
) {
  return rows1.map(r1 => {
    const row2 = rows2.find(r2 => {
      return r1[0] === r2[0];
    });
    if (!row2) {
      return r1.concat(def(r1));
    }
    return r1.concat(row2.slice(1));
  });
}

export function leftJoinOnTwoColumns(
  rows1,
  rows2,
  def = () => {
    return 0;
  }
) {
  return rows1.map(r1 => {
    const row2 = rows2.find(r2 => {
      return r1[0] === r2[0] && r1[1] === r2[1];
    });
    if (!row2) {
      return r1.concat(def(r1));
    }
    return r1.concat(row2.slice(2));
  });
}

export function sliceRows(rows, start, end) {
  return rows.map(row => {
    return row.slice(start, end);
  });
}

export function formatTime(time, interval) {
  switch (interval) {
    case 'DAY':
      return moment(time).format('YYYY-MM-DD');
    case 'HOUR':
      return moment(time).format('YYYY-MM-DD HH:MM');
    case 'MONTH':
      return moment(time).format('YYYY-MM');
    default:
      return time;
  }
}

export function find80Percent(data, dataSelector) {
  const mapped = data.map(dataSelector);
  const total = mapped.reduce((a, b) => a + b, 0);
  const threshHold = total * 0.98;
  let running = 0;
  let i = 0;
  mapped.forEach(x => {
    running += x;
    if (running < threshHold) {
      i++;
    }
  });
  return i;
}

export function groupUnsortedToNBuckets(data, buckets, bucketCreator) {
  return [...data.slice(0, buckets), bucketCreator(data.slice(buckets))];
}

export function groupToNBuckets(data, buckets, bucketSelector, bucketCreator) {
  const sortedBuckets = data.sort(bucketSelector).reverse();
  return [...sortedBuckets.slice(0, buckets - 1), bucketCreator(sortedBuckets.slice(buckets))];
}

export function sortByFirstColumn(data) {
  return data.slice(0, data.length).sort((a, b) => {
    return a[0] - b[0];
  });
}
