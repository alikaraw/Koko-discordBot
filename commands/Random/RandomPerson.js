const { CheckIfBotCanMessage, CreateErrorEmbed, CreateNormalEmbed} = require('../../src/generalUtilies');

module.exports = {
    name: 'randomPerson',
    aliases: ['rp'],
    description: 'Picks a random person from a voice channel',
    maxArgs: 1,
    expectedArgs: '[ChannelID/ChannelMention]',

    callback: ({instance, guild, message, args, member}) => {
        if(!CheckIfBotCanMessage(instance, message)) { return; }
        
        let ChannelToPickFrom;
        
        if(args[0]) {
            ChannelsMentioned = message.mentions.channels;
            if(ChannelsMentioned && ChannelsMentioned.size !== 0) {
                ChannelToPickFrom = ChannelsMentioned.first();
            } else {
                ChannelToPickFrom = guild.channels.cache.find(channel => channel.id == args[0])
            }
        } else { // current user channel
            ChannelToPickFrom = message.member.voice.channel;
        }
        
        if(!ChannelToPickFrom || ChannelToPickFrom.type !== 'GUILD_VOICE') {
            const errorMessage = CreateErrorEmbed(
                instance,
                "Insufficient Channel!",
                (args[0]) ? (`Couldn't find a voice channel with the id "\`${args[0]}\`".`) : (`You have to be in a voice channel OR input channel id.`),
                member
            )
                        
            message.reply({
                embeds: [errorMessage]
            })

            return;
        }
        
        const MembersInChannel = ChannelToPickFrom.members;
        MembersInChannel.sweep(member => member.user.bot);

        if(MembersInChannel.size == 0) {
            message.channel.send({
                embeds: [
                    CreateErrorEmbed(
                        instance,
                        "Insufficient Channel!",
                        `The channel <#${ChannelToPickFrom.id}> is empty!`,
                        member
                    )
                ]
            });
        } else {
            message.channel.send({
                embeds: [
                    CreateNormalEmbed(
                        instance,
                        `Picking random person from ${ChannelToPickFrom.name}...`,
                        `The random person who got picked is <@${MembersInChannel.random().id}>!`,
                        member
                    )
                ]
            });
        }
    }
}