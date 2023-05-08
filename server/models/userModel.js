const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: {
      value: true,
      message: "A User must have a Name",
    },
    minlength: [5, "Name Must be greater than 5 characters"],
    maxlength: [15, "Name Must be less than 15 characters"],
  },
  email: {
    type: String,
    trim: true,
    required: {
      value: true,
      message: "A User must have an E-mail",
    },
    unique: true,
    validate: {
      validator: function (value) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/.test(value);
      },
      message: "Email should match the format",
    },
    minlength: [5, "Email Must be greater than 5 characters"],
    maxlength: [25, "Email Must be less than 25 characters"],
  },
  photo: String,
  designation: {
    type: String,
    required: [true, "A User must have a Designation"],
  },
  role: {
    type: String,
    enum: {
      values: ["admin", "user", "author"],
      message: "Must be admin or user or author",
    },
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Password is Required"],
    trim: true,
    validate: {
      validator: function (value) {
        return /^(?=.*[!@#$%^&*()_+{}:"<>?|[\]\\;',./`~])(?=.*[A-Z])(?=.*[0-9])[A-Za-z0-9!@#$%^&*()_+{}:"<>?|[\]\\;',./`~]{8,20}$/.test(
          value
        );
      },
      message:
        "Password must have atleast a special character,an upper-case alphabet and a number and length between 8 to 20 chars.",
    },
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "Confirm Password is Must"],
    trim: true,
    validate: {
      validator: function (value) {
        return this.password === value;
      },
      message: "It should match with the password",
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetTokenExpiresIn: {
    type: Date,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});

userSchema.methods.correctPassword = async function (password) {
  if (!password) {
    return false;
  }
  return bcrypt.compare(password, this.password);
};

userSchema.methods.passwordChanged = function (issuedAt) {
  if (this.passwordChangedAt) {
    return parseInt(this.passwordChangedAt.getTime() / 1000) > issuedAt;
  }
  return false;
};

userSchema.methods.createPasswordResetToken=function()
{
    const token = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    this.passwordResetToken=hashedToken;
    this.passwordResetTokenExpiresIn=Date.now()+10*60*1000;
    return token;
}

const User = new mongoose.model("User", userSchema);
module.exports = User;


