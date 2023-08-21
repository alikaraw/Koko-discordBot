const Path = require('path');
const Discord = require('discord.js');
const ConsolelLogLevels = require('./src/GetHandler/enums/ConsolelLogLevels.js');
const GetHandler = require('./src/GetHandler/GetHandler');

const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
    ]
})

client.on('ready', () => {
    client.user.setPresence({
        status: 'online', // "online" "idle" "invisible" "dnd"
        activities: [{
            name: 'Coding',
            type: 'PLAYING',
        }],
    });
    
    new GetHandler(client, {
        guildID: '623044952699699201',
        prefix: '~~',
        commandsDir: Path.join(__dirname, 'commands'),
        commandsDefaultFunctions: '_DefaultFunctions',
        featuresDir: Path.join(__dirname, 'features'),
        ignoreFilePrefix: '#',
        deleteMessageAfterCallBack: true,
        logLevel: ConsolelLogLevels.ALL,
        errorEmbedColor: 'E80036',
        normalEmbedColor: '5663E9'
    }).setCategorySettings([
        {
            name: 'General',
            emoji: '⚙️',
            customEmoji: false,
            folderName: 'General',
            hidden: false,
            options: {
                description: 'Commands doesn\'t have anything common with other commands, which makes them just general commands.'
            }
        }, {
            name: 'Random Selection',
            emoji: '🎲',
            customEmoji: false,
            folderName: 'Random',
            hidden: false,
            options: {
                description: 'Commands with a random aspect to it, randomness can be really cool sometimes.'
            }
        }, {
            name: 'Admin & Configuration',
            emoji: '🛠️',
            customEmoji: false,
            folderName: 'Admin',
            hidden: true,
            options: {
                description: 'Commands for administators to use to add, edit, remove or change somthing in the server.'
            }
        }, {
            name: 'Games',
            emoji: '🎮',
            customEmoji: false,
            folderName: 'Games',
            hidden: false,
            options: {
                description: 'All the game commands are in this category. have fun playing them ;)'
            }
        }
    ]);
})

client.login('OTcxODAxMTMzODQ2NzgxOTUy.YnPyVQ.GIIW5tKpmwBSjytNhiwmo4b8eZ4');