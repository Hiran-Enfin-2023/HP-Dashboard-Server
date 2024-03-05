const jwt = require("jsonwebtoken");

exports.authenticateUser = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({
      message: "No Token provided",
    });
  } else {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        res.status(401).json({
          message: "token is not valid",
        });
      } else {
        req.userId = user.id;
        next();
      }
    });
  }
};
