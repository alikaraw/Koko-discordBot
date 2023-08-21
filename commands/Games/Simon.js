const { 
    CreateColoredEmbed, 
    CreateRandomEmbed, 
    CreateButton, 
    CheckIfBotCanMessage,
    CreateEmbedAuthorData,
    CreateSelectMenu,
    CreateSelectMenuItem,
    CreateErrorEmbed,
    RandomInt,
} = require('../../src/generalUtilies');
const { Collection, MessageActionRow } = require('discord.js');
const interactionHandler_1 = require('../../src/InteractionHandler');

const FooterIDPrefix = '𝓘𝓓', SimonInteractions = new interactionHandler_1('SIMON_');
const AvaliableEmojis = {
    Colors: ['🟥', '🟦', '🟩', '🟨', '🟪', '⬜', '🟫', '🟧'],
    Animals: ['🐄', '🐑', '🐖', '🐓', '🐘', '🐊', '🦒', '🐒'],
    Food: ['🍎', '🍋', '🍐', '🍇', '🍔', '🍟', '🍕', '🌭'],
}

const SettingsOptions = {
    amountOfEmojis: {
        label: 'Amount Of Emojis',
        description: 'The number of emojis that can be used ingame',
        isOptions: false,
        minValue: 2.0,
        maxValue: 8.0,
        stepValue: 1.0, 
    },
    patternShowTime: {
        label: 'Pattern Show Time',
        description: 'The time you get to see the pattern',
        isOptions: false,
        minValue: 0.5,
        maxValue: 5.0,
        valueSuffix: 's',
        stepValue: 0.5,
    },
    patternSizeToWin: {
        label: 'Pattern Size To Win',
        description: 'The size of the emojis you need to get to win',
        isOptions: false,
        minValue: 5.0,
        maxValue: 20.0,
        stepValue: 5.0,
    },
    timeForEachEmoji: {
        label: 'Time For Each Emoji',
        description: 'The time you get for each emoji',
        isOptions: false,
        minValue: 1.0,
        maxValue: 3.0,
        valueSuffix: 's',
        stepValue: 0.5,
    },
    emojisToUse: {
        label: 'Emojis To Use',
        description: 'The emojis to use for the pattern',
        isOptions: true,
        options: Object.keys(AvaliableEmojis)
    }
}

const Presets = { // NOTE: id can't me 'Custom'
    default_colors: {
        label: 'Default (Colors)',
        description: 'The default settings for the game',
        settings: {
            amountOfEmojis: 4.0,
            patternShowTime: 2.0,
            patternSizeToWin: 10.0,
            timeForEachEmoji: 2.0,
            emojisToUse: 'Colors'
        }
    },
    default_animals: {
        label: 'Default (Animals)',
        description: 'The default settings for the game but with animals',
        settings: {
            amountOfEmojis: 4.0,
            patternShowTime: 2.0,
            patternSizeToWin: 10.0,
            timeForEachEmoji: 2.0,
            emojisToUse: 'Animals',
        }
    },
    default_food: {
        label: 'Default (Food)',
        description: 'The default settings for the game but with food',
        settings: {
            amountOfEmojis: 4.0,
            patternShowTime: 2.0,
            patternSizeToWin: 10.0,
            timeForEachEmoji: 2.0,
            emojisToUse: 'Food',
        }
    },
}

const CreateArrayOfPresets = () => {
    const items = [];
    for(const [name, preset] of Object.entries(Presets)) {
        items.push(
            CreateSelectMenuItem(
                preset.label,
                preset.description,
                name,
                undefined,
                false
            )
        )
    }

    return items;
}

const CreateArrayOfSettingOptions = () => {
    const items = [];
    for(const [name, settingOptions] of Object.entries(SettingsOptions)) {
        items.push(
            CreateSelectMenuItem(
                settingOptions.label,
                settingOptions.description,
                name,
                undefined,
                false,
            )
        )
    }

    return items;
}

const CreateEmojiSettingOptions = () => {
    const items = [];
    for(const [name, emojis] of Object.entries(AvaliableEmojis)) {
        items.push(
            CreateSelectMenuItem(
                `${name} - [${emojis.join(', ')}]`,
                '',
                name,
                undefined,
                false
            )
        )
    }

    return items;
}

