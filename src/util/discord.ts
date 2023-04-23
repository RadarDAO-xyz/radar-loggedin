import { Client } from 'discord.js';

const DiscordClient = new Client({
    intents: ['Guilds']
});

DiscordClient.login(process.env.DISCORD_BOT_TOKEN);

export default DiscordClient;
