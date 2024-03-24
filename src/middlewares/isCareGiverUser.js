'use strict';

module.exports = function (req, res, next) {
  if (req.user.role === 'GIVER' || req.user.role === 'ADMIN') next();
  else {
    return res.status(403).json({ ok: false, error: 'You are not authorized to perform this action.' });
  }
};
