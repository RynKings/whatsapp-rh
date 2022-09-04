// nodejs version: v16.14.2
//------------------------------------------------------------------------------
// Copyright (c) 2022, Ryns (https://github.com/rynkings).
//------------------------------------------------------------------------------

class HookRH {

    constructor () {
        this.events_listeners = [];
        this.wait_listeners = [];
    }

    remove_element (arr, index) {
        return arr.filter(e => e !== index);
    }

    wait (config, callback) {
        this.wait_config_default = {
            wait_id: '',
            sender: '',
            public: false,
            ignoreSelf: true,
            on: {
                text: false,
                image: false,
                video: false,
                audio: false,
                media: false,
                location: false,
                sticker: false,
                all: false,
            }
        }
        this.wait_config_default.on[config.type] = true;
        this.wait_listeners.push({
            config: {
                ...this.wait_config_default,
                ...config,
            },
            callback,
        });
    }

    add (type, config, callback) {
        this.events_config_default = {
            command: '',
            type: 'startswith',
            case_sensitive: false,
            chat: 'all',
            owners: [],
            owner_only: false,
            example: '',
            description: '',
            ignoreSelf: true,
            on: {
                text: false,
                image: false,
                video: false,
                audio: false,
                media: false, //means both (image/video/audio)
                location: false,
                sticker: false,
                caption: false,
                mention: false,
                reply: false,
                listResponse: false,
                buttonResponse: false,
                templateResponse: false,
                all: false,
            }
        };

        this.events_config_default.on[type] = true;
        
        this.events_listeners.push({
            config: {
                ...this.events_config_default,
                ...config,
            },
            callback,
        });
    }

    async wait_call (client, message) {
        const { type } = message.parse;

        for (let i = 0; i < this.wait_listeners.length; i++) {
            let listener = this.wait_listeners[i];
            let { config, callback } = listener;

            if (config.ignoreSelf && message.parse.sender === message.parse.self.id) continue

            if (config.public && config.sender === ''){
                await condition_();
            } else if (!config.public && config.sender === message.parse.sender){
                await condition_();
            }

            const condition_ = async () => {
                let callback_result = null;

                if (config.on.all){
                    callback_result = await this.callback_with_message(callback, 'all[wait]', client, message);
                } else if (config.on.text && (type === 'conversation' || type === 'extendedTextMessage')) {
                    callback_result = await this.callback_with_message(callback, 'text[wait]', client, message);
                } else if (config.on.image && type === 'imageMessage') {
                    callback_result = await this.callback_with_message(callback, 'image[wait]', client, message);
                } else if (config.on.video && type === 'videoMessage') {
                    callback_result = await this.callback_with_message(callback, 'video[wait]', client, message);
                } else if (config.on.audio && type === 'audioMessage') {
                    callback_result = await this.callback_with_message(callback, 'audio[wait]', client, message);
                } else if (config.on.location && type === 'locationMessage') {
                    callback_result = await this.callback_with_message(callback, 'location[wait]', client, message);
                } else if (config.on.sticker && type === 'stickerMessage') {
                    callback_result = await this.callback_with_message(callback, 'sticker[wait]', client, message);
                }
                if (callback_result === 'delete'){
                    console.log(`[BEFORE DELETED (${this.wait_listeners.length})]`)
                    this.wait_listeners = this.remove_element(this.wait_listeners, listener);
                    console.log(`[AFTER DELETED (${this.wait_listeners.length})]`)
                }
            }
        }
    }

