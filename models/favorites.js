var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var favSchema = new Schema({
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    dishes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dish'
    }]
}, {
    timestamps: true
});

// the schema is useless so far
// we need to create a model using it
module.exports = mongoose.model('Favorite', favSchema);