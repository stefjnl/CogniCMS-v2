/**
 * Jest style mock for CSS and preprocessor imports.
 * Returns a proxy object so className lookups do not fail.
 */
module.exports = new Proxy(
  {},
  {
    get: (target, prop) => (prop === "__esModule" ? false : String(prop)),
  }
);