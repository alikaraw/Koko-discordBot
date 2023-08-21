// imports
const fs_1 = require('fs');
const { MessageEmbed, MessageSelectMenu, MessageButton } = require('discord.js');

// consts for
/** @Example emoji `:sob:` */
const EmojiPattern = /:.+:/g
/** @Example custom emoji `<:10_rating:974064379781857291>` */
const CustomEmojiPattern = /<:.+?:\d{17,19}>/g
/** @Example snowflake `974064379781857291` */
const SnowFlakePattern = /\d{17,19}/g

// functions

/**
 * Creates a error embed and returns it
 * @param {!GetHandler} instance the GetHandler instance
 * @param {!String|''} title the title of the error embed
 * @param {!String|''} description the description of the error embed
 * @param {GuildMember} member if defined, add `CreateEmbedAuthorData` to the embed
 * @returns {!MessageEmbed} error embed
 */
const CreateErrorEmbed = (instance, title, description, member = undefined) => {
    return CreateColoredEmbed(instance.errorEmbedColor, title, description, member);
}

/**
 * Creates a normal embed and returns it
 * @param {!GetHandler} instance the GetHandler instance
 * @param {?String} title the title of the normal embed
 * @param {?String} description the description of the normal embed
 * @param {GuildMember} member if defined, add `CreateEmbedAuthorData` to the embed
 * @returns {!MessageEmbed} normal embed
 */
const CreateNormalEmbed = (instance, title, description, member = undefined) => {
    return CreateColoredEmbed(instance.normalEmbedColor, title, description, member);
}

/**
 * Creates a embed with random color and returns it
 * @param {?String} title the title of the normal embed
 * @param {?String} description the description of the normal embed
 * @param {GuildMember} member if defined, add `CreateEmbedAuthorData` to the embed
 * @returns {!MessageEmbed} random color embed
 */
 const CreateRandomEmbed = (title, description, member = undefined) => {
    return CreateColoredEmbed('RANDOM', title, description, member);
}

/**
 * Creates a colored embed and returns it
 * @param {ColorResolvable} color the color of the embed
 * @param {*} title the title of the embed
 * @param {*} description the description of the embed
 * @param {GuildMember} member if defined, add `CreateEmbedAuthorData` to the embed
 * @returns {!MessageEmbed} colored embed
 */
 const CreateColoredEmbed = (color, title, description, member) => {
    const newEmbed = new MessageEmbed()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)

    if(member) { newEmbed.setAuthor(CreateEmbedAuthorData(member)); }

    return newEmbed;
}

/**
 * Creates the author embed data from a guild member
 * @param {GuildMember} member the guild member to create the author embed for 
 * @returns {{
 * name: String,
 * iconURL: String,
 * }}
 */
const CreateEmbedAuthorData = (member) => {
    return {
        name: (member.nickname) ? `${member.nickname} (aka ${member.user.username})` : member.user.username,
        iconURL: member.user.displayAvatarURL()
    }
}

/**
 * Creates a button
 * @param {!String} customID the custom ID of the button
 * @param {!String} label the label of the button
 * @param {!Number} style the style of the button 
 * `[1: PRIMARY]`
 * `[2: SECONDARY]`
 * `[3: SUCCESS]`
 * `[4: DANGER]`
 * `[5: LINK]`
 * @param {{
 * emoji: EmojiIdentifierResolvable | undefined,
 * enable: boolean|true,
 * url: string|undefined,
 * }} options the options of the button
 * @returns {!MessageButton} new button instance
 */
const CreateButton = (customID, label, style, options = {}) => {
    options.emoji  = options.emoji || undefined;
    options.enable = (typeof options.enable === 'boolean') ? options.enable : true;
    options.url = options.url || undefined;
    
    const newButton = new MessageButton()
    .setCustomId(customID)
    .setLabel(label)
    .setDisabled(!options.enable)

    switch (style) {
        case 1:
            newButton.setStyle('PRIMARY')
            break;
        case 2:
            newButton.setStyle('SECONDARY')
            break;
        case 3:
            newButton.setStyle('SUCCESS')
            break;
        case 4:
            newButton.setStyle('DANGER')
            break;
        case 5:
            newButton.setStyle('LINK')
            break;
        default:
            newButton.setStyle(undefined);
            break;
    }

    if(options.emoji) { newButton.setEmoji(options.emoji); }
    if(options.url) { newButton.setURL(options.url); }
    
    return newButton;
}

