const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const rounds = parseInt(process.env.ROUNDS);
const bcrypt = require("bcrypt");
const { ENUM } = require("../config/constant.config");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      trim: true,
      required: true,
    },

    firstName: {
      type: String,
      trim: true,
      default: ENUM.FIRSTNAME,
    },

    lastName: {
      type: String,
      trim: true,
      default: ENUM.LASTNAME,
    },

    mobile: {
      type: Number,
      trim: true,
      default: ENUM.MOBILE,
    },

    country: {
      type: String,
      trim: true,
      default: ENUM.COUNTRY,
    },

    state: {
      type: String,
      trim: true,
      default: ENUM.STATE,
    },

    cloudinary_id: {
      type: String,
      default: ""
    },

    url: {
      type: String,
      default: ""
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew("password")) {
    const salt = await bcrypt.genSalt(rounds);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    const salt = await bcrypt.genSalt(rounds);
    update.password = await bcrypt.hash(update.password, salt);
  }
  next();
});
const user = mongoose.model("user", userSchema);
module.exports = user;
