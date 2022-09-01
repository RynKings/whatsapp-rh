// nodejs version: v16.14.2
//------------------------------------------------------------------------------
// Copyright (c) 2022, Ryns (https://github.com/rynkings).
//------------------------------------------------------------------------------

const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, makeInMemoryStore } = require('@adiwajshing/baileys');
const HookRH = require('./hook');
const { message_parse } = require('./message');
const P = require('pino');
const fs = require('fs');

class WhatsappRH {

    constructor (options) {
        this.options = options;
        this.options.qrTerminal = options.qrTerminal || false;
        this.options.statePath = options.statePath || './data/auth/state.json';
        this.options.storePath = options.storePath || './data/store/store.json';

        if (!fs.existsSync('./data/auth')) {
            fs.mkdirSync('./data/auth', { recursive: true });
        }

        if (!fs.existsSync('./data/store')) {
            fs.mkdirSync('./data/store', { recursive: true });
        }

        this.store = makeInMemoryStore({ });
        this.set_store();

        this.hook = new HookRH();
        this.user = null;
    }

    async connect () {
        const { state, saveCreds } = await useMultiFileAuthState(this.options.statePath);
        this.socket = makeWASocket({
            logger: P({ level: 'error'}),
            printQRInTerminal: this.options.qrTerminal,
            auth: state,
        })
        this.store.bind(this.socket.ev);

        this.socket.ev.on('connection.update', (update) => {
            const { connection, lastDisconnect } = update;
            if (connection === 'close') {
                const shouldReconnect = lastDisconnect?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log(`Disconnected from server. Reason: ${lastDisconnect.error}`);
                if (shouldReconnect) {
                    console.log('Reconnecting...');
                    this.connect();
                }
            } else if ( connection === 'open' ) {
                this.user = this.socket.user;
                console.log(`Login successful. Welcome ${this.socket.user.name}!`);
            }
        })
        this.socket.ev.on('messages.upsert', m => {
            if (m === null || m === undefined) return;
            if (m.messages === undefined) return;

            m.self = this.user;
            this.hook.call(this.socket, message_parse(m));
        })
        this.socket.ev.on('contacts.set', ({contacts}) => {
            console.log('got contacts', contacts);
        })
        this.socket.ev.on('contacts.upsert', (contact) => {
            console.log('got contact', contact)
        })
        this.socket.ws.on('CB:response,type:contacts', (data) => {
            console.log('got contacts', data)
        })
        this.socket.ev.on('creds.update', saveCreds)
        return this
    }

    set_store () {
        this.store.readFromFile(this.options.storePath);
        setInterval(() => {
            this.store.writeToFile(this.options.storePath);
        }, 10_000);
    }

    on (event, callback) {
        this.socket.ev.on(event, callback);
    }

    once (event, callback) {
        this.socket.ev.once(event, callback);
    }

    on_hook (event, config, callback) {
        this.hook.add(event, config, callback);
    }
}

module.exports = WhatsappRH;