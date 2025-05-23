let logoutFn: () => void = () => {};

export function registerLogout(fn: () => void) {
  logoutFn = fn;
}

export function callLogout() {
  logoutFn();
}
