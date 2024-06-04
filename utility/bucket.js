const { Storage } = require("@google-cloud/storage");

const storage = new Storage({
  projectId: process.env.projectId,
  keyFilename: process.env.keyFilename,
});

const bucketName = "eraahstorage1";
const bucket = storage.bucket(bucketName);
module.exports = {
  bucket,
};
