const bcrypt = require("bcrypt");
const NGO = require("../models/NGOSchema.js");
const Sclass = require("../models/sclassSchema.js");
const Student = require("../models/studentSchema.js");
const Teacher = require("../models/teacherSchema.js");
const Subject = require("../models/subjectSchema.js");
const Notice = require("../models/noticeSchema.js");
const Complain = require("../models/complainSchema.js");

const NGORegister = async (req, res) => {
  try {
    const existingNGOByEmail = await NGO.findOne({ email: req.body.email });
    const existingNGOByName = await NGO.findOne({ name: req.body.name });
    const salt = await bcrypt.genSalt(10);
    console.log("created salt");
    console.log(salt);
    console.log(req.body);
    console.log(req.body.password);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    console.log("hashed pass");
    console.log(hashedPass);

    // upload images and get url for bank statement and address prrof
    console.log("adding ngo");
    const ngo = new NGO({
      ...req.body,
      password: hashedPass,
    });
    console.log("ngo object");
    console.log(ngo);

    if (existingNGOByEmail) {
      res.send({ message: "Email already exists" });
    } else if (existingNGOByName) {
      res.send({ message: "Name already exists" });
    } else {
      let result = await NGO.create(ngo);
      result.password = undefined;
      res.send("success");
    }
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      // Duplicate key error
      console.error("Duplicate key error:", err.message);
      res
        .status(400)
        .json({ message: "Duplicate key error", error: err.message });
    } else {
      // Other errors
      console.error(err);
      res.status(500).json(err);
    }
  }
};

const NGOLogIn = async (req, res) => {
  if (req.body.email && req.body.password) {
    let ngo = await NGO.findOne({ email: req.body.email });
    if (ngo) {
      const validated = await bcrypt.compare(req.body.password, ngo.password);

      if (validated) {
        ngo.password = undefined;
        res.send(ngo);
      } else {
        res.send({ message: "Invalid password" });
      }
    } else {
      res.send({ message: "User not found" });
    }
  } else {
    res.send({ message: "Email and password are required" });
  }
};

const getNGODetail = async (req, res) => {
  try {
    let ngo = await NGO.findById(req.params.id);
    if (ngo) {
      ngo.password = undefined;
      res.send(ngo);
    } else {
      res.send({ message: "No NGO found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getAllNgo = async (req, res) => {
  try {
    let ngo = await NGO.find({}, { password: 0 });
    if (ngo) {
      // ngo.password = undefined;
      res.send(ngo);
    } else {
      res.send({ message: "No NGO found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const removeNgo = async (req, res) => {
  console.log(req.params.id);
  try {
    const result = await NGO.findByIdAndDelete(req.params.id);

    await Sclass.deleteMany({ school: req.params.id });
    await Student.deleteMany({ school: req.params.id });
    await Teacher.deleteMany({ school: req.params.id });
    await Subject.deleteMany({ school: req.params.id });
    await Notice.deleteMany({ school: req.params.id });
    await Complain.deleteMany({ school: req.params.id });

    res.send("success");
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

const updateNGO = async (req, res) => {
  try {
    console.log("updating ngo start");
    console.log(req.body);
    console.log(req.body.password);
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    let result = await NGO.findByIdAndUpdate(req.body._id, req.body);

    result.password = undefined;
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};

// module.exports = { NGORegister, NGOLogIn, getNGODetail, deleteNGO, updateNGO };

module.exports = {
  NGORegister,
  NGOLogIn,
  getNGODetail,
  getAllNgo,
  removeNgo,
  updateNGO,
};
