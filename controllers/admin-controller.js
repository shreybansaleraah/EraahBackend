const bcrypt = require("bcrypt");
const adminSchema = require("../models/adminSchema.js");
const teacherSchema = require("../models/teacherSchema.js");
const studentSchema = require("../models/studentSchema.js");
const NGOSchema = require("../models/NGOSchema.js");
const sclassSchema = require("../models/sclassSchema.js");

const adminRegister = async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const admin = new adminSchema({
      ...req.body,
      password: hashedPass,
    });

    const existingAdminByEmail = await adminSchema.findOne({
      email: req.body.email,
    });

    if (existingAdminByEmail) {
      res.send({ message: "Email already exists" });
    } else {
      let result = await adminSchema.create(admin);
      result.password = undefined;
      res.send(result);
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const adminLogIn = async (req, res) => {
  if (req.body.email && req.body.password) {
    // console.log("req.body.email");
    // console.log(req.body.email);
    let admin = await adminSchema.findOne({ email: req.body.email });
    // let admin = await adminSchema.find();
    // console.log("admin");
    // console.log(admin);
    if (admin) {
      const validated = await bcrypt.compare(req.body.password, admin.password);
      if (validated) {
        admin.password = undefined;
        res.send(admin);
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

const getAdminDetail = async (req, res) => {
  try {
    let admin = await adminSchema.findById(req.params.id);
    if (admin) {
      admin.password = undefined;
      res.send(admin);
    } else {
      res.send({ message: "No User found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
const getAdminDashboardData = async (req, res) => {
  try {
    let admin = await adminSchema.findById(req.params.id);
    // console.log("params id");
    // console.log(req.params.id);
    // console.log("admin");
    // console.log(admin);
    if (admin) {
      let teachers = await teacherSchema.countDocuments();
      let students = await studentSchema.countDocuments();
      let ngos = await NGOSchema.countDocuments();
      let classes = await sclassSchema.countDocuments();

      res.send({
        teacherCount: teachers,
        studentCount: students,
        ngosCount: ngos,
        classCount: classes,
      });
    } else {
      res.send({ message: "Unauthorized" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

module.exports = {
  adminRegister,
  adminLogIn,
  getAdminDetail,
  getAdminDashboardData,
};
