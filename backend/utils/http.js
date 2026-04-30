const sendSuccess = (res, payload = {}, status = 200) =>
  res.status(status).json({
    success: true,
    ...payload
  });

const sendError = (res, status, code, error, details) =>
  res.status(status).json({
    success: false,
    code,
    error,
    ...(details !== undefined ? { details } : {})
  });

module.exports = {
  sendSuccess,
  sendError
};
