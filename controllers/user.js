const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const crypto = require("crypto");
const sgmail = require("@sendgrid/mail");

const User = require("../models/User");
const UserResetPassword = require("../models/UserResetPassword");

sgmail.setApiKey(config.get("apiKeysendgrid"));

exports.postRegisterUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let { username, email, password } = req.body;

  try {
    let user = await User.findOne({ where: { email } });

    if (user) {
      return res.status(400).json({ errors: [{ msg: "User already exists" }] });
    }

    const salt = await bcrypt.genSalt(10);

    password = await bcrypt.hash(password, salt);

    await User.create({ username, email, password });

    user = await User.findOne({ where: { email } });

    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ msg: "User created", token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.postLoginUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    let user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: "Invalid credentials" }] });
    }

    const payload = { user: { id: user.id } };

    jwt.sign(
      payload,
      config.get("jwtSecret"),
      {
        expiresIn: 3600,
      },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.postResetPassword = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  crypto.randomBytes(32, async (err, buffer) => {
    if (err) {
      console.log(err);
      return;
    }

    const token = buffer.toString("hex");

    const { email } = req.body;

    try {
      let user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(400).json({
          errors: [{ msg: "this email does NOT exist in our records" }],
        });
      }

      let resetToken = token;
      let resetTokenExpiration = Date.now() + 3600;
      let isActive = "yes";
      let userId = user.id;

      await UserResetPassword.create({
        resetToken,
        resetTokenExpiration,
        isActive,
        userId,
      });

      await sgmail.send({
        from: "carlosa@acrdigitalmarketing.com",
        to: email,
        subject: "Password reset",
        html: `<p>You requested a password reset</p>
        <p>Click this <a href="http://localatlas.com/reset/${token}">link</a> to set a new password</p>
        `,
      });

      res.json({ msg: "Email sent", token });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ msg: "Server error" });
    }
  });
};
