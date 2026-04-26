const { google } = require("googleapis")
const bcrypt = require("bcrypt")

const User = require("../models/User")

async function syncUsers() {

  try {

    const sheets = google.sheets({
      version: "v4",
      auth: process.env.GOOGLE_API_KEY
    })

    const response = await sheets.spreadsheets.values.get({

      spreadsheetId: process.env.SHEET_ID,
      range: "Sheet1!A2:C"

    })

    const rows = response.data.values

    if (!rows) {
      console.log("No data found in Google Sheet")
      return
    }

    for (let row of rows) {

      const idNumber = row[0]
      const password = row[1]
      const role = row[2]

      const existingUser = await User.findOne({ idNumber })

      if (!existingUser) {

        const hashedPassword = await bcrypt.hash(password, 10)

        await User.create({
          idNumber,
          password: hashedPassword,
          role
        })

        console.log("User added:", idNumber)

      }

    }

    console.log("Google Sheet sync completed")

  } catch (error) {

    console.error("Google Sheet sync error:", error)

  }

}

module.exports = syncUsers