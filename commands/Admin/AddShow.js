const { MessageEmbed, Permissions, Collection } = require("discord.js");
const { CheckIfBotCanMessage, CreateErrorEmbed } = require('../../src/generalUtilies');
const fs_1 = require('fs');
const consolelLogLevels_1 = require('../../src/GetHandler/enums/ConsolelLogLevels');

const QUICK_LOAD_BOT = true;

/*
messageID: {
    reactionUserManagers: [
        '1_rating': {},
        '2_rating': {},
        ...
        '10_rating': {},
    ], Users: [
        'userID_1': '1_rating',
        'userID_2': '5_rating',
        'userID_3': '10_rating',
        'userID_4': '8_rating',
    ]
}
*/
const messagesReactions = new Collection();
const usingCommand = new Map(); //  <userID, {messageEdit, info: {}}}>
const X = '✘', VEE = '✔', NULL_CHANNEL = '0', commandDone = '<done>', commandCancel = '<cancel>';
const emojiDirectory = './assets/emojies', emojiFileName = '_rating', emojiFileExtention = '.png';
const messageTextFileDirectory = './assets/textFiles', messagesIDTextFileName = 'messagesID.txt';
const emojiIDs = [];
let messagesInfoToFetch = []; // "channelID/MessageID"

const embedColors = {
    '10' : '14683E',
    '9.5' : '297C43',
    '9' : '3D8F48',
    '8.5' : '5E9A44',
    '8' : '7EA53F',
    '7.5' : '96A838',
    '7' : 'AEAB31',
    '6.5' : 'C5B32D',
    '6' : 'DBBA28',
    '5.5' : 'DDAF22',
    '5' : 'DFA31C',
    '4.5' : 'DA8B1E',
    '4' : 'D4721F',
    '3.5' : 'CD581C',
    '3' : 'C63D19',
    '2.5' : 'C02F1D',
    '2' : 'B92120',
    '1.5' : 'A51E24',
    '1' : '911A28',
};

const infoPrefix = {
    title: {name: 'title', type: 'String'},
    wiki: {name: 'wiki', type: 'URL'},
    watch: {name: 'watch', type: 'URL'},
    image: {name: 'image', type: 'URL to image'},
    channel: {name: 'channel', type: 'Text channelID'},
}

const UpdateMessageGrade = async (instance, message) => {
    let totalGrade = 0;
    const messageInfo = `${message.channelId}/${message.id}`;
    const usersReactions = messagesReactions.get(messageInfo).usersReactions;
    const editEmbed = message.embeds[0];
    const descriptionParts = editEmbed.description.split('\n');

    /*
    check if the embed is on 0 votes if there is no reactions no reason to update
    make the code little bit faster
    */
    if((editEmbed.hexColor === instance.normalEmbedColor) && (usersReactions.size === 0)) {
        return;
    }

    // embed needs update
    if(usersReactions.size !== 0) {
        for(const userRaction of usersReactions.values()) {
            totalGrade += parseInt(userRaction, 10);
        }
        
        totalGrade = Math.round((totalGrade /= usersReactions.size) * 2) / 2;
        descriptionParts[0] = `𝐀𝐯𝐞𝐫𝐚𝐠𝐞 𝐆𝐫𝐚𝐝𝐞 \`(${totalGrade}/10)\` \`(${usersReactions.size}) Total ratings)\``
        editEmbed
        .setDescription(descriptionParts.join('\n'))
        .setColor(embedColors[totalGrade.toString()])
    } else {
        descriptionParts[0] = `𝐀𝐯𝐞𝐫𝐚𝐠𝐞 𝐆𝐫𝐚𝐝𝐞 \`(-/10)\` \`(0 Total ratings)\``
        editEmbed
        .setDescription(descriptionParts.join('\n'))
        .setColor(instance.normalEmbedColor)
    }
    
    editEmbed
    .setTimestamp()
    .setFooter({
        text: `Last updated at`
    });
    
    await message.edit({
        embeds: [editEmbed],
    })
}

const CheckChannelStatus = async (guild, channelID) => {
    try {
        let newChannel = await guild.channels.fetch(channelID)
        if (newChannel) {
            let perms = new Permissions()
                .add('SEND_MESSAGES')
                .add('ADD_REACTIONS');
            
            return (guild.me.permissionsIn(newChannel).has(perms)) ? newChannel.id : NULL_CHANNEL;
        } else {
            return NULL_CHANNEL;
        }
    } catch (e) { return NULL_CHANNEL; }
}

