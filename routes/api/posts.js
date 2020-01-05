const express =  require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult } =  require('express-validator');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route  POST api/posts/create
// @desc   Create Posts route
// @acess  Private 
router.post('/create', [
    auth,
    [
        check('text', 'Text is required').not().isEmpty()
    ]
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).send({ errors: errors});
    }
    try {
    const user = await User.findById(req.user.id).select('-password');

    const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
    });
    const post = await newPost.save();
    res.status(200).send(post);
    } catch (error) {
        console.error(err);
        res.status(500).send('Server Error');    
    }
});

// @route  GET api/posts/
// @desc   Get Posts route
// @acess  Private 
router.get('/', auth, async(req, res) => {

    try {
        const posts = await Post.find().sort({ date: -1 });
        res.status(200).send(posts);
    } catch (error) {
        console.error(err);
        res.status(500).send('Server Error');    
    }
});

// @route  GET api/posts/:id
// @desc   Get Posts route
// @acess  Private 
router.get('/:id', auth, async(req, res) => {

    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(400).send({ msg: 'Post not found'});
        }
        res.status(200).send(post);
    } catch (err) {
        console.error(err);
        if(err.kind === 'ObjectId'){
            return res.status(400).send({ msg: 'Post not found'});
        }
        res.status(500).send('Server Error');    
    }
});

// @route  DELETE  api/posts/:id
// @desc   DELETE Posts route
// @acess  Private 
router.delete('/:id', auth, async(req, res) => {

    try {
        const post = await Post.findById(req.params.id);

        if(!post){
            return res.status(400).send({ msg: 'Post not found'});
        }

        //check  user 
        if(post.user.toString() !==  req.user.id){
            return res.status(401).send({ msg: 'User not authorized' });
        }
        await post.remove();
        res.status(200).send({ msg: "Post Removed"});
    } catch (error) {
        console.error(err);
        if(err.kind === 'ObjectId'){
            return res.status(400).send({ msg: 'Post not found'});
        }
        res.status(500).send('Server Error');    
    }
});


module.exports = router;