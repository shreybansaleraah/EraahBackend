const bcrypt = require("bcrypt");
const Teacher = require("../models/teacherSchema.js");
const Subject = require("../models/subjectSchema.js");
const Student = require("../models/studentSchema.js");
const SClass = require("../models/sclassSchema.js");

const { uploadImage, APIResponse } = require("../utility/index.js");

const teacherRegister = async (req, res) => {
  const {
    name,
    email,
    password,
    aadhar,
    pan,
    role,
    school,
    teachSubject,
    teachSclass,
    classTeacher,
  } = req.body;
  // console.log("the body is ");
  // console.log(req.body);
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    let existEmailAndClass = false;
    const existingTeacherByEmailAndClass = await Teacher.findOne({
      email,
    })
      .populate("teachSclass")
      .exec();

    // console.log("existingTeacherByEmailAndClass");
    // console.log(existingTeacherByEmailAndClass);

    if (existingTeacherByEmailAndClass != null) {
      // console.log("in existing teacher if condition");
      existEmailAndClass = existingTeacherByEmailAndClass.teachSclass
        .map((sclass) => sclass.sclassName.toString())
        .includes(teachSclass);
    } else {
      // console.log("in else condition");
    }

    // console.log("if condition pass");
    const existingTeacherByEmail = await Teacher.findOne({ email });
    // const existingTeacherByEmailAndSubject = await Teacher.findOne({ email });
    // console.log(existingTeacherByEmail);

    if (existEmailAndClass) {
      return res.send({ message: "Email with class already exists" });
    } else if (existingTeacherByEmail) {
      // console.log("else if condition");
      let result = await Teacher.findByIdAndUpdate(
        existingTeacherByEmail._id,
        { $push: { teachSclass: teachSclass } },
        { new: true }
      );
      await Subject.findByIdAndUpdate(teachSubject, {
        teacher: existEmailAndClass._id,
      });

      return res.send(result);
    } else {
      uploadImage.uploadImage(
        req.file,
        async (callback) => {
          const teacher = new Teacher({
            name,
            email,
            password: hashedPass,
            aadhar,
            pan,
            role,
            school,
            teachSubject,
            teachSclass,
            photoUrl: callback,
          });
          let result = await teacher.save();
          await Subject.findByIdAndUpdate(teachSubject, {
            teacher: teacher._id,
          });

          if (classTeacher) {
            // // console.log("classTeacher is getting yes");
            await Student.updateMany(
              { sclassName: teachSclass },
              { $set: { classTeacher: result._id } }
            );
            const className = await SClass.findOne({
              _id: teachSclass,
              school,
            });
            // // console.log(result._id);
            // // console.log(className);
            // // console.log(teachSclass);
            // // console.log(school);
            await Teacher.findOneAndUpdate(
              {
                classTeacher: className.sclassName,
              },
              { classTeacher: "NO" }
            );

            // // console.log(className.sclassName);
            var resv = await Teacher.findByIdAndUpdate(result._id, {
              classTeacher: className.sclassName,
            });
            // console.log(resv);
          }

          result.password = undefined;
          return res.send(result);
        },
        (onError) => {
          APIResponse.badRequest(res, "Invalid file", {});
        }
      );
    }
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const makeTeacherHead = async (req, res) => {
  try {
    const removeTeacherHead = await Teacher.findOneAndUpdate(
      {
        classTeacher: req.body.teachSclass,
      },
      { classTeacher: "NO" }
    );
    const teacherResult = await Teacher.findByIdAndUpdate(req.body.id, {
      classTeacher: req.body.teachSclass,
    });
    const classId = await SClass.findOne({ sclassName: req.body.teachSclass });
    await Student.updateMany(
      { sclassName: classId._id },
      { $set: { classTeacher: req.body.id } }
    );
    res.send(teacherResult);
  } catch (e) {
    res.status(500).json(err);
  }
};

const teacherLogIn = async (req, res) => {
  try {
    let teacher = await Teacher.findOne({ email: req.body.email });
    if (teacher && teacher?.classTeacher?.toLowerCase() !== "no") {
      const validated = await bcrypt.compare(
        req.body.password,
        teacher.password
      );
      if (validated) {
        teacher = await teacher.populate("teachSubject", "subName sessions");
        teacher = await teacher.populate("school", "schoolName");
        teacher = await teacher.populate("teachSclass", "sclassName");
        teacher.password = undefined;
        res.send(teacher);
      } else {
        res.send({ message: "Invalid password" });
      }
    } else {
      res.send({ message: "Teacher not found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getTeachers = async (req, res) => {
  try {
    let teachers = await Teacher.find({ school: req.params.id })
      .populate("teachSubject", "subName")
      .populate("teachSclass", "sclassName");
    if (teachers.length > 0) {
      let modifiedTeachers = teachers.map((teacher) => {
        return { ...teacher._doc, password: undefined };
      });
      res.send(modifiedTeachers);
    } else {
      res.send({ message: "No teachers found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getTeacherDetail = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate("teachSubject", "subName sessions")
      .populate("school", "schoolName")
      .populate("teachSclass", "sclassName");

    if (!teacher) {
      return res.send({ message: "No teacher found" });
    }

    // Create a new object or use .lean() to avoid modifying the original document
    const teacherDetails = { ...teacher._doc };
    teacherDetails.password = undefined;

    let students = [];
    if (teacher.teachSclass) {
      // Assuming teachSclass is an array, so we need to handle each class separately
      for (const sclass of teacher.teachSclass) {
        const classStudents = await Student.find({
          school: teacher.school.id,
          sclassName: sclass.id,
        }).populate("sclassName", "sclassName");
        students = students.concat(classStudents);
      }
    }

    res.send({ ...teacherDetails, studentsList: students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateTeacherSubject = async (req, res) => {
  const { teacherId, teachSubject } = req.body;
  try {
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      teacherId,
      { teachSubject },
      { new: true }
    );

    await Subject.findByIdAndUpdate(teachSubject, {
      teacher: updatedTeacher._id,
    });

    res.send(updatedTeacher);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);

    await Subject.updateOne(
      { teacher: deletedTeacher._id, teacher: { $exists: true } },
      { $unset: { teacher: 1 } }
    );
    await Student.updateOne(
      { classTeacher: deletedTeacher._id, classTeacher: { $exists: true } },
      { $unset: { classTeacher: 1 } }
    );

    res.send(deletedTeacher);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteTeachers = async (req, res) => {
  try {
    const deletionResult = await Teacher.deleteMany({ school: req.params.id });

    const deletedCount = deletionResult.deletedCount || 0;

    if (deletedCount === 0) {
      res.send({ message: "No teachers found to delete" });
      return;
    }

    const deletedTeachers = await Teacher.find({ school: req.params.id });

    await Subject.updateMany(
      {
        teacher: { $in: deletedTeachers.map((teacher) => teacher._id) },
        teacher: { $exists: true },
      },
      { $unset: { teacher: "" }, $unset: { teacher: null } }
    );
    await Student.updateMany(
      {
        classTeacher: { $in: deletedTeachers.map((teacher) => teacher._id) },
        classTeacher: { $exists: true },
      },
      { $unset: { classTeacher: "" }, $unset: { classTeacher: null } }
    );

    res.send(deletionResult);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteTeachersByClass = async (req, res) => {
  try {
    const deletionResult = await Teacher.deleteMany({
      sclassName: req.params.id,
    });

    const deletedCount = deletionResult.deletedCount || 0;

    if (deletedCount === 0) {
      res.send({ message: "No teachers found to delete" });
      return;
    }

    const deletedTeachers = await Teacher.find({ sclassName: req.params.id });

    await Subject.updateMany(
      {
        teacher: { $in: deletedTeachers.map((teacher) => teacher._id) },
        teacher: { $exists: true },
      },
      { $unset: { teacher: "" }, $unset: { teacher: null } }
    );

    res.send(deletionResult);
  } catch (error) {
    res.status(500).json(error);
  }
};

const teacherAttendance = async (req, res) => {
  const { status, date } = req.body;

  try {
    const teacher = await Teacher.findById(req.params.id);

    if (!teacher) {
      return res.send({ message: "Teacher not found" });
    }

    const existingAttendance = teacher.attendance.find(
      (a) => a.date.toDateString() === new Date(date).toDateString()
    );

    if (existingAttendance) {
      existingAttendance.status = status;
    } else {
      teacher.attendance.push({ date, status });
    }

    const result = await teacher.save();
    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const getAllTeachers = (req, res) => {
  Teacher.find({})
    .populate({ path: "school", select: "-password" })
    .populate("teachSubject", "subName")
    .populate("teachSclass", "sclassName")
    .then((teachers) => {
      if (teachers.length > 0) {
        let modifiedTeachers = teachers.map((teacher) => {
          return { ...teacher._doc, password: undefined };
        });
        APIResponse.success(res, "success", modifiedTeachers);
      } else {
        APIResponse.success(res, "success", []);
      }
    })
    .catch((err) => {
      APIResponse.badRequest(res, err, {});
    });
};
const getSelectedTeacherDetail = async (req, res) => {
  try {
    console.log(req.query.id);

    const teacher = await Teacher.findById(req.query.id)
      .populate("teachSubject", "subName sessions")
      .populate("school", "schoolName")
      .populate("teachSclass", "sclassName");

    if (!teacher) {
      // return res.send({ message: "No teacher found" });
      APIResponse.success(res, "No teacher found", []);
      return;
    }

    // Create a new object or use .lean() to avoid modifying the original document
    const teacherDetails = { ...teacher._doc };
    teacherDetails.password = undefined;

    let students = [];
    if (teacher.teachSclass) {
      // Assuming teachSclass is an array, so we need to handle each class separately
      for (const sclass of teacher.teachSclass) {
        const classStudents = await Student.find({
          school: teacher.school.id,
          sclassName: sclass.id,
        }).populate("sclassName", "sclassName");
        students = students.concat(classStudents);
      }
    }

    // res.send({ ...teacherDetails, studentsList: students });
    APIResponse.success(res, "success", {
      ...teacherDetails,
      studentsList: students,
    });
  } catch (err) {
    console.error(err);
    // res.status(500).json({ error: "Internal Server Error" });
    APIResponse.internalServerError(res, "Internal Server Error", {});
  }
};

module.exports = {
  teacherRegister,
  teacherLogIn,
  getTeachers,
  getTeacherDetail,
  updateTeacherSubject,
  deleteTeacher,
  deleteTeachers,
  deleteTeachersByClass,
  teacherAttendance,
  makeTeacherHead,
  getAllTeachers,
  getSelectedTeacherDetail,
};
