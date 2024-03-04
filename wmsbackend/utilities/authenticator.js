const jwt = require('jsonwebtoken');
const TOKEN_SECRET="SEWMSPROJECT";

let auth={};

auth.authenticateToken=async(req, res, next)=> {

  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1];
    console.log(token,"<<>>token");
  if (token == null) return res.sendStatus(401)

  await jwt.verify(token, TOKEN_SECRET, (err, user) => {
    console.log(err,"ERROR")

    if (err) return res.sendStatus(403)

    req.user = user;

    next();
  })
}

module.exports=auth;