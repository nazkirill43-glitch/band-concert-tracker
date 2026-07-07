const mongoose = require("mongoose")
const Joi = require("joi")

const entrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    concert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Concert",
      required: true,
    },
    favourite: { type: Boolean, default: false },
    status: { type: String, enum: ["planned", "attended", null], default: null },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String, default: "" },
  },
  { timestamps: true }
)

entrySchema.index({ user: 1, concert: 1 }, { unique: true })

const Entry = mongoose.model("Entry", entrySchema)

const ratingRule = Joi.number()
  .integer()
  .min(1)
  .max(5)
  .when("status", {
    is: "attended",
    then: Joi.optional().allow(null),
    otherwise: Joi.forbidden(),
  })
  .label("Rating")

const reviewRule = Joi.string()
  .allow("")
  .max(1000)
  .when("status", {
    is: "attended",
    then: Joi.optional(),
    otherwise: Joi.forbidden(),
  })
  .label("Review")

const statusRule = Joi.string()
  .valid("planned", "attended")
  .allow(null, "")
  .label("Status")

const validateEntry = (data) => {
  const schema = Joi.object({
    concert: Joi.string().hex().length(24).required().label("Concert"),
    favourite: Joi.boolean().label("Favourite"),
    status: statusRule,
    rating: ratingRule,
    review: reviewRule,
  })
  return schema.validate(data)
}

const validateEntryUpdate = (data) => {
  const schema = Joi.object({
    favourite: Joi.boolean().label("Favourite"),
    status: statusRule,
    rating: ratingRule,
    review: reviewRule,
  })
  return schema.validate(data)
}

module.exports = { Entry, validateEntry, validateEntryUpdate }
