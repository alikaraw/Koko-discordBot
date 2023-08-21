const { CheckIfBotCanMessage, CreateErrorEmbed } = require('../src/generalUtilies');

module.exports = {
    syntaxError: ({instance, message, commandObject, member}) => {
        if(!CheckIfBotCanMessage(instance, message)) { return; }

        const errorEmbed = CreateErrorEmbed(
            instance,
            'Insufficient Syntax!',
            `Incorrect usage of the command __**\`${commandObject.name}\`**__ please use:\n\`${instance.prefix}${commandObject.name}${(commandObject.expectedArgs === '') ? '' : (` ${commandObject.expectedArgs}`)}\``,
            member
        );
        
        message.reply({
            embeds: [errorEmbed]
        });    
    },

    noRoles: ({instance, message, commandObject, missingRoles, member}) => {
        if(!CheckIfBotCanMessage(instance, message)) { return; }

        let missingRolesMentions = '';
        missingRoles.forEach(roleID => {
            missingRolesMentions = missingRolesMentions.concat(`● <@&${roleID}>\n`);
        });
        
        const errorEmbed = CreateErrorEmbed(
            instance,
            'Insufficient Roles!',
            `You're missing the following __**role${(missingRoles.length === 1) ? '' : 's'}**__ to use the command \`${commandObject.name}\`:\n${missingRolesMentions}`,
            member
        )

        message.reply({
            embeds: [errorEmbed]
        });
    },

    noPermissions: ({instance, message, missingPermissions, commandObject, member}) => {
        if(!CheckIfBotCanMessage(instance, message)) { return; }

        let missingPermissionsFormated = '';
        missingPermissions.forEach(perm => {
            missingPermissionsFormated = missingPermissionsFormated.concat(`● ${perm}\n`)
        })

        const errorEmbed = CreateErrorEmbed(
            instance,
            'Insufficient Permissions!',
            `You're missing the following __**permission${(missingPermissions.length === 1) ? '':'s'}**__ to use the command \`${commandObject.name}\`:\n${missingPermissionsFormated}`,
            member
        )

        message.reply({
            embeds: [errorEmbed]
        });
    },

    noCategories: ({instance, message, commandObject, member}) => {
        if(!CheckIfBotCanMessage(instance, message)) { return; }

        let categoriesFormatted = '',categories = commandObject.categories;
        categories .forEach(category => {
            categoriesFormatted = categoriesFormatted.concat(`● <#${category}>\n`);
        });
        
        const errorEmbed = CreateErrorEmbed(
            instance,
            'Insufficient Category!',
            `You're using the command \`${commandObject.name}\` in an incorrect category\nPlease use ${(categories.length === 1) ? '' : 'one of'} the following __**categor${(categories.length === 1 ? 'y' : 'ies')}**__:\n${categoriesFormatted}`,
            member
        )

        message.reply({
            embeds: [errorEmbed]
        });
    },

    noChannels: ({instance, message, commandObject, member}) => {
        if(!CheckIfBotCanMessage(instance, message)) { return; }

        let channelsFormated = '', channels = commandObject.channels;
        channels.forEach(channelID => {
            channelsFormated = channelsFormated.concat(`● <#${channelID}>\n`);
        });
        
        const errorMessage = CreateErrorEmbed(
            instance, 
            'Insufficient Channel!',
            `You're using the command \`${commandObject.name}\` in an incorrect channel\nPlease use ${(channels.length === 1) ? '' : 'one of'} the following __**channel${(channels.length === 1 ? '' : 's')}**__:\n${channelsFormated}`,
            member
        )

        message.reply({
            embeds: [errorMessage]
        });
    }
}

