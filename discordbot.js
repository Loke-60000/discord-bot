const { Client, GatewayIntentBits } = require('discord.js');
const CharacterAI = require('node_characterai');
const characterAI = new CharacterAI();
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

(async () => {
  await characterAI.authenticateWithToken(process.env.CHARACTERAI_TOKEN);
  const characterId = "DJHMzDNO6glFc0trAEE56sDLxADq2Da015R3ZzIYtCM"; // for Makise Kurisu
  const chat = await characterAI.createOrContinueChat(characterId);

  console.log('Amadeus connection: ok!');

  client.once('ready', () => {
    console.log('Ready!');
  });

  client.on('messageCreate', async (message) => {
    console.log('A message was received:', message.content);

    if (!message.guild || message.author.bot) return;

    if (message.content.startsWith('!amadeus') || message.mentions.has(client.user)) {
      console.log('Amadeus message received:', message.content);

      let amadeusMessage = message.content.startsWith('!amadeus')
        ? message.content.slice('!amadeus'.length).trim()
        : message.content.replace(`<@${client.user.id}>`, '').trim();

      // Add username to the beginning of the message
      const username = message.author.username;
      amadeusMessage = `${username}: ${amadeusMessage}`;

      try {
        const response = await chat.sendAndAwaitResponse(amadeusMessage, true);
        console.log('Amadeus response:', response);

        if (response) {
          if (typeof response === 'string') {
            message.channel.send(response);
          } else if (Array.isArray(response)) {
            for (const item of response) {
              message.channel.send(item);
            }
          } else if (typeof response === 'object') {
            const { text } = response;
            message.channel.send(text);
          } else {
            console.error('Unexpected response type:', typeof response);
          }
        } else {
          console.log('Empty response from AI');
        }
      } catch (error) {
        console.error('Error generating response:', error);
      }
    }
  });

  client.login(process.env.DISCORD_TOKEN);
})();
