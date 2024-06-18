const AdmZip = require("adm-zip");
const fs = require("fs");
const path = require("path");
const { APIResponse } = require("../utility");
const NGOSchema = require("../models/NGOSchema");
const { uploadImageFromPath } = require("../utility/uploadImage");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;

// const urlConverter = (req, res) => {
//   //   const zipPath = path.join(__dirname, "images.zip");

//   NGOSchema.findById(req.query.id)
//     .then((ngoData) => {
//       if (ngoData) {
//         const zipPath = req.file.buffer;
//         console.log(req.file);
//         const extractFolder = path.join(__dirname, "extracted_images"); // Ensure it's an absolute path
//         const csvPath = path.join(__dirname, "image_urls.csv");
//         console.log(csvPath);
//         const baseUrl = "http://localhost/images/";

//         try {
//           if (!fs.existsSync(extractFolder)) {
//             fs.mkdirSync(extractFolder);
//           } else {
//             // Clean up the extraction folder
//             fs.readdirSync(extractFolder).forEach((file) => {
//               const filePath = path.join(extractFolder, file);
//               fs.unlinkSync(filePath);
//             });
//           }
//           // Extract zip file
//           console.log("load admzip");
//           const zip = new AdmZip(zipPath);
//           console.log("image extracting");
//           zip.extractAllTo(extractFolder, true);

//           // Ensure the directory was created
//           if (!fs.existsSync(extractFolder)) {
//             throw new Error("Extraction folder not found.");
//           }

//           // Get image filenames and create URLs
//           console.log("image array declaration");
//           const imageUrls = [];
//           const files = fs.readdirSync(extractFolder);

//           if (files.length === 0) {
//             throw new Error("No files found in the extracted folder.");
//           }

//           console.log("start for each loop");
//           files.forEach(async (file) => {
//             const ext = path.extname(file).toLowerCase();
//             console.log("file");
//             console.log(file);
//             console.log(ext);
//             if ([".png", ".jpg", ".jpeg", ".gif", ".bmp"].includes(ext)) {
//               if (file && file.trim()) {
//                 console.log(path.join(__dirname, `extracted_images/${file}`));
//                 await uploadImageFromPath(
//                   path.join(__dirname, `extracted_images/${file}`),
//                   (callback) => {
//                     console.log("upload success");
//                     console.log(callback);
//                     imageUrls.push({
//                       url: callback,
//                     });
//                   },
//                   (onError) => {
//                     console.log("onError");
//                     console.log(onError);
//                     console.log("onError finish");
//                   }
//                 );
//               } else {
//                 console.warn("Invalid filename found:", file);
//               }
//             }
//           });

//           if (imageUrls.length === 0) {
//             console.log("imageUrls start");
//             console.log(imageUrls);
//             console.log("imageUrls finish");
//             throw new Error("No valid image files found.");
//           }

//           // Write to CSV
//           const csvWriter = createCsvWriter({
//             path: csvPath,
//             header: [
//               // { id: "filename", title: "Filename" },
//               { id: "url", title: "URL" },
//             ],
//           });

//           csvWriter
//             .writeRecords(imageUrls)
//             .then(() => {
//               console.log("CSV file was written successfully");
//               res.download(csvPath, "image_urls.csv", (err) => {
//                 if (err) {
//                   console.error("Error sending file:", err);
//                   // res.status(500).send("Error sending file");
//                   APIResponse.badRequest(res, "Error sending file", {});
//                 } else {
//                   // Optionally delete the file after sending it
//                   fs.unlink(csvPath, (err) => {
//                     if (err) {
//                       // console.error("Error deleting file:", err);
//                       APIResponse.badRequest(res, err, {});
//                     } else {
//                       fs.readdirSync(extractFolder).forEach((file) => {
//                         const filePath = path.join(extractFolder, file);
//                         fs.unlinkSync(filePath);
//                       });
//                     }
//                   });
//                 }
//               });
//             })
//             .catch((err) => {
//               console.error("Error writing CSV file", err);
//               // res.status(500).send("Error writing CSV file");
//               APIResponse.badRequest(res, "Error writing CSV file", {});
//             });
//         } catch (err) {
//           console.error("An error occurred:", err);
//           // res.status(500).send(`An error occurred: ${err.message}`);
//           APIResponse.badRequest(
//             res,
//             err.message ?? "something went wrong",
//             {}
//           );
//         }
//       } else {
//         APIResponse.unAuthorized(res, "UnAuthorize", {});
//       }
//     })
//     .catch((err) => {
//       APIResponse.badRequest(res, "Invalid Data", {});
//     });
// };

