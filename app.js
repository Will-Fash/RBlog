//Imports
var exps = require("express-sanitizer"), //Helps prevent scripts from being run in our forms
    MO = require("method-override"), //adds put and delete functionality to html forms
    express = require("express"),
    bp = require("body-parser"),
    mg = require("mongoose"),
    app = express();

//Setting Packages/Config
mg.connect("mongodb://localhost:27017/restful_blog_app", {useNewUrlParser: true});
app.use(bp.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(MO("_method"));
app.use(exps()); //Has to go below body-parser

//Schema
var blogSchema = new mg.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date, default: Date.now}
});

//Model
var Blog = mg.model("Blog", blogSchema);

//RESTful ROUTES BELOW:

//Root Route
app.get("/", (req,res) => {
    res.redirect("/blogs");
});

//Index Route
app.get("/blogs", (req, res) => {
    Blog.find({}, (err, blogs) => {
        if(err){
            console.log(err);
        } else {
            res.render("index", {blogs: blogs});
        }
    });
});

//New Route
app.get("/blogs/new", (req, res) => {
    res.render("new");
});

//Create Route
app.post("/blogs", (req,res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.create(req.body.blog, (err, newBlog) => {
        if(err){
            res.render("new");
        } else {
            res.redirect("/blogs");
        }
    });
});

//Show Route
app.get("/blogs/:id", (req,res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("show", {blog: foundBlog});
        }
    });
});

//Edit Route
app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if(err){
            res.redirect("/blogs");
        } else {
            res.render("edit", {blog: foundBlog});
        }
    });
});

//Update Route
app.put("/blogs/:id", (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, 
        (err, updatedBlog) => {
            if(err){
               res.redirect("/blogs"); 
            } else {
               res.redirect("/blogs/" + req.params.id); 
            }
        });
});

//DELETE Route
app.delete("/blogs/:id", (req, res) => {
    Blog.findByIdAndDelete(req.params.id, (err) => {
        if(err){
            res.redirect("/blogs");
        } else {
            res.redirect("blogs");
        }
    });
});

//Start Server
app.listen(3000, () => {
    console.log("SERVER IS RUNNING!!!");
});