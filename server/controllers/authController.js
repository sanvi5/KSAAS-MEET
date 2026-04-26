const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const login = async (req, res) => {
  try {
    const { idNumber, password } = req.body

    const user = await User.findOne({ idNumber })

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    const validPassword = await bcrypt.compare(password, user.password)

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid password" })
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        idNumber: user.idNumber
      },
      process.env.JWT_SECRET || "supersecretkey",
      { expiresIn: "12h" }
    )

    res.json({
      token,
      role: user.role,
      idNumber: user.idNumber
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error during login" })
  }
}

module.exports = { login }