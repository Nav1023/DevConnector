const express =  require('express');
const router = express.Router();
const  { check, validationResult } = require('express-validator');

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
    (req, res) =>{ 
        const errors  = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).send({ errors : errors});
        }
        res.send('User Route');
    });

module.exports = router;