    async call (client, message) {
        const { type, isMention, mentionedJid } = message.parse;

        for (let i = 0; i < this.events_listeners.length; i++) {
            let listener = this.events_listeners[i];
            let { config, callback } = listener;

            if (config.ignoreSelf && message.parse.sender === message.parse.self.id) {
                continue;
            }
            if (config.on.text && (type === 'conversation' || type === 'extendedTextMessage') && !isMention) {
                let isTrue = this.condition(message.parse, config);
                if (isTrue) {
                    await this.callback_with_message(callback, 'text', client, message);
                }

            } else if (config.on.mention && isMention) {
                let userid = message.parse.self.id;
                let number = userid.split(':')[0] || userid.split('@')[0];

                for (let i = 0; i < mentionedJid.length; i++) {
                    if (mentionedJid[i].replace('@s.whatsapp.net','').indexOf(number) > -1) {
                        message.parse.text = message.parse.text.replace(/@\S+/g, '').trim();
                        let isTrue = this.condition(message.parse, config);
                        if (isTrue) {
                            await this.callback_with_message(callback, 'mention', client, message);
                        }
                    }
                }
            } else if (config.on.image && type === 'imageMessage') {
                await this.callback_with_message(callback, 'image', client, message);
            } else if (config.on.video && type === 'videoMessage') {
                await this.callback_with_message(callback, 'video', client, message);
            } else if (config.on.audio && type === 'audioMessage') {
                await this.callback_with_message(callback, 'audio', client, message);
            } else if (config.on.location && type === 'locationMessage') {
                await this.callback_with_message(callback, 'location', client, message);
            } else if (config.on.sticker && type === 'stickerMessage') {
                await this.callback_with_message(callback, 'sticker', client, message);
            } else if (config.on.caption && (type === 'imageMessage' || type === 'videoMessage')) {
                let isCaption = message.message[type].caption;
                if (isCaption) {
                    message.parse.text = isCaption;
                    let isTrue = this.condition(message.parse, config);
                    if (isTrue) {
                        await this.callback_with_message(callback, 'caption', client, message);
                    }
                }
            } else if (config.on.listResponse && type === 'listResponseMessage') {
                let listResponse = message.message.listResponseMessage;
                let listQuotedResponse = listResponse.contextInfo.quotedMessage.listMessage
                message.parse.list = {
                    selectedText: listResponse.title,
                    selectedRowId: listResponse.singleSelectReply.selectedRowId,
                    listType: listResponse.listType,
                    title: listQuotedResponse.title,
                    description: listQuotedResponse.description,
                    buttonText: listQuotedResponse.buttonText,
                    footerText: listQuotedResponse.footerText,
                    sections: listQuotedResponse.sections,
                }
                await this.callback_with_message(callback, 'list', client, message)
            }
        }
    }

    async callback_with_message (callback, type, client, message) {
        console.log('[HOOK]', type, message.parse.text);
        return await callback(client, message);
    }

    condition (message, config) {
        const { type, case_sensitive, chat, owners, owner_only } = config;
        if (type === 'startswith') {
            if (case_sensitive) {
                return message.text.startsWith(config.command) 
                    && (chat === 'all' || (chat === 'group' && message.isGroup) || (chat === 'private' && !message.isGroup))
                    && (owners.includes(message.sender) === owner_only)
            } else {
                return message.text.toLowerCase().startsWith(config.command.toLowerCase()) 
                    && (chat === 'all' || (chat === 'group' && message.isGroup) || (chat === 'private' && !message.isGroup))
                    && (owners.includes(message.sender) === owner_only)
            }
        } else if (type === 'contains') {
            if (case_sensitive) {
                return message.text.includes(config.command) 
                    && (chat === 'all' || (chat === 'group' && message.isGroup) || (chat === 'private' && !message.isGroup))
                    && (owners.includes(message.sender) === owner_only)
            } else {
                return message.text.toLowerCase().includes(config.command.toLowerCase()) 
                    && (chat === 'all' || (chat === 'group' && message.isGroup) || (chat === 'private' && !message.isGroup))
                    && (owners.includes(message.sender) === owner_only)
            }
        } else if (type === 'exact') {
            if (case_sensitive) {
                return message.text === config.command 
                    && (chat === 'all' || (chat === 'group' && message.isGroup) || (chat === 'private' && !message.isGroup))
                    && (owners.includes(message.sender) === owner_only)
            } else {
                return message.text.toLowerCase() === config.command.toLowerCase() 
                    && (chat === 'all' || (chat === 'group' && message.isGroup) || (chat === 'private' && !message.isGroup))
                    && (owners.includes(message.sender) === owner_only)
            }
        } else if (type === 'endswith') {
            if (case_sensitive) {
                return message.text.endsWith(config.command) 
                    && (chat === 'all' || (chat === 'group' && message.isGroup) || (chat === 'private' && !message.isGroup))
                    && (owners.includes(message.sender) === owner_only)
            } else {
                return message.text.toLowerCase().endsWith(config.command.toLowerCase()) 
                    && (chat === 'all' || (chat === 'group' && message.isGroup) || (chat === 'private' && !message.isGroup))
                    && (owners.includes(message.sender) === owner_only)
            }
        } else if (type === 'regex') {
            if (case_sensitive) {
                return message.text.match(config.command) 
                    && (chat === 'all' || (chat === 'group' && message.isGroup) || (chat === 'private' && !message.isGroup))
                    && (owners.includes(message.sender) === owner_only)
            } else {
                return message.text.toLowerCase().match(config.command.toLowerCase()) 
                    && (chat === 'all' || (chat === 'group' && message.isGroup) || (chat === 'private' && !message.isGroup))
                    && (owners.includes(message.sender) === owner_only)
            }
        }
        return false
    }
}

module.exports = HookRH;