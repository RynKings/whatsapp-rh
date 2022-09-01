// nodejs version: v16.14.2
//------------------------------------------------------------------------------
// Copyright (c) 2022, Ryns (https://github.com/rynkings).
//------------------------------------------------------------------------------

const message_parse = (m) => {
    let msg = m.messages[0];
    let isGroup = msg.key.remoteJid.includes('@g.us');
    let isMention = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0;
    let isReply = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage !== undefined;
    let mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    let sender = isGroup ? msg.key.participant : msg.key.remoteJid;
    let to = msg.key.remoteJid;
    let text = msg.message?.conversation || msg.message?.extendedTextMessage?.text;
    let type = msg.message ? Object.keys(msg.message)[0] : msg.messageStubType;
    let self = m.self;
    if (msg.key.fromMe){
        sender = self.id;
        to = msg.key.remoteJid;
    }

    if (type === 'senderKeyDistributionMessage'){
        let senderKeyDistributionMessage = Object.keys(msg.message.senderKeyDistributionMessage);
        type = senderKeyDistributionMessage[senderKeyDistributionMessage.length - 1];
    }

    if (type === 'messageContextInfo'){
        let typeMessages = Object.keys(msg.message)
        type = typeMessages[typeMessages.length - 1]
    }

    msg.parse = {
        sender,
        to,
        text,
        mentionedJid,
        isGroup,
        isMention,
        isReply,
        type,
        self,
    }
    return msg;
}

const message_wait_response = (rh) => {
    return new Promise((resolve, reject) => {
        rh.once('messages.upsert', m => {
            m = message_parse(m);
            resolve(m);
        })
    })
}

const message_wait_response_with_filter = (rh, message_filter) => {
    return new Promise((resolve, reject) => {
        rh.once('message.upsert', m => {
            m = message_parse(m);
            if (message_filter(m)){
                resolve(m);
            }
        })
    })
}

module.exports = {
    message_parse,
    message_wait_response,
    message_wait_response_with_filter,
}