/**
 * Creates a select menu 
 * @param {String} customID the custom ID of the select menu 
 * @param {String} placeHolder the place holder for the select menu
 * @param {[...{
 * lable: string,
 * description: string | '',
 * value: string,
 * emoji: EmojiIdentifierResolvable | undefined,
 * default: boolean| false,
 * }]} items the items of the select menu
 * @param {{
 * enable: boolean | true,
 * minValues: number | 1,
 * maxValues: number | 1,
 * }} options the other options 
 * @returns {MessageSelectMenu} new select menu instance
 */
const CreateSelectMenu = (customID, placeHolder, items, options = {}) => {
    options.enable = (typeof options.enable === 'boolean') ? options.enable : true;
    options.minValues = options.minValues || 1;
    options.maxValues = options.maxValues || 1;

    return new MessageSelectMenu()
    .setCustomId(customID)
    .setPlaceholder(placeHolder)
    .setOptions(items)
    .setDisabled(!options.enable)
    .setMinValues(options.minValues)
    .setMaxValues(options.maxValues)
}

/**
 * Creates a select menu item
 * @param {!String} lable the lable of the item
 * @param {String | ''} description the description of the item
 * @param {!String} value the value of the item
 * @param {EmojiIdentifierResolvable | undefined} emoji the emoji of the item
 * @param {!Boolean | false} default_ whether this item is the default choice
 * @returns {{
 * lable: string,
 * description: string | '',
 * value: string,
 * emoji: EmojiIdentifierResolvable | undefined,
 * default: boolean | false,
 * }} object module for item menu
 */
const CreateSelectMenuItem = (label, description, value, emoji, default_) => {
    if(description) {
        description = (description.length > 100) ? `${description.substring(0, 97)}...` : (description);
    }

    return {
        label: label,
        description: description || '',
        value: value,
        emoji: emoji || undefined,
        default: default_ || false,
    }
}

/**
 * Checks of the the bot can send messages in a channel, sends message if can't
 * @param {!GetHandler} instance the GetHandler instance 
 * @param {!Message} message the message to get channel and guild from
 * @returns {!Boolean} true if the bot can send the messages in given channel
 */
const CheckIfBotCanMessage = (instance, message) => {
    if(!message.guild.me.permissionsIn(message.channel).has('SEND_MESSAGES')) {
        message.author.send({
            embeds: [
                CreateErrorEmbed(
                    instance,
                    'Insufficient Permissions',
                    `I cant send messages in <#${message.channelId}>.`
                )
            ]
        });

        return false;
    } 
    
    return true;
}
/**
 * Random integer
 * @param {Number} max the maximum number (exclusive) 
 * @param {Number} min the minimum number (inclusive)
 * @returns {Number} random int between (min) and (max - 1)
 */
const RandomInt = (max, min = 0) => {
    return Math.floor((Math.random() * max)) + min;
}

/** 
 * Reads all the files in dir with the given suffix
 * @param {!String} dir the path to the directory
 * @param {!String} suffix the suffix to check for files
 * @returns {[...[FileName, FilePath]]} array of files with the suffix
 */
const GetFilesFromDirectory = (dir, suffix) => {
    const files = fs_1.readdirSync(dir, {
        withFileTypes: true,
    });

    let commandFiles = [];

    files.forEach(file => {
        if(file.isDirectory()) {
            commandFiles = [
                ...commandFiles,
                 ...GetFilesFromDirectory(`${dir}\\${file.name}`, suffix)
                ];
        } else if(file.name.endsWith(suffix)) {
            commandFiles.push([`${dir}\\${file.name}`, file.name.split('.')[0]]);
        }
    })
     
    return commandFiles;
}

/**
 * Checks of the member has administrator permissions
 * @param {Discord.GuildMember} member the guild member to check permissions on
 * @return {boolean} whether member has administrator permissions
 */
const isMemberAdmin = (member) => {
    return member.permissions.has('ADMINISTRATOR');
}

module.exports = {
    EmojiPattern,
    CustomEmojiPattern,
    SnowFlakePattern,
    CheckIfBotCanMessage,
    CreateErrorEmbed,
    CreateNormalEmbed,
    CreateRandomEmbed,
    CreateColoredEmbed,
    CreateEmbedAuthorData,
    CreateButton,
    CreateSelectMenu,
    CreateSelectMenuItem,
    RandomInt,
    GetFilesFromDirectory,
    isMemberAdmin,
}