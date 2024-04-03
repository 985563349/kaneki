export function parseQueryKey(queryKey, data) {
  return queryKey.map((key) => (isFunction(key) ? key(data) : key));
}

export function hashQueryKey(queryKey) {
  return JSON.stringify(queryKey);
}

export function isFunction(value) {
  return typeof value === 'function';
}
