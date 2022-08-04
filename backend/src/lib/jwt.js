const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET_KEY;

const generateToken = (payload, expiresIn = "2d") => {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn
  });

  return token;
};

const verifyToken = (token) => {
  const isVerified = jwt.verify(token, JWT_SECRET);

  return isVerified;
};

// const forgotToken = (token) => {
//   const isActive = jwt.verify(token,JWT_SECRET)

//   return isActive
// }

module.exports = {
  generateToken,
  verifyToken,
};
