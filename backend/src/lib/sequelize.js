const { Sequelize } = require("sequelize");
const dbConfig = require("../configs/database");

const sequelize = new Sequelize({
  username: dbConfig.MYSQL_USERNAME,
  password: dbConfig.MYSQL_PASSWORD,
  database: dbConfig.MYSQL_DB_NAME,
  port: dbConfig.MYSQL_PORT,
  dialect: "mysql",
});

//models
const Users = require("../models/users")(sequelize);
const Posts = require("../models/post")(sequelize);
const Likes = require("../models/likes")(sequelize);
const Comments = require("../models/comments")(sequelize);
const VerificationToken = require("../models/verification_token")(sequelize);
const ForgotToken = require("../models/forgot_token")(sequelize)

// 1 : M
Posts.belongsTo(Users, { foreignKey: "user_id" });
Users.hasMany(Posts, { foreignKey: "user_id" });

//Like
// Post.belongsToMany(User, { through: Like });
// User.belongsToMany(Post, { through: Like });
Users.hasMany(Likes, { foreignKey: "UserId" });
Likes.belongsTo(Users, { foreignKey: "UserId" });
Posts.hasMany(Likes, { foreignKey: "PostId" });
Likes.belongsTo(Posts, { foreignKey: "PostId" });

//Comment
// Post.belongsToMany(User, { through: Comment });
// User.belongsToMany(Post, { through: Comment });
Users.hasMany(Comments, { foreignKey: "UserId" });
Comments.belongsTo(Users, { foreignKey: "UserId" });
Posts.hasMany(Comments, { foreignKey: "PostId" });
Comments.belongsTo(Posts, { foreignKey: "PostId" });

//Verification
VerificationToken.belongsTo(Users, { foreignKey: "user_id" })
Users.hasMany(VerificationToken, { foreignKey: "user_id" })

//ForgotPass
ForgotToken.belongsTo(Users, { foreignKey: "user_id"})
Users.hasMany(ForgotToken, { foreignKey: "user_id"} )

module.exports = {
  sequelize,
  Posts,
  Users,
  Comments,
  Likes,
  VerificationToken,
  ForgotToken
};
