const express = require("express");
const router = express.Router();
// const { authorizedLoggedInUser } = require("../middlewares/authMiddleware");
const multer = require("multer");
const {authorizedLoggedInUser} = require("../middleware/authMiddleware")
const upload = multer({
  limits: {
    fileSize: 1000000000000000, //Byte
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("File harus berupa png,jpg,jpeg"), false);
    }
    cb(null, true);
  },
});
const { userController } = require("../controller");

const fileUploader = require("../lib/uploader");

router.post("/login", userController.login);

router.post("/register", userController.register);

router.patch("/edit-profile/:user_id",userController.editProfile);

router.patch(
  "/edit-avatar/:user_id",
  fileUploader({
    destinationFolder:"avatar",
    fileType: "image",
    prefix: "PROFILEPIC"
  }).single("avatar"),
  userController.editAvatar
)

router.get("/refresh-token", authorizedLoggedInUser, userController.keepLogin);

router.get("/avatar/:user_id", userController.renderAvatar);

router.patch("/verify/:vertoken", userController.verifyUser);

router.patch("/forgot-password/:fortoken",userController.resetPassword);

router.post("/resendVerif", userController.resendVerif)


module.exports = router;
