const { CheckIfBotCanMessage, CreateErrorEmbed, CreateNormalEmbed} = require('../../src/generalUtilies');
const EmptyField = 'Empty Team';

module.exports = {
    name: 'randomTeam',
    aliases: ['rt'],
    description: 'Picks random amount of teams from the people connected to voice channel',
    minArgs: 1,
    maxArgs: 2,
    expectedArgs: '<Number Of Teams [>2]> [ChannelID/ChannelMention]',

    callback: ({instance, guild, message, args, member}) => {
        if(!CheckIfBotCanMessage(instance, message)) { return; }

        // Arg 1 [0] - Number of teams
        const NumberOfTeams = parseInt(args[0], 10);
        
        if(NumberOfTeams < 2) {
            const errorMessage = CreateErrorEmbed(
                instance,
                "Insufficient Teams Amount!",
                'The number of teams must be at least 2.',
                member
            )
                        
            message.reply({
                embeds: [errorMessage]
            })

            return;
        }

        // Arg 2 [1] - Channel
        let ChannelOfTeams;
        if(args[1]) {
            ChannelsMentioned = message.mentions.channels;
            if(ChannelsMentioned && ChannelsMentioned.size !== 0) {
                ChannelOfTeams = ChannelsMentioned.first();
            } else {
                ChannelOfTeams = guild.channels.cache.find(channel => channel.id == args[1])
            }
        } else { // current user channel
            ChannelOfTeams = message.member.voice.channel;
        }
        
        if(!ChannelOfTeams) {
            const errorMessage = CreateErrorEmbed(
                instance,
                "Insufficient Channel!",
                (args[1]) ? (`Couldn't find the voice channel "\`${args[1]}\`".`) : (`You have to be in a voice channel OR input channel id.`),
                member
            )
                        
            message.reply({
                embeds: [errorMessage]
            })

            return;
        }
        
        const MembersInChannel = ChannelOfTeams.members;

        // filters out the bots
        MembersInChannel.sweep(member => member.user.bot);

        if(MembersInChannel.size == 0) { 
            message.channel.send({
                embeds: [
                    CreateErrorEmbed(
                        instance,
                        "Insufficient Channel!",
                        `The channel <#${ChannelOfTeams.id}> is empty!`,
                        member
                    )
                ]
            });
        } else {
            let TeamFields = [], TeamIndex = 1;

            for(let i = 1; i <= NumberOfTeams; i++) {
                TeamFields[i] = {
                    name: `Team ${i}`,
                    value: EmptyField,
                    inline: true
                }
            }

            const Holder_MembersInChannel = MembersInChannel.size;
            const NumberOfMembersInTeam = Holder_MembersInChannel/NumberOfTeams;

            while(MembersInChannel.size !== 0) {
                const randomKey = MembersInChannel.randomKey();
                MembersInChannel.delete(randomKey);

                if (TeamFields[TeamIndex].value === EmptyField) {
                    TeamFields[TeamIndex].value = `<@${randomKey}>\n`;
                } else {
                    TeamFields[TeamIndex].value = TeamFields[TeamIndex].value.concat(`<@${randomKey}>\n`);
                }

                TeamIndex++;
                if(TeamIndex > NumberOfTeams) { TeamIndex = 1; }
            }

            const embedTeams = CreateNormalEmbed(
                instance,
                `Splitting ${ChannelOfTeams.name} to ${NumberOfTeams} Teams...`,
                `Splited \`${Holder_MembersInChannel}\` members to \`${NumberOfTeams}\` teams, each team has \`${(Holder_MembersInChannel%NumberOfTeams == 0) ? (NumberOfMembersInTeam) : `${Math.floor(NumberOfMembersInTeam)} - ${Math.floor(NumberOfMembersInTeam) + 1}`}\` members.\nThe random teams are:`,
                member
            ).setFields(TeamFields);

            message.channel.send({
                embeds: [embedTeams]
            });
        }
    }
}