const requireUser = require("../middlewares/requireUser");
const userController = require("../controllers/UserController");
const { demoUser } = require("../middlewares/demoUser");
const router = require("express").Router();

router.post("/follow", requireUser, userController.followOrUnfollow);
router.get(
  "/getFeedData",
  requireUser,
  userController.getPostOfFollowing
);
router.get("/getMyPosts", requireUser, userController.getMyPosts);
router.get(
  "/getParticularUserPost",
  requireUser,
  userController.getParticularUserPost
);
router.delete("/", requireUser,demoUser, userController.deleteMyProfile);
router.get("/getMyInfo", requireUser, userController.getMyInfo);
router.put("/", requireUser,demoUser, userController.updateMyProfile);
router.post("/getUserProfile", requireUser, userController.getUserProfile);

module.exports = router;
