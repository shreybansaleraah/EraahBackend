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
    console.log(url);
    callback(url);
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
module.exports = {
  uploadImage,
  deleteImage,
};
