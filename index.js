const discord = require('discord.js');
const config = require('./config.json');

const client = new discord.Client({
    intents: [discord.GatewayIntentBits.DirectMessages,discord.GatewayIntentBits.Guilds,discord.GatewayIntentBits.GuildVoiceStates,discord.GatewayIntentBits.GuildMessages,discord.GatewayIntentBits.MessageContent,]
})

client.on("ready", () => {
    console.log(`Login as ${client.user.username}`);
})
/**
 * 
 * @param {any} config 
 * @param {discord.Message<boolean>} message 
 */
const doActions = async (config, message) => {
    try {
        const guild = await client.guilds.fetch(message.guild.id);
        let doAction = false; // Check has been kick before ban
        if(config.delete){
            await message.delete();
        }
        if (config.timeout.enabled){
            const user = guild.members.cache.get(message.author.id)
            user.timeout(config.timeout.time, config.timeout.reason)
        }
        if(config.kick.enabled){
            const user = guild.members.cache.get(message.author.id)
            user.kick(config.kick.reason)
            doAction = true
        }
        if(config.ban.enabled && doAction == false){
            const user = guild.members.cache.get(message.author.id)
            user.ban(config.ban.reason)
        }
    } catch (error) {
        console.log(error)
    }
}

client.on("messageCreate", (message) => {
    const guildId = message.guild.id;
    const channelId = message.channel.id;
    let doAction = false; // Check user got some action can't get again

    if(!config.targetGuild.find(e => e == guildId)) return;
    if(config.allowChannel.find(e => e == channelId)) return;
    if(config.allowBot == true && message.author.bot) return;

    if(config.links.invite.enabled){
        const regex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-z]/g
        if(message.content.match(regex)) {doAction = true; doActions(config.links.invite.action, message)}
    }
    if(config.links.all.enabled && doAction == false){
        const regex =  /^(?:(http|https):\/\/)?([a-zA-Z0-9.-]+[.]{1,}[a-z]{2,6})([^\s]*)?$/;
        if(message.content.match(regex)) {doAction = true; doActions(config.links.invite.action, message)}
    }
    return;
})

client.login(config.token)