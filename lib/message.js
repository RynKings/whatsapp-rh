// nodejs version: v16.14.2
//------------------------------------------------------------------------------
// Copyright (c) 2022, Ryns (https://github.com/rynkings).
//------------------------------------------------------------------------------

const message_parse = (m) => {
    let msg = m.messages[0];
    let isGroup = msg.key.remoteJid.includes('@g.us');
    let isMention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0;
    let mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    let sender = isGroup ? msg.key.participant : msg.key.remoteJid;
    let to = msg.key.remoteJid;
    let text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    let type = Object.keys(msg.message)[0];
    let self = m.self;
    if (msg.key.fromMe){
        sender = self.id;
        to = msg.key.remoteJid;
    }

    msg.parse = {
        sender,
        to,
        text,
        mentionedJid,
        isGroup,
        isMention,
        type,
        self,
    }
    return msg;
}

module.exports = message_parse;