const UpdateMessageBuilder = async (instance, guild, info) => {
    let editEmbed = new MessageEmbed()
        .setColor(instance.normalEmbedColor)
        .setTitle(`${info.title}`)
        .setDescription(`𝐀𝐯𝐞𝐫𝐚𝐠𝐞 𝐆𝐫𝐚𝐝𝐞 \`(-/10)\` \`(0 Total ratings)\`\n● Watch the show online in [here](${info.watch})\n● View information about the show in [here](${info.wiki})`)
        .setImage(`${info.image}`)
        .setTimestamp()
        .setFooter({
            text: `Created at`
        });

    info.channel = await CheckChannelStatus(guild, info.channel);
    let status = (info.channel !== NULL_CHANNEL) ? VEE : X;
    
    let content = `**Preview & Information**\n● Sending Message in channel: ${(info.channel === NULL_CHANNEL) ? 'NULL' : `<#${info.channel}>`} \`(Status: ${status})\`\n`;
    
    //{editEmbed, content}
    return { 
        editEmbed,
        content
    }
}

const UpdateMessagesInfoTextFile = () => {
    fs_1.writeFile(`${messageTextFileDirectory}/${messagesIDTextFileName}`, messagesInfoToFetch.join('\n'), 'utf8', (error) => {
        if(error) { console.error(error); }
    })
}

