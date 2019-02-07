var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var axios = require("axios");
var cheerio = require("cheerio");
var db = require("./models");

var PORT = 3000;

var app = express();

app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/snopesScrapedData";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Routes


app.get("/scrape", function(req, res) {

  axios.get("http://www.snopes.com/").then(function(response) {

    var $ = cheerio.load(response.data);


    $("div.media-body").each(function(i, element) {

      var result = {};

      result.title = $(element).children("h2").text();
      result.description = $(element).children("p").text();
      result.link = $(element).parent().attr("href");

    db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle)
        })
        .catch(function(err) {
          console.log(err);
        });
      
    });

    console.log("Scrape Complete");
    res.redirect("/");
  });
});


//Would like to find where saved = false
app.get("/", function(req, res) {
  db.Article.find({})
  .then(function(dbArticle) {
    var hbsObject = {
      Article: dbArticle
    }
    console.log(hbsObject);
    res.render("index", hbsObject);
  })
  .catch(function(err){
    res.json(err)
  })
})

//Saved = true
app.get("/saved", function(req, res) {
  db.Article.find({saved: true}).populate("note")
  .then(function(dbArticle) {
    var hbsObject = {
      Article: dbArticle
    }
    res.render("saved", hbsObject);
  })
  .catch(function(err){
    res.json(err);
  })
})

//Save Article
app.post("/articles/saved/:id", function(req, res) {
  db.Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": true})
  .exec(function(err, result) {
    if (err) {
      console.log(err);
    }
    else {
      res.send(result);
    }
  });
});


//API Route
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});


//Create new note
app.post("/articles/:id", function(req, res) {
  console.log(req.body)
  db.Note.create(req.body)
    .then(function(dbNote) {
      console.log(dbNote)
      return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push:{ note: dbNote._id }}, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});


//Delete Note
app.delete("/delete/notes/:id", function(req, res) {
  var id = req.params.id;

  db.Note.findByIdAndRemove({"_id": id }, function(err){
    if (err) {
      console.log(err);
    }
  })
});

//Delete Article
app.delete("/delete/article/:id", function(req, res) {
  var id = req.params.id;

  db.Article.findByIdAndRemove({"_id": id }, function(err){
    if (err) {
      console.log(err);
    }
  })
});




app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
