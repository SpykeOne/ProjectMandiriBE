const { Users, VerificationToken, } = require("../lib/sequelize");
const { Op, where } = require("sequelize");
const bcrypt = require("bcrypt");
const { generateToken, verifyToken } = require("../lib/jwt");
const sharp = require("sharp");
const mailer = require("../lib/mailer");
const mustache = require("mustache");
const { nanoid } = require("nanoid");
const moment = require("moment")
const fs = require("fs");



async function SendVerification(id, email, username) {

const vertoken = await generateToken({id , isEmailVerification : true}, "300s");
const url_verify = process.env.LINK_VERIFY + vertoken

await mailer({
  to: email,
  subject: "Hi " + username + " please kindly verify your account",
  html: `<div> <h1> Your Account has been registered</h1> </div>
   <div> Please verify your account with the button below</div>
   <div> <button> <a href="${url_verify}"> Verify </a> </button>`, 
 })


return vertoken
}

// async function SendResetPassword(id, email, username){

//   const vertoken = await generateToken({id, isEmailVerification : true}, "300s")

//   const url_verify = process.env.LINK_RESETP + vertoken

//   await mailer ({
//     to:email,
//     subject: "Hi " + username + " your reset password submission has been accepted",
//     html: `<div> <h1> You can now reset your password </h1> </div>
//     <div> Please click the button below to continue <div>
//     <div> <button href="${url_verify}"> Reset Password </button>`
//   })


//   return vertoken
// }

