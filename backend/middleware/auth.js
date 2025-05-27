const jwt = require("jsonwebtoken");

function authenticateJWT(req, res, next) {
  const prefix = process.env.API_PREFIX || "/api";
  const openPaths = [`${prefix}/login`, `${prefix}/register`];

  if (openPaths.includes(req.path)) {
    return next();
  }
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];

    jwt.verify(
      token,
      process.env.JWT_SECRET || "default_jwt_secret",
      (err, user) => {
        if (err) return res.status(403).json({ message: "Forbidden" });

        req.user = user;
        // Log the user information for debugging
        // console.log("Authenticated user:", req.user);
        next();
      }
    );
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = authenticateJWT;
