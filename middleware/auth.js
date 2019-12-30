const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function(req, res, next){
    //Get the token from headers
    const token = req.header('x-auth-token');
    if(!token){
        return res.status(401).send({msg: 'No Token, authorization failed'});
    }
    //Verify Token
    try{
        const decoded =  jwt.verify(token, config.get('jwtSecret'));
        req.user = decoded.user;
        next();

    }catch(error){
        res.status(401).send({msg: "Token is invalid"});
    }

}
