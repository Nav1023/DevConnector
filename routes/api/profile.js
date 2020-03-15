const express =  require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');
const {check, validationResult } =  require('express-validator');
const { errorsCheck } = require('../utils/helper');

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
        const validation = errorsCheck(req);
        if(validation.type){
        return res.status(400).send({
            type: 'error',
            message: validation.msg
        });
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

// @route  DELETE  api/profile/
// @desc   Delete the profile, user & posts
// @acess  Private
router.delete('/', auth, async (req, res) =>{
    try {
        // Remove use post
        await Post.deleteMany({ user: req.user.id });
       //Remove Profile
       await Profile.findOneAndRemove({ user: req.user.id});
       //Remove User
       await User.findOneAndRemove({ _id: req.user.id});
       res.status(200).send({msg: 'User deleted'});
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}); 

// @route  PUT  api/profile/experience
// @desc   Add profile experience
// @acess  Private
router.put('/experience', 
    [
        auth,
        [
            check('title', 'Title is required')
            .not()
            .isEmpty(),
            check('company', 'Company is required')
            .not()
            .isEmpty(),
            check('from', 'From date is required')
            .not()
            .isEmpty(),
        ]
    ],
    async (req, res) => {
        const validation = errorsCheck(req);
        if(validation.type){
        return res.status(400).send({
            type: 'error',
            message: validation.msg
        });
        }
        const {
            title,
            company,
            location,
            to,
            from,
            current,
            description
        } = req.body;

        const newExp = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        };

        try {
            const profile = await Profile.findOne({ user:req.user.id });

            profile.experience.unshift(newExp);
            await profile.save();
            res.status(200).send(profile);

        } catch (err) {
            console.error(err);
            res.status(500).send('Server Error');
        }

});

// @route  DELETE  api/profile/experience/:expId
// @desc   DELETE profile experience
// @acess  Private
router.delete('/experience/:expId', auth, async (req, res) => {

    try {
        const profile = await Profile.findOne({ user:req.user.id });

        //GET remove index
        const removeIndex = profile.experience
        .map(item => item.id)
        .indexOf(req.params.expId);

        profile.experience.splice(removeIndex, 1);

        await profile.save();
        res.status(200).send(profile);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});


// @route  PUT  api/profile/education
// @desc   Add profile education
// @acess  Private
router.put('/education', 
    [
        auth,
        [
            check('school', 'School is required')
            .not()
            .isEmpty(),
            check('degree', 'Degree is required')
            .not()
            .isEmpty(),   
            check('fieldofstudy', 'Field of study is required')
            .not()
            .isEmpty(),
            check('from', 'From date is required')
            .not()
            .isEmpty(),
        ]
    ],
    async (req, res) => {
        const validation = errorsCheck(req);
        if(validation.type){
        return res.status(400).send({
            type: 'error',
            message: validation.msg
        });
        }
        const {
            school,
            degree,
            fieldofstudy,
            to,
            from,
            current,
            description
        } = req.body;

        const newEdu = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
        };

        try {
            const profile = await Profile.findOne({ user:req.user.id });

            profile.education.unshift(newEdu);
            await profile.save();
            res.status(200).send(profile);

        } catch (err) { 
            console.error(err);
            res.status(500).send('Server Error');
        }

});

// @route  DELETE  api/profile/education/:eduId
// @desc   DELETE profile education
// @acess  Private
router.delete('/education/:eduId', auth, async (req, res) => {

    try {
        const profile = await Profile.findOne({ user:req.user.id });

        //GET remove index
        const removeIndex = profile.education
        .map(item => item.id)
        .indexOf(req.params.eduId);

        profile.education .splice(removeIndex, 1);

        await profile.save();
        res.status(200).send(profile);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route  GET  api/profile/github/:username
// @desc   Get user repos from github
// @acess  Public
router.get('/github/:username', async (req, res) => {

    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&
            sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=
            ${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent' : 'node.js' }
        }
        request(options, (error, response, body) => {
            if(error) console.log(error);
            if(response.statusCode !== 200){
               return res.status(404).send({ msg: 'No github profile found'});
            }
            
            return res.status(200).send(JSON.parse(body));
        })
    } catch (error) {
        console.error(err);
        res.status(500).send('Server Error');
    }
})

module.exports = router;