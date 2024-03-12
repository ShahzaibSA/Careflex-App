'use strict';

module.exports = function (req, res, next) {
  if (req.user.role !== 'HOME') {
    return res.status(404).json({ ok: false, error: 'You are not authorized' });
  }
  next();
};
