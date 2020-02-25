// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");

// Initialize Express
var app = express();
app.set('view engine', 'pug');
// Database configuration
var databaseUrl = "scrapeddata";
var collections = ["collectdata"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function (error) {
    console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function (req, res) {
    var scrapedData = db.scrapeddata.find({}, function (error, found) {

        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            // res.json(found);
            console.log(found);
            res.render('index', { foundItems: found });
            // console.log(db.scrapeddata.title)
            // console.log(db.scrapeddata.link)
        }
    });

    console.log(__dirname)
    //res.sendFile('/Users/prestoncarroll/Desktop/scraping-the-web/index.html')
});

// Retrieve data from the db
// findAll() {
//     // Find all results from the scrapedData collection in the db
//     db.scrapeddata.find({}, function (error, found) {

//         // Throw any errors to the console
//         if (error) {
//             console.log(error);
//         }
//         // If there are no errors, send the data to the browser as json
//         else {
//             // res.json(found);
//             return found;
//             // console.log(db.scrapeddata.title)
//             // console.log(db.scrapeddata.link)
//         }
//     });
// };

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function (req, res) {
    // Make a request via axios for the news section of `ycombinator`
    axios.get("https://news.ycombinator.com/").then(function (response) {
        // Load the html body from axios into cheerio
        var $ = cheerio.load(response.data);
        // For each element with a "title" class
        $(".title").each(function (i, element) {
            // Save the text and href of each link enclosed in the current element
            var title = $(element).children("a").text();
            var link = $(element).children("a").attr("href");

            // If this found element had both a title and a link
            if (title && link) {
                // Insert the data in the scrapedData db
                db.scrapeddata.insert({
                    title: title,
                    link: link
                },
                    function (err, inserted) {
                        if (err) {
                            // Log the error if one is encountered during the query
                            console.log(err);
                        }
                        else {
                            // Otherwise, log the inserted data
                            console.log(inserted);
                        }
                    });
            }
        });
    });

    // Send a "Scrape Complete" message to the browser
    res.send("Scrape Complete");
});




// Listen on port 3000
app.listen(3000, function () {
    console.log("App running on port 3000!");
});