const GamePanelInteractions = new MessageActionRow()
.addComponents(CreateButton(SimonInteractions.createCustomID('START'), 'Start the game', 3, {emoji: '🎉'}))
.addComponents(CreateButton(SimonInteractions.createCustomID('INSTRUCTIONS'), 'Game Instructions', 1, {emoji: '📑'}))
.addComponents(CreateButton(SimonInteractions.createCustomID('SETTINGS'), 'Go To Settings', 2, {emoji: '⚙️'}))
.addComponents(CreateButton(SimonInteractions.createCustomID('CANCEL'), 'Exit', 4, {emoji: '✖️'}))

const SettingPreset = new MessageActionRow()
.addComponents(CreateSelectMenu(
    SimonInteractions.createCustomID('SETTINGS_SELECT_PRESET'),
    'No preset has been selected',
    CreateArrayOfPresets()
))

const SettingChangeField = new MessageActionRow()
.addComponents(CreateSelectMenu(
    SimonInteractions.createCustomID('SETTINGS_CHANGE_FIELD'),
    'No field has been selected to change',
    CreateArrayOfSettingOptions()
))

const SettingSetField = new MessageActionRow()
.addComponents(CreateButton(SimonInteractions.createCustomID('SETTINGS_FIELD_ADD'), 'Add Step', 3, {emoji: '➕'}))
.addComponents(CreateButton(SimonInteractions.createCustomID('SETTINGS_FIELD_CURRENT'), 'Current Value: -', 2, {enable: false}))
.addComponents(CreateButton(SimonInteractions.createCustomID('SETTINGS_FIELD_REMOVE'), 'Remove Step', 4, {emoji: '➖'}))

const SettingSelectEmoji = new MessageActionRow()
.addComponents(CreateSelectMenu(
    SimonInteractions.createCustomID('SETTINGS_SELECT_EMOJI'),
    'No Emoji has been selected',
    CreateEmojiSettingOptions()
))

const BackToGamePanelButton = new MessageActionRow()
.addComponents(CreateButton(SimonInteractions.createCustomID('BACK_TO_GAME_PANEL'), 'Back To Game Panel', 2, {emoji: '🚪'}))

const GameButtons1To4 = new MessageActionRow()
.addComponents(CreateButton(SimonInteractions.createCustomID('BUTTON_1'), '', 2, {emoji: AvaliableEmojis['Colors'][0]}))
.addComponents(CreateButton(SimonInteractions.createCustomID('BUTTON_2'), '', 2, {emoji: AvaliableEmojis['Colors'][1]}))
.addComponents(CreateButton(SimonInteractions.createCustomID('BUTTON_3'), '', 2, {emoji: AvaliableEmojis['Colors'][2]}))
.addComponents(CreateButton(SimonInteractions.createCustomID('BUTTON_4'), '', 2, {emoji: AvaliableEmojis['Colors'][3]}))

const GameButtons5To8 = new MessageActionRow()
.addComponents(CreateButton(SimonInteractions.createCustomID('BUTTON_5'), '', 2, {emoji: AvaliableEmojis['Colors'][4]}))
.addComponents(CreateButton(SimonInteractions.createCustomID('BUTTON_6'), '', 2, {emoji: AvaliableEmojis['Colors'][5]}))
.addComponents(CreateButton(SimonInteractions.createCustomID('BUTTON_7'), '', 2, {emoji: AvaliableEmojis['Colors'][6]}))
.addComponents(CreateButton(SimonInteractions.createCustomID('BUTTON_8'), '', 2, {emoji: AvaliableEmojis['Colors'][7]}))

const GameQuit = new MessageActionRow()
.addComponents(CreateButton(SimonInteractions.createCustomID('QUIT_GAME'), 'Quit Game', 4, {emoji: '✖️'}));

/*
    'userID': {
        message: Discord.Message,
        selectMenuValues: {
            preset: String,
            change_field: String
        },
        settings: {
            amountOfEmojis: Number,
            patternShowTime: Number,
            patternSizeToWin: Number,
            timeForEachEmoji: Number,
            emojisToUse: String, // AvaliableEmojis
        },
        footer: { text: },
        gameData: {
            pattern: [],
        } || undefined; // undefined means game isn't started yet
    }
*/
const GameInfoHolder = new Collection();

