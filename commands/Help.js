//const { CreateNormalEmbed, CheckIfBotCanMessage } = require('../src/generalUtilies');
const { CreateNormalEmbed, CheckIfBotCanMessage, CreateErrorEmbed } = require('/src/generalUtilies');
const { Collection, MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js');
const timer_1 = require('../src/Timer');

/*
    'userID': {
        message: Discord.Message,        
        isInMainPage : true/false,
        idleTimer: timer_1(),
    } 
*/
const HelpMessages = new Collection();
/*
    'emojiID' : MessageEmbed,
*/
const emojiNameIdtoCategory = new Collection();
const messageIDPrefix = '𝓘𝓓', MENU_ID_SELECT_MENU = 'MenuID_SlectMenu', MENU_ID_GOBACK_BUTTON = 'MenuID_GobackButton';
const IdleTimer = 25 * 1000;
let noCommandSelectedEmbed;

/**
 * Sets the member to the main page, if channel is `undefined` edit the old message to main page
 * @param {GetHandler} instance the GetHandler instance 
 * @param {Discord.GuildMember} member the guild member who ran the command
 * @param {Discord.TextChannel} channel the channel to send the embed to, NOTE: if `undefined` then edit message
 */
const setMainPage = async (instance, member, channel = undefined) => {
    const Categories = instance.getVisibleCategories(member);
    let description = '';
    for(const category of Categories.values()) {
        description += `● ${category.emoji} - ${category.name} \`(${category.commandObjects.length} commands)\`\n\n`;
    }

    const mainEmbed = CreateNormalEmbed(
        instance,
        'Help Menu',
        `This help menu is interactable only with <@${member.user.id}>.\nReact with the corresponding emoji to view category commands.\n\n ${description}`
    ).setAuthor({
        name: (member.nickname) ? `${member.nickname} (aka ${member.user.username})`: member.user.username,
        iconURL: member.user.displayAvatarURL()
    })

    let newHelpMessage;
    if(channel) {
        newHelpMessage = await channel.send({
            embeds: [mainEmbed],
            components: []
        })
    } else {
        newHelpMessage = await HelpMessages.get(member.id).message.edit({
            embeds: [mainEmbed],
            components: [],
        })
    }

    await newHelpMessage.edit({
        embeds: [mainEmbed.setFooter({
            text: `${messageIDPrefix} ${newHelpMessage.id}`
        })],
    })

    for(const [folderName, category] of Categories) {
        await newHelpMessage.react(category.emoji);
    }

    let timer;
    if (!channel) {
        timer = HelpMessages.get(member.id).idleTimer.reset();
    } else {
        timer = new timer_1(IdleTimer, () => {
            const messageToDelete = HelpMessages.get(member.id).message;
            messageToDelete.reactions.removeAll();
            messageToDelete.edit({
                components: [],
                embeds: [CreateErrorEmbed(
                    instance,
                    'Help Menu Timed out!',
                    `Use \`${instance.prefix}help\` to get active help menu.`
                    )]
            })

            HelpMessages.delete(member.id);
        });
    }

    HelpMessages.set(member.id, {
        message: newHelpMessage,
        isInMainPage: true,
        idleTimer: timer,
    });
}

const getEmojiNameId = (emoji) => {
    return `${emoji.name}:${(emoji.id) ? emoji.id : '1'}`
}

const CreateCategoryEmbed = (instance, category) => {
    return CreateNormalEmbed(
        instance,
        `${category.emoji} ${category.name} Commands`,
        `${category.options.description}\n\n● Total Commands \`${category.commandObjects.length}\`\n● Commands Folder \`.../${category.folderName}\``
    )
}

const CreateCommandEmbed = (instance, commandName) => {
    const command = instance.getCommand(commandName);
    
    const aliases = command.aliases;
    aliases.shift();
    let aliasesString = '';
    for(const alias of aliases) {
        aliasesString += `\n**⤷** \`${alias}\``
    }

    let roles = '';
    for(const role of command.roles) {
        roles += `\n**⤷** <@&${role}>`
    }

    let channels = '';
    for(const channel of command.channels) {
        channels += `\n**⤷** <#${channel}>`
    }

    let categories = '';
    for(const category of command.categories) {
        categories += `\n**⤷** <#${category}>`
    }

    let permissions = '';
    for(const permission of command.permissions) {
        permissions += `\n**⤷** \`${permission}\``
    }

    return CreateNormalEmbed(
        instance,
        `Command \"${command.name}\"`,
        `${command.description}\n
        ● Syntax 
        **⤷** \`${instance.prefix}${command.name}${(command.expectedArgs === '') ? '' : ` ${command.expectedArgs}`}\`
        
        ● Aliases ${aliasesString || '\`-\`'}

        ● Roles required ${roles || '\`-\`'}

        ● Channels required ${channels || '\`-\`'}
        
        ● Categories required ${categories || '\`-\`'}
        
        ● Premissions required ${permissions || '\`-\`'}`
    )
}

module.exports = {
    name: 'help',
    description: 'Help command',

    init: async (client, instance) => {
        instance.once('finishRegisterCommand', () => {
            for(const [folderName, category] of instance.getCategories()) {
                emojiNameIdtoCategory.set((category.customEmoji) ? 
                `${category.emoji.name}:${category.emoji.id}` : // emoji is custom 'name:id'
                `${category.emoji}:1`, // emoji is default 'name:1'
                    Object.assign({}, {
                        categoryEmbed: CreateCategoryEmbed(instance, category),
                        commandObjects: category.commandObjects,
                    })
                );
            }

            noCommandSelectedEmbed = CreateNormalEmbed(
                instance,
                '',
                'No command has been selected'
            )``
        })

        client.on('messageReactionAdd', async (messageReaction, user) => {
            // if bot return
            if(user.bot) { return;}

            // check if the user reacted to his help message, if no remove reaction
            messageReaction.users.remove(user);
            const userHelpMessage = HelpMessages.get(user.id).message;
            if(!userHelpMessage || userHelpMessage.id !== messageReaction.message.id) {
                return;
            }

            // stop if user reacted with useless emoji or isInMainPage = false
            const emojiInformation = emojiNameIdtoCategory.get(getEmojiNameId(messageReaction.emoji));
            if (!emojiInformation || !HelpMessages.get(user.id).isInMainPage) { return;}

            // select menu
            const selectMenuCommands = []
            for(const command of emojiInformation.commandObjects) {
                selectMenuCommands.push({
                    label: command.name,
                    description: (command.description.length > 100) ? 
                        `${command.description.substring(0, 97)}...` : (command.description),
                    value: command.name,
                })
            }

            let shouldDisable = false;
            if(selectMenuCommands.length === 0) {
                shouldDisable = true;
                selectMenuCommands.push({
                    label: 'No commands are available',
                    value: 'alonLevinGay',
                    default: true,
                })
            }

            const selectCommandMenu = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                .setCustomId(`${MENU_ID_SELECT_MENU}_${userHelpMessage.id}`)
                .setPlaceholder('Nothing selected')
                .addOptions(selectMenuCommands)
                .setDisabled(shouldDisable)
            )

            const backToMainPageButton = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId(`${MENU_ID_GOBACK_BUTTON}_${userHelpMessage.id}`)
                .setLabel('Go back to main page')
                .setStyle('PRIMARY')
            )

            await userHelpMessage.reactions.removeAll();
            const editedMessage = await userHelpMessage.edit({
                embeds: [
                    emojiInformation.categoryEmbed
                    .setAuthor(userHelpMessage.embeds[0].author)
                    .setFooter({text: `${messageIDPrefix} ${userHelpMessage.id}`}),
                    noCommandSelectedEmbed
                ],
                components: [selectCommandMenu, backToMainPageButton]
            });

            HelpMessages.set(user.id, {
                message: editedMessage,
                isInMainPage: false,
                idleTimer: HelpMessages.get(user.id).idleTimer.reset(),
            })
        })

        client.on('interactionCreate', async (interaction) => {
            const userHelpMessage = (HelpMessages.get(interaction.member.id)) ? (HelpMessages.get(interaction.member.id).message) : undefined;
            if(!userHelpMessage || interaction.customId.replace(/[a-zA-Z_]/g, '') !== userHelpMessage.id ) {
                interaction.deferUpdate();
                return;
            }

            const InteractionCustomId = interaction.customId.replace(/_\d{17,19}/g, '');
            switch(InteractionCustomId) {
                case MENU_ID_SELECT_MENU:
                    userHelpMessage.edit({
                        embeds: [userHelpMessage.embeds[0], CreateCommandEmbed(instance, interaction.values[0])]
                    })
                break;
                case MENU_ID_GOBACK_BUTTON:
                    setMainPage(instance, interaction.member);
                break;
            }

            HelpMessages.get(interaction.member.id).idleTimer.reset();
            interaction.deferUpdate();
        })
    },

    callback: async ({ message, channel, instance, user, member}) => {
        // check of bot can send messages in channel
        if(!CheckIfBotCanMessage(instance, message)) { return; }

        // delete old help message
        if(HelpMessages.get(user.id)) {
            await HelpMessages.get(user.id).message.delete();
        }

        // send new help message
        await setMainPage(instance, member, channel);
    },
}