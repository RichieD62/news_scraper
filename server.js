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

app.get("/", function(req, res) {
  db.Article.find({}, function(err, data) {
    res.render("index", {data, data});
  })
})


app.get("/scrape", function(req, res) {

  axios.get("http://www.snopes.com/").then(function(response) {

    var $ = cheerio.load(response.data);


    $("div.media-body").each(function(i, element) {

      var result = {};

      result.title = $(element).children("h2").text();
      result.description = $(element).children("p").text();
      result.link = $(element).parent().attr("href");

    //  for (var i=0; i<db.Article.length; i++) {
    //    if (result.link === db.Article[i].link) {
    //      //Don't add to DB
    //    } else {
        
    //    }
    //  }

    db.Article.create(result)
        .then(function(dbArticle) {
          console.log(dbArticle);
        })
        .catch(function(err) {
          console.log(err);
        });
      
    });

    console.log("Scrape Complete");
    res.redirect("/");
  });
});

app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// app.get("/articles/:id", function(req, res) {
//   db.Article.findOne({ _id: req.params.id })
//     .populate("note")
//     .then(function(dbArticle) {
//       res.json(dbArticle);
//     })
//     .catch(function(err) {
//       res.json(err);
//     });
// });

app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

app.delete("/delete/notes.:id", function(req, res) {
  var id = req.params.id;

  Note.findByIdAndRemove({"_id": id }, function(err){
    if (err) {
      console.log(err);
    }
  })
})



app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
