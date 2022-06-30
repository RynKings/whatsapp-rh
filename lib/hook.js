// nodejs version: v16.14.2
//------------------------------------------------------------------------------
// Copyright (c) 2022, Ryns (https://github.com/rynkings).
//------------------------------------------------------------------------------

class HookRH {

    constructor () {
        this.events_listeners = [];
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
                location: false,
                sticker: false,
                caption: false,
                mention: false,
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
            }
        }
    }

    async callback_with_message (callback, type, client, message) {
        console.log('[HOOK]', type, message.parse.text);
        await callback(client, message);
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