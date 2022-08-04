const { Likes, Posts } = require("../lib/sequelize");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const { generateToken } = require("../lib/jwt");
const likeController = {
  addLike: async (req, res) => {
    try {
      const { UserId, PostId } = req.body;
      const check = await Likes.findOne({
        where: {
          [Op.and]: {
            UserId,
            PostId,
          },
        },
      });

      const checkPost = await Posts.findOne({
        where: {
          id: PostId,
        },
      });

      console.log(check);

      if (check) {
        await Likes.destroy({
          where: {
            id: check.dataValues.id,
          },
        });

        await Posts.update(
          {
            number_of_likes: checkPost.dataValues.number_of_likes - 1,
          },
          { where: { id: PostId } }
        );

        return res.status(200).json({
          message: "unlike post",
        });
      }

      await Likes.create({
        UserId,
        PostId,
      });
      await Posts.update(
        {
          number_of_likes: checkPost.dataValues.number_of_likes + 1,
        },
        { where: { id: PostId } }
      );

      return res.status(200).json({
        message: "like post",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.toString(),
      });
    }
  },
};

module.exports = likeController;
