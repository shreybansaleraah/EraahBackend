const { Storage } = require("@google-cloud/storage");

const storage = new Storage({
  projectId: "cryptic-yen-418706",
  keyFilename: "eraahProject.json",
});

const bucketName = "eraahstorage1";
const bucket = storage.bucket(bucketName);
module.exports = {
  bucket,
};