const urlConverter = (req, res) => {
  NGOSchema.findById(req.query.id)
    .then(async (ngoData) => {
      // Made the callback function async
      if (ngoData) {
        const zipPath = req.file.buffer;
        console.log(req.file);
        const extractFolder = path.join(
          __dirname,
          `extracted_images${req.query.id}`
        ); // Ensure it's an absolute path
        const csvPath = path.join(__dirname, `image_urls${req.query.id}.csv`);
        console.log(csvPath);
        const baseUrl = "http://localhost/images/";

        try {
          if (!fs.existsSync(extractFolder)) {
            fs.mkdirSync(extractFolder);
          } else {
            // Clean up the extraction folder
            fs.rmSync(extractFolder, { recursive: true, force: true });
            // fs.readdirSync(extractFolder).forEach((file) => {
            //   const filePath = path.join(extractFolder, file);
            //   fs.unlinkSync(filePath);
            // });
          }
          // Extract zip file
          console.log("load admzip");
          const zip = new AdmZip(zipPath);
          console.log("image extracting");
          zip.extractAllTo(extractFolder, true);

          // Ensure the directory was created
          if (!fs.existsSync(extractFolder)) {
            throw new Error("Extraction folder not found.");
          }

          // Get image filenames and create URLs
          console.log("image array declaration");
          const files = fs.readdirSync(extractFolder);

          if (files.length === 0) {
            throw new Error("No files found in the extracted folder.");
          }

          console.log("start map for promises");
          const imageUrls = await Promise.all(
            files.map(async (file) => {
              const ext = path.extname(file).toLowerCase();
              console.log("file");
              console.log(file);
              console.log(ext);
              if ([".png", ".jpg", ".jpeg", ".gif", ".bmp"].includes(ext)) {
                if (file && file.trim()) {
                  // console.log(path.join(__dirname, `extracted_images/${file}`));
                  return new Promise((resolve, reject) => {
                    uploadImageFromPath(
                      path.join(
                        __dirname,
                        `extracted_images${req.query.id}/${file}`
                      ),
                      (callback) => {
                        console.log("upload success");
                        console.log(callback);
                        resolve({ url: callback });
                      },
                      (onError) => {
                        console.log("onError");
                        console.log(onError);
                        reject(onError);
                      }
                    );
                  });
                } else {
                  console.warn("Invalid filename found:", file);
                }
              }
            })
          );

          // Filter out any undefined results
          const validImageUrls = imageUrls.filter((url) => url);

          if (validImageUrls.length === 0) {
            console.log("imageUrls start");
            console.log(validImageUrls);
            console.log("imageUrls finish");
            throw new Error("No valid image files found.");
          }

          // Write to CSV
          const csvWriter = createCsvWriter({
            path: csvPath,
            header: [{ id: "url", title: "URL" }],
          });

          await csvWriter.writeRecords(validImageUrls);
          console.log("CSV file was written successfully");
          APIResponse.success(res, "success", {
            downloadUrl: `/download?file=image_urls${req.query.id}.csv&id=${req.query.id}`,
          });
        } catch (err) {
          console.error("An error occurred:", err);
          APIResponse.badRequest(
            res,
            err.message ?? "something went wrong",
            {}
          );
        }
      } else {
        APIResponse.unAuthorized(res, "UnAuthorize", {});
      }
    })
    .catch((err) => {
      APIResponse.badRequest(res, "Invalid Data", {});
    });
};

const getCsvFile = (req, res) => {
  const filePath = path.join(__dirname, req.query.file);
  console.log("file path start");
  console.log(filePath);

  res.download(filePath, "image_urls.csv", (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Error sending file");
    } else {
      // Optionally delete the file after sending it
      fs.unlink(filePath, (err) => {
        const extractFolder = path.join(
          __dirname,
          `extracted_images${req.query.id}`
        );
        // fs.unlink(extractFolder);
        fs.rmSync(extractFolder, { recursive: true, force: true });
        // fs.readdirSync(extractFolder).forEach((file) => {
        //   const filePath = path.join(extractFolder, file);
        // });
        if (err) {
          console.error("Error deleting file:", err);
        }
      });
    }
  });
};

module.exports = {
  urlConverter,
  getCsvFile,
};
