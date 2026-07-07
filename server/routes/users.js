const router = require("express").Router()
const { User, validate } = require("../models/user")
const auth = require("../middleware/auth")
const bcrypt = require("bcrypt")

router.post("/", async (req, res) => {
  try {
    const { error } = validate(req.body)
    if (error)
      return res.status(400).send({ message: error.details[0].message })

    const exists = await User.findOne({ email: req.body.email })
    if (exists)
      return res
        .status(409)
        .send({ message: "User with given email already exists!" })

    const salt = await bcrypt.genSalt(Number(process.env.SALT))
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    await new User({
      ...req.body,
      password: hashPassword,
      role: "user",
    }).save()
    res.status(201).send({ message: "User created successfully" })
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" })
  }
})

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password")
    if (!user) return res.status(404).send({ message: "User not found" })
    res.send(user)
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" })
  }
})

module.exports = router
