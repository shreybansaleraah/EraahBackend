const { bucket } = require("../utility/index.js");

const uploadImage = async (file, callback, onError) => {
  try {
    await bucket.bucket.file(file.destination).save(file.fileBuffer, {
      metadata: {
        contentType: file.mimetype,
      },
    });

    const [url] = await bucket.bucket.file(file.destination).getSignedUrl({
      action: "read",
      expires: "3124-05-30T00:00:00Z",
    });
    callback(url);
  } catch (e) {
    onError(e);
  }
};
module.exports = {
  uploadImage,
};
