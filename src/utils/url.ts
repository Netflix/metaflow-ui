export function getParamChangeHandler(params: URLSearchParams, fn: (q: string) => void, clean: () => void) {
  return (key: string, value: string, useClean?: boolean) => {
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    fn(params.toString());
    useClean ?? clean();
  };
}
