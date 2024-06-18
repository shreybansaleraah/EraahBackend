const fs = require("fs");
const path = require("path");

const { bucket } = require("../utility/bucket.js");
const uploadImage = async (file, callback, onError) => {
  // console.log(file);
  // console.log(process.env.projectId);

  try {
    await bucket.file(file.originalname).save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    const [url] = await bucket.file(file.originalname).getSignedUrl({
      action: "read",
      expires: "3124-05-30T00:00:00Z",
    });
    // console.log(url);
    callback(url);
  } catch (e) {
    console.log(e);
    onError(e);
  }
};

const uploadImageFromPath = async (filePath, callback, onError) => {
  try {
    const buffer = await fs.promises.readFile(filePath);
    const fileName = path.basename(filePath);
    const fileMimeType = getMimeType(filePath); // Implement this function to get the MIME type

    const file = {
      originalname: fileName,
      buffer: buffer,
      mimetype: fileMimeType,
    };
    console.log("going to upload file");
    console.log(file);

    await uploadImage(file, callback, onError);
  } catch (e) {
    console.log(e);
    onError(e);
  }
};

const deleteImage = async (fileName, callback, onError) => {
  // console.log(file);
  // console.log(process.env.projectId);

  try {
    await bucket.file(fileName).delete();
    // storage.bucket(bucketName).file(fileName).delete();

    // const [url] = await bucket.file(file.originalname).getSignedUrl({
    //   action: "read",
    //   expires: "3124-05-30T00:00:00Z",
    // });
    // console.log(url);
    callback(true);
  } catch (e) {
    console.log(e);
    onError(e);
  }
};
const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".bmp":
      return "image/bmp";
    default:
      return "application/octet-stream";
  }
};
module.exports = {
  uploadImage,
  deleteImage,
  uploadImageFromPath,
};
