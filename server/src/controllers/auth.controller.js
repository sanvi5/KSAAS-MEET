const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { JWT_SECRET } = require("../config/env")

const login = async (req, res) => {
  try {
    const { idNumber, password } = req.body

    if (!idNumber || !password) {
      return res.status(400).json({ message: "ID number and password are required" })
    }

    const user = await User.findOne({ idNumber: String(idNumber).trim() })

    if (!user || !user.active) {
      return res.status(401).json({ message: "User not allowed" })
    }

    const isMatch = await bcrypt.compare(String(password), user.password)

    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" })
    }

    const token = jwt.sign(
      {
        id: user._id,
        idNumber: user.idNumber,
        role: user.role
      },
      JWT_SECRET || "ksaas_secret_key_change_this",
      { expiresIn: "12h" }
    )

    return res.json({
      token,
      role: user.role,
      idNumber: user.idNumber
    })
  } catch (error) {
    console.error("Login error:", error.message)
    return res.status(500).json({ message: "Login error" })
  }
}

module.exports = { login }