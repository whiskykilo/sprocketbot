// @sprocket
// Nutanix Slackbot
// Maintained by: whiskykilo

// ************************************************************************** //
// Botkit Instantiation

if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('./lib/Botkit.js');
var os = require('os');

var request = require('request');

const execSync = require('child_process').execSync;

var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

// ************************************************************************** //
// Nutanix Specific Connection Details

var ntnxUser = "admin";
var ntnxPass = "nutanix4u";

var ntnxAddress = "10.68.69.102";
var ntnxAPI = "https://" + ntnxUser + ":" + ntnxPass + "@" + ntnxAddress + ":9440/PrismGateway/services/rest/v2.0";
//var ntnxAPI = "https://" + ntnxAddress + ":9440/PrismGateway/services/rest/v2.0";

// Nutanix API Endpoints
var ntnxEndpointCluster = ntnxAPI + "/cluster/";
var ntnxEndpointDisk = ntnxAPI + "/disks/";
var ntnxEndpointHealth = ntnxAPI + "/health_checks/";
var ntnxEndpointHost = ntnxAPI + "/host/";
var ntnxEndpointImages = ntnxAPI + "/images/";
var ntnxEndpointNetworks = ntnxAPI + "/networks/";
var ntnxEndpointPD = ntnxAPI + "/protection_domains/";
var ntnxEndpointRemoteSites = ntnxAPI + "/remote_sites/";
var ntnxEndpointSnapshots = ntnxAPI + "/snapshots/";
var ntnxEndpointStorageContainer = ntnxAPI + "/storage_containers/";
var ntnxEndpointTasks = ntnxAPI + "/tasks/";
var ntnxEndpointVdisks = ntnxAPI + "/vdisks/";
var ntnxEndpointVM = ntnxAPI + "/vms/";
var ntnxEndpointVG = ntnxAPI + "/volume_groups/";
var ntnxEndpointVStores = ntnxAPI + "/vstores/";


// ************************************************************************** //
// Global Variables

var networkuuid = "base";

// ************************************************************************** //
// HACKS

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// ************************************************************************** //
// Nutanix Command

controller.hears(['new dev environment', 'testing'], 'direct_message,direct_mention,mention', function(bot, message) {
  bot.startConversation(message, function(err, convo) {
    if (!err) {
      convo.ask('What name would you like for the dev environment?', function(response, convo) {
        var envName = response.text;
        console.log(envName);
        convo.next();
        convo.ask('What VLAN ID for the network? (default 0)', function(response, convo) {
          var envVLAN = response.text;
          convo.next();
          convo.ask('You want to call the dev environment: `' + envName + '` with VLAN ID `' + envVLAN + '`?', [
            {
              pattern: 'yes',
              callback: function(response, convo){
                convo.say('I will now create your dev environment! This will take a few moments.');
                // CREATE STUFF
                var netForm = {"name": envName, "vlan_id":envVLAN};
                var netstate = ntnxEndpointNetworks;
                request.post(netstate, {headers: [{name: 'content-type', value: 'application/json'}], body: netForm, json: true}, function networkout(error, response, body) {
                  if (!error) {
                    console.log(body);
                    var statejson = body;
                    return statejson.network_uuid;
                  }
                });
                convo.next();
                var networkuuid = networkout();
                console.log(networkuuid);
                convo.say(networkuuid);
                convo.stop();
              }
            },
            {
              pattern: 'no',
              callback: function(response, convo){
                convo.say('Let me know if you change your mind!');
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
          ])
        })
      })
    }
  })
});
//THIS WORKS!
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

// THIS WORKS!
controller.hears(['testGET'], 'direct_message,direct_mention,mention', function(bot, message) {
  var netstate = ntnxEndpointNetworks;
  request({url: netstate}, function (error, response, body) {
    if (!error) {
      var statejson = JSON.parse(body);
      var networkuuid = statejson.metadata.total_entities;
      bot.reply(message, 'Stuff: ' + networkuuid);
    }
  });
});

// controller.hears(['new dev environment'], 'direct_message,direct_mention,mention', function(bot, message) {
//
//       bot.reply(message, "I Created the environment, cloned from production:");
//       bot.reply(message, "VM Name: devDB-01, IP Address: 10.68.69.109");
//       bot.reply(message, "VM Name: devAPP-01, IP Address: 10.68.69.110");
//
//     });
//
// controller.hears(['scale dev environment'], 'direct_message,direct_mention,mention', function(bot, message) {
//
//       bot.reply(message, "I added the following:");
//       bot.reply(message, "VM Name: devDB-02, IP Address: 10.68.69.111");
//       bot.reply(message, "VM Name: devAPP-02, IP Address: 10.68.69.112");
//       bot.reply(message, "VM Name: devAPP-03, IP Address: 10.68.69.113");
//
//    });




// controller.hears(['new dev environment', 'new sandbox', 'clone sandbox', 'clone production', 'test'], 'direct_message,direct_mention,mention', function(bot, message) {
//   var netForm = '{"name": "Testme","vlan_id":0}';
//   bot.reply(message, netForm);
//   bot.reply(message, ntnxEndpointNetworks);
//   request('http://google.com'), function(err, response, body){
//     bot.reply(message, response.statusCode);
//   }
//   // request.get({url: ntnxEndpointNetworks}), function(err, response, body){
//   //   if (err) {
//   //     bot.reply(message, err);
//   //   } else if (!err) {
//   //   bot.reply(message, 'Hi! Im here');
//   //   bot.reply(message, response.statusCode);
//   //   var netoutput = JSON.parse(body);
//   //   var networkuuid = netoutput.metadata.total_entities;
//   //   bot.reply(message, 'Created network with UUID: ' + networkuuid);
//   // }
//   // }
//   // request.post({url: ntnxEndpointNetworks, formData: netForm}), function optionalCallback(err, response, body){
//   //   if (err) {
//   //     bot.reply(message, err);
//   //   }
//   //   var netoutput = JSON.parse(body);
//   //   var networkuuid = netoutput.networkuuid;
//   //   bot.reply(message, 'Created network with UUID: ' + networkuuid);
//   // }
// });

// ************************************************************************** //

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
