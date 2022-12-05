// const jwt = require("jsonwebtoken");
// const User = require("../models/user.js");

// const AuthMiddleWares = async (req, res, next) => {
//     const { authorization } = req.headers;
//     // console.log(authorization);
//     const [authType, authToken] = authorization.split(" ");
//     //authtype : Bearer
//     //authToken : 실제 jwt값이 들어옴
//     // console.log([authType, authToken]);

//     if (authType !== "Bearer" || !authToken) {
//         res.status(400).json({
//             errorMessage : "로그인 후 사용이 가능한 API입니다."
//         });
//         return;
//     }

//     //복호화 및 검증
//     try {
//         const {userId} = jwt.verify(authToken, "hyeju-secret-key");
//         const user =  await User.findById(userId);
//         res.locals.user = user;
//         // console.log(user);
//         next();
//     } catch(error) {
//         // console.log(error);
//         res.status(400).json({
//             errorMessage : "로그인 후 사용이 가능한 API입니다."
//         });
//         return;
//     }
// };

// module.exports = AuthMiddleWares;


// middlewares/auth-middleware.js
const jwt = require("jsonwebtoken");
const { User } = require("../models");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  const [authType, authToken] = (authorization || "").split(" ");

  if (!authToken || authType !== "Bearer") {
    res.status(401).send({
      errorMessage: "로그인 후 이용 가능한 기능입니다.",
    });
    return;
  }

  try {
    const { userId } = jwt.verify(authToken, "customized-secret-key");
    User.findByPk(userId).then((user) => {
      res.locals.user = user;
      next();
    });
  } catch (err) {
    res.status(401).send({
      errorMessage: "로그인 후 이용 가능한 기능입니다.",
    });
  }
};