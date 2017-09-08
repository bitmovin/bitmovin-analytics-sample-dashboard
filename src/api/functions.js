import * as util from './util'

export const formatters = {
  'pct': (value) => {
    return util.roundTo(value, 2);
  },
  'float': (value) => {
    return util.rountTo(value, 2);
  }
}
function parseArguments(promises, args) {
  const argumentPromises = [];
  for(let arg of args) {
    const regex = new RegExp(/^\$(\d)+$/);
    const match = regex.exec(arg);
    if (match !== null) {
      argumentPromises.push(promises[parseInt(match[1], 10)]);
    }
  }
  return argumentPromises;
}
function joinPromises(promises) {
  let rows = util.sliceRows(promises[0], 0, 1);
  for (const arg of promises) {
    rows = util.leftJoin(rows, arg);
  }
  return rows;
}
function setFormatter(formatter) {
  if (!formatter) {
    return (value) => { return value; };
  } else if (!(typeof formatter === 'function')) {
    return formatters[formatter.toLowerCase()];
  }
  return formatter;
}

function func(promises, args, formatter, fn) {
  if (args.length > 2)
    throw new Error("Function can't have more than two arguments" );

  formatter = setFormatter(formatter);

  const argumentPromises = parseArguments(promises, args);
  return new Promise((resolve, reject) => {
    Promise.all(argumentPromises)
      .then((args) => {
        const rows = joinPromises(args);
        const result = rows.map((row) => {
          return [row[0], formatter(fn(row[1], row[2]))];
        });
        resolve(result);
      });
  });
}

export function div (promises, args, formatter) {
  return func(promises, args, formatter, (a,b) => {
    return a / b;
  });
}

export function add (promises, args, formatter) {
  return func(promises, args, formatter, (a, b) => { return a + b; });
}

export function mult (promises, args, formatter) {
  return func(promises, args, formatter, (a, b) => { return a * b; });
}

export function sub (promises, args, formatter) {
  return func(promises, args, formatter, (a, b) => { return a - b; });
}
