var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');

var base64 = require('base-64');
var utf8 = require('utf8');

router.get('/', function (req, res) {
    // log user out
    delete req.session.token;

    // move success message into local variable so it only appears once (single read)
    var viewData = { success: req.session.success, username: req.signedCookies.username ? req.signedCookies.username : '', password: req.signedCookies.password ? utf8.decode(base64.decode(req.signedCookies.password)) : ''  };
    delete req.session.success;    
        
    res.render('login', viewData);
    
});

router.post('/', function (req, res) {
    
    // implement remember me cookie handling
    if(req.body.remember === 'true') {
        // create persistant cookie
        res.cookie('username', req.body.username, { maxAge: 900000, httpOnly: true, signed: true });
        res.cookie('password', base64.encode(utf8.encode(req.body.password)), { maxAge: 900000, httpOnly: true, signed: true });
    } else {
        // timeout the cookie
        res.cookie('username', '', {expires: new Date(0), signed: true});
        res.cookie('password', '', {expires: new Date(0), signed: true});
    }
    // authenticate using api to maintain clean separation between layers
    request.post({
        url: config.apiUrl + '/users/authenticate',
        form: req.body,
        json: true
    }, function (error, response, body) {
        if (error) {
            return res.render('login', { error: 'An error occurred' });
        }

        if (!body.token) {
            return res.render('login', { error: body, username: req.body.username });
        }

        // save JWT token in the session to make it available to the angular app
        req.session.token = body.token;

        // redirect to returnUrl
        var returnUrl = req.query.returnUrl && decodeURIComponent(req.query.returnUrl) || '/';
        res.redirect(returnUrl);
    });
});

module.exports = router;