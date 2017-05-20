// @sprocket
// Nutanix Slackbot
// Maintained by: whiskykilo

// ************************************************************************** //
// Botkit Instantiation

require('dotenv').config({
  path: __dirname + '/.env'
});

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var ntnxip = process.env.ntnxip;
var ntnxuser = process.env.ntnxuser;
var ntnxpass = process.env.ntnxpass;

var Botkit = require('./lib/Botkit.js');
var os = require('os');

var request = require('request');
var prism = require('nutanix_prism');
const execSync = require('child_process').execSync;

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

// ************************************************************************** //
// Nutanix Specific Connection Details

var opts = {creds: {username:ntnxuser,password:ntnxpass},ip:ntnxip,itemX: 'whateverElse' }

// ************************************************************************** //
// HACKS

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// ************************************************************************** //
// Nutanix conversations

var netForm = {"name": "Testme","vlan_id":0};
controller.hears(['CreateNW'], 'direct_message,direct_mention,mention', function(bot, message) {
  var netstate = ntnxEndpointNetworks;
  // bot.reply(message, netForm);
  request.post(netstate, {headers: [{name: 'content-type', value: 'application/json'}], body: netForm, json: true}, function (error, response, body) {
    if (!error) {
      console.log(body);
      var statejson = body;
      console.log(statejson);
      var networkuuid = statejson.network_uuid;
      bot.reply(message, 'Network UUID: ' + networkuuid);
    }
  });
});

controller.hears(['get cluster name'], 'direct_message,direct_mention,mention', function(bot, message) {
  prism.cluster.get(opts)
    .then(successData => {
      //var statejson = JSON.stringify(successData);
      var data = successData.name;
      bot.reply(message, 'Cluster Name: ' + data);
    })
    .catch(err => {
      bot.reply(message, "Oh no! Something Happened: " + err);
    })
});

controller.hears(['get vm names'], 'direct_message,direct_mention,mention', function(bot, message) {
  prism.vm.get(opts)
    .then(successData => {
      //var statejson = JSON.stringify(successData);
      var data = successData.entities[0].vmName;
      bot.reply(message, 'VM Name: ' + data);
    })
    .catch(err => {
      bot.reply(message, "Oh no! Something Happened: " + err);
    })
});


// FULL JSON

controller.hears(['full json get cluster'], 'direct_message,direct_mention,mention', function(bot, message) {
  prism.cluster.get(opts)
    .then(successData => {
      var statejson = JSON.stringify(successData);
      //var data = successData;
      bot.reply(message, 'Full JSON Cluster Data: ' + statejson);
    })
    .catch(err => {
      bot.reply(message, "Oh no! Something Happened: " + err);
    })
});

controller.hears(['full json get vm'], 'direct_message,direct_mention,mention', function(bot, message) {
  prism.vm.get(opts)
    .then(successData => {
      var statejson = JSON.stringify(successData);
      //var data = successData.name;
      bot.reply(message, 'Full JSON VM Data: ' + statejson);
    })
    .catch(err => {
      bot.reply(message, "Oh no! Something Happened: " + err);
    })
});

controller.hears(['full json get images'], 'direct_message,direct_mention,mention', function(bot, message) {
  prism.image.get(opts)
    .then(successData => {
      console.log(successData);
      var statejson = JSON.stringify(successData);
      //var data = successData.name;
      bot.reply(message, 'Full JSON Images Data: ' + statejson);
    })
    .catch(err => {
      bot.reply(message, "Oh no! Something Happened: " + err);
    })
});




// ************************************************************************** //
// Basic bot stuff

controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.api.reactions.add({
        timestamp: message.ts,
        channel: message.channel,
        name: 'robot_face',
    }, function(err, res) {
        if (err) {
            bot.botkit.log('Failed to add emoji reaction :(', err);
        }
    });


    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Hello ' + user.name + '!!');
        } else {
            bot.reply(message, 'Hello.');
        }
    });
});

controller.hears(['call me (.*)', 'my name is (.*)'], 'direct_message,direct_mention,mention', function(bot, message) {
    var name = message.match[1];
    controller.storage.users.get(message.user, function(err, user) {
        if (!user) {
            user = {
                id: message.user,
            };
        }
        user.name = name;
        controller.storage.users.save(user, function(err, id) {
            bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
        });
    });
});

controller.hears(['what is my name', 'who am i'], 'direct_message,direct_mention,mention', function(bot, message) {

    controller.storage.users.get(message.user, function(err, user) {
        if (user && user.name) {
            bot.reply(message, 'Your name is ' + user.name);
        } else {
            bot.startConversation(message, function(err, convo) {
                if (!err) {
                    convo.say('I do not know your name yet!');
                    convo.ask('What should I call you?', function(response, convo) {
                        convo.ask('You want me to call you `' + response.text + '`?', [
                            {
                                pattern: 'yes',
                                callback: function(response, convo) {
                                    // since no further messages are queued after this,
                                    // the conversation will end naturally with status == 'completed'
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function(response, convo) {
                                    // stop the conversation. this will cause it to end with status == 'stopped'
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function(response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();

                    }, {'key': 'nickname'}); // store the results in a field called nickname

                    convo.on('end', function(convo) {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'OK! I will update my dossier...');

                            controller.storage.users.get(message.user, function(err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function(err, id) {
                                    bot.reply(message, 'Got it. I will call you ' + user.name + ' from now on.');
                                });
                            });



                        } else {
                            // this happens if the conversation ended prematurely for some reason
                            bot.reply(message, 'OK, nevermind!');
                        }
                    });
                }
            });
        }
    });
});


controller.hears(['shutdown'], 'direct_message,direct_mention,mention', function(bot, message) {

    bot.startConversation(message, function(err, convo) {

        convo.ask('Are you sure you want me to shutdown?', [
            {
                pattern: bot.utterances.yes,
                callback: function(response, convo) {
                    convo.say('Bye!');
                    convo.next();
                    setTimeout(function() {
                        process.exit();
                    }, 3000);
                }
            },
        {
            pattern: bot.utterances.no,
            default: true,
            callback: function(response, convo) {
                convo.say('*Phew!*');
                convo.next();
            }
        }
        ]);
    });
});


controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function(bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
             '>. I have been running for ' + uptime + ' on ' + hostname + '.');

    });

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}
