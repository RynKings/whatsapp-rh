const { rh } = require('../main');

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

var hook = {command: 'template'};
rh.on_hook('mention', hook, async (c, m) => {
	const templateButtons = [
	    {index: 1, urlButton: {displayText: '⭐ Ryns URL!', url: 'https://ryns.yoururl.app'}},
	    {index: 2, callButton: {displayText: 'Call me!', phoneNumber: '+1 (234) 5678-901'}},
	    {index: 3, quickReplyButton: {displayText: 'This is a reply, just like normal buttons!', id: 'id-like-buttons-message'}},
	]

	const templateMessage = {
	    text: "Hi it's a template message",
	    footer: 'Hello World',
	    templateButtons: templateButtons
	}

	const sendMsg = await c.sendMessage(m.parse.to, templateMessage)
	console.log(sendMsg);
})

var hook = {command: 'button'};
rh.on_hook('mention', hook, async (c, m) => {
	const buttons = [
	  {buttonId: 'id1', buttonText: {displayText: 'Button 1'}, type: 1},
	  {buttonId: 'id2', buttonText: {displayText: 'Button 2'}, type: 1},
	  {buttonId: 'id3', buttonText: {displayText: 'Button 3'}, type: 1}
	]

	const buttonMessage = {
		image: {url: 'https://1.bp.blogspot.com/-3c4VhOi5mo8/X_W4pmQZ12I/AAAAAAAAFX4/w1OzIOIkix8I8xPRImESvfIx8yb4Mr38QCLcBGAsYHQ/s365/ImgBB.png'},
	    caption: "Hi it's button message",
	    footer: 'Hello World',
	    buttons: buttons,
	    headerType: 4
	}

	const sendMsg = await c.sendMessage(m.parse.to, buttonMessage)
	console.log(sendMsg);
});