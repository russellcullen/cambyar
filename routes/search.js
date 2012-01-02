/*
 * search.js
 *   search routes
 */
var mongoose = require('mongoose');
var async = require('async');
var models = mongoose.models;


/*
 * GET request on search query and type
 *   Only searches through descripton at the moment
 */
exports.search = function(req, res, next) {
    if (!req.query) {
        res.render('search', {
            lessons: [],
        });
    } 
    switch(req.query.a){
        case 'tag':
        default:
            keyword(req, res, next);
    }

}

function keyword(req, res, next) {
    var term = decodeURIComponent(req.query.q);
    var regex = new RegExp(term,'i');
    var results = [];
    models.Lesson.find({description: regex}, function(err, primary) {
        if(err) return next(err);
        results = results.concat(primary);
        async.map(results, function(lesson, cb) {
            cb(null,lesson._id);
        }, function(err, ids) {
            if(err) next(err);
            var terms = term.split(' ');
            regex.compile('('+terms.join('|')+')','i');
            models.Lesson.find({description: regex, _id: {$nin: ids}}, function(err,secondary) {
                if(err) return next(err);
                results = results.concat(secondary);
                res.render('search', {
                    'lessons': results,
                });
            });
        });
    });
}