const GamePanel = async (member) => {
    const MemberGameInfo = GameInfoHolder.get(member.id);

    let TextOptions = '';
    for(const [name, settingInfo] of Object.entries(SettingsOptions)) {
        TextOptions += `
        ● __**${settingInfo.label}:**__ \`${!settingInfo.isOptions ? MemberGameInfo.settings[name] : `[${AvaliableEmojis[MemberGameInfo.settings[name]]}]`}${settingInfo.valueSuffix || ''}\` \n*${settingInfo.description}.*
        `
    }

    const GamePanelEmbed = CreateRandomEmbed(
        'Simon Game',
        `
        Hey <@${member.id}>! Welcome to the simon game, a simple yet intense memory game.

        Press the **🎉 Start the game** button to start the game.
        Press the **📑 Game instructions** to see how to play the game.
        Press the **⚙️ Go To Settings** button to change the game settings.
        Press the **❌ Exit** button to exit the game.

        ⚙️ **__Settings__** ${TextOptions}
        `
    )
    .setAuthor(CreateEmbedAuthorData(member))
    .setFooter(MemberGameInfo.footer)

    if(!MemberGameInfo.embedColor) {
        MemberGameInfo.embedColor = GamePanelEmbed.hexColor;
    } else {
        GamePanelEmbed.setColor(MemberGameInfo.embedColor);
    }

    if(!MemberGameInfo.message.embeds) { // if embeds is undefined = MemberGameInfo.message = channel
        MemberGameInfo.message = await MemberGameInfo.message.send({
            components: [GamePanelInteractions],
            embeds: [GamePanelEmbed]
        })

        // set the MemberGameInfo.footer for future updates
        MemberGameInfo.footer = {
            text: `${FooterIDPrefix} ${MemberGameInfo.message.id}`
        }

        await MemberGameInfo.message.edit({
            components: [GamePanelInteractions],
            embeds: [GamePanelEmbed.setFooter(MemberGameInfo.footer)]
        })
    } else {
        MemberGameInfo.message.edit({
            components: [GamePanelInteractions],
            embeds: [GamePanelEmbed]
        })
    }
}

const SettingsPanel = async (member) => {
    const MemberGameInfo = GameInfoHolder.get(member.id);

    let TextOptions = '';
    for(const [name, settingInfo] of Object.entries(SettingsOptions)) {
        TextOptions += `
        ● __**${settingInfo.label}:**__ \`${!settingInfo.isOptions ? MemberGameInfo.settings[name] : `[${AvaliableEmojis[MemberGameInfo.settings[name]]}]`}${settingInfo.valueSuffix || ''}\` \n*${settingInfo.description}.*
        `
    }

    const SettingPanelEmbed = CreateColoredEmbed(
        MemberGameInfo.embedColor,
        'Settings Panel',
        `Hey <@${member.id}>! In this panel you can set the settings of the game, You can either select a preset from the __**First drop menu**__ or customize your game to your liking with the __**Second drop menu**__.

        ⚙️ __**Current Settings**__ ${TextOptions}
        `
    )
    .setAuthor(CreateEmbedAuthorData(member))
    .setFooter(MemberGameInfo.footer)
    
    UpdateSettingComponents(member);
    
    if(MemberGameInfo.selectMenuValues.change_field) {
        MemberGameInfo.message = await MemberGameInfo.message.edit({
            components: [
                SettingPreset,
                SettingChangeField,
                (SettingsOptions[MemberGameInfo.selectMenuValues.change_field].isOptions) ? SettingSelectEmoji : SettingSetField,
                BackToGamePanelButton,
            ],
            embeds: [SettingPanelEmbed]
        })
    } else {
        MemberGameInfo.message = await MemberGameInfo.message.edit({
            components: [
                SettingPreset,
                SettingChangeField,
                BackToGamePanelButton,
            ],
            embeds: [SettingPanelEmbed]
        })
    }
}

