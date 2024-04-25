const adminSchema = require("../models/adminSchema.js");
const Facility = require("../models/facilitySchema.js");

const facilityCreate = async (req, res) => {
  try {
    const facility = new Facility({
      ...req.body,
      school: req.body.NGOID,
    });
    const result = await facility.save();
    res.send(result);
  } catch (err) {
    res.status(500).json(err);
  }
};

const facilityList = async (req, res) => {
  try {
    let facilities = await Facility.find({ school: req.params.id }).populate(
      "school"
    );
    if (facilities.length > 0) {
      res.send(facilities);
    } else {
      res.send({ message: "No facility found" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
const allFacilitiesList = async (req, res) => {
  try {
    let admin = adminSchema.findById(req.params.id);
    if (admin) {
      let facilities = await Facility.find({}).populate("school");
      if (facilities.length > 0) {
        res.send(facilities);
      } else {
        res.send({ message: "No facility found" });
      }
    } else {
      res.send({ message: "Unauthorized" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

const updateFacility = async (req, res) => {
  try {
    const result = await Facility.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.send(result);
  } catch (error) {
    res.status(500).json(error);
  }
};

const deleteFacility = async (req, res) => {
  try {
    const result = await Facility.findByIdAndDelete(req.params.id);
    res.send(result);
  } catch (error) {
    res.status(500).json(err);
  }
};

const deleteFacilities = async (req, res) => {
  try {
    const result = await Facility.deleteMany({ school: req.params.id });
    if (result.deletedCount === 0) {
      res.send({ message: "No facility found to delete" });
    } else {
      res.send(result);
    }
  } catch (error) {
    res.status(500).json(err);
  }
};
const uploadFacilityProof = async (req, res) => {
  try {
    const result = await Facility.findByIdAndUpdate(req.body.id, {
      proofOfDeployementUrl:
        "https://images.unsplash.com/photo-1444492417251-9c84a5fa18e0?q=80&w=2535&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    });

    res.send(result);
  } catch (error) {
    res.status(500).json(err);
  }
};

module.exports = {
  facilityCreate,
  facilityList,
  updateFacility,
  deleteFacility,
  deleteFacilities,
  allFacilitiesList,
  uploadFacilityProof,
};
