'use strict';

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authenticate = async function (req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.sendStatus(401); //! Unauthorized

  const token = authHeader.split(' ')[1];

  const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
  if (!decoded) return res.status(403).json({ error: 'EXPIRED_TOKEN' }); //! Forbidden || Not allowed

  try {
    const user = await User.findOne({ _id: decoded.uid, 'tokens.token': token });
    if (!user) return res.sendStatus(404); //!Not Found
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(500).send({ error: 'Authentication Failed' });
  }
};

module.exports = authenticate;