let CustomPresetItemExists = false;
const UpdateSettingComponents = (member) => {
    const MemberGameInfo = GameInfoHolder.get(member.id);

    for(const item of SettingPreset.components[0].options) {
        item.default = MemberGameInfo.selectMenuValues.preset === item.value;
    }
    
    if(MemberGameInfo.selectMenuValues.preset === 'Custom') {
        if(!CustomPresetItemExists) {
            CustomPresetItemExists = true;

            SettingPreset.components[0].options.push(CreateSelectMenuItem(
                'Custom Preset',
                'Customize your settings to your liking',
                'Custom',
                undefined,
                true
            ))
            SettingPreset.components[0].options
        }
    } else {
        if (CustomPresetItemExists) {
            CustomPresetItemExists = false;

            SettingPreset.components[0].options.pop();
        }
    }

    for(const item of SettingChangeField.components[0].options) {
        item.default = MemberGameInfo.selectMenuValues.change_field === item.value;
    }

    for(const item of SettingSelectEmoji.components[0].options) {
        item.default = MemberGameInfo.settings.emojisToUse === item.value;
    }

    const ChangedSetting = SettingsOptions[MemberGameInfo.selectMenuValues.change_field];
    if (MemberGameInfo.selectMenuValues.change_field && !ChangedSetting.isOptions) {
        // Green Button
        SettingSetField.components[0].label = `Add (${ChangedSetting.stepValue}${ChangedSetting.valueSuffix || ''})`;
        SettingSetField.components[0].disabled = (MemberGameInfo.settings[MemberGameInfo.selectMenuValues.change_field] + ChangedSetting.stepValue) > ChangedSetting.maxValue;
        
        // Gray Button
        SettingSetField.components[1].label = `Current Value: ${MemberGameInfo.settings[MemberGameInfo.selectMenuValues.change_field]}${ChangedSetting.valueSuffix || ''}`;
        
        // Red Button
        SettingSetField.components[2].label = `Remove (${ChangedSetting.stepValue}${ChangedSetting.valueSuffix || ''})`;
        SettingSetField.components[2].disabled = (MemberGameInfo.settings[MemberGameInfo.selectMenuValues.change_field] - ChangedSetting.stepValue) < ChangedSetting.minValue;
    }
}

const ChangeSetting = (member, isAdd) => {
    const MemberGameInfo = GameInfoHolder.get(member.id);
    const ChangedSetting = SettingsOptions[MemberGameInfo.selectMenuValues.change_field];
    MemberGameInfo.settings[MemberGameInfo.selectMenuValues.change_field] += ((ChangedSetting.stepValue) * ((isAdd) ? (1) : (-1.0)));
}

const StartGame = async (member) => {
    const MemberGameInfo = GameInfoHolder.get(member.id);
    const MemberSettings = GameInfoHolder.get(member.id).settings;
    MemberGameInfo.gameData =  {
        pattern: [],
    }
    const MemberGameData = MemberGameInfo.gameData;

    for(let i = 0; i < 20; i++) {
        PullRandomEmoji(member);
    }

    const GameStartPanel = CreateColoredEmbed(
        MemberGameInfo.embedColor,
        'Simon Game',
        '',
        member
    )
    .setFields(
        {
            name: '__**New Emoji Added To The Pattern**__',
            value: `${MemberGameData.pattern[MemberGameData.pattern.length - 1]}`,
            inline: false
        },
        {
            name: '__**Current Pattern**__',
            value: `${MemberGameData.pattern.join(' ')}`,
            inline: false
        },
        {
            name: '__**Time To Get The Pattern**__',
            value: `You Have **${MemberGameData.pattern.length * MemberSettings.timeForEachEmoji}s**`,
            inline: true,
        },
        {
            name: '__**Progress To Win**__',
            value: `You Are **${MemberGameData.pattern.length}/${MemberSettings.patternSizeToWin}** the away to win`,
            inline: true,
        },
        {
            name: '__**Quitting Game**__',
            value: 'You can quit at any point in the game by pressing the ❌**Quit Game** button',
            inline: false,
        }
    )
    .setFooter(MemberGameInfo.footer)

    UpdateGameComponents(member);

    MemberGameInfo.message = await MemberGameInfo.message.edit({
        components: [GameButtons1To4, GameButtons5To8, GameQuit],
        embeds: [GameStartPanel],
    });
}

