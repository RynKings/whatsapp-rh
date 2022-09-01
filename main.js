// nodejs version: v16.14.2
//------------------------------------------------------------------------------
// Copyright (c) 2022, Ryns (https://github.com/rynkings).
//------------------------------------------------------------------------------
// RH (Ryns Hook) is a simple wrapper for the Whatsapp Web API.
// It is a Node.js module that allows you to easily create a bot that can
// interact with the Whatsapp Web API.
//------------------------------------------------------------------------------

const WhatsappRH = require('./lib/client');
const fs = require('fs');

const command_path = './commands'
const command_files = fs.readdirSync(command_path)

const options = {
    qrTerminal: true,
}

const rh = new WhatsappRH(options);
exports.rh = rh;

command_files.forEach(file => {
    if (!file.endsWith('.js')){
        return
    }
    require(command_path + `/${file}`);
    // let code = fs.readFileSync(command_path + `/${file}`, {
    //     encoding: 'utf8',
    //     flag: 'r'
    // })
    // eval(code)
})

async function main () {
    await rh.connect();
}
main();