const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  caption: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
          text: String,
          postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          createdAt: { type: Date, default: Date.now }
        }]
});


// const PostSchema = new mongoose.Schema({
//     caption: String,
//     imageUrl: String, // Cloudinary or local URL
//     createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//     likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
//     comments: [{
//       text: String,
//       postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//       createdAt: { type: Date, default: Date.now }
//     }]
//   }, { timestamps: true });

  /* 
  When ts true createdAt/updatedAt added auto
  {
  "_id": "6621f9d9a7...",
  "caption": "Hello from InstaApp!",
  "imageUrl": "https://...",
  "createdBy": "661efb9f...",
  "createdAt": "2025-04-09T08:12:25.352Z",
  "updatedAt": "2025-04-09T08:12:25.352Z"
}
  */

module.exports = mongoose.model("Post", PostSchema);