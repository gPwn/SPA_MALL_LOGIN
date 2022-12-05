const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

mongoose.connect("mongodb://127.0.0.1:27017/shopping-demo", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

const app = express();
const router = express.Router();


// const User = require("./models/user.js");
//회원가입
// router.post("/users", async(req, res) => {
//   const { nickname, email, password, confirmPassword } = req.body;

//   //1. 패스워드, 패스워드 검증 값이 일치하는가
//   if ( password !== confirmPassword ) {
//     res.status(400).json({
//       errorMessage : "password와 confirmPassword가 일치하지 않습니다."
//     });
//     return;
//   }
//   //2. email에 해당하는 사용자가 있는가 3. nickname에 해당하는 사용자가 있는가

//   const existUser = await User.findOne({
//     $or : [{email: email}, {nickname : nickname}]
//   });

//   if(existUser) {
//     res.status(400).json({
//       errorMessage : "Email이나 Nickname이 이미 사용중입니다."
//     });
//     return;
//   }

//   //4. DB에 데이터를 삽입
//   const user = new User({nickname, email, password});
//   await user.save();

//   res.status(201).json({});
// });


//회원가입 mysql
const { Op } = require("sequelize");
const { User } = require("./models");

router.post("/users", async (req, res) => {
  const { email, nickname, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    res.status(400).send({
      errorMessage: "패스워드가 패스워드 확인란과 다릅니다.",
    });
    return;
  }

  // email or nickname이 동일한게 이미 있는지 확인하기 위해 가져온다.
  const existsUsers = await User.findAll({
    where: {
      [Op.or]: [{ email }, { nickname }],
    },
  });
  if (existsUsers.length) {
    res.status(400).send({
      errorMessage: "이메일 또는 닉네임이 이미 사용중입니다.",
    });
    return;
  }

  await User.create({ email, nickname, password });
  res.status(201).send({});
});


//로그인
// router.post("/auth", async (req, res) => {
//   const {email, password} = req.body;

//   const user = await User.findOne({email});

//   //1. 사용자가 존재하지 않거나,
//   //2. 입력받은 password와 사용자의 password가 다를때 에러메세지가 발생해야한다.
//   if(!user || password !== user.password) {
//     res.status(400).json({
//       errorMessage: "사용자가 존재하지 않거나, 사용자의 password와 입력받은 password가 존재하지 않습니다."
//     });
//     return;
//   };

//   const token = jwt.sign({userId : user.userId}, "hyeju-secret-key")

//   res.send({
//     token,
//   })
// });


// 로그인 구현 mysql
router.post("/auth", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    where: {
      email,
    },
  });

  // NOTE: 인증 메세지는 자세히 설명하지 않는것을 원칙으로 한다: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses
  if (!user || password !== user.password) {
    res.status(400).send({
      errorMessage: "이메일 또는 패스워드가 틀렸습니다.",
    });
    return;
  }

  res.send({
    token: jwt.sign({ userId: user.userId }, "customized-secret-key"),
  });
});

const authMiddleWare = require("./middlewares/authMiddlewares.js");
router.get("/users/me", authMiddleWare, async(req, res) => {
  res.status(200).json({user : res.locals.user});
});

app.use("/api", express.urlencoded({ extended: false }), router);
app.use(express.static("assets"));

app.listen(8080, () => {
  console.log("서버가 요청을 받을 준비가 됐어요");
});