const express =  require('express');
const router = express.Router();
const auth  = require('../../middleware/auth');
const User =  require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const  { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

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
        const errors  = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors : errors});
        }
        const {
            password,
            email
        } = req.body;

        try{

        //See if the user exists
        let user =  await User.findOne({ email });
        if(!user){
            return res.status(400).json({ errors : [ { msg : 'Invalid credentials' }]});
        }
        const isMatch = await bcrypt.compare(password, user.password); 
        if(!isMatch){
            return res.status(400).json({ errors : [ { msg : 'Invalid credentials' }]});
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