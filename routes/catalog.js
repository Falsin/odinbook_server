const express = require("express");
const router = express.Router();

router.get("/", (req, res, next) => {
  console.log('fuck')
  res.json('hello!')
})

module.exports = router;