const { DataTypes } = require("sequelize");

const Posts = (sequelize) => {
  return sequelize.define("Post", {
    image_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    caption: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    number_of_likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  });
};

module.exports = Posts;
