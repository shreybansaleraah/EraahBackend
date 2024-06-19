const adminSchema = require("../models/adminSchema.js");
const donorInfoSchema = require("../models/donorInfoSchema.js");
const Notice = require("../models/noticeSchema.js");
const { APIResponse } = require("../utility/index.js");

const noticeCreate = async (req, res) => {
  try {
    const notice = new Notice({
      ...req.body,
      school: req.body.NGOID,
    });
    const result = await notice.save();
    res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

const noticeList = async (req, res) => {
  try {
    let notices = await Notice.find({ school: req.params.id }).populate(
      "school"
    );
    if (notices.length > 0) {
      res.send(notices);
    } else {
      res.send({ message: "No notices found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
const allNoticecList = async (req, res) => {
  try {
    let admin = await adminSchema.findById(req.params.id);
    if (!admin) {
      admin = await donorInfoSchema.findById(req.params.id);
    }

    if (admin) {
      let notices = await Notice.find({}).populate("school");
      if (notices.length > 0) {
        APIResponse.success(res, null, notices);
      } else {
        APIResponse.success(res, "No notices found", []);
      }
    } else {
      APIResponse.unAuthorized(res, "Unauthorized", {});
      // res.send({ message: "Unauthorized" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const updateNotice = async (req, res) => {
  try {
    const result = await Notice.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteNotice = async (req, res) => {
  try {
    const result = await Notice.findByIdAndDelete(req.params.id);
    res.send(result);
  } catch (error) {
    res.status(500).json(err);
  }
};

const deleteNotices = async (req, res) => {
  try {
    const result = await Notice.deleteMany({ school: req.params.id });
    if (result.deletedCount === 0) {
      res.send({ message: "No notices found to delete" });
    } else {
      res.send(result);
    }
  } catch (error) {
    res.status(500).json(err);
  }
};

module.exports = {
  noticeCreate,
  noticeList,
  updateNotice,
  deleteNotice,
  deleteNotices,
  allNoticecList,
};
