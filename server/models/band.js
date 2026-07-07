const mongoose = require("mongoose")
const Joi = require("joi")

const bandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    genre: { type: String, default: "" },
    country: { type: String, default: "" },
    formedYear: { type: Number },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
)

const Band = mongoose.model("Band", bandSchema)

const validateBand = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(1).max(100).required().label("Name"),
    genre: Joi.string().allow("").max(60).label("Genre"),
    country: Joi.string().allow("").max(60).label("Country"),
    formedYear: Joi.number()
      .integer()
      .min(1900)
      .max(new Date().getFullYear())
      .allow(null)
      .label("Formed Year"),
    notes: Joi.string().allow("").max(1000).label("Notes"),
  })
  return schema.validate(data)
}

module.exports = { Band, validateBand }
