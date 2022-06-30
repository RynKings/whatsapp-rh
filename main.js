// nodejs version: v16.14.2
//------------------------------------------------------------------------------
// Copyright (c) 2022, Ryns (https://github.com/rynkings).
//------------------------------------------------------------------------------
// RH (Ryns Hook) is a simple wrapper for the Whatsapp Web API.
// It is a Node.js module that allows you to easily create a bot that can
// interact with the Whatsapp Web API.
//------------------------------------------------------------------------------

const WhatsappRH = require('./lib/client');

const options = {
    qrTerminal: true,
}

const rh = new WhatsappRH(options);

var hook = {command: 'ami', chat: 'group'};
rh.on_hook('text', hook, async (c, m) => {
    await c.sendMessage(m.parse.to, {text: 'Ami kuntul'});
})
var hook = {command: 'help'};
rh.on_hook('mention', hook, async (c, m) => {
    await c.sendMessage(m.parse.to, {text: 'Hello ' + m.pushName});
})
var hook = {};
rh.on_hook('mention', hook, async (c, m) => {
    await c.sendMessage(m.parse.to, {text: 'Hey ' + m.pushName});
})
var hook = {command: 't', type: 'exact'};
rh.on_hook('text', hook, async (c, m) => {
    console.log(rh.store)
})


async function main () {
    await rh.connect();
}
main();