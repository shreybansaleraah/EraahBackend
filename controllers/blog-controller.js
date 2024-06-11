const blogSchema = require("../models/blogSchema");
const { uploadImage, APIResponse } = require("../utility/index.js");

const addBlog = (req, res) => {
  if (req.file) {
    uploadImage.uploadImage(
      req.file,
      (callback) => {
        req.body.photoUrl = callback;
        blogSchema
          .create(req.body)
          .then((value) => {
            APIResponse.success(res, "Successfully added blog", value);
          })
          .catch((err) => {
            APIResponse.badRequest(res, err, {});
          });
      },
      (onError) => {
        APIResponse.badRequest(res, "Invalid file", {});
      }
    );
  } else {
    blogSchema
      .create(req.body)
      .then((value) => {
        APIResponse.success(res, "Successfully added blog", value);
      })
      .catch((err) => {
        APIResponse.badRequest(res, err, {});
      });
  }
};
const getBlogs = (req, res) => {
  blogSchema
    .find({})
    .then((value) => {
      APIResponse.success(res, "success", value);
    })
    .catch((err) => {
      APIResponse.badRequest(res, err, {});
    });
};
const getEachBlog = (req, res) => {
  blogSchema
    .findById(req.query.id)
    .then((value) => {
      APIResponse.success(res, "success", value);
    })
    .catch((err) => {
      APIResponse.badRequest(res, err, {});
    });
};
const editBlogs = (req, res) => {
  blogSchema
    .findById(req.query.id)
    .then((blogData) => {
      const pattern = /\/([^/?]+)\?/;
      var fileName = blogData.photoUrl;
      const match = fileName.match(pattern);

      if (match) {
        uploadImage.deleteImage(
          match[1],
          (callback) => {
            if (req.file) {
              uploadImage.uploadImage(
                req.file,
                (callback) => {
                  req.body.photoUrl = callback;
                  blogSchema
                    .findByIdAndUpdate(req.query.id, req.body)
                    .then((value) => {
                      APIResponse.success(
                        res,
                        "Successfully updated blog",
                        value
                      );
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
              blogSchema
                .findByIdAndUpdate(req.query.id, req.body)
                .then((value) => {
                  APIResponse.success(res, "Successfully added blog", value);
                })
                .catch((err) => {
                  APIResponse.badRequest(res, err.message, {});
                });
            }
          },
          (onerror) => {
            if (onerror.code === 404) {
              if (req.file) {
                uploadImage.uploadImage(
                  req.file,
                  (callback) => {
                    req.body.photoUrl = callback;
                    blogSchema
                      .findByIdAndUpdate(req.query.id, req.body)
                      .then((value) => {
                        APIResponse.success(
                          res,
                          "Successfully updated blog",
                          value
                        );
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
                blogSchema
                  .findByIdAndUpdate(req.query.id, req.body)
                  .then((value) => {
                    APIResponse.success(res, "Successfully added blog", value);
                  })
                  .catch((err) => {
                    APIResponse.badRequest(res, err.message, {});
                  });
              }
            } else {
              APIResponse.badRequest(res, "Invalid file", {});
            }
          }
        );
      } else {
        if (req.file) {
          uploadImage.uploadImage(
            req.file,
            (callback) => {
              req.body.photoUrl = callback;
              blogSchema
                .findByIdAndUpdate(req.query.id, req.body)
                .then((value) => {
                  APIResponse.success(res, "Successfully added blog", value);
                })
                .catch((err) => {
                  APIResponse.badRequest(res, err, {});
                });
            },
            (onError) => {
              APIResponse.badRequest(res, "Invalid file", {});
            }
          );
        } else {
          blogSchema
            .findByIdAndUpdate(req.query.id, req.body)
            .then((value) => {
              APIResponse.success(res, "Successfully added blog", value);
            })
            .catch((err) => {
              APIResponse.badRequest(res, err, {});
            });
        }
      }
    })
    .catch((e) => {
      APIResponse.notFound(res, "no blog found", {});
    });
};
const deleteBlogs = (req, res) => {
  blogSchema
    .findByIdAndDelete(req.body.id)
    .then((value) => {
      const pattern = /\/([^/?]+)\?/;
      var fileName = value.photoUrl;
      const match = fileName.match(pattern);
      if (match) {
        uploadImage.deleteImage(
          match[1],
          (callback) => {
            APIResponse.success(res, "success", value);
          },
          (onError) => {
            APIResponse.success(res, "success", {});
          }
        );
      } else {
        APIResponse.success(res, "success", value);
      }
    })
    .catch((err) => {
      APIResponse.badRequest(res, err, {});
    });
};

module.exports = { addBlog, getBlogs, deleteBlogs, editBlogs, getEachBlog };
