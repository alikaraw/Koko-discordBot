const { CheckIfBotCanMessage, CreateNormalEmbed } = require('../../src/generalUtilies');

// ~~pick 
module.exports = {
    name: 'pfl',
    aliases: ['pick', 'pic'],
    description: 'Picks a random item from a given list',
    expectedArgs: '<List of items with seperated by "," minimum of 2>',

    callback: ({ message, channel, args, text, client, prefix, instance, user, member, guild, commandObject }) => {
        if(!CheckIfBotCanMessage(instance, message)) { return; }

        const Items = text.split(',');
        Items.map(item => item.trim());
        
        if(Items.length < 2) {
            channel.send({
                embeds: [
                    CreateNormalEmbed(
                        instance,
                        'Insufficient number of items',
                        'You must have at least two items sperated by ",".',
                        member
                    )
                ]
            })
            
            return;
        }

        let ItemsList = '';
        for (let i = 1; i <= Items.length; i++) {
            ItemsList += `● #${i} ${Items[i - 1]}\n`;
        }

        channel.send({
            content: ItemsList,
        })
    },
}