const express = require("express");
const multer = require("multer");

const router = express.Router();

const upload = multer();

const { chat } = require("../controllers/aiController");
const { transcribe } = require("../controllers/sttController");

router.post("/", chat);

router.post(
  "/transcribe",
  upload.single("audio"),
  transcribe
);

module.exports = router;