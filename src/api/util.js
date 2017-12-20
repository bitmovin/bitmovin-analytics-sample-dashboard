import moment from 'moment';

export function round10 (number) {
  return roundTo(number, 2);
}

export function roundTo (number, places) {
  const base = Math.pow(10, places);
  return Math.round(number * base) / base;
}

export function leftJoin (rows1, rows2, def = () => { return 0 }) {
  return rows1.map((r1) => {
    const row2 = rows2.find((r2) => {
      return r1[0] === r2[0];
    });
    if (!row2) {
      return r1.concat(def(r1));
    }
    return r1.concat(row2.slice(1));
  })
}

export function leftJoinOnTwoColumns (rows1, rows2, def = () => { return 0}) {
  return rows1.map(r1 => {
    const row2 = rows2.find((r2) => {
      return r1[0] === r2[0] && r1[1] === r2[1];
    })
    if (!row2) {
      return r1.concat(def(r1));
    }
    return r1.concat(row2.slice(2));
  })
}

export function sliceRows(rows, start, end) {
  return rows.map((row) => {
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

export function groupToNBuckets(data, buckets, bucketSelector, bucketCreator) {
  const sortedBuckets = data.sort(bucketSelector).reverse();
  return [...sortedBuckets.slice(0, buckets - 1), bucketCreator(sortedBuckets.slice(buckets))];
}
