const router = require("express").Router()
const auth = require("../middleware/auth")
const admin = require("../middleware/admin")
const { Band, validateBand } = require("../models/band")
const { Concert } = require("../models/concert")
const { Entry } = require("../models/entry")

router.use(auth)

router.get("/", async (req, res) => {
  try {
    const bands = await Band.find().sort("name")
    res.send(bands)
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const band = await Band.findById(req.params.id)
    if (!band) return res.status(404).send({ message: "Band not found" })
    res.send(band)
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" })
  }
})


router.post("/", admin, async (req, res) => {
  try {
    const { error } = validateBand(req.body)
    if (error)
      return res.status(400).send({ message: error.details[0].message })
    const band = await new Band(req.body).save()
    res.status(201).send(band)
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" })
  }
})

router.put("/:id", admin, async (req, res) => {
  try {
    const { error } = validateBand(req.body)
    if (error)
      return res.status(400).send({ message: error.details[0].message })
    const band = await Band.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
    if (!band) return res.status(404).send({ message: "Band not found" })
    res.send(band)
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" })
  }
})

router.delete("/:id", admin, async (req, res) => {
  try {
    const band = await Band.findByIdAndDelete(req.params.id)
    if (!band) return res.status(404).send({ message: "Band not found" })

    const concerts = await Concert.find({ band: band._id }).select("_id")
    const concertIds = concerts.map((c) => c._id)
    await Concert.deleteMany({ band: band._id })
    await Entry.deleteMany({ concert: { $in: concertIds } })
    res.send({ message: "Band deleted" })
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" })
  }
})

module.exports = router
