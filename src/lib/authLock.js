let last = Promise.resolve();
export const withAuthLock = (fn) => {
  const run = last.finally(() => fn());
  last = run.catch(() => {});
  return run;
};
