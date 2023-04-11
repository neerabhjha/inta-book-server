const Post = require("../models/Post");
const User = require("../models/User");
const { mapPostOutput } = require("../utils/Utils");
const { error, success } = require("../utils/responseWrapper");
const cloudinary = require("cloudinary").v2;

const followOrUnfollow = async (req, res) => {
  try {
    const { userIdToFollow } = req.body;
    const curUserId = req._id;
    // console.log("followId", userIdToFollow, "curId", curUserId);

    const userToFollow = await User.findById(userIdToFollow);
    const curUser = await User.findById(curUserId);

    if (userIdToFollow === curUserId) {
      res.send(error(409, "User can not follow themselves"));
    }

    if (!userIdToFollow) {
      res.send(error(404, "User to follow not found"));
    }

    //if already followed
    if (curUser.followings.includes(userIdToFollow)) {
      const followingIndex = curUser.followings.indexOf(userIdToFollow);
      
      curUser.followings.splice(followingIndex, 1);

      const followerIndex = userToFollow.followers.indexOf(curUserId);
      userToFollow.followers.splice(followerIndex, 1);
      
    } else {
      userToFollow.followers.push(curUserId);
      curUser.followings.push(userIdToFollow);
     
    }

    await curUser.save();
    await userToFollow.save();
    return res.send(success(200, { user: userToFollow }));
  } catch (e) {
    res.send(error(500, e.message));
  }
};

const getPostOfFollowing = async (req, res) => {
  try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId).populate("followings");

    const fullPosts = await Post.find({
      owner: {
        $in: curUser.followings, // return all owner from followings of cur User
      },
    }).populate("owner");

    const posts = fullPosts
      .map((item) => mapPostOutput(item, req._id))
      .reverse();
    // console.log(posts);

    const followingsIds = curUser.followings.map((item) => item._id);
    followingsIds.push(req._id);
    // console.log(followingsIds);
    
    const suggestions = await User.find({
      _id: {
        $nin: followingsIds, // return all userIds except followingsids
      },
    });
    // console.log(suggestions);

    return res.send(success(200, { ...curUser._doc, suggestions, posts }));
  } catch (e) {
    console.log(e);
    res.send(error(500, e.message));
  }
};

const getMyPosts = async (req, res) => {
  try {
    const curUserId = req._id;

    const allUserPosts = await Post.find({
      owner: curUserId,
    }).populate("likes");

    return res.send(success(200, { allUserPosts }));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

const getParticularUserPost = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) {
      return res.send(error(400, "userId is required"));
    }
    const allUserPosts = await Post.find({
      owner: userId,
    }).populate("likes");

    return res.send(success(200, { allUserPosts }));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

const deleteMyProfile = async (req, res) => {
  try {
    const curUserId = req._id;
    const curUser = await User.findById(curUserId);

    //delete all posts
    await Post.deleteMany({
      owner: curUserId,
    });

    //remove myself from my followers' following
    // curUser.followers.forEach(async (followerId) => {
    //   const follower = await User.findById(followerId);
    //   const index = follower?.followings?.indexOf(curUserId);
    //   console.log("following index", index);
    //   follower?.followings?.splice(index, 1);

    //   await follower?.save();
    // });

    // //remove myself from my followings' follower
    // curUser.followings.forEach(async (followingId) => {
    //   const following = await User.findById(followingId);
    //   const index = following?.followers?.indexOf(curUserId);
    //   following?.followers?.splice(index, 1);
    //   await following?.save();
    // });

    //delete all likes by me
    const allposts = await Post.find();
    allposts.forEach(async (post) => {
      const index = post.likes.indexOf(curUserId);
      post.likes.splice(index, 1);
      await post.save();
    });

    //delete my account
    await User.deleteOne({ _id: curUserId });

    res.clearCookie("jwt", {
      httpOnly: true,
      secure: true,
    });

    return res.send(success(200, "User deleted successfully"));
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

const getMyInfo = async (req, res) => {
  try {
    const user = await User.findById(req._id);
    return res.send(success(200, { user }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const updateMyProfile = async (req, res) => {
  try {
    const { name, bio, userImg } = req.body;

    const user = await User.findById(req._id);
    if (name) {
      user.name = name;
    }
    if (bio) {
      user.bio = bio;
    }
    if (userImg) {
      const cloudImg = cloudinary.uploader.upload(userImg, {
        folder: "profileImgSocialMedia",
      });
      user.avatar = {
        url: (await cloudImg).secure_url,
        publicId: (await cloudImg).public_id,
      };
    }

    await user.save();
    return res.send(success(200, { user }));
  } catch (e) {
    return res.send(error(500, e.message));
  }
};

const getUserProfile = async (req, res) => {
  try {
    
    const userId = req.body.userId;
    const user = await User.findById(userId).populate({
      path: "posts",
      populate: {
        path: "owner",
      },
    });

    
    const fullPosts = user.posts;

    const posts = fullPosts
      .map((item) => mapPostOutput(item, userId))
      .reverse(); // getting posts data in recent order

    // console.log(posts);
    return res.send(success(200, { ...user._doc, posts }));

    // _doc is getting only user schema data not any mongodb data
  } catch (e) {
    console.log(e);
    return res.send(error(500, e.message));
  }
};

module.exports = {
  followOrUnfollow,
  getPostOfFollowing,
  getMyPosts,
  getParticularUserPost,
  deleteMyProfile,
  getMyInfo,
  updateMyProfile,
  getUserProfile,
};
