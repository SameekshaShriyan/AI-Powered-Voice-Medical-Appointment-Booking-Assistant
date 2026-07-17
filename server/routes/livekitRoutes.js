const express = require("express");
const router = express.Router();
const { getToken } = require("../controllers/livekitController");

router.get("/token", getToken);

module.exports = router;