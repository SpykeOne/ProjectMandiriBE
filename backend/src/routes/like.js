const express = require("express");
const router = express.Router();
// const { authorizedLoggedInUser } = require("../middlewares/authMiddleware");

const { likeController } = require("../controller");
const { route } = require("./post");

// router.get("/", likeController.login);

// router.get("/post/:id", likeController.getLikebyPost);

router.post("/", likeController.addLike);


//  

module.exports = router;
