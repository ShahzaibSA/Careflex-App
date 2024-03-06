'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authenticate = function (req, res, next) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ ok: false, message: 'Unauthorized' }); //! Unauthorized

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.TOKEN_SECRET, async (error, decoded) => {
    if (error) return res.status(401).json({ ok: false, message: 'EXPIRED_TOKEN' }); //! Forbidden || Not allowed
    try {
      const user = await User.findOne({ _id: decoded.uid, 'tokens.token': token });
      if (!user) return res.status(403).json({ ok: false, message: 'Authentication Failed' }); //!Not Found
      req.token = token;
      req.user = user;
      next();
    } catch (error) {
      res.status(401).send({ ok: false, error: error || 'Invalid Token' });
    }
  });
};

const admin = function (req, res, next) {
  try {
    if (req.user.role === 'ADMIN') {
      next();
    } else {
      res.status(401).json({ ok: false, message: 'Not Allowed' });
    }
  } catch (error) {
    console.log(error);
    res.status(401).json({ ok: false, message: 'Admin Authentication Failed' });
  }
};

module.exports = { authenticate, admin };
