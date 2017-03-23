var express = require('express');
var router = express.Router();
var chatService = require('../server/chatService');
var userService = require('../server/userService');

router.get('/', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === "tokenwebdojo") {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});

router.post('/', function (req, res) {
  var data = req.body;
  console.log('webhook');
  // Make sure this is a page subscription
  if (data.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    data.entry.forEach(function(entry) {
      var pageID = entry.id;
      var timeOfEvent = entry.time;

      // Iterate over each messaging event
      entry.messaging.forEach(function(event) {
        var senderId = event.sender.id;
        var userData = "";
        if (event.message) {
          if (!(userService.isUserKnown(senderId))) {
            chatService.sendTextMessage(senderId, 'Bienvenue sur WebDojo !');
            userService.addUser(senderId, 'hello');
          }
          chatService.receivedMessage(event);
        } else {
          console.log("Webhook received unknown event: ", event);
        }
      });
    });



    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know
    // you've successfully received the callback. Otherwise, the request
    // will time out and we will keep trying to resend.
    res.sendStatus(200);
  }
});

module.exports = router;
