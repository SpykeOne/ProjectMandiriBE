const { Comments, Users } = require("../lib/sequelize");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { generateToken } = require("../lib/jwt");
const commentController = {
  fetchComment: async (req, res) => {
    try {
      const { PostId } = req.query;
      const { limit = 5, page = 1 } = req.query

      // console.log(req.query)

      console.log(PostId);

      const comments = await Comments.findAll({
        offset: (page-1) * limit,
        include: Users,
        limit: limit ? parseInt(limit) : 5,
        where: {
          PostId,
        },
      });
      console.log(comments);

      res.status(200).json({
        message: "loading comments",
        result: comments,
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        message: err.toString(),
      });
    }
  },
  postComment: async (req, res) => {
    try {
      const { UserId, content, PostId } = req.body;

      console.log(req.body);

      await Comments.create({
        UserId,
        content,
        PostId,
      });

      return res.status(200).json({
        message: "new comment added",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.toString(),
      });
    }
  },
};

module.exports = commentController;
