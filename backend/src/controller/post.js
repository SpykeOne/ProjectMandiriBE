const { Posts, Users, Likes, Comments } = require("../lib/sequelize");
const sharp = require("sharp");

const postController = {
  getAllPost: async (req, res) => {
    try {
      const findPost = await Posts.findAll({
        include: [Users, Likes, Comments],
        limit: 10,
        offset: 0,
        order:[['createdAt', 'DESC']]
      });
      return res.status(200).json({
        message: "fetched data post",
        results: findPost,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "error",
      });
    }
  },
  getPostPaging: async (req, res) => {
    try {
      const { limit = 5, page = 1 } = req.query;

      console.log(req.query)

      const findPost = await Posts.findAll({
        offset:  (page - 1) * limit,
        limit: limit ? parseInt(limit) : null,
        include: [Users, Likes, {model: Comments, include:[Users]}],
        order: [["createdAt", 'DESC']]
      });
      

      return res.status(200).json({
        message: "fetching post",
        result: findPost,
      });
    } catch (err) {
      console.log(err);

      res.status(400).json({
        message: "error",
      });
    }
  },
  getPostByUser: async (req, res) => {
    try {
      const { username } = req.params;
      // console.log("halo");
      const findPost = await Posts.findAll({
        include: [
          Likes,
          Comments,
          {
            model: Users,
            where: {
              username,
            },
          },
        ],
      });

      console.log(findPost);

      return res.status(200).json({
        message: "fetching data",
        results: findPost,
      });
    } catch (err) {
      console.log(err);

      res.status(400).json({
        message: "error ",
      });
    }
  },
  getPostByLiked: async (req, res) => {
    try {
      const { id } = req.params;
      const findPost = await Posts.findAll({
        include: [
          Users,
          Comments,
          {
            model: Likes,
            where: {
              UserId: id,
            },
          },
        ],
      });
      console.log(findPost);
      return res.status(200).json({
        message: "fetching data",
        results: findPost,
      });
    } catch (err) {
      console.log(err);

      res.status(400).json({
        message: "error ",
      });
    }
  },

  getPostById: async (req,res) =>{
    try{
      const { id } = req.params;

      const findPost = await Posts.findByPk(id,
        {
          include : [Users, Likes, Comments]
        },
      )
      console.log(findPost)
      return res.status(200).json({
        message: "fetching specific post",
        result: findPost
      })
    } catch (err) {
      console.log(err)

      res.status(400).json({
        message: "error",
      });
    }
  },

  addPost: async (req, res) => {
    try {
      const {caption, location, user_id} = req.body;
      const { filename } = req.file

      await Posts.create({
        image_url: `${process.env.UPLOAD_FILE_DOMAIN}/${process.env.PATH_POST}/${filename}`,
        caption,
        location,
        user_id,
      });

      return res.status(200).json({
        message: "New post added",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Error",
      });
    }
  },
  
  deletePost: async (req, res) => {
    try {
      const { id } = req.params;

      await Posts.destroy({
        where: {
          id,
        },
      });

      return res.status(200).json({
        message: "Post deleted",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Error",
      });
    }
  },
  editPost: async (req, res) => {
    try {
      const { id } = req.params;
      console.log(req.body);

      await Posts.update(
        {
          ...req.body,
        },
        {
          where: {
            id,
          },
        }
      );

      return res.status(200).json({
        message: "Post edited",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Error",
      });
    }
  },
  uploadPost: async (req, res) => {
    try {
      const { caption, location, user_id } = req.body;
      const uploadFileDomain = process.env.UPLOAD_FILE_DOMAIN;
      const filePath = "post_images";
      const { filename } = req.file;
      console.log("halo");

      const newPost = await Posts.create({
        image_url: `${uploadFileDomain}/${filePath}/${filename}`,
        caption,
        location,
        user_id,
      });

      return res.status(201).json({
        message: "Post created",
        result: newPost,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
};

module.exports = postController;
