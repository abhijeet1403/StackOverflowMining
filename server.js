// server.js

var express = require('express');
var app = express();
var mongoose = require('mongoose'); // mongoose for mongodb
var morgan = require('morgan'); // log requests to the console (express4)
var bodyParser = require('body-parser'); // pull information from HTML POST (express4)
var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)

// Data Extraction Logic =======================================
var fs = require('fs'),
    xml2js = require('xml2js'),
    util = require('util');

//Our Data Models =================
var POST_DATA = [];
var POST_TAGS = {};
var POST_JSON = {};
var parser = new xml2js.Parser();

fs.readFile(__dirname + '/dumplist/Posts.xml', function (err, data) {
    parser.parseString(data, function (err, result) {
        console.log('Please Wait...');
        var row = result.posts.row;
        for (var index in row) {
            var object = row[index]['$'];

            if (object.PostTypeId == 1) {
                var QA = {};
                QA.answers = {};
                var questionId = object.Id;
                var hasAnswer = false;
                for (var ansindex in row) {
                    if (row[ansindex]['$']['PostTypeId'] == 2 && row[ansindex]['$']['ParentId'] == questionId) {
                        if (!hasAnswer) {
                            POST_JSON[questionId] = {};
                            QA.Id = questionId;
                            QA.question = object;
                            QA.questionTitle = object.Title;
                            QA.tags = getTagArray(object.Tags);
                            updateTagLibrary(QA.tags, questionId);
                            hasAnswer = true;
                        }
                        var ansObject = row[ansindex]['$'];
                        QA.answers[ansObject.Id] = ansObject;
                    }
                }
                if (POST_JSON.hasOwnProperty(questionId)) {
                    POST_JSON[questionId] = QA;
                }
                if (QA.hasOwnProperty('Id')) {
                    POST_DATA.push(QA);
                }
            }
        }
        console.log('Done, Hit the local host at 8080!');
    });
});

//Helper Functions ==================

var getTagArray = function (tags) {
    tags = tags.replace(/[<>]/g, " ");
    var tagArray = tags.split("  ");
    return tagArray;
}

var updateTagLibrary = function (tags, questionId) {
    for (var tagIndex in tags) {
        if (POST_TAGS.hasOwnProperty(tags[tagIndex])) {
            var ob = POST_TAGS[tags[tagIndex]];
            ob.postId.push(questionId);
            ob.postCount++;
            POST_TAGS[tags[tagIndex]] = ob;
        } else {
            var ob = {
                postId: [questionId],
                postCount: 1
            };
            POST_TAGS[tags[tagIndex]] = ob;
        }
    }
}

var findInTags = function (searchWord) {
    console.log("Searching for " + searchWord);
    var postIds;
    if (POST_TAGS.hasOwnProperty(searchWord)) {
        postIds = POST_TAGS[searchWord].postId;
    }
    console.log("search finished");
    return postIds;
}

var getDATAfrom = function (searchResults) {
    var POST_QUERIED_DATA = [];
    for (var index in searchResults) {
        POST_QUERIED_DATA.push(POST_JSON[searchResults[index]]);
    }
    return POST_QUERIED_DATA;
}

// configuration =================

app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(bodyParser.urlencoded({
    'extended': 'true'
})); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
})); // parse application/vnd.api+json as json
app.use(methodOverride());


// routes ======================================================================

// api ---------------------------------------------------------------------
// get all posts
app.get('/api/posts', function (req, res) {
    res.json(POST_DATA); // return all posts in JSON format
});

//Get all tags==================================================================
app.get('/api/tags', function (req, res) {
    res.json(POST_TAGS); // return all tags in JSON format
});


// search post and send back all posts after searching
app.post('/api/posts', function (req, res) {

    var searchWord = req.body.text;
    var resultArray = findInTags(searchWord);
    if (resultArray) {
        var searchResult = getDATAfrom(resultArray);
        res.json(searchResult);
    }
    /*
    // Search a post, information comes from AJAX request from Angular
    Todo.create({
        text: req.body.text,
        done: false
    }, function (err, todo) {
        if (err)
            res.send(err);

        // get and return all the todos after you create another
        Todo.find(function (err, todos) {
            if (err)
                res.send(err)
            res.json(todos);
        });
    });
    */

});

// get a post
app.get('/api/posts/:post_id', function (req, res) {
    console.log("Post Requested" + req.params.post_id);

    res.json(POST_JSON[req.params.post_id]);
    /* Todo.remove({
         _id: req.params.post_id
     }, function (err, post) {
         if (err)
             res.send(err);

         // get and return all the todos after you create another
         Todo.find(function (err, todos) {
             if (err)
                 res.send(err)
             res.json(todos);
         });
     });*/

});

// application -------------------------------------------------------------
app.get('*', function (req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

// listen (start app with node server.js) ======================================
app.listen(8080);
console.log("App listening on port 8080");