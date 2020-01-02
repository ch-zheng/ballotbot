'use strict';
const discord = require('discord.js');
const config = require('./config.json');
const motions = require('./motions.js');

const client = new discord.Client();
client.once('ready', () => console.log('Client ready.'));
client.on('message', message => {
	if (message.content.startsWith(config.prefix + config.command) &&
		!message.author.bot &&
		message.guild.available
	) {
		//Parse arguments
		const args = message.content.match(/[^\s"]+|".+"/g).slice(1).map(x => /".+"/.test(x) ? x.slice(1, -1) : x);
		const motion = args[0].charAt(0).toUpperCase() + args[0].slice(1).toLowerCase();
		if (motions.hasOwnProperty(motion)) {
			create_ballot(
				message,
				new motions[motion](message, args.slice(1)),
			).catch(console.log);
		} else if (motion == 'Help') {
			const embed = new discord.RichEmbed()
				.setTitle('BallotBot Help')
				.setDescription('Delivering democracy since 2020.\nBelow is a list of commands for your viewing pleasure:')
				.setColor('BLUE');
			for (const property of Object.keys(motions)) {
				embed.addField(property, `${motions[property].help}\n\`${config.prefix}${config.command} ${property.toLowerCase()} ${motions[property].syntax}\``);
			}
			message.channel.send(embed);
		} else {
			message.channel.send(`\`${motion}\` is not a valid command.`);
		}
	}
});
client.login(config.token);

function create_ballot(message, motion) {
	return message.guild.pruneMembers(parseInt(config.prune_days), true).then(pruned =>
		Math.ceil(motion.threshold * (message.guild.memberCount - pruned)) + 2
	).then(threshold => {
		const ballotText =
`Voting to ${motion.description}.
${threshold} votes required within ${motion.hours} hours.`
		message.channel.send(ballotText).then(ballot => {
			//Listen for votes
			const collector = ballot.createReactionCollector(
				(reaction, user) =>
					reaction.emoji.name === config.for_emoji ||
					reaction.emoji.name === config.against_emoji ||
					reaction.emoji.name === config.present_emoji,
				{time: motion.hours * 3.6e6}
			);
			//Threshold met => Stop collection
			collector.on('collect', (reaction, collector) => {
				switch (reaction.emoji.name) {
					case config.for_emoji:
					case config.against_emoji:
						const present_votes = count_emoji(
							collector.collected,
							config.present_emoji
						);
						if (reaction.count + present_votes >= threshold)
							collector.stop();
						break;
					case config.present_emoji:
						const [for_votes, against_votes] =
							[config.for_emoji, config.against_emoji].map(
								emoji => count_emoji(collector.collected, emoji)
							);
						if (for_votes !== against_votes &&
							(reaction.count + for_votes >= threshold ||
							reaction.count + against_votes >= threshold))
							collector.stop();
						break;
				}
			});
			//Tally votes
			collector.on('end', (collected, reason) => {
				const [for_votes, against_votes, present_votes] =
					[config.for_emoji, config.against_emoji, config.present_emoji].map(
						emoji => count_emoji(collected, emoji)
					);
				const summary_text =
` with ${for_votes + config.for_emoji}/\
${present_votes + config.present_emoji}/\
${against_votes + config.against_emoji}.`
				if (for_votes > against_votes) {
					motion.pass();
					ballot.edit(ballot.content + '\nVote passed' + summary_text);
				} else if (against_votes > for_votes) {
					ballot.edit(ballot.content + '\nVote failed' + summary_text);
				} else {
					ballot.edit(ballot.content + '\nVote expired' + summary_text);
				}
				ballot.clearReactions();
			});
			return ballot;
		}).then(ballot =>
			ballot.react(config.for_emoji).then(reaction =>
				reaction.message.react(config.present_emoji).then(reaction =>
					reaction.message.react(config.against_emoji)
				)
			)
		);
	});
}

function count_emoji(reaction_collection, emoji) {
	return reaction_collection.some(r => r.emoji.name === emoji) ?
		reaction_collection.find(r => r.emoji.name === emoji).count :
		0;
}
