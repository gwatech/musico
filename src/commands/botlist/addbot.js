/* eslint-disable newline-per-chained-call */
const { Command } = require('discord-akairo');
const { stripIndents } = require('common-tags');

class AddBotCommand extends Command {
	constructor() {
		super('addbot', {
			aliases: ['addbot', 'ab'],
			category: 'botlist',
			description: {
				content: 'Adds your bot to the server.',
				usage: '<Client ID> <prefix>',
				examples: ['761469922563063818 m!']
			},
			args: [
				{
					id: 'client',
					type: 'string',
					prompt: {
						start: 'Enter the ID of the bot'
					}
				},
				{
					id: 'prefix',
					type: 'string',
					prompt: {
						start: 'Enter the prefix of the bot'
					}
				}
			]
		});
	}

	async exec(message, { client, prefix }) {
		if (await this.checkExisting(client)) return message.util.send('You have already added this bot. Please wait for our testers to test your bot.');

		if (await this.validateBot(client) === false) return message.util.send('The Client ID you entered is not valid. Please try again with a valid Client ID.');

		const embed = this.client.util.embed()
			.setColor(0xb1a7f0)
			.setTitle('Bot Submitted')
			.setDescription(stripIndents`
				**Owner** - ${message.author.tag} (${message.author.id})
				**Bot** - ${client}
				**Prefix** - ${prefix}
				**Invite Url** - [Click Here](${this.generateInvite(client)})
			`);

		await message.util.send({
			embed: { color: 'GREEN', description: '<:emoji_100:808567239443611668> Your bot has been successfully added to the queue.\nPlease wait for our moderators to test your bot.' }
		});

		await this.save(message.author.id, client, prefix);

		return this.client.channels.cache.get('808324664165924934').send('@everyone', { embed });
	}

	async save(ownerID, clientID, prefix) {
		const db = await this.client.mongo.db('musico').collection('bots').insertOne({
			ownerID,
			clientID,
			prefix,
			approved: false,
			submittedAt: new Date()
		});

		return db;
	}

	async checkExisting(client) {
		const db = await this.client.mongo.db('musico').collection('bots').find({
			clientID: client
		}).toArray();

		return db.length ? true : false;
	}

	async validateBot(client) {
		const bot = await this.client.users.fetch(client).catch(() => undefined);

		if (!bot?.bot) return false;

		return true;
	}

	generateInvite(id) {
		return `https://discordapp.com/oauth2/authorize?client_id=${id}&scope=bot&permissions=0`;
	}
}

module.exports = AddBotCommand;
