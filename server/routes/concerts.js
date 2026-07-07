const router = require("express").Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { Concert, validateConcert } = require("../models/concert");
const { Band } = require("../models/band");
const { Entry } = require("../models/entry");

router.use(auth);

router.get("/", async (req, res) => {
  try {
    const concerts = await Concert.find()
      .populate("band", "name genre")
      .sort("-date");
    res.send(concerts);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/:id/reviews", async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id);
    if (!concert) return res.status(404).send({ message: "Concert not found" });

    const entries = await Entry.find({
      concert: req.params.id,
      status: "attended",
      $or: [{ rating: { $ne: null } }, { review: { $nin: ["", null] } }],
    })
      .populate("user", "firstName lastName")
      .sort("-updatedAt");

    const rated = entries.filter((e) => typeof e.rating === "number");
    const average = rated.length
      ? Math.round(
          (rated.reduce((s, e) => s + e.rating, 0) / rated.length) * 10,
        ) / 10
      : null;

    res.send({
      average,
      count: entries.length,
      reviews: entries.map((e) => ({
        _id: e._id,
        user: e.user ? `${e.user.firstName} ${e.user.lastName}` : "User",
        rating: e.rating ?? null,
        review: e.review || "",
        updatedAt: e.updatedAt,
      })),
    });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const concert = await Concert.findById(req.params.id).populate(
      "band",
      "name genre",
    );
    if (!concert) return res.status(404).send({ message: "Concert not found" });
    res.send(concert);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.post("/", admin, async (req, res) => {
  try {
    const { error } = validateConcert(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const band = await Band.findById(req.body.band);
    if (!band)
      return res.status(400).send({ message: "Selected band does not exist" });

    const concert = await new Concert(req.body).save();
    const populated = await concert.populate("band", "name genre");
    res.status(201).send(populated);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.put("/:id", admin, async (req, res) => {
  try {
    const { error } = validateConcert(req.body);
    if (error)
      return res.status(400).send({ message: error.details[0].message });

    const band = await Band.findById(req.body.band);
    if (!band)
      return res.status(400).send({ message: "Selected band does not exist" });

    const concert = await Concert.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("band", "name genre");
    if (!concert) return res.status(404).send({ message: "Concert not found" });
    res.send(concert);
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

router.delete("/:id", admin, async (req, res) => {
  try {
    const concert = await Concert.findByIdAndDelete(req.params.id);
    if (!concert) return res.status(404).send({ message: "Concert not found" });
    await Entry.deleteMany({ concert: concert._id });
    res.send({ message: "Concert deleted" });
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
