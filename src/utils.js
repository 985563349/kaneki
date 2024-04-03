export function isPlainObject(o) {
  if (!hasObjectPrototype(o)) {
    return false;
  }

  const ctor = o.constructor;
  if (ctor === undefined) {
    return true;
  }

  const prot = ctor.prototype;
  if (!hasObjectPrototype(prot)) {
    return false;
  }

  if (!prot.hasOwnProperty('isPrototypeOf')) {
    return false;
  }

  return true;
}

function hasObjectPrototype(o) {
  return Object.prototype.toString.call(o) === '[object Object]';
}

export function parseQueryKey(queryKey, data) {
  return queryKey.map((key) => (isFunction(key) ? key(data) : key));
}

export function hashQueryKey(queryKey) {
  return JSON.stringify(queryKey, (_, val) =>
    isPlainObject(val)
      ? Object.keys(val)
          .sort()
          .reduce((result, key) => {
            result[key] = val[key];
            return result;
          }, {})
      : val
  );
}

export function isFunction(value) {
  return typeof value === 'function';
}
