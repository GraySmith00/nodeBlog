// APP CONFIG AND DEPENDENCIES
// ===========================================
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');

mongoose.connect("mongodb://localhost/nodeBlog");
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer());

// MONGOOSE MODEL CONFIG
// ===========================================
const postSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created_at: {type: Date, default: Date.now}
});

const Post = mongoose.model("Post", postSchema);

// INDEX PAGE
// ===========================================
app.get("/", function(req, res) {
    res.redirect("/posts");
});

app.get("/posts", function(req, res) {
    Post.find({}, function(err, allPosts) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", {posts: allPosts})
        }
    });
});


// NEW PAGE
// ===========================================
app.get("/posts/new", function(req, res) {
    res.render("new");
});

// CREATE POST REQUEST
// ===========================================
app.post("/posts", function(req, res) {
    // sanitize body from malicious inputs
    req.body.post.body = req.sanitize(req.body.post.body);
    // Create Post
    Post.create(req.body.post, function(err, newBlog) {
        if (err) {
            console.log(err);
            res.render("new");
        } else {
            res.redirect('/posts')
        }
    });
});

// SHOW PAGE
// ===========================================
app.get("/posts/:id", function(req, res) {
    Post.findById(req.params.id, function(err, foundPost) {
        if (err) {
            console.log(err);
        } else {
            res.render("show", {post: foundPost})
        }
    })
})

// EDIT PAGE
// ===========================================
app.get("/posts/:id/edit", function(req, res) {
    Post.findById(req.params.id, function(err, foundPost) {
        if (err) {
            console.log(err);
            res.redirect("/posts");
        } else {
            res.render("edit", {post: foundPost});
        }
    });
});

// UPDATE POST
// ===========================================
app.put("/posts/:id", function(req, res) {
    // sanitize body from malicious inputs
    req.body.post.body = req.sanitize(req.body.post.body);
    // update post and redirect
    Post.findByIdAndUpdate(req.params.id, req.body.post, function(err, updatedPost) {
        if (err) {
            console.log(err);
            res.redirect("/posts");
        } else {
            res.redirect(`/posts/${req.params.id}`);
        }
    });
});

// DELETE POST
// ===========================================
app.delete("/posts/:id", function(req, res) {
    // Destroy post
    Post.findByIdAndRemove(req.params.id, function(err) {
        if (err) {
            console.log(err);
            res.redirect("/posts");
        } else {
            res.redirect("/posts");
        }
    })
    // redirect
});

// START THE SERVER
// ===========================================
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("nodeBlog Server is cookin!");
})