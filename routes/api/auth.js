const express =  require('express');
const router = express.Router();
const auth  = require('../../middleware/auth');
const User =  require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const  { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { errorsCheck } = require('../utils/helper');

// @route  GET api/auth
// @desc   Test route
// @acess  Public 
router.get('/', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).send(user); 
    }catch(error){
        console.error(error);
        res.status(500).send('Server error');
    }
});


// @route  POST api/auth
// @desc   Authenticate user & get token
// @acess  Public 
router.post('/',
    [ 
        check('email', 'Please Include a valid Email')
        .isEmail(),
        check('password', 'Password is required')
        .exists(),
    ],
    async (req, res) =>{ 
        const validation = errorsCheck(req);
        if(validation.type){
        return res.status(400).send({
            type: 'error',
            message: validation.msg
        });
        }
        const {
            password,
            email
        } = req.body;

        try{

        //See if the user exists
        let user =  await User.findOne({ email });
        if(!user){
            return res.status(400).json({ type: 'error', message: 'Invalid credentials'});
        }
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch){
            return res.status(400).json({ type: 'error', message: 'Invalid credentials'});
        }
        //Return JWT
        const payload = {
            user: {
                id: user.id
            }
        };
        jwt.sign(
            payload, 
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token)=>{
                if(err) throw err;
                res.status(200).send({token});
            });
        } catch(err){
        console.error(err);
        return res.status(500).send('Server Error');
        }
    });


module.exports = router;