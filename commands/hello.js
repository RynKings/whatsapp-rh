//commands

var hook = {command: 'hello', chat: 'all'};
rh.on_hook('text', hook, async (c, m) => {
    await c.sendMessage(m.parse.to, {text: `Hello, ${m.pushName}`});
})

var hook = {command: 'help'};
rh.on_hook('mention', hook, async (c, m) => {
    await c.sendMessage(m.parse.to, {text: 'Hello ' + m.pushName});
})
var hook = {};
rh.on_hook('mention', hook, async (c, m) => {
    await c.sendMessage(m.parse.to, {text: 'Hey ' + m.pushName});
})