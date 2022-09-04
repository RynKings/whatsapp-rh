const { rh } = require('../main');

let pollSettings = {}

var hook = {command: 'xpoll'}
rh.on_hook('text', hook, async (c, m) => {

    let to = m.parse.to;
    let sender = m.parse.sender;
    let text = m.parse.text;

    let sep = text.split(' ')
    let cmd = text.replace(sep[0] + ' ','')

    switch(cmd){
        case "create":
            if (pollSettings[to]) return await c.sendMessage(to, {text: "You in create mode!"});
            pollSettings[to] = {
                sender,
                onTitle: true,
                onList: false,
            }
            await c.sendMessage(to, {text: "poll create mode activate _please send the title poll..._"});
            break;
        case "cancel":
            if (!pollSettings[to]) return await c.sendMessage(to, {text: "You're not in create mode!"});
            delete pollSettings[to];
            await c.sendMessage(to, {text: "poll create canceled!"});
            break;
    }
    
    // const sections = [
    //     {
    //         title: "",
    //         rows: [
    //             {title: "Jam 3", rowId: "option1",},
    //             {title: "Jam 4", rowId: "option2",},
    //         ]
    //     },
    // ]
    
    // const listMessage = {
    //     text: "Ngegrill",
    //     footer: "ryns.yoururl.app",
    //     title: "Poll",
    //     buttonText: "Click here!",
    //     sections
    // }

    // await c.sendMessage(m.parse.to, listMessage)
    
})

var hook = {}
rh.on_hook('listResponse', hook, async (c, m) => {
    let contextInfo = m.message.listResponseMessage.contextInfo
    if (contextInfo.quotedMessage.listMessage.footerText === 'ryns.yoururl.app'){
        let selectedPoll = m.message.listResponseMessage.singleSelectReply.selectedRowId
        if (pollSettings.active){
            if (pollSettings[m.parse.sender] === undefined){
                pollSettings[selectedPoll].num += 1
                pollSettings[m.parse.sender] = true
            }
            let result = 'Hasil Polling'
            result += `\nJam 3 => ${pollSettings.option1.num}`
            result += `\nJam 4 => ${pollSettings.option2.num}`
            await c.sendMessage(m.parse.to, {text: result})
        }
    }
})