const { Router } = require("express");
const userRoutes = require("./user.route");
const router = Router();

router.use("/v1", userRoutes);

module.exports = router;
