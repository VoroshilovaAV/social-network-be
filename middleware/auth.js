const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = function(req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'Отсутствует токен авторизации' });

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Неверный токен авторизации' });
  }
};
