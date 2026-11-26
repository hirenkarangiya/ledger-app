// Creates an error with an HTTP status code.
// The error handler in app.js reads err.status and sends it to the client.
export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}