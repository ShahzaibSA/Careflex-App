function errorMiddleware(error, req, res, next) {
  if (error.isJoi) {
    return res.status(422).json({ ok: false, error: error.details[0].message });
  }
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';
  res.status(status).json({ ok: false, message });
}

module.exports = errorMiddleware;
