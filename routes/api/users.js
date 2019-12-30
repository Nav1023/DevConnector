const express =  require('express');
const router = express.Router();
const gravatar =  require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const  { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route  GET api/users/test
// @desc   Test route
// @acess  Public 
router.get('/test', (req, res) => res.send('User Route'));

// @route  POST api/users/
// @desc   Register user route
// @acess  Public 
router.post('/',
    [ 
        check('name', 'Name is require')
        .not()
        .isEmpty(),
        check('email', 'Please Include a valid Email')
        .isEmail(),
        check('password', 'Please enter a password with 6  or more characters')
        .isLength({min : 6}),
    ],
    async (req, res) =>{ 
        const errors  = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ errors : errors});
        }
        const {
            name,
            password,
            email
        } = req.body;

        try{

        //See if the user exists
        let user =  await User.findOne({ email });
        if(user){
            return res.status(400).json({ errors : [ { msg : 'User already exists' }]});
        }
        //Get the user gravatar
        const avatar = gravatar.url(email, {
            s: '200',
            r:'pg',
            d: 'mm'
        });
        user = new User({
            name,
            email,
            password,
            avatar
        })
        //Encrypt the password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await  user.save();

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
            }
            )

        // return res.status(200).send('User Registered');
        } catch(err){
        console.log(err);
        return res.status(500).send('Server Error');
        }
    });

module.exports = router;