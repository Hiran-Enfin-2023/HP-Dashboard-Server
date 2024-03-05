var mongoose = require("mongoose");
const bcrypt = require("bcrypt");

var adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (value) {
          return this.model("admins")
            .findOne({ name: value })
            .then((admin) => !admin);
        },
        message: (props) => `${props.value} is already used by another user`,
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/, "Invalid email format"],
      validate: {
        validator: function (value) {
          return this.model("admins")
            .findOne({ email: value })
            .then((admin) => !admin);
        },
        message: (props) => `${props.value} is already used by another user`,
      },
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving it to the database
adminSchema.pre("save", async function (next) {
  const admin = this;
  if (!admin.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt();
    admin.password = await bcrypt.hash(admin.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

module.exports = mongoose.model("admins", adminSchema);
