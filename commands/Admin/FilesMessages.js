const { Collection } = require('discord.js');
const fs_1 = require('fs');
const util_1 = require('util');
const path_1 = require('path');
const { CheckIfBotCanMessage, GetFilesFromDirectory, CreateNormalEmbed, CreateErrorEmbed} = require('../../src/generalUtilies');

const readFile = util_1.promisify(fs_1.readFile);

let FilesMessages = new Collection(), FilesMessagesNames = [];
let AlreadyLoaded = false;
const SecondsToDeleteMessage = 10;
const FileMessageDirectory = path_1.join(__dirname, '../../assets/textFiles/CMD - FilesMessages');
const list = 'list', reload = 'reload', commandNamePrefix = '(Duplicate) ';
const EmbedDevider = '<->',  EmbedColor = '<color>',  EmbedTitle = '<title>', EmbedDescription = '<description>';

const LoadMessage = () => {
    // clears all old messages
    FilesMessages = new Collection();
    FilesMessagesNames = [];

    // loads all messages
    const Files = GetFilesFromDirectory(FileMessageDirectory, '.txt');
    for(let [fileDirection, fileName] of Files) {
        if(fileName === list || fileName === reload) { fileName = `${commandNamePrefix}${fileName}`; }
        fileName = fileName.split(' ').join('');
        FilesMessagesNames.push(fileName);
        FilesMessages.set(fileName.toLowerCase(), fileDirection);
    }
}

module.exports = {
    name: 'message',
    aliases: ['msg'],
    description: `Reads dir \"${FileMessageDirectory}\" txt files and sends messages from the file text`,
    maxArgs: 1,
    expectedArgs: '[FileName/List/Reload]',
    permissions: ['ADMINISTRATOR'],
    roles: ['779694607343943690', '850540225993113670'],
    channels: ['974046503029071973'],
    categories: ['623493159426719744'],

    callback: async ({guild, prefix, instance, message, args, commandObject}) => {
        if(!CheckIfBotCanMessage(instance, message)) { return; }

        if(!AlreadyLoaded && !(args[0] && args[0].toLowerCase() === 'reload')) {
            LoadMessage();
            AlreadyLoaded = true;
        }

        // if there is arg' lower case it
        if(args[0]) { args[0] = args[0].trim().toLowerCase(); }

        // command has no arguments, send messages list
        if(!args[0] || args[0] === 'list') {
            let embedForList;
            if(FilesMessages.size === 0) {
                embedForList = CreateErrorEmbed(
                    instance,
                    'File Messages',
                    `There was no file messages found in the directory:\n\`${FileMessageDirectory}\`\nMake sure all files are inside this directory!`
                );
            } else {
                embedForList = CreateNormalEmbed(
                    instance,
                    'File Messages',
                    `The following file messages that are available for usage are:\n● ${FilesMessagesNames.join('\n● ')}`
                );
            }

            await message.channel.send({
                embeds: [embedForList]
            });
        } else if (args[0] === 'reload') { // reloads the message list
            LoadMessage();
            await message.channel.send({
                embeds: [
                    CreateNormalEmbed(
                        instance,
                        'File Messages',
                        `Reloaded the message files.`
                    ).setFooter({
                        text: `deletes message in ${SecondsToDeleteMessage}s`
                    })
                ]
            }).then(msg => {
                setTimeout(() => {
                    msg.delete()
                }, SecondsToDeleteMessage * 1000)
            });
        } else { // sends message if exists
            if(FilesMessagesNames.includes(args[0])) { // message exists
                message.delete();
                await readFile(FilesMessages.get(args[0]), 'utf8', async (error, data) => {
                    if(error) { console.error(error); }

                    const EmbedsToSend = [];

                    const embedsParts = data.split(EmbedDevider);
                    for(const embedPart of embedsParts) {
                        /**
                         * <color>:
                         * <title>:
                         * <description>:
                         */
                        const temp_Description = embedPart.split(EmbedDescription); // [[color, title], description]
                        const description = temp_Description[1].trim(); 
                        const temp_Title = temp_Description[0].split(EmbedTitle); // [color, title]
                        const title = temp_Title[1].trim();
                        let colorInput = temp_Title[0].trim().replace(EmbedColor, '');

                        // color is role color.
                        if(colorInput.includes("<@&")) {
                            colorInput = colorInput.replace(/<|@|&|>/g, ''); // remains only id
                            let role = guild.roles.cache.get(colorInput);
                            if(role) {
                                colorInput = role.hexColor;
                            } else { colorInput = ''; }
                        }

                        let embedToAdd = CreateNormalEmbed(
                            instance,
                            title,
                            description
                        );

                        if(colorInput && colorInput !== '') { embedToAdd.setColor(colorInput);}

                        EmbedsToSend.push(embedToAdd);
                    }

                    let MoreThan10Embeds = [];
                    while(EmbedsToSend.length > 10) {
                        for (let i = 0; i < 10; i++) {
                            MoreThan10Embeds.push(EmbedsToSend.shift());
                        }
                        
                        message.channel.send({
                            embeds: MoreThan10Embeds
                        });

                        MoreThan10Embeds = [];
                    } 

                    message.channel.send({
                        embeds: EmbedsToSend
                    });
                });

                return;
            } else { // message does not exist
                await message.channel.send({
                    embeds: [
                        CreateErrorEmbed(
                            instance,
                            'File Messages',
                            `Couldn't find file message \`${args[0]}\`!\nUse the command \`${prefix}${commandObject.getName()} ${list}\` to view all avaliable messages.`
                        ).setFooter({
                            text: `deletes message in ${SecondsToDeleteMessage}s`
                        })
                    ]
                }).then(msg => {
                    setTimeout(() => {
                        msg.delete()
                    }, SecondsToDeleteMessage * 1000)
                });
            }
        }

        await message.delete();
    }
}