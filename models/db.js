var chalk = require('chalk');
var mongoose = require( 'mongoose' );
var bcrypt=require('bcrypt');
var SALT_WORK_FACTOR = 10;

var dbURIx = 'mongodb://mikie:mikie2016@ds135049.mlab.com:35049/leavethemarks';

var env = require('../env/environment');
var dbURI = `mongodb://${env.accountName}:${env.key}@${env.accountName}.documents.azure.com:${env.port}/${env.databaseName}?ssl=true`;


d();
// eslint-disable-next-line max-len

//var dbURI = 'mongodb://localhost/test';
//var dbURI = 'mongodb://your_username:your_password@ds043615.mongolab.com:43615/leavethemarks';

function d(msg){
  console.log(chalk.blue(dbURI));
}

mongoose.connect(dbURI);

mongoose.connection.on('connected', function () {
  console.log(chalk.yellow('Mongoose connected to ' + dbURI));
});

mongoose.connection.on('error',function (err) {
  console.log(chalk.red('Mongoose connection error: ' + err));
});

mongoose.connection.on('disconnected', function () {
  console.log(chalk.red('Mongoose disconnected'));
});

var userSchema = new mongoose.Schema({
  username: {type: String, unique:true},
  email: {type: String, unique:true},
  password: String
});

userSchema.pre('save', function(next) {
    //document object
    var user = this;
    console.log("userSchema pre - Before Registering the user");
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        console.log("Salt");
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            console.log("Hash : "+hash);
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    console.log('db.js compare password: ' + candidatePassword + ' - ' + this.password);
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

// Build the User model
mongoose.model('User', userSchema );

// Stories Schema

var storiesSchema = new mongoose.Schema({
  author:String,
  title: {type: String,unique:true},
  created_at:{type:Date,default:Date.now},
  summary:String,
  content: {type: String},
  imageLink:String,
  comments:[{body:String,commented_by:String,date:Date}],
  slug:String
});

// Build the User model

mongoose.model('Story', storiesSchema,'stories');
