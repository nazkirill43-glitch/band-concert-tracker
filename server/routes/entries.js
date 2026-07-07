const router = require("express").Router()
const auth = require("../middleware/auth")
const {
  Entry,
  validateEntry,
  validateEntryUpdate,
} = require("../models/entry")
const { Concert } = require("../models/concert")

router.use(auth)

const isFuture = (date) => new Date(date) > new Date()

router.get("/", async (req, res) => {
  try {
    const filter = { user: req.user._id }
    if (req.query.status) filter.status = req.query.status
    if (req.query.favourite === "true") filter.favourite = true

    const entries = await Entry.find(filter)
      .populate({
        path: "concert",
        populate: { path: "band", select: "name genre" },
      })
      .sort("-updatedAt")
    res.send(entries)
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const entry = await Entry.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate({
      path: "concert",
      populate: { path: "band", select: "name genre" },
    })
    if (!entry) return res.status(404).send({ message: "Entry not found" })
    res.send(entry)
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" })
  }
})

router.post("/", async (req, res) => {
  try {
    const { error } = validateEntry(req.body)
    if (error)
      return res.status(400).send({ message: error.details[0].message })

    const concert = await Concert.findById(req.body.concert)
    if (!concert)
      return res
        .status(400)
        .send({ message: "Selected concert does not exist" })

    if (req.body.status === "attended" && isFuture(concert.date))
      return res
        .status(400)
        .send({ message: "You cannot mark a future concert as attended" })

    const existing = await Entry.findOne({
      user: req.user._id,
      concert: req.body.concert,
    })
    if (existing)
      return res
        .status(409)
        .send({ message: "Entry for this concert already exists" })

    const entry = await new Entry({ ...req.body, user: req.user._id }).save()
    res.status(201).send(entry)
  } catch (error) {
    if (error.code === 11000)
      return res
        .status(409)
        .send({ message: "Entry for this concert already exists" })
    res.status(500).send({ message: "Internal Server Error" })
  }
})

router.put("/:id", async (req, res) => {
  try {
    const { error } = validateEntryUpdate(req.body)
    if (error)
      return res.status(400).send({ message: error.details[0].message })

    const entry = await Entry.findOne({
      _id: req.params.id,
      user: req.user._id,
    })
    if (!entry) return res.status(404).send({ message: "Entry not found" })

    if (req.body.favourite !== undefined) entry.favourite = req.body.favourite

    if (req.body.status !== undefined) {
      const newStatus = req.body.status || null 

      if (newStatus === "attended") {
        const concert = await Concert.findById(entry.concert)
        if (!concert)
          return res.status(400).send({ message: "Concert no longer exists" })
        if (isFuture(concert.date))
          return res
            .status(400)
            .send({ message: "You cannot mark a future concert as attended" })

        entry.status = "attended"
        if (req.body.rating !== undefined) entry.rating = req.body.rating
        if (req.body.review !== undefined) entry.review = req.body.review
      } else {
        entry.status = newStatus
        entry.rating = undefined
        entry.review = ""
      }
    }

    await entry.save()
    res.send(entry)
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const entry = await Entry.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    })
    if (!entry) return res.status(404).send({ message: "Entry not found" })
    res.send({ message: "Entry deleted" })
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" })
  }
})

module.exports = router
