var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt'); //Require express-jwt in routes/index.js
var auth = jwt({secret: 'SECRET', userProperty: 'payload'}); //Create a middleware for authenticating jwt tokens

var mongoose = require('mongoose');
var Contact = mongoose.model('Contact');
var User = mongoose.model('User');

var refresh = function(){
	router.get('/api/contacts/:contact_authors', function(req, res)
	{	
		Contact.find({authors: req.params.contact_authors}, function(err, contacts)

		{
			if(err)
				res.send(err);
			console.log(req.params.contact_authors);
			res.json(contacts);
		});
	});
};
refresh();
/*
	This post method tied to the createContact method from controller.
*/
router.post('/api/contacts', auth, function(req, res)
{
	/*
		Create method below from Node/Express will take $scope.formData from controller
		parse, and then store them into model 'Contact' Schema in MongoDB.
	*/
		Contact.create
	({
		authors: req.body.authors,
		email: req.body.email,
		phone: req.body.phone,
		name: req.body.name,
		done: false				
		}, function(err, contacts)
		{
			if (err)
				res.send(err);
			if(contacts)
				res.send(contacts);
		});
});

/*
	This delete method tied to the removeContact() method from controller.
*/
router.delete('/api/contacts/:contact_id', auth, function(req, res)
{
	/*
		Remove method below from Node/Express will take contact_id from controller
		and remove the correct contact_id entry from the MongoDB.
	*/
	Contact.remove({
		_id: req.params.contact_id
		}, function(err, contact) {
			if(err)
				res.send(err);
			if(contact)
				res.send(contact);
			});
});

/*
	This get method tied to the editContact() method from controller.
*/
router.get('/api/contacts/:contact_authors/:contact_id', function(req, res)
{	
	/*
		Use 'Contact' model declared in Schema of Node&Express to find user selected entry in mongodb
		with given 'id' from controller
	*/
	Contact.findOne({
		_id: req.params.contact_id
		}, function(err, contact) {
			/*
				Here 'contact' contains the entry belong to id (id,name,email,phone)
			 */
			console.log(contact)
			
			/*
				Select only 'name' field in the whole object entry
			 */
			 console.log(contact.name);
			
			if(err)
				res.send(err);

			if(contact)
				res.json(contact);
			
		});
			
});

/*
	This get method tied to the updateContact() method from controller.
*/
router.put('/api/contacts/:contact_authors/:contact_id', function(req, res)
{
	console.log(req.body.name);
	
	/*
		Use 'Contact' model declared in Schema of Node&Express to find the exact user selected entry in mongodb
		with given 'id' from controller
	*/
	Contact.findByIdAndUpdate(
	req.params.contact_id,
	{$set: {name: req.body.name, email: req.body.email, phone: req.body.phone}},
	{new: true, upsert: true},
			function(err, contacts)
		{
			if (err)
				res.send(err);
			if(contacts)
				res.json(contacts);
		})
});

router.post('/register', function(req, res){
  if(!req.body.username || !req.body.password){
    return res.status(400).send({message: 'Please fill out all fields'});
  }

	User.findOne({username: req.body.username }, function(err, existingUser) {
	if(existingUser) {
		return res.status(409).send({message: 'This username is not available, please choose another one!'});
	}
  })
	  
  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password)

  user.save(function (err){
    if(err){ return (err); }

    return res.json({token: user.generateJWT()})
  });
});

router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }

  passport.authenticate('local', function(err, user, info){
    if(err){ return next(err); }

    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Contact List' });
});

module.exports = router;
