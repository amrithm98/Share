var express=require('express');

var app=express();

var bodyparser=require('body-parser');

var mongodb=require('mongodb');

var MongoClient=mongodb.MongoClient;

app.use(express.static('public'));

app.use(bodyparser.json());
var dbase;
app.get('/d',function(req,res,next){
	MongoClient.connect("mongodb://localhost:27017/media",function(err,db) {
	if(!err)
	{
		dbase=db;
		console.log("connected");
		db.collection('mediafeed',function(err,collection){
			collection.find().toArray(function(err,data){
					res.send(data);
			});
	});
		}
});
	
});


app.post('/new',function(req,res,next){
	console.log(req.body.share);
	dbase.collection('mediafeed',function(err,collection){
			collection.insert({text:req.body.share},{w:1},function(err,data){
					res.send();
			});
	});
	res.send();
});
app.put('/new/remove',function(req,res,next){
	var id=req.body.det;
	console.log(id);
	dbase.collection('mediafeed',function(err,collection){
			collection.remove({_id:new mongodb.ObjectID(id)},function(err,data){
					return res.send();
			});
	});
	res.send();
});


app.listen(3000,function() {
	console.log('server up');
});