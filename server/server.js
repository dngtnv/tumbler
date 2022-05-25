'use strict';
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const tumblr = require('tumblr.js');
const app = express();
const port = process.argv[2] || 3000;
const client = tumblr.createClient({
  credentials: {
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    token: process.env.TOKEN,
    token_secret: process.env.TOKEN_SECRET,
  },
  returnPromises: true,
});

// app.use(express.static('../client/build'));
app.use(cors());

const getUserInfo = blogName => {
  const info = [];
  const response = client
    .blogInfo(blogName)
    .then(data => {
      const blog = { avatar: data.blog.avatar[0].url, name: data.blog.name, description: data.blog.description };
      info.push({ avatar: blog.avatar, username: blog.name, description: blog.description });
      return info;
    })
    .catch(err => {
      console.error(err);
    });
  return response;
};
const getImageUrls = (blogName, postNumber, offsetNumber) => {
  let imageUrls = [];
  const response = client
    .blogPosts(blogName, { type: 'photo', limit: postNumber, offset: offsetNumber })
    .then(data => {
      data.posts.filter(post => {
        if (post['type'] === 'photo') {
          imageUrls.push({ id: post.id, og_size: post.photos[0].original_size.url, alt: post.summary });
        } else {
          let str = post.trail[0].content;
          let start = str.indexOf('src');
          let end = str.indexOf('alt');
          let url = str.slice(start + 5, end - 2);
          imageUrls.push({ id: post.id, og_size: url, alt: post.summary });
        }
      });
      return imageUrls;
    })
    .catch(err => {
      console.error(err);
    });
  return response;
};
app.get('/:blog/photos/:number/offset=:offset', async (req, res) => {
  const data = await getImageUrls(req.params.blog, +req.params.number, +req.params.offset);
  res.cookie('user', 'guest', { sameSite: 'none', secure: true });
  res.status(200).json({ images: data });
});
app.get('/user/:username', async (req, res) => {
  const data = await getUserInfo(req.params.username);
  res.status(200).json({ info: data });
});

app.listen(port, () => {
  console.log(`The server is listening at http://localhost:${port}`);
});
