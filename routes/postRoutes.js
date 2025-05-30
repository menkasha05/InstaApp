const express = require('express');
const mongoose = require('mongoose');
const Post = require('../models/post');
const User = require('../models/user');
const router = express.Router();
//  post create
router.post('/create', async (req, res) => {
    const { caption, imageUrl,userId } = req.body;
    try {
         // Check for missing required fields
         if (!caption || !imageUrl || !userId) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({ error: 'Invalid userId format' });
        }
    
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
    
        const post = new Post({ caption, imageUrl,user: userId });
    console.log(post)

        await post.save();
        console.log("post saved:", post);
        res.status(201).json({
            message: "Post created successfully"
         });
    } catch (error) {
    console.dir(error)
        res.status(500).json({ message: 'Server error', error });
    }
})

// GET /api/posts/user/:userId
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. Check if userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId format' });
    }

    // 2. Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 3. Fetch user's posts
    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });
console.dir(posts)
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error while fetching posts' });
  }
});

//Update api
router.put('/update/:postId', async (req, res) => {
    const { postId } = req.params;
    const { caption, imageUrl, userId } = req.body;
    try {
        // Validate userId if provided
        if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: 'Invalid userId format' });
        }

        // Check if post exists
        const post = await Post.findById(postId);
    
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // If userId is changing, validate new user exists
        if (userId && userId !== post.user.toString()) {
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            post.user = userId;
        }

        // Update fields if provided
        if (caption) post.caption = caption;
        if (imageUrl) post.imageUrl = imageUrl;

        await post.save();

        res.status(200).json({ message: 'Post updated successfully', post });
    } catch (error) {
        console.dir(error);
        res.status(500).json({ message: 'Server error', error });
    }
});


// DELETE /api/posts/:postId
router.delete('/:postId', async (req, res) => {
  const { postId } = req.params;

  try {
    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid postId format' });
    }

    // 2. Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // (Optional) Authorization logic here: check if the user owns the post

    // 3. Delete the post
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// POST /api/posts/:postId/like
router.post('/like/:postId', async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    // 1. Validate IDs
    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid postId or userId' });
    }

    // 2. Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const userIndex = post.likes.indexOf(userId);

    if (userIndex === -1) {
      // Not liked yet → like it
      post.likes.push(userId);
      await post.save();
      return res.status(200).json({ message: 'Post liked', likes: post.likes });
    } else {
      // Already liked → unlike it
      post.likes.splice(userIndex, 1);
      await post.save();
      return res.status(200).json({ message: 'Post unliked', likes: post.likes });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to like post' });
  }
});
  
// POST /api/posts/:postId/comment
router.post('/comment/:postId', async (req, res) => {
  const { postId } = req.params;
  const { text, userId } = req.body;

  try {
    // 1. Validate IDs
    if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid postId or userId' });
    }

    // 2. Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // 3. Create the comment
    const newComment = {
      text,
      postedBy: userId,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    res.status(200).json({ message: 'Comment added', comment: newComment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

module.exports = router;