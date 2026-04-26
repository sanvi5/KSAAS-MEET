const { google } = require("googleapis")
const bcrypt = require("bcrypt")
const User = require("../models/User")
const { GOOGLE_API_KEY, SHEET_ID } = require("../config/env")

const allowedRoles = ["host", "admin", "participant"]

const syncUsers = async () => {
  try {
    if (!GOOGLE_API_KEY || !SHEET_ID) {
      console.log("Google Sheets config missing, skipping sync")
      return
    }

    const sheets = google.sheets({
      version: "v4",
      auth: GOOGLE_API_KEY
    })

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A2:D"
    })

    const rows = response.data.values || []

    if (rows.length === 0) {
      console.log("No rows found in Google Sheet")
      return
    }

    for (const row of rows) {
      const [idNumber, password, role, active] = row

      if (!idNumber || !password || !role) {
        continue
      }

      const cleanId = String(idNumber).trim()
      const normalizedRole = String(role).trim().toLowerCase()
      const isActive = String(active).trim().toLowerCase() === "true"

      if (!allowedRoles.includes(normalizedRole)) {
        console.log(`Skipping ${cleanId}: invalid role "${role}"`)
        continue
      }

      const existingUser = await User.findOne({ idNumber: cleanId })

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(String(password), 10)

        await User.create({
          idNumber: cleanId,
          password: hashedPassword,
          role: normalizedRole,
          active: isActive
        })
      } else {
        existingUser.role = normalizedRole
        existingUser.active = isActive

        if (password) {
          existingUser.password = await bcrypt.hash(String(password), 10)
        }

        await existingUser.save()
      }
    }

    console.log("Users synced from Google Sheets")
  } catch (error) {
    console.error("Google sync error:", error.message)
  }
}

module.exports = syncUsers