const userController = {
  login: async (req, res) => {
    try {
      const { email, password, username } = req.body;

      const user = await Users.findOne({
        where: {
          [Op.or]: [{ username }, { email }],
        },
      });

      if (!user) {
        throw new Error("username/email/password not found");
      }

      const checkPass = await bcrypt.compareSync(password, user.password);
      console.log(checkPass);
      
      if (!checkPass) {
        throw new Error("password salah");
      }
      const token = generateToken({ id: user.id });

      // delete user.dataValues.password;
      delete user.dataValues.createdAt;
      delete user.dataValues.updatedAt;

      console.log(user);

      res.status(200).json({
        message: "login succeed",
        result: { user, token },
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        message: err.toString(),
      });
    }
  },
  register: async (req, res) => {
    try {
      const { username, password, full_name, email } = req.body;
      const findUser = await Users.findOne({
        where: {
          [Op.or]: [{ username }, { email }],
        },
      });

      if (findUser) {
        throw Error("username/email has been taken");
      }

      console.log(findUser);

      const hashedPassword = bcrypt.hashSync(password, 5);

      const user = await Users.create({
        username,
        password: hashedPassword,
        full_name,
        email,
      });

      const token = await generateToken({ id: user.id, isEmailVerification : true });
      
      const verToken = await SendVerification(user.id, email, username)

      // console.log(verToken)

      return res.status(200).json({
        message: "new user has been created",
        result: { user, token, verToken },
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: err.toString(),
      });
    }
  },
  keepLogin: async (req, res) => {
    // Terima token
    // Check kalau token valid
    // Renew token
    // Kirim token + user data
    try {
      const { token } = req;

      const renewedToken = generateToken({ id: token.id, password: token.password });

      const findUser = await Users.findByPk(token.id);
      console.log(findUser)

      delete findUser.password;

      return res.status(200).json({
        message: "Renewed user token",
        result: {
          user: findUser,
          token: renewedToken,
        },
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error",
      });
    }
  },
  editProfile: async (req, res) => {
    try {
      const { user_id } = req.params
      const { username, full_name, bio } = req.body;     
      console.log(req.body)
      // if (req.body) {

      //   const checkAvatar = await Users.findOne({
      //     id
      //   });
      //   if (!checkAvatar) {
      //     let editUser = new Users();
      //     editUser.avatar = avatar;
      //     editUser.user_id = user_id;
      //     await newAva.save();
      //   } else {
      //     checkAvatar.avatar = avatar;
      //     await checkAvatar.save();
      //   }
      // } 

  await Users.update(
        {
          full_name,
          username,
          bio,
        },
        {
          where: {
            id: user_id
          },
        }
      );

      const user = await Users.findByPk(user_id)
      console.log(user)

      return res.status(200).json({
        message: "Changes saved",
        result : user 
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "Error",
      });
    }
  },
  editAvatar: async (req, res) => {
    try{
      const { user_id } = req.params;

      const { filename } = req.file
  
      // const user = await Users.findOne({
      //   user_id
      // })
  
      await Users.update({
        avatar: `${process.env.UPLOAD_FILE_DOMAIN}/${process.env.PATH_AVATAR}/${filename}`
      },
      {
        where : {
          id: user_id
      },
      })
  
      return res.status(200).json ({
        message: "Avatar updated",
        // result: user
      })
    } catch (err) {
      console.log(err)
      return res.status(500).json({
        message: "Error in updating avatar"
      })
    }
  },
  renderAvatar: async (req, res) => {
    try {
      // Get user
      const { user_id } = req.params;

      const user = await Users.findOne({ user_id });

      if (!user) {
        throw new Error("No Avatar Found");
      }

      // Config untuk mengirim image
      res.set("Content-type", "image/png");

      // Kirim image
      res.send(user.image);
    } catch (err) {
      res.send(err);
    }
  },
  verifyUser: async (req,res) => {
    
    try{
      const { vertoken } = req.params
      console.log(vertoken)

      const isTokenVerified= verifyToken(vertoken, process.env.JWT_SECRET_KEY)
 
      if(!isTokenVerified || !isTokenVerified.isEmailVerification){
        throw new Error("token is invalid")
      }

      await Users.update({ is_verified: true}, {where: {
        id: isTokenVerified.id
      }})

      return res.status(200).json({
        message: "User is Verified",
        success:  true
      })

    }
    catch(err) {
      console.log(err);
      res.status(400).json({
        message: err.toString(),
        success : false
      })
    }
  },
  resetPassword: async (req, res) => {
    // const { forToken }  = req.params
    
    // const isTokenVerified = fpToken(forToken, process.env.JWT_SECRET_KEY)
  },
  resendVerif: async (req, res) => {
    try{

      const {id , username, email} = req.body

      console.log(req.body)

      const token = generateToken ({id: id, username: username, email: email})
      const verToken = await SendVerification(id,email,username)

      console.log(verToken)
      
      return res.status(200).json({
        message: "Verification request has been sent to your email",
        result: {token, verToken}
      })


    }catch(err){
      console.log(err)
      res.status(400).json({
        message: err.toString(),
        success: false
      })

    }
  }


  // registerUserV2: async (req, res) => {
  //   try {
  //     const { username, password, full_name, email } = req.body;

  //     const findUser = await Users.findOne({
  //       where: {
  //         [Op.or]: [{ username }, { email }],
  //       },
  //     });
  //     console.log(findUser);

  //     const hashedPassword = bcrypt.hashSync(password, 5);

  //     const user = await Users.create({
  //       username,
  //       password: hashedPassword,
  //       full_name,
  //       email,
  //     });
  //     // Verification email
  //     const verificationToken = nanoid(40);

  //     await VerificationToken.create({
  //       token: verificationToken,
  //       user_id: user.id,
  //       valid_until: moment().add(1, "hour"),
  //       is_valid: true
  //     })

  //     const verificationLink =
  //       `http://localhost:3000/verification/${verificationToken}`

  //     const template = fs.readFileSync(__dirname + "/../templates/verify.html").toString()

  //     const renderedTemplate = mustache.render(template, {
  //       username,
  //       verify_url: verificationLink,
  //       full_name
  //     })

  //     await mailer({
  //       to: email,
  //       subject: "Verify your account!",
  //       html: renderedTemplate
  //     })

  //     return res.status(201).json({
  //       message: "Registered user"
  //     })
  //   } catch (err) {
  //     console.log(err)
  //     return res.status(500).json({
  //       message: "Server error"
  //     })
  //   }
  // },
  
};

module.exports = userController;





// register => create 2 token 
// token = login (id). by default exp = 2d
// token2 = verify(id , isEmailVerification = true) exp = 30m

// => login 
// => email => link => verification page

// token = route.params

// localhost:3000/users/verify

// cek verifyToken(token)

// object token 
// token.id
// token.isEmailVerification



// IF( token.isEmailVerification )
// {

//   axios.post(/users/verify) => 
//   try
//   cek user.is_verified ? throw error
//   update user.is_verified = true 
//   catch error
// }
// else
// {
//   invalid token
// }


// <Text> your acc has been verified </Text>
// <Text> invalid token </Text>