module.exports = {
    name: 'addshow',
    aliases: ['as'],
    description: 'Command to create new rating message',
    permissions: ['ADMINISTRATOR'],

    init: async (client, instance) => {
        if(QUICK_LOAD_BOT) { return; }
        // Create Emojies if doesnt exist
        try {
            const guild = client.guilds.cache.get(instance.guildID);
            const emojiManager = guild.emojis;
            const emojis = await emojiManager.fetch();
            let emojiNames = [];
            emojis
            .filter(({name} = emoji ) => name.includes(emojiFileName))
            .each(({id, name} = emoji) => {
                emojiIDs.push(id);
                emojiNames.push(name); 
            });

            for(let i = 1; i <= 10; i++) {
                if(!emojiNames.includes(`${i}${emojiFileName}`)) {
                    emojiManager.create(`${emojiDirectory}/${i}${emojiFileName}${emojiFileExtention}`, `${i}${emojiFileName}`)
                }
            }
        } catch(e) { console.error(e); }

        // Fetch old messages if exists any
        if(fs_1.existsSync(`${messageTextFileDirectory}/${messagesIDTextFileName}`)){
            fs_1.readFile(`${messageTextFileDirectory}/${messagesIDTextFileName}`, 'utf8', async (error, data) => {
                if(error) { console.error(error); }
                messagesInfoToFetch = data.split('\n');
                messagesInfoToFetch = messagesInfoToFetch.filter(messageInfo => messageInfo !== '')
                for(let i = 0; i < messagesInfoToFetch.length; i++) {
                    messagesInfoToFetch[i] = messagesInfoToFetch[i].replace('\r', '');
                }

                const guild = client.guilds.cache.get(instance.guildID); 
                let deletedMessages = [], messagesFetched = 1;
                for (const messageInfo of messagesInfoToFetch) {
                    try {
                        let data = messageInfo.split('/'); // [0] = channelID - [1] = messageID
                        await guild.channels.fetch(data[0]).then(async channel => {
                            await channel.messages.fetch(data[1]).then(async message => {
                                instance.ConsoleLogInfo(
                                    __filename,
                                    `Fetching message \"${message.channel.name}/${message.embeds[0].title}\" (ChannelID: ${message.channelId}) (MessageID: ${message.id}) (${messagesFetched}/${messagesInfoToFetch.length})`,
                                    consolelLogLevels_1.LOADING_INFORMATION
                                );

                                messagesFetched++;
                                const reactionUserManagers = {}, usersReactions = new Collection();
                                for(const messageReaction of message.reactions.cache.values()) {
                                    if(emojiIDs.includes(messageReaction.emoji.id)) {
                                        await messageReaction.fetch().then(async messageReactionFeteched => {
                                            const messageReactionUserMananger = messageReactionFeteched.users;
                                            reactionUserManagers[messageReactionFeteched.emoji.name] = messageReactionUserMananger;
                                            await messageReactionUserMananger.fetch().then(async users => {
                                                for(const fetchedUser of users.values()) {
                                                    if(!fetchedUser.bot) {
                                                        let didReactAlready = usersReactions.get(fetchedUser.id);
                                                        if(usersReactions.get(fetchedUser.id)) {
                                                            await reactionUserManagers[didReactAlready].remove(fetchedUser);
                                                        }

                                                        usersReactions.set(fetchedUser.id, messageReactionFeteched.emoji.name);
                                                    }
                                                }
                                            })
                                        })
                                    } else { messageReaction.remove(); }
                                }

                                messagesReactions.set(messageInfo, {
                                    reactionUserManagers: reactionUserManagers,
                                    usersReactions: usersReactions,
                                });
                                UpdateMessageGrade(instance, message);
                            })
                        })
                    } catch (e) { 
                        console.error(e)
                        deletedMessages.push(messageInfo); 
                    }
                }

                messagesInfoToFetch = messagesInfoToFetch.filter(messageInfo => !(deletedMessages.includes(messageInfo)))
                UpdateMessagesInfoTextFile();
                instance.ConsoleLogInfo(
                    __filename,
                    `Deleted ${deletedMessages.length} messages!`,
                    consolelLogLevels_1.LOADING_INFORMATION
                );

                instance.ConsoleLogInfo(
                    __filename,
                    `Finished fetching messages and ready to operate!`,
                    consolelLogLevels_1.LOADING_INFORMATION
                );
            })
        } else { fs_1.open(`${messageTextFileDirectory}/${messagesIDTextFileName}`, 'w', () => {}); }

        // liseners
        client.on('messageCreate', async (message) => {
            let userInformation = usingCommand.get(message.author.id);
            
            // check if user using command
            if(!userInformation) { return; }

            // check if message still exists, if not stop process
            try {
                userInformation.messageEdit = await message.channel.messages.fetch(userInformation.messageEdit.id)
            } catch (e) { userInformation.messageEdit = undefined; }

            if(!userInformation.messageEdit) { 
                usingCommand.delete(message.author.id);
                return;
            }
            
            // has to input fields in the same channel as the command was executed in
            if(userInformation.messageEdit.channelId !== message.channelID) { return; i}

            let deleteMessage = false;
            // check if user typed done or cancel
            if(message.content.trim() === commandDone) {
                deleteMessage = true;

                let channelID = await CheckChannelStatus(message.guild, userInformation.info.channel);
                if(channelID !== NULL_CHANNEL) {
                    userInformation.messageEdit.delete();
                    usingCommand.delete(message.author.id);
                    
                    const reactionUserManagers = {}, usersReactions = new Collection();

                    const sentMessage = await message.guild.channels.cache.get(userInformation.info.channel).send({
                        embeds: [userInformation.messageEdit.embeds[0]]
                    });
                    
                    for (let i = 1; i <= 10; i++) {
                        const emojiReaction = await message.guild.emojis.cache.find(emoji => emoji.name === `${i}${emojiFileName}`);
                        const messageReaction = await sentMessage.react(emojiReaction);
                        reactionUserManagers[emojiReaction.name] = messageReaction.users;
                    }

                    const messageInfo = `${sentMessage.channelId}/${sentMessage.id}`;
                    fs_1.appendFile(`${messageTextFileDirectory}/${messagesIDTextFileName}`, `${(messagesInfoToFetch.length === 0) ? '':'\n'}${messageInfo}`, (error) => {
                        if(error) {console.error(error)}
                    })

                    messagesReactions.set(messageInfo, {
                        reactionUserManagers: reactionUserManagers,
                        usersReactions: usersReactions,
                    });

                    messagesInfoToFetch.push(messageInfo);
                } else {
                    const errorMessage = CreateErrorEmbed(
                        instance,
                        'Invalid Channel!',
                        `The channel ${(userInformation.info.channel === NULL_CHANNEL) ? '\`NULL\`' : `<#${userInformation.info.channel}>`} is invalid to use.`
                    )
                    
                    message.channel.send({
                        embeds: [errorMessage]
                    }).then(msg => {
                        setTimeout(() => {
                            msg.delete()
                        }, 5 * 1000)
                    })
                }
            } else if (message.content.trim() === commandCancel) {
                deleteMessage = true;
                usingCommand.delete(message.author.id);
                userInformation.messageEdit.delete();
            } else { // client typed field? check if its field input or message
                let foundOne;
                // check if user typed information
                for(const field of Object.values(infoPrefix)) {
                    if(message.content.startsWith(field.name.concat(':'))) {
                        foundOne = field;
                        break;
                    }
                }
                
                if(foundOne) {
                    deleteMessage = true;
                
                    let data = message.content.split(/:(.*)/s);
                    userInformation.info[data[0]] = data[1].trim();
                    
                    let {editEmbed, content} = await UpdateMessageBuilder(instance, message.guild, userInformation.info);
                    userInformation.messageEdit = await userInformation.messageEdit.edit({
                        content,
                        embeds: [editEmbed, userInformation.messageEdit.embeds[1]]
                    })
                }
            }

            if(deleteMessage) { message.delete(); }
        })

        client.on('messageDelete', message => {
            const messageInfo = `${message.channelId}/${message.id}`;
            if(messagesInfoToFetch.includes(messageInfo)) {
                messagesReactions.delete(messageInfo);
                messagesInfoToFetch = messagesInfoToFetch.filter((messageInfoElement) => (messageInfoElement !== messageInfo))
                UpdateMessagesInfoTextFile();
            }
        })

        client.on('messageReactionAdd', (messageReactionEvent, user) => {
            if(user.bot) { return; }
            const {message, emoji} = messageReactionEvent; // emoji = newReaction
            const messageInfo = `${message.channelId}/${message.id}`;

            // check if event is called on message show
            if(messagesInfoToFetch.includes(messageInfo)) {
                // if emoji that was added is rating if not rating remove it
                if(emojiIDs.includes(emoji.id)) {
                    // get messagesReaction information
                    const messageReactions = messagesReactions.get(messageInfo);
                    // check if valid, no reason for it to not be but just in case
                    if(messageReactions) {
                        // get old reaction
                        let oldReaction = messageReactions.usersReactions.get(user.id);
                        
                        // check if there is old reaction if there is delete the old one
                        if(oldReaction && oldReaction !== emoji.name) {
                            messageReactions.reactionUserManagers[oldReaction].remove(user);
                        }
                        
                        // set the user's new reaction to new reaction
                        messageReactions.usersReactions.set(user.id, emoji.name);

                        // update message
                        UpdateMessageGrade(instance, message);
                    }
                } else { messageReactionEvent.remove(); }
            }
        })

        client.on('messageReactionRemove', (messageReactionEvent, user) =>  {
            if(user.bot) { return; }
            const {message, emoji} = messageReactionEvent; // emoji = newReaction
            const messageInfo = `${message.channelId}/${message.id}`;
            
            // check if event is called on message show
            if(messagesInfoToFetch.includes(messageInfo)) {
                // if emoji that was removed is rating if not rating dont do anything
                if(emojiIDs.includes(messageReactionEvent.emoji.id)) {
                    // get messagesReaction information
                    const messageReactions = messagesReactions.get(messageInfo);
                    
                    // check if valid, no reason for it to not be but just in case
                    if(messageReactions) {
                        
                        // get old reaction
                        let oldReaction = messageReactions.usersReactions.get(user.id);
                        
                        /*
                        check if the newReaction removed is same as the old one if so remove the reaction from the list
                        update message only if user removed and didnt add new one because we update already when he added one
                        */
                         if(oldReaction === emoji.name) { 
                            messageReactions.usersReactions.delete(user.id);
                            UpdateMessageGrade(instance, message);
                        }
                    }
                }
            }
        })
    },

    callback: async ({ instance, guild, message }) => {
        if(!CheckIfBotCanMessage(instance, message)) { return; }

        let fieldsFormatted = '';
        Object.values(infoPrefix).forEach(field => {
            fieldsFormatted = fieldsFormatted.concat(`● ${field.name} \`(${field.type})\`\n`);
        });

        fieldsFormatted = fieldsFormatted.concat(`\nType \`${commandDone}\` to finish the process.\nType \`${commandCancel}\` to cancel the process.`);

        const instructionEmbed = new MessageEmbed()
        .setColor(instance.normalEmbedColor)
        .setTitle('Instructions')
        .setDescription(`To set one of the fields please type here \`{field}:{input}\`\nThe fields that are avaliable are:\n${fieldsFormatted}`);
        
        let info = {
            channel: message.channelId,
            title: 'Title',
            watch: 'https://myflixer.to',
            wiki: 'https://en.wikipedia.org/wiki/Wiki',
            image: 'https://i.imgur.com/F5YKL7z.png',
        }

        let {editEmbed, content} = await UpdateMessageBuilder(instance, guild, info);
        let messageEdit = await message.channel.send({
            content,
            embeds: [editEmbed, instructionEmbed]
        });

        usingCommand.set(message.author.id, {messageEdit, info});
        message.delete();
    }
}