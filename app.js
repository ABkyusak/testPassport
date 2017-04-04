var express          = require( 'express' )
  , app              = express()
  , server           = require( 'http' ).createServer( app )
  , passport         = require( 'passport' )
  , util             = require( 'util' )
  , bodyParser       = require( 'body-parser' )
  , cookieParser     = require( 'cookie-parser' )
  , session          = require( 'express-session' )
  , RedisStore       = require( 'connect-redis' )( session )
  , GoogleStrategy   = require( 'passport-google-oauth2' ).Strategy;

var GOOGLE_CLIENT_ID      = "985289327383-pioo5himhigu6rp976g4dt12hlkmra6e.apps.googleusercontent.com"
  , GOOGLE_CLIENT_SECRET  = "wCWa77RKvQGR_3iUfdlN1ytR";



passport.use(new GoogleStrategy({
    clientID:     GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback",
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));


passport.serializeUser(function(user, done) {
    data = JSON.stringify(user);
    console.log("-----------Serialize User is called----------" +data);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
    data = JSON.stringify(obj);
    console.log("-----------Deserialize user is called----------" + data );
  done(null, obj);
});



app.use(bodyParser.json({limit:'10mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));
app.use(cookieParser());
app.use(session({
    name :'AppCookie',
    secret: 'ALongSecretKeyForMakingTheCookieSecure'+Date.now(),
    resave: true,
    httpOnly : true,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use( passport.initialize());
app.use( passport.session());

app.get('/account',ensureAuthenticated,function(req, res){
    console.log("*************/account route is asseccsed*********");
  console.log(req.user);
  res.send(req.user);
});


app.get('/auth/google', passport.authenticate('google', { scope: [
       'https://www.googleapis.com/auth/plus.login',
       'https://www.googleapis.com/auth/plus.profile.emails.read']
}));

app.get( '/auth/google/callback', passport.authenticate( 'google'),function(req,res){
  console.log(req.user);
  userData = JSON.stringify(req.user);
  res.send("Logged in" + userData);
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/try/123', function(req, res){
    data = JSON.stringify(req.user);
    console.log("inside /try/123/" + data);
    console.log(req.user);
    res.send(req.user);
});

server.listen( 3000 );


function ensureAuthenticated(req, res, next) {
  if (req.user) {
      data = JSON.stringify(req.user);
      console.log("--------ensureAuthenticated is called ---------"+data);
     return next();
   }
   else {
      console.log(req.session.user);
  res.redirect('/login');
}
}
