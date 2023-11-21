// Import required modules
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");

// Initial content for different sections of the site
const homeStartingContent = "..."; // Content for the home page
const aboutContent = "HELLO "; // Content for the about page
const contactContent = "..."; // Content for the contact page

// Create an Express application
const app = express();

// Set the view engine to EJS
app.set("view engine", "ejs");

// Configure session middleware for managing user sessions
app.use(
  session({
    secret: "aFm29sBpWxZyC1lQvNrGbTeYhVk5j8hP", // Secret key for session
    resave: false,
    saveUninitialized: false,
  })
);

// Parse incoming requests with JSON payloads
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static("public"));

// Connect to MongoDB Atlas database
mongoose.connect("mongodb+srv://mohitsonu:mohitsonu@blog.26az7mo.mongodb.net/");

// Define the Post schema for MongoDB
const postSchema = {
  title: String,
  content: String,
};

// Create a model for posts based on the defined schema
const Post = mongoose.model("Post", postSchema);

// Middleware to check if the user is authenticated
const authenticate = (req, res, next) => {
  if (req.session && req.session.authenticated) {
    return next(); // Continue to the next middleware or route handler
  } else {
    return res.redirect("/login"); // Redirect to the login page if not authenticated
  }
};

// Apply authentication middleware only to the /compose route
app.use("/compose", authenticate);

// Define routes and their handlers

// Login routes
app.route("/login")
  .get((req, res) => {
    res.render("login"); // Render the login form
  })
  .post((req, res) => {
    const { username, password } = req.body;
    if (username === "mohitsonu" && password === "mohitsonu") {
      req.session.authenticated = true; // Set the user as authenticated
      res.redirect("/compose"); // Redirect to the compose page on successful login
    } else {
      res.redirect("/login"); // Redirect back to the login page if login fails
    }
  });

// Home page route
app.get("/", async function (req, res) {
  try {
    // Retrieve posts from the database and render the home page
    const posts = await Post.find({}).sort({ _id: -1 }); // Sort by creation date in descending order
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Logout route
app.get("/logout", function (req, res) {
  // Destroy the user session on logout
  req.session.destroy(function (err) {
    if (err) {
      console.error(err);
    } else {
      res.redirect("/"); // Redirect to the home page after logout
    }
  });
});

// About page route
app.get("/about", function (req, res) {
  res.render("about", { aboutContent: aboutContent }); // Render the about page
});

// Contact page route
app.get("/contact", function (req, res) {
  res.render("contact", { contactContent: contactContent }); // Render the contact page
});

// Compose page route
app.get("/compose", function (req, res) {
  res.render("compose"); // Render the compose page
});

// Handle form submission for creating a new post
app.post("/compose", function (req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
  });

  post.save()
    .then(() => {
      res.redirect("/"); // Redirect to the home page after successful post creation
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    });
});

// View a specific post route
app.get("/posts/:postId", async function (req, res) {
  const requestedPostId = req.params.postId;

  try {
    // Retrieve a specific post from the database and render the post page
    const post = await Post.findOne({ _id: requestedPostId });
    res.render("post", {
      title: post.title,
      content: post.content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

// Start the server and listen on port 7000
app.listen(7000, function () {
  console.log("Server started on port 7000");
});
