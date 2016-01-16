var Sequelize = require('sequelize');
var bcrypt = require('bcrypt-nodejs');
var databaseURL = 'mysql://b1a1841c5ab4c1:f9dd02f1@us-cdbr-iron-east-03.cleardb.net/heroku_e63780ba5c54845?reconnect=true';
var database = process.env.DATABASE || 'soymilk'
var dbUser = process.env.DBUSER || 'user'
var dbPass = process.env.DBPASS || 'user'
var dbHost = databaseURL;
    
    passportLocalSequelize = require('passport-local-sequelize');


var db = new Sequelize("soymilk", "root", "", {
    host: dbHost,
});

var User = db.define('User', {
    name: Sequelize.STRING,
    password: Sequelize.STRING,
    myhash: Sequelize.STRING,
    mysalt: Sequelize.STRING
    }, {
        instanceMethods: {
            comparePasswords: function(pw, cb) {
                bcrypt.compare(pw, this.getDataValue('password'), function(err, isMatch) {
                    if (err) {
                        return cb(err)
                    } else {
                        cb(null, isMatch)
                    }
                })
            }
        }
    });

passportLocalSequelize.attachToUser(User, {
    usernameField: 'name',
    hashField: 'myhash',
    saltField: 'mysalt'
});


var Playlist = db.define('Playlist', {
    name: Sequelize.STRING,
    area: Sequelize.STRING,
    timeReq: Sequelize.STRING,
    image: Sequelize.STRING,
    dateCreate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
    }
  });

var Activity = db.define('Activity', {
    name: Sequelize.STRING,
    address: Sequelize.STRING,
    notes: Sequelize.STRING,
    city: Sequelize.STRING,
    rating: Sequelize.STRING,
    photo: Sequelize.STRING,
    lat: Sequelize.DECIMAL(20,10),
    lng: Sequelize.DECIMAL(20,10),
    url: Sequelize.STRING
}, {
    name: {
        singular: 'Activity',
        plural: 'Activities'
    }
})


var ActiveJoin = db.define('ActiveJoin', {}, {
    timestamps: false
})

var Rating = db.define('Rating', {
    rating: Sequelize.INTEGER
}, {
    timestamps: false
})

var Favorite = db.define('Favorite', {
    type: Sequelize.BOOLEAN
})

//WORKS
Activity.belongsToMany(Playlist, {through: 'ActiveJoin'});
Playlist.belongsToMany(Activity, {through: 'ActiveJoin'});


//Ratings => Playlist
Playlist.hasMany(Rating)
Rating.belongsTo(Playlist)


//Refactor relations
User.hasMany(Playlist, {as: 'Traveler'});


Playlist.belongsToMany(User, {through: 'Favorite'});
User.belongsToMany(Playlist, {through: 'Favorite'});

// Playlist.hasOne(User)

// User.belongsToMany(Playlist, {through: 'Rating'});
// Playlist.belongsToMany(User, {through: 'Rating'});


// User.belongsToMany(Favorite, {as: 'Favoriter'})
// Favorite.hasOne(User)


User.sync()
    .then(function() {
        return Activity.sync();
    })
    .then(function() {
        return Playlist.sync();
    })
    .then(function() {
        return Favorite.sync();
    })
    .then(function() {
        return ActiveJoin.sync();
    })
    .then(function() {
        return Rating.sync();
    })




exports.User = User;
exports.Playlist = Playlist;
exports.Activity = Activity;
exports.Rating = Rating;

exports.Favorite = Favorite;
exports.ActiveJoin = ActiveJoin;
exports.Rating = Rating;

 