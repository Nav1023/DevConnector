const express =  require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const {check, validationResult } =  require('express-validator');

// @route  GET api/profile/me
// @desc   Get current users profile
// @acess  Private 
router.get('/me', auth,  async (req, res) => {
    try{
        const profile = await Profile.findOne({user: req.user.id}).populate('user',
          ['name', 'avatar']);
        if(!profile){
            return res.status(400).send({ msg: 'There is no profile for this User'});
        }
        res.status(200).send(profile);
    }catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// @route  POST  api/profile/
// @desc   Create or  Update a user profile
// @acess  Private 
router.post('/',  [ 
    auth,
    [ 
        check('status', 'Status is Required').not().isEmpty(),
        check('skills', 'Skills is Required').not().isEmpty()
    ]
    ], async(req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).send({ errors: errors})
        }

        const{
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin,
        } = req.body;
        
        //Build Profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if(company) profileFields.company = company;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(bio) profileFields.bio = bio;
        if(status) profileFields.status = status;
        if(githubusername) profileFields.githubusername = githubusername;
        if(skills){
            console.log(123);
            profileFields.skills = skills.split(',').map(skills => skills.trim());
        }   
        // Build social object
        profileFields.social = {};
        if(youtube) profileFields.social.youtube = youtube;
        if(twitter) profileFields.social.twitter = twitter;
        if(facebook) profileFields.social.facebook = facebook;
        if(linkedin) profileFields.social.linkedin = linkedin;
        if(instagram) profileFields.social.instagram = instagram;

        try{
            let profile  = await Profile.findOne({ user:  req.user.id });

            if(profile){
             //update
              profile = await Profile.findOneAndUpdate(
                  {user: req.user.id},
                  {$set : profileFields},
                  {new : true}
              );
              return res.status(200).send(profile);
            }
            //create
            profile = new Profile(profileFields);
            await profile.save();
            res.status(200).send(profile);
        }catch(err){
            console.error(err);
            res.status(500).send('Server Error');
        }
    });

// @route  GET  api/profile/
// @desc   Get all profiles
// @acess  Public
router.get('/', async (req, res) =>{
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.status(200).send(profiles);
    } catch (error) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}); 

// @route  GET  api/profile/user/:userId
// @desc   Get profile
// @acess  Public
router.get('/user/:userId', async (req, res) =>{
    try {
        const profile = await Profile.findOne({ user: req.params.userId })
        .populate('user', ['name', 'avatar']);

        if(!profile) return res.status(400).send({ msg: 'Profile not found' });

        res.status(200).send(profile);
    } catch (err) {
        console.error(err);
        if(err.kind === 'ObjectId'){
            return res.status(400).send({ msg: 'Profile not found' });
        }
        res.status(500).send('Server Error');
    }
}); 

module.exports = router;