const PullRandomEmoji = (member) => {
    const MemberGameInfo = GameInfoHolder.get(member.id);
    const MemberSettings = MemberGameInfo.settings;
    MemberGameInfo.gameData.pattern.push(AvaliableEmojis[MemberSettings.emojisToUse][RandomInt(MemberSettings.amountOfEmojis)]);
}

const UpdateGameComponents = (member) => {
    const MemberGameInfo = GameInfoHolder.get(member.id);
    const MemberSettings = MemberGameInfo.settings;
    const EmojisToUse = AvaliableEmojis[MemberSettings.emojisToUse];
    const AmountOfEmojis = GameButtons1To4.components.length + GameButtons5To8.components.length;
    
    for(let index = 0; index < AmountOfEmojis; index++) {
        if(index <= 3) {
            GameButtons1To4.components[index].emoji = { 
                animated: false,
                name: EmojisToUse[index],
                id: null
            }
            GameButtons1To4.components[index].disabled = index > MemberSettings.amountOfEmojis - 1;
        } else {
            GameButtons5To8.components[index - 4].emoji = { 
                animated: false,
                name: EmojisToUse[index],
                id: null
            }
            GameButtons5To8.components[index - 4].disabled = index > MemberSettings.amountOfEmojis - 1;
        }
    }
}

module.exports = {
    name: 'simon',
    aliases: 's',
    description: 'The good old memory game simon with a unique twist',
    
    init: (client, instance) => {
        client.on('interactionCreate', (interaction) => {
            if(!SimonInteractions.hasCustomID(interaction.customId)) { return; }

            const MemberGameInfo = GameInfoHolder.get(interaction.member.id);
            if(!MemberGameInfo || interaction.message.id !== MemberGameInfo.message.id) {
                interaction.reply({
                    embeds: [
                        CreateErrorEmbed(
                            instance, 
                            'Interaction Error!',
                            `This game isn't yours! Please use \`${instance.prefix}simon\` to create your own game.`
                        )
                    ],
                    
                    ephemeral: true,
                })

                return;
            }

            CustomID = interaction.customId.replace(SimonInteractions.prefix, '');

            switch(CustomID) {
                case 'SETTINGS_SELECT_PRESET':
                    MemberGameInfo.selectMenuValues.preset = interaction.values[0];
                    MemberGameInfo.settings = Object.assign({}, Presets[interaction.values[0]].settings);
                    SettingsPanel(interaction.member);
                    break;
                case 'SETTINGS_CHANGE_FIELD':
                    MemberGameInfo.selectMenuValues.change_field = interaction.values[0];
                    SettingsPanel(interaction.member);
                    break;
                case 'SETTINGS_FIELD_ADD':
                case 'SETTINGS_FIELD_REMOVE':
                    MemberGameInfo.selectMenuValues.preset = 'Custom';
                    ChangeSetting(interaction.member, CustomID === 'SETTINGS_FIELD_ADD');
                    SettingsPanel(interaction.member);
                    break;
                case 'SETTINGS_SELECT_EMOJI': 
                    MemberGameInfo.selectMenuValues.preset = 'Custom';
                    MemberGameInfo.settings.emojisToUse = interaction.values[0];
                    SettingsPanel(interaction.member);
                    break;
                case 'SETTINGS':
                    SettingsPanel(interaction.member);
                    break;
                case 'QUIT_GAME':
                case 'CANCEL':
                    MemberGameInfo.message.delete()
                    GameInfoHolder.delete(interaction.member.id);
                    break;
                case 'BACK_TO_GAME_PANEL':
                    MemberGameInfo.selectMenuValues.change_field = undefined;
                    GamePanel(interaction.member);
                    break;
                case 'START':
                    StartGame(interaction.member); 
                    break;
            }
            
            interaction.deferUpdate();
        })
    },

    callback: async ({ instance, message, channel , member }) => {
        if(!CheckIfBotCanMessage(instance, message)) { return; }

        if(GameInfoHolder.get(member.id)) {
            await GameInfoHolder.get(member.id).message.delete();
        }

        GameInfoHolder.set(member.id, {
            message: channel,
            selectMenuValues: {
                preset: 'default_colors',
                change_field: undefined,
            },
            settings: Presets['default_colors'].settings,
            footer: {text: ' '},
        });

        GamePanel(member, channel)
    },
}