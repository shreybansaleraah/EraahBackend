const bcrypt = require("bcrypt");
const Student = require("../models/studentSchema.js");
const Subject = require("../models/subjectSchema.js");
const Teacher = require("../models/teacherSchema.js");
const Sclass = require("../models/sclassSchema.js");
const fs = require("fs");
const csv = require("csv-parser");
const NGOSchema = require("../models/NGOSchema.js");
const { uploadImage, APIResponse } = require("../utility/index.js");

const studentRegister = (req, res) => {
  try {
    // const salt = await bcrypt.genSalt(10);
    // const hashedPass = await bcrypt.hash(req.body.password, salt);
    uploadImage.uploadImage(
      req.file,
      async (callback) => {
        const existingStudent = await Student.findOne({
          rollNum: req.body.rollNum,
          school: req.body.NGOID,
          sclassName: req.body.sclassName,
        });

        if (existingStudent) {
          res.send({ message: "Roll Number already exists" });
        } else {
          const className = await Sclass.findById(req.body.sclassName);
          // console.log("find class ", className);
          // console.log("find class ", className.sclassName);
          // console.log("find class ", req.body.NGOID);
          const classTeacher = await Teacher.findOne({
            classTeacher: className.sclassName,
            school: req.body.NGOID,
          });
          // console.log("find class teacher");
          // console.log(classTeacher);
          const student = new Student({
            ...req.body,
            school: req.body.NGOID,
            photoUrl: callback,
          });

          if (classTeacher) {
            // console.log("inside class teacher");
            student.classTeacher = classTeacher._id;
            // console.log("exiting class teacher");
          }
          let result = await student.save();
          // // console.log(result);

          // // console.log(result.populate("sclassName"));

          result.password = undefined;
          res.send(result);
        }
      },
      (onError) => {
        APIResponse.badRequest(res, "Invalid file", {});
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
};

const studentLogIn = async (req, res) => {
  try {
    let student = await Student.findOne({
      rollNum: req.body.rollNum,
      name: req.body.studentName,
    });
    if (student) {
      const validated = await bcrypt.compare(
        req.body.password,
        student.password
      );
      if (validated) {
        student = await student.populate("school", "schoolName");
        student = await student.populate("sclassName", "sclassName");
        student.password = undefined;
        student.examResult = undefined;
        student.attendance = undefined;
        res.send(student);
      } else {
        res.send({ message: "Invalid password" });
      }
    } else {
      res.send({ message: "Student not found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getStudents = async (req, res) => {
  try {
    let students = await Student.find({ school: req.params.id })
      .populate("sclassName", "sclassName")
      .populate({
        path: "classTeacher",
        select: "-password", // specify the field you want to exclude with a minus sign (-)
      });
    if (students.length > 0) {
      let modifiedStudents = students.map((student) => {
        return { ...student._doc };
      });
      // modifiedStudents = modifiedStudents.classTeacher.;
      res.send(modifiedStudents);
    } else {
      res.send({ message: "No students found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const getStudentDetail = async (req, res) => {
  try {
    let student = await Student.findById(req.params.id)
      .populate("school", "schoolName")
      .populate("sclassName", "sclassName")
      .populate("examResult.subName", "subName")
      .populate({
        path: "classTeacher",
        select: "-password", // specify the field you want to exclude with a minus sign (-)
      })
      .populate("attendance.subName", "subName sessions");
    if (student) {
      // student.password = undefined;
      res.send(student);
    } else {
      res.send({ message: "No student found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const deleteStudent = async (req, res) => {
  try {
    const result = await Student.findByIdAndDelete(req.params.id);
    res.send(result);
  } catch (error) {
    res.status(500).json(err);
  }
};

const deleteStudents = async (req, res) => {
  try {
    const result = await Student.deleteMany({ school: req.params.id });
    if (result.deletedCount === 0) {
      res.send({ message: "No students found to delete" });
    } else {
      res.send(result);
    }
  } catch (error) {
    res.status(500).json(err);
  }
};

const deleteStudentsByClass = async (req, res) => {
  try {
    const result = await Student.deleteMany({ sclassName: req.params.id });
    if (result.deletedCount === 0) {
      res.send({ message: "No students found to delete" });
    } else {
      res.send(result);
    }
  } catch (error) {
    res.status(500).json(err);
  }
};

const updateStudent = async (req, res) => {
  try {
    // if (req.body.password) {
    //   const salt = await bcrypt.genSalt(10);
    //   res.body.password = await bcrypt.hash(res.body.password, salt);
    // }
    let result = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    // result.password = undefined;
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const updateExamResult = async (req, res) => {
  const { subName, marksObtained } = req.body;

  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.send({ message: "Student not found" });
    }

    const existingResult = student.examResult.find(
      (result) => result.subName.toString() === subName
    );

    if (existingResult) {
      existingResult.marksObtained = marksObtained;
    } else {
      student.examResult.push({ subName, marksObtained });
    }

    const result = await student.save();
    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const studentAttendance = async (req, res) => {
  const { subName, status, date } = req.body;

  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.send({ message: "Student not found" });
    }

    const subject = await Subject.findById(subName);

    const existingAttendance = student.attendance.find(
      (a) =>
        a.date.toDateString() === new Date(date).toDateString() &&
        a.subName.toString() === subName
    );

    if (existingAttendance) {
      existingAttendance.status = status;
    } else {
      // Check if the student has already attended the maximum number of sessions
      const attendedSessions = student.attendance.filter(
        (a) => a.subName.toString() === subName
      ).length;

      if (attendedSessions >= subject.sessions) {
        return res.send({ message: "Maximum attendance limit reached" });
      }

      student.attendance.push({ date, status, subName });
    }

    const result = await student.save();
    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const clearAllStudentsAttendanceBySubject = async (req, res) => {
  const subName = req.params.id;

  try {
    const result = await Student.updateMany(
      { "attendance.subName": subName },
      { $pull: { attendance: { subName } } }
    );
    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const clearAllStudentsAttendance = async (req, res) => {
  const schoolId = req.params.id;

  try {
    const result = await Student.updateMany(
      { school: schoolId },
      { $set: { attendance: [] } }
    );

    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const removeStudentAttendanceBySubject = async (req, res) => {
  const studentId = req.params.id;
  const subName = req.body.subId;

  try {
    const result = await Student.updateOne(
      { _id: studentId },
      { $pull: { attendance: { subName: subName } } }
    );

    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const removeStudentAttendance = async (req, res) => {
  const studentId = req.params.id;

  try {
    const result = await Student.updateOne(
      { _id: studentId },
      { $set: { attendance: [] } }
    );

    return res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const uploadStudentPhoto = (req, res) => {
  console.log(req.query.id);

  Student.findById(req.query.id)
    .then((student) => {
      if (!student) {
        // return res.send({ message: "No teacher found" });
        APIResponse.notFound(res, "No student found", []);
      } else if (!req.file) {
        APIResponse.badRequest(res, "Invalid file", {});
      } else {
        const pattern = /\/([^/?]+)\?/;
        var fileName = student.photoUrl;
        const match = fileName.match(pattern);
        if (match) {
          uploadImage.deleteImage(
            match[1],
            (deleteImageCallback) => {
              uploadImage.uploadImage(
                req.file,
                (callback) => {
                  Student.findByIdAndUpdate(req.query.id, {
                    photoUrl: callback,
                  })
                    .then((value) => {
                      APIResponse.success(res, "success", {});
                    })
                    .catch((err) => {
                      APIResponse.badRequest(res, "Invalid file", {});
                    });
                },
                (onError) => {
                  APIResponse.badRequest(res, "Invalid file", {});
                }
              );
            },
            (deleteImageError) => {
              if (deleteImageError.code === 404) {
                uploadImage.uploadImage(
                  req.file,
                  (callback) => {
                    Student.findByIdAndUpdate(req.query.id, {
                      photoUrl: callback,
                    })
                      .then((value) => {
                        APIResponse.success(res, "success", {});
                      })
                      .catch((err) => {
                        APIResponse.badRequest(res, "Invalid file", {});
                      });
                  },
                  (onError) => {
                    APIResponse.badRequest(res, "Invalid file", {});
                  }
                );
              } else {
                APIResponse.badRequest(res, "Invalid file", {});
              }
            }
          );
        } else {
          uploadImage.uploadImage(
            req.file,
            (callback) => {
              Student.findByIdAndUpdate(req.query.id, { photoUrl: callback })
                .then((value) => {
                  APIResponse.success(res, "success", {});
                })
                .catch((err) => {
                  APIResponse.badRequest(res, "Invalid file", {});
                });
            },
            (onError) => {
              APIResponse.badRequest(res, "Invalid file", {});
            }
          );
        }
      }
    })
    .catch((e) => {
      console.error(err);
      // res.status(500).json({ error: "Internal Server Error" });
      APIResponse.internalServerError(res, "Internal Server Error", {});
    });
};

module.exports = {
  studentRegister,
  studentLogIn,
  getStudents,
  getStudentDetail,
  deleteStudents,
  deleteStudent,
  updateStudent,
  studentAttendance,
  deleteStudentsByClass,
  updateExamResult,
  uploadStudentPhoto,
  clearAllStudentsAttendanceBySubject,
  clearAllStudentsAttendance,
  removeStudentAttendanceBySubject,
  removeStudentAttendance,
};
