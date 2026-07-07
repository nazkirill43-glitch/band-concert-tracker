const mongoose = require("mongoose")
const Joi = require("joi")

const concertSchema = new mongoose.Schema(
  {
    band: { type: mongoose.Schema.Types.ObjectId, ref: "Band", required: true },
    venue: { type: String, required: true },
    city: { type: String, default: "" },
    date: { type: Date, required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
)

const Concert = mongoose.model("Concert", concertSchema)

const validateConcert = (data) => {
  const schema = Joi.object({
    band: Joi.string().hex().length(24).required().label("Band"),
    venue: Joi.string().min(1).max(120).required().label("Venue"),
    city: Joi.string().allow("").max(80).label("City"),
    date: Joi.date().required().label("Date"),
    notes: Joi.string().allow("").max(1000).label("Notes"),
  })
  return schema.validate(data)
}

module.exports = { Concert, validateConcert }
