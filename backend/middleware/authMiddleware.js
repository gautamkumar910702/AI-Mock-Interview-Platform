const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    // ==========================================
    // Authorization Header
    // ==========================================

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,

        message: "Authorization token is missing.",
      });
    }

    // ==========================================
    // Extract Token
    // ==========================================

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,

        message: "Token not found.",
      });
    }

    // ==========================================
    // Verify Token
    // ==========================================

    const decoded = jwt.verify(
      token,

      process.env.JWT_SECRET,
    );

    req.user = {
      id: decoded.id,

      email: decoded.email,
    };

    next();
  } catch (error) {
    console.log(error);

    return res.status(401).json({
      success: false,

      message: "Invalid or expired token.",
    });
  }
};

module.exports = authMiddleware;
