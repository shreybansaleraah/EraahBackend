const bcrypt = require("bcrypt");
const NGO = require("../models/NGOSchema.js");
const Sclass = require("../models/sclassSchema.js");
const Student = require("../models/studentSchema.js");
const Teacher = require("../models/teacherSchema.js");
const Subject = require("../models/subjectSchema.js");
const Notice = require("../models/noticeSchema.js");
const Complain = require("../models/complainSchema.js");
const csv = require("csv-parser");
const fs = require("fs");
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

const uploadBulkCsv = async (req, res) => {
  try {
    const ngoExist = await NGO.findById(req.params.id);
    console.log("body is ", req.body.actionFor);

    if (ngoExist && req.body.actionFor) {
      if (req.body.actionFor === "student") {
        const results = await processStudentData(req);
        await Student.insertMany(results)
          .then((value) => {
            if (value.message) res.send({ message: value.message });
            try {
              res.send({ data: "success" });
            } catch (e) {}
          })
          .catch((e) => {
            res.send({ data: "failed" });
          });
      } else if (req.body.actionFor === "teacher") {
        const results = await processTeacherData(req);
        await Teacher.insertMany(results)
          .then((value) => {
            if (value.message) res.send({ message: value.message });
            try {
              res.send({ data: "success" });
            } catch (e) {}
          })
          .catch((e) => {
            res.send({ data: "failed" });
          });
      } else if (req.body.actionFor === "class") {
        console.log("file is");
        console.log(req.file);
        const results = await processClassData(req);

        await Sclass.insertMany(results)
          .then((value) => {
            if (value.message) res.send({ message: value.message });
            try {
              res.send({ data: "success" });
            } catch (e) {}
          })
          .catch((e) => {
            res.send({ data: "failed" });
          });
      } else if (req.body.actionFor === "subject") {
        const results = await processSubjectData(req);
        // res.send(results);
        await Subject.insertMany(results)
          .then((value) => {
            if (value.message) res.send({ message: value.message });
            try {
              res.send({ data: "success" });
            } catch (e) {}
          })
          .catch((e) => {
            res.send({ data: "failed" });
          });
      }
    } else {
      res.status(401).send({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

async function processStudentData(req) {
  const lines = req.file.buffer.toString().split("\n").slice(1);
  const results = [];

  for (const line of lines) {
    const [
      name,
      rollNum,
      className,
      fatherName,
      fatherOcc,
      motherName,
      motherOcc,
      ...rest
    ] = line.split(",");

    if (
      name !== undefined &&
      name.length !== 0 &&
      !className &&
      !rollNum &&
      !fatherName &&
      !fatherOcc &&
      !motherName &&
      !motherOcc.replace(/[\r\n]/g, "")
    ) {
      return { message: "Incorrect data, field are missing" };
    }
    await Student.deleteMany({
      name,
      rollNum,
      sclassName: className,
      school: req.params.id,
    });
    results.push({
      name,
      rollNum,
      sclassName: className,
      fatherName,
      fatherOcc,
      motherName,
      motherOcc: motherOcc ? motherOcc.replace(/[\r\n]/g, "") : undefined,
      school: req.params.id,
      attendance: [],
    });
  }

  return results.filter(
    (item) =>
      item.name !== "" && item.name !== undefined && item.name.length !== 0
  );
}

async function processTeacherData(req) {
  const lines = req.file.buffer.toString().split("\n").slice(1);
  const results = [];

  for (const line of lines) {
    const [name, teachSclass, email, password, aadhar, pan, subject, ...rest] =
      line.split(",");

    if (
      name !== undefined &&
      name.length !== 0 &&
      !email &&
      !password &&
      !aadhar &&
      !pan &&
      !teachSclass &&
      !subject
    ) {
      return { message: "Incorrect data, field are missing" };
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const aadharRegex = /^\d{12}$/;
      const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/;

      if (
        name !== undefined &&
        name.length !== 0 &&
        (!emailRegex.test(email) ||
          !aadharRegex.test(aadhar.replace("'"), "") ||
          !panRegex.test(pan))
      ) {
        return {
          message: !emailRegex.test(email)
            ? `Incorrect email of ${name}`
            : !aadharRegex.test(aadhar)
            ? `Incorrect aadhar of ${name}`
            : `Incorrect pan of ${name}`,
        };
      } else {
        await Teacher.deleteMany({
          name,
          teachSclass,
          email,
          aadhar,
          subject,
          school: req.params.id,
        });
        results.push({
          name,
          teachSclass,
          email,
          password: await bcrypt.hash(password ?? "", await bcrypt.genSalt(10)),
          aadhar,
          pan,
          subject: subject ? subject.replace(/[\r\n]/g, "") : undefined,
          school: req.params.id,
        });
      }
    }
  }

  return results.filter(
    (item) =>
      item.name.trim() !== "" &&
      item.name.trim() !== undefined &&
      item.name.length !== 0
  );
}

async function processClassData(req) {
  console.log("class");
  console.log(req.file);
  // console.log(file);

  const lines = req.file.buffer.toString().split("\n").slice(1);
  const results = [];

  for (const line of lines) {
    const [sclassName, ...rest] = line.split(",");

    await Sclass.deleteMany({ sclassName, school: req.params.id });

    results.push({
      sclassName: sclassName ? sclassName.replace(/[\r\n]/g, "") : undefined,
      school: req.params.id,
    });
  }

  return results.filter(
    (item) =>
      item.sclassName !== "" &&
      item.sclassName !== undefined &&
      item.sclassName.length !== 0
  );

  // const results = [];

  // fs.createReadStream(req.file)
  //   .pipe(csv())
  //   .on("data", (data) => results.push(data))
  //   .on("end", () => {
  //     console.log(results);
  //   });
}

async function processSubjectData(req) {
  const lines = req.file.buffer.toString().split("\n").slice(1);
  const results = [];

  for (const line of lines) {
    const [subName, subCode, sessions, ...rest] = line.split(",");
    await Subject.deleteMany({
      subName,
      sclassName: req.body.sclassName,
      school: req.params.id,
    });
    results.push({
      subName,
      subCode,
      sessions: sessions ? sessions.replace(/[\r\n]/g, "") : undefined,
      sclassName: req.body.sclassName,
      school: req.params.id,
    });
  }

  return results.filter(
    (item) =>
      item.subName !== "" &&
      item.subName !== undefined &&
      item.subName.length !== 0
  );
}

async function removeDuplicate(collection, filter) {
  const pipeline = [
    { $match: filter }, // Match the documents based on the specified filter
    {
      $group: { _id: "$_id", count: { $sum: 1 }, docs: { $push: "$$ROOT" } },
    },
    { $match: { count: { $gt: 1 } } },
  ];

  const duplicates = await collection.aggregate(pipeline).toArray();

  for (const duplicate of duplicates) {
    const docsToRemove = duplicate.docs.slice(1); // Remove all but the first document
    for (const doc of docsToRemove) {
      await collection.deleteOne({ _id: doc._id });
    }
  }
}
// module.exports = { NGORegister, NGOLogIn, getNGODetail, deleteNGO, updateNGO };

module.exports = {
  NGORegister,
  NGOLogIn,
  getNGODetail,
  getAllNgo,
  removeNgo,
  updateNGO,
  uploadBulkCsv,
};
