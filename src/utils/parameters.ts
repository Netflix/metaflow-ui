export function readParameterValue(str: string): string {
  let val;
  try {
    val = JSON.parse(str);
  } catch (e) {
    return str;
  }

  if (!val) {
    return str;
  }

  if (typeof val === 'object') {
    return JSON.stringify(val, null, 2);
  }
  return str;
}