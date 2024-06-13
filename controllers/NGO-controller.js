const bcrypt = require("bcrypt");
const { APIResponse } = require("../utility/index.js");
const NGO = require("../models/NGOSchema.js");
const Sclass = require("../models/sclassSchema.js");
const Student = require("../models/studentSchema.js");
const Teacher = require("../models/teacherSchema.js");
const Subject = require("../models/subjectSchema.js");
const Notice = require("../models/noticeSchema.js");
const Complain = require("../models/complainSchema.js");

const teacherGallerySchema = require("../models/teacherGallerySchema.js");
const studentGallerySchema = require("../models/studentGallerySchema.js");
const ngoGalleryschema = require("../models/ngoGalleryschema.js");
const { uploadImage } = require("../utility/uploadImage.js");
const NGORegister = async (req, res) => {
  try {
    const existingNGOByEmail = await NGO.findOne({ email: req.body.email });
    const existingNGOByName = await NGO.findOne({ name: req.body.name });
    const salt = await bcrypt.genSalt(10);
    // console.log("created salt");
    // console.log(salt);
    // console.log(req.body);
    // console.log(req.body.password);
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    // console.log("hashed pass");
    // console.log(hashedPass);

    // upload images and get url for bank statement and address prrof
    // console.log("adding ngo");
    const ngo = new NGO({
      ...req.body,
      password: hashedPass,
    });
    // console.log("ngo object");
    // console.log(ngo);

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
    // console.log(err);
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
  // console.log(req.params.id);
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
    // console.log(error);
    res.status(500).json(error);
  }
};

const updateNGO = async (req, res) => {
  try {
    // console.log("updating ngo start");
    // console.log(req.body);
    // console.log(req.body.password);
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    let result = await NGO.findByIdAndUpdate(req.body._id, req.body);

    result.password = undefined;
    res.send(result);
  } catch (error) {
    // console.log(error);
    res.status(500).json(error);
  }
};

const uploadBulkCsv = async (req, res) => {
  try {
    const ngoExist = await NGO.findById(req.params.id);
    // console.log("body is ", req.body.actionFor);

    if (ngoExist && req.body.actionFor) {
      if (req.body.actionFor === "student") {
        // // console.log(req.file);
        // // console.log(req.file.path);

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
        res.send(results);
      } else if (req.body.actionFor === "class") {
        // console.log("file is");
        // console.log(req.file);
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
    // console.log(error);
    res.status(400).json(error);
  }
};

const uploadPhotoGalleryForTeacher = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return APIResponse.badRequest(res, "No file uploaded", {});
    }
    uploadImage(
      file,
      async (url) => {
        console.log("redirect is : ", encodeURIComponent(url));
        if (req.body.studentId) {
          await studentGallerySchema.create({
            picUrl: url,
            school: req.body.ngoId,
            student: req.body.studentId,
          });
        } else if (req.body.teacherId) {
          await teacherGallerySchema.create({
            picUrl: url,
            school: req.body.ngoId,
            teacher: req.body.teacherId,
          });
        } else if (req.body.ngoId) {
          await ngoGalleryschema.create({
            picUrl: url,
            school: req.body.ngoId,
          });
        } else {
          return APIResponse.badRequest(res, "No file uploaded", {});
        }
        APIResponse.success(res, "File uploaded successfully", {});
      },
      (onError) => {
        APIResponse.badRequest(res, "Invalid file", {});
      }
    );
  } catch (error) {
    console.error("Error uploading file:", error);

    APIResponse.internalServerError(res, "something went wrong", {});
  }
};

const getGalleryAll = (req, res) => {
  ngoGalleryschema
    .find({}, { picUrl: 1, _id: 0 })
    .then((ngoGallery) => {
      teacherGallerySchema
        .find({}, { picUrl: 1, _id: 0 })
        .then((teacherGallery) => {
          studentGallerySchema
            .find({}, { picUrl: 1, _id: 0 })
            .then((studentGallery) => {
              var data = [
                ...ngoGallery.splice(0, 5),
                ...teacherGallery.splice(0, 5),
                ...studentGallery.splice(0, 5),
              ];
              APIResponse.success(res, "success", data);
            });
        })
        .catch((e) => {
          APIResponse.badRequest(res, "something went wrong", []);
        })
        .catch((e) => {
          APIResponse.badRequest(res, "something went wrong", []);
        });
    })
    .catch((e) => {
      APIResponse.badRequest(res, "something went wrong", []);
    });
};

const getGallery = async (req, res) => {
  var data = [];
  if (req.body.studentId) {
    data = await studentGallerySchema
      .find({
        school: req.body.ngoId,
        student: req.body.studentId,
      })
      .populate({ path: "school", select: "-password" })
      .populate({ path: "student", select: "-password" });
  } else if (req.body.teacherId) {
    data = await teacherGallerySchema
      .find({
        school: req.body.ngoId,
        teacher: req.body.teacherId,
      })
      .populate({ path: "school", select: "-password" })
      .populate({ path: "teacher", select: "-password" });
  } else if (req.body.ngoId) {
    data = await ngoGalleryschema
      .find({
        school: req.body.ngoId,
      })
      .populate({ path: "school", select: "-password" });
  } else {
    return APIResponse.badRequest(res, "Invalid data", {});
  }
  APIResponse.success(res, "success", data);
};

async function processStudentData(req) {
  const lines = req.file.buffer.toString().split("\n").slice(1);
  const results = [];

  for (const line of lines) {
    if (line.length < 7) {
      continue;
    }
    const [
      name,
      rollNum,
      className,
      photo,
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
      !rollNum.replace(/[\r\n]/g, "")
      //  &&
      // !fatherName &&
      // !fatherOcc &&
      // !motherName &&
      // !motherOcc.replace(/[\r\n]/g, "")
    ) {
      return { message: "Incorrect data, field are missing" };
    }
    var classId = await Sclass.findOne({
      sclassName: className,
      school: req.params.id,
    });
    if (classId === undefined || !classId) {
      classId = await Sclass.create({
        sclassName: className,
        school: req.params.id,
      });
    }
    await Student.deleteMany({
      name,
      rollNum,
      sclassName: classId._id,
      school: req.params.id,
    });
    var classTeacherId = await Teacher.findOne({
      school: req.params.id,
      classTeacher: className,
    });
    var payload = {
      name,
      rollNum,
      sclassName: classId._id,
      photoUrl: photo.startsWith("http") ? photo : null,
      fatherName,
      fatherOcc,
      motherName,
      motherOcc: motherOcc ? motherOcc.replace(/[\r\n]/g, "") : undefined,
      school: req.params.id,
      attendance: [],
    };
    if (classTeacherId !== undefined && classTeacherId) {
      payload = { ...payload, classTeacher: classTeacherId._id };
    }
    results.push(payload);
  }

  return results.filter(
    (item) =>
      item.name !== "" && item.name !== undefined && item.name.length !== 0
  );
}

async function processTeacherData(req) {
  try {
    const lines = req.file.buffer.toString().split("\n").slice(1);
    // const results = [];

    for (const line of lines) {
      // console.log("line is : ", line);
      if (line.length < 8) {
        continue;
      }
      const [
        name,
        teachSclass,
        email,
        password,
        aadhar,
        pan,
        subject,
        photo,
        classTeacher,
      ] = line.split(",");

      if (
        name !== undefined &&
        name.length !== 0 &&
        !email &&
        !password &&
        !aadhar &&
        !pan &&
        !teachSclass &&
        !classTeacher &&
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
          var existEmailAndClass = false;
          // console.log("start ");
          const existingTeacherByEmail = await Teacher.findOne({
            email,
            school: req.params.id,
          });
          var classId = await Sclass.findOne({
            sclassName: teachSclass,
            school: req.params.id,
          });
          const existingTeacherByEmailAndClass = await Teacher.findOne({
            email,
          })
            .populate("teachSclass")
            .exec();
          if (existingTeacherByEmailAndClass != null) {
            // console.log("in existing teacher if condition");
            existEmailAndClass = existingTeacherByEmailAndClass.teachSclass
              .map((sclass) => sclass.sclassName.toString())
              .includes(teachSclass);
          }
          // console.log("else condition");
          if (existEmailAndClass) {
            continue;
          } else if (existingTeacherByEmail) {
            // console.log("else email");
            if (classId === undefined || !classId) {
              // console.log("undefine");
              classId = await Sclass.create({
                sclassName: teachSclass,
                school: req.params.id,
              });
              // continue;
            }
            let result = await Teacher.findByIdAndUpdate(
              existingTeacherByEmail._id,
              { $push: { teachSclass: classId._id } },
              { new: true }
            );
            // await Subject.findByIdAndUpdate(teachSubject, {
            //   teacher: existEmailAndClass._id,
            // });
          } else {
            // console.log("not exist cond");
            // console.log(subject);
            // console.log(req.params.id);
            // // console.log(classTeacher.replace(/[\r\n]/g, ""));
            var subjectId = await Subject.findOne({
              subName: subject,
              school: req.params.id,
            });
            // console.log(subjectId);
            if (classId === undefined || !classId) {
              // console.log("undefine");
              // continue;
              classId = await Sclass.create({
                sclassName: teachSclass,
                school: req.params.id,
              });
            }
            if (subjectId === undefined || !subjectId) {
              subjectId = await Subject.create({
                subName: subject,
                school: req.params.id,
                sclassName: classId._id,
              });
            }

            var results = {
              name,
              teachSclass: classId._id,
              email,
              password: await bcrypt.hash(
                password ?? "",
                await bcrypt.genSalt(10)
              ),
              aadhar,
              pan,
              teachSubject: subjectId._id,
              school: req.params.id,
              photoUrl: photo.startsWith("http") ? photo : null,
              classTeacher:
                classTeacher.toLowerCase().replace(/[\r\n]/g, "") === "yes"
                  ? teachSclass
                  : "NO",
            };
            // console.log("result created");
            // console.log(results);

            if (
              results.name.trim() !== "" &&
              results.name.trim() !== undefined &&
              results.name.length !== 0
            ) {
              // console.log("results if cond");
              var teacher = await Teacher.create(results);
              await Subject.findByIdAndUpdate(subjectId._id, {
                teacher: teacher._id,
              });
              // // console.log(classTeacher.toLowerCase().includes("yes"));
              // // console.log(classTeacher.toLowerCase());
              // // console.log(typeof classTeacher);
              if (classTeacher.toLowerCase().includes("yes")) {
                // console.log("yes class teacher");
                await Student.updateMany(
                  { sclassName: classId._id },
                  { $set: { classTeacher: teacher._id } }
                );
                // const className = await Sclass.find({ teachSclass, school });
                await Teacher.findOneAndUpdate(
                  {
                    classTeacher: classId.sclassName,
                  },
                  { classTeacher: "NO" }
                );
                await Teacher.findByIdAndUpdate(req.body.id, {
                  classTeacher: classId.sclassName,
                });
              }
            }
          }
        }
      }
    }

    return { data: "success" };
  } catch (e) {
    console.log(e);
    return { data: "failed" };
  }
}

async function processClassData(req) {
  // console.log("class");
  // console.log(req.file);
  // // console.log(file);

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
  //     // console.log(results);
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
  uploadPhotoGalleryForTeacher,
  getGallery,
  getGalleryAll,
};
