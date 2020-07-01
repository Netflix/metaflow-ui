type Handler = (k: string, v: string, useClean?: boolean) => void;

export function getParamChangeHandler(params: URLSearchParams, fn: (q: string) => void, clean: () => void): Handler {
  return (key, value, useClean) => {
    if (value === null || value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    fn(params.toString());
    useClean ?? clean();
  };
}
