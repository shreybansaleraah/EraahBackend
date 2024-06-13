const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
var bodyParser = require("body-parser");
dotenv.config();
// const bodyParser = require("body-parser")
const app = express();
const Routes = require("./routes/route.js");
const { APIResponse } = require("./utility/index.js");
const celebrate = require("celebrate");
const PORT = process.env.PORT || 5000;
const specialCharsRegex = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]/g;

// app.use(bodyParser.json({ limit: '10mb', extended: true }))
// app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }))

// app.use(express.urlencoded({ limit: "50mb", extended: true }));
// app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
// app.use(express.bodyParser({ limit: "50mb", extended: true }));
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ limit: "50mb" }));
app.use(cors());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log("NOT CONNECTED TO NETWORK", err));

app.use("/", Routes);

app.listen(PORT, () => {
  console.log(`Server started at port no. ${PORT}`);
});

/// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err["status"] = 404;
  next(err);
});

/// error handlers
app.use((err, req, res, next) => {
  /**
   * Handle 401 thrown by express-jwt library
   */
  if (err.name === "UnauthorizedError") {
    return res.status(err.status).send({ message: err.message }).end();
  }
  return next(err);
});

app.use((err, req, res, next) => {
  // logger.error("Instance of Bad error:", err);
  if (err.status && err.status == 404) {
    return APIResponse.notFound(res, err.message, "");
  } else if (celebrate.isCelebrateError(err)) {
    const validationError = err.details.get("body");
    const errorMessage = validationError
      ? validationError.details
          .map((detail) => detail.message.replace(specialCharsRegex, ""))
          .join(", ")
      : "Validation error";

    return APIResponse.badRequest(res, errorMessage, {});
  } else {
    return APIResponse.internalServerError(
      res,
      `Oops! This shouldn't have happened. Please try this in some time. We sincerely apologise for the inconvenience caused.`,
      ""
    );
  }
});
