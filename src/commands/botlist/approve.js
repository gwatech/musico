const { Command } = require('discord-akairo');
const { stripIndents } = require('common-tags');

class AddBotCommand extends Command {
	constructor() {
		super('approve', {
			aliases: ['approve'],
			category: 'botlist',
			description: {
				content: 'You cannot use it bruh!'
			},
			ownerOnly: true,
			args: [
				{
					id: 'client',
					type: 'string',
					prompt: {
						start: 'Enter the client ID'
					}
				}
			]
		});
	}

	async exec(message, { client }) {
		await message.util.send(`Succesfully approved <@${client}>`);

		await this.edit(message.author.id, client);
		await this.botLog(client, message.author);
		await this.handle(client);

		return message.guild.members.cache.get(client).kick('Bot Approved');
	}

	async edit(user, clientID) {
		const db = await this.client.mongo.db('musico').collection('bots').updateOne({ clientID }, {
			$set: {
				approved: true,
				approvedBy: user
			}
		});

		return db;
	}

	async botLog(client, approvedBy) {
		const bot = await this.client.users.fetch(client);

		const embed = this.client.util.embed()
			.setColor('#98fb98')
			.setTitle('Bot Approved')
			.setThumbnail(bot.displayAvatarURL({ size: 1024 }))
			.setDescription(stripIndents`
				Bot Tag: \`${bot.tag}\`
				Bot ID: \`${bot.id}\`
				Moderator: ${approvedBy.tag} (${approvedBy.id})
			`)
			.setTimestamp();

		return this.client.channels.cache.get('808343180628983808').send(embed);
	}

	async handle(clientID) {
		const { ownerID } = await this.client.mongo.db('musico').collection('bots').findOne({ clientID });
		const guild = this.client.guilds.cache.get('694554848758202451');

		const bot = await this.client.users.fetch(clientID);

		if (guild.members.cache.has(ownerID)) {
			await this.client.users.cache.get(ownerID).send(`🎉 Congratulations your bot **${bot.tag}** \`(${bot.id})\` has been approved!`);
			await guild.members.cache.get(ownerID)?.roles.add('808341405943463956');
		}
	}
}

module.exports = AddBotCommand;
