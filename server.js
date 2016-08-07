var express=require('express');

var app=express();

var bodyparser=require('body-parser');

var mongodb=require('mongodb');

var bcrypt = require('bcryptjs');

var MongoClient=mongodb.MongoClient;

var jwt = require('jwt-simple');

var JWT_SECRET="youcanthackthis";

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || 'localhost';
app.use(express.static('public'));

app.use(bodyparser.json());
var dbase;
mongodb_connection_string = 'mongodb://localhost:27017/' + 'media';
//take advantage of openshift env vars when available:
if(process.env.OPENSHIFT_MONGODB_DB_URL){
  mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + 'media';
}
MongoClient.connect(mongodb_connection_string,function(err,db) {
	if(!err)
	{
		dbase=db;
		console.log("connected");
		}
});
app.get('/d',function(req,res,next){

		dbase.collection('mediafeed',function(err,collection){
			collection.find().toArray(function(err,data){
					res.send(data);
			});
	});	
});


app.post('/new',function(req,res,next){
	var token=req.headers.authorization;
	var decoded=jwt.decode(token,JWT_SECRET);
	dbase.collection('mediafeed',function(err,collection){
			var share={text:req.body.share,
				user:decoded._id,
				username:decoded.username};
			collection.insert(share,{w:1},function(err,data){
					res.send();
			});
	});
	res.send();
});
app.put('/new/remove',function(req,res,next){
	var token=req.headers.authorization;
	var decoded=jwt.decode(token,JWT_SECRET);
	var id=req.body.det;
	dbase.collection('mediafeed',function(err,collection){
			collection.remove({_id:new mongodb.ObjectID(id),user:decoded._id},function(err,data){
					return res.send();
			});
	});
	res.send();
});
app.post('/users',function(req,res,next){
	bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
        // Store hash in your password DB. 
        var user={
        name:req.body.name,
		username:req.body.username,
		password:hash};
		dbase.collection('users',function(err,collection){
			collection.insert(user,{w:1},function(err,data){
					res.send();
			});
	});
	res.send();
   		 });
	});
	
});
app.put('/users/signin',function(req,res,next){
	dbase.collection('users',function(err,collection){
			collection.findOne({username:req.body.username},function(err,user){
			if(user!=null){
				bcrypt.compare(req.body.password,user.password, function(err, result) {
    				// result == true 
    			if(result)
    			{
    				var token = jwt.encode(user,JWT_SECRET);
    				return res.json({token:token});//generate token instead
    			}
    			else{
    				return res.status(400).send();
    			}
    		   
		});
			}
			 else{
    			return res.status(400).send();}
	});
 });
	
});

app.listen(server_port, server_ip_address,function() {
	console.log('Listening on " + server_ip_address + ", server_port " + port ');
});