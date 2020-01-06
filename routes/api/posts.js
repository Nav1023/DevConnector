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

// @route  PUT  api/posts/like/:id
// @desc   Put Posts route
// @acess  Private 
router.put('/like/:id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(400).send({ msg: 'Post not found'});
        }
        //check if the post has already been  liked
        if(post.likes.filter(like => like.user.toString()  === req.user.id).length > 0){
            return res.status(400).send({ msg: 'Post already liked' })
        }
        post.likes.unshift({ user: req.user.id})
        await post.save();
        res.status(200).send(post.likes);
    } catch (err) {
        console.error(err);
        if(err.kind === 'ObjectId'){
            return res.status(400).send({ msg: 'Post not found'});
        }
        res.status(500).send('Server Error');    
    }
});

// @route  PUT  api/posts/unlike/:id
// @desc   Put Posts route
// @acess  Private 
router.put('/unlike/:id', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(400).send({ msg: 'Post not found'});
        }
        //check if the post has already been  liked
        if(post.likes.filter(like => like.user.toString()  === req.user.id).length === 0){
            return res.status(400).send({ msg: 'Post has not yet been liked' })
        }
        //get remove index
        const removeIndex = post.likes.map( like => like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex, 1);

        await post.save();
        res.status(200).send(post.likes);
    } catch (err) {
        console.error(err);
        if(err.kind === 'ObjectId'){
            return res.status(400).send({ msg: 'Post not found'});
        }
        res.status(500).send('Server Error');    
    }
});

// @route  POST api/posts/comment/:id
// @desc   Create Comment route
// @acess  Private 
router.post('/comment/:id', [
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
    const post = await Post.findById(req.params.id);
    if(!post){
        return res.status(400).send({ msg: 'Post not found'});
    }
    const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
    };
    post.comments.unshift(newComment);
    await post.save();
    res.status(200).send(post.comments);
    } catch (error) {
        console.error(err);
        if(err.kind === 'ObjectId'){
            return res.status(400).send({ msg: 'Post not found'});
        }
        res.status(500).send('Server Error');    
    }
});

// @route  DELETE  api/posts/comment/:id/:commentId
// @desc   DELETE comment route
// @acess  Private 
router.delete('/comment/:id/:commentId', auth, async(req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if(!post){
            return res.status(400).send({ msg: 'Post not found'});
        }

        //Pull out comment 
        const comment = post.comments.find(comment => comment.id ==  req.params.commentId);

        //check comment exists
        if(!comment){
            return res.status(404).send({ msg: 'Comment does not exist '});
        } 
        //check user
        if(comment.user.toString() !== req.user.id){
            return res.status(401).send({ msg: 'user not authorized'});
        }
         //get remove index
         const removeIndex = post.comments.map( comment => comment.user.toString()).indexOf(req.user.id);

         post.comments.splice(removeIndex, 1);
 
         await post.save();
         res.status(200).send(post.comments);
    } catch (error) {
        console.error(err);
        if(err.kind === 'ObjectId'){
            return res.status(400).send({ msg: 'Post not found'});
        }
        res.status(500).send('Server Error');    
    }
});


module.exports = router;