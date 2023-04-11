const postsController = require("../controllers/postsController");
const requireUser = require("../middlewares/requireUser");
const {demoUser} = require("../middlewares/demoUser");

const router = require("express").Router();

router.post("/", requireUser ,demoUser, postsController.createPost);
router.post("/like", requireUser, postsController.likeAndUnlikePost);
router.put("/", requireUser,demoUser, postsController.updatePost);
router.delete("/", requireUser,demoUser, postsController.deletePost);


module.exports = router;
