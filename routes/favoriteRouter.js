var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');
var Verify = require('./verify');

var favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

function addToFavorites(favorites, newFavorite, res) {
    if (favorites.dishes.indexOf(newFavorite) === -1) {
        favorites.dishes.push(newFavorite);
        favorites.save(function (err, favorites) {
            if (err) throw err;
            console.log('Added Favorites!');
            res.json(favorites);
        });
    } else {
        res.end('This dish was already added to favorites!');
    }
}

favoriteRouter.route('/')
.all(Verify.verifyOrdinaryUser)
.get(function (req, res, next) {
    Favorites.findOne({postedBy: req.decoded._doc._id})
    .populate('postedBy')
    .populate('dishes')
    .exec(function (err, result) {
        if (err) throw err;
        res.json(result);
    });
})

.post(function (req, res, next) {
    Favorites.findOne({postedBy: req.decoded._doc._id}, function(err, favorites) {
        // console.log(favorites);
        if (!favorites) {
            Favorites.create({postedBy: req.decoded._doc._id,
                              dishes: []}, function (err, favorites) {
                                addToFavorites(favorites, req.body._id, res);
                              })
        } else {
            addToFavorites(favorites, req.body._id, res);
        }
    });
})

.delete(function (req, res, next) {
    Favorites.findOne({postedBy: req.decoded._doc._id}, function(err, favorites) {
        if (!favorites) {
            res.end('You do not have any favorites!');
        } else {
            Favorites.remove({postedBy: req.decoded._doc._id}, function(err, resp) {
                if (err) throw err;
                res.end('All favorites data has been deleted for you.');
            })
        }
    });
});

favoriteRouter.route('/:favoriteId')
.delete(Verify.verifyOrdinaryUser, function(req, res, next) {
    Favorites.findOne({postedBy: req.decoded._doc._id}, function(err, favorites) {
        if (!favorites) {
            res.end('You do not have any favorites!');
        } else {
            var index = favorites.dishes.indexOf(req.params.favoriteId);
            if (index === -1) {
                res.end('This dish is not in your favorites list.');
            } else {
                favorites.dishes.splice(index, 1);
                favorites.save(function (err, favorites) {
                    if (err) throw err;
                    console.log('Removed a favorite!');
                    res.json(favorites);
                });
            }
        }
    });
});

module.exports = favoriteRouter;


