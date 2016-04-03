//Set up requirements
var express = require("express");
var Request = require('request');
var bodyParser = require('body-parser');
var _ = require('underscore');

//Create an 'express' object
var app = express();

//Set up the views directory
app.set("views", __dirname + '/views');

//Set EJS as templating language WITH html as an extension
app.engine('.html', require('ejs').__express);
app.set('view engine', 'html');

//Add Jquery
app.use('jquery', express.static(__dirname + '/node_modules/jquery/dist/'));

//Add connection to the public folder for css & js files
app.use(express.static(__dirname + '/public'));

// Enable json body parsing of application/json
app.use(bodyParser.json());

/*---------------
//DATABASE CONFIG
----------------*/
var cloudant_USER = 'shujaat';
var cloudant_DB = 'final_project';
var cloudant_KEY = 'illentspendeggledrancrin';
var cloudant_PASSWORD = '3756dc1f3aee33e3d094a87bc8c91edf665d79ad';
var cloudant_URL = "https://" + cloudant_USER + ".cloudant.com/" + cloudant_DB;


/*---------------------------
Make Server-side NYT Request
-----------------------------*/
function saveNews(data){
	Request.post({
		url: cloudant_URL,
		auth: {
			user: cloudant_KEY,
			pass: cloudant_PASSWORD
		},
		json: true,
		body: data
	},
	function (err, res, body) {
		if (res.statusCode == 201){
			console.log('NYT Data was saved!');
		}
		else{
			console.log('Error in NYT data: '+ res.statusCode);
			console.log(body);
		}
	});
}

function getNews(){
	
	nytURL= 'http://api.nytimes.com/svc/topstories/v1/home.json?api-key=';
	nytKey= '6e298bb14bdc4f71f155eae7a8d5f8b7:7:73071282';
	nytTopStory= nytURL+nytKey;

	Request.get({
		url: nytTopStory,
		json:true,
	}, function (err, res, body){
		//var data= console.log(JSON.parse(body,null,2));
		//theData=response.json(body);
		saveNews(body);
	});

}

//getNews();

/*-------------
SETING UP PORT
--------------*/
var port = process.env.PORT || 3000;
// Start the server & save it to a var
var server = app.listen(port);
//Pass the server var as an arg to the 'io' init requirement
var io = require('socket.io')(server);
console.log('Express started on port ' + port);

/*-----
ROUTES
-----*/
//Enable cross-origin referencing
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get("/", function (request, response) {
	console.log("In main route");
	response.render('index', {title: "Welcome!"});
});

// GET - API route to get the CouchDB data after page load.
app.get("/api", function (request, response) {
	console.log('Making a db request for posts');
	// Use the Request lib to GET the data in the CouchDB on Cloudant
	Request.get({
		url: cloudant_URL+"/_all_docs?include_docs=true",
		auth: {
			user: cloudant_KEY,
			pass: cloudant_PASSWORD
		},
		json: true
	}, function (err, res, body){
		//Grab the rows
		var theData = body.rows;
		if (theData){
			// And then filter the results to match the desired key.
			var filteredData = theData.filter(function (d) {
				return d.doc.namespace == request.params.key;
			});
			// Now use Express to render the JSON.
			response.json(filteredData);
		}
		else{
			response.json({noData:true});
		}
	});
});


app.get("*", function(request,response){
	response.send("Sorry, there is no data for this match!");
});

//Main Socket Connection
io.on('connection', function (socket) {
console.log('a user connected');
	socket.on('like', function (data) {
		io.emit('message', {value:'like', news:data});
  });

	socket.on('Dislike', function (data) {
		io.emit('message', {value:'Dislike', news:data});
  });

});


