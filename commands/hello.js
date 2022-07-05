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
rh.on_hook('sticker', hook, async (c, m) => {
	await c.sendMessage(m.parse.to, {text: 'Sticker ' + m.pushName});
})

var hook = {command: '#convert'};
rh.on_hook('caption', hook, async (c, m) => {
	await c.sendMessage(m.parse.to, {text: 'Caption ' + m.pushName});
})

var hook = {command: 'exec'};
rh.on_hook('mention', hook, async (c, m) => {
    let sep = m.parse.text.split('\n');
    let text = m.parse.text.replace(sep[0] + '\n', '');
    
    const print = async function(text){
		await c.sendMessage(m.parse.to, {text: text});
	}
    const codeFormat = (text) => "```\n" + text + "\n```";

    await c.sendMessage(m.parse.to, {text: 'Executing\n' + codeFormat(text)});
	f = `(async () => {
		try {
			${text}
		} catch (e){
			c.sendMessage(m.parse.to, codeFormat(String(e.stack)))
		}
	})()`
	eval(f)
})