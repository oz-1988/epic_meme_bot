const { Client, Intents, MessageAttachment } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { join } = require('path');
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    const slashCommandData = new SlashCommandBuilder()
        .setName('epicmeme')
        .setDescription('Generates a meme with the given background, foreground, and text.')
        .addStringOption(option =>
            option.setName('background')
                .setDescription('The background image')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('foreground')
                .setDescription('The foreground image')
                .setRequired(true)
                .setAutocomplete(true))
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The text to add to the meme')
                .setRequired(true))
        .toJSON();

    await client.application.commands.create(slashCommandData);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand() || interaction.commandName !== 'epicmeme') return;

    const background = interaction.options.getString('background');
    const foreground = interaction.options.getString('foreground');
    const text = interaction.options.getString('text');

    try {
        const buffer = await createMeme(background, foreground, text);
        const attachment = new MessageAttachment(buffer, 'meme.png');

        await interaction.reply({ files: [attachment] });
    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'An error occurred while creating the meme. Please ensure the background and foreground images exist and the command is used correctly.',
            ephemeral: true
        });
    }
});

async function createMeme(background, foreground, text) {
    const bg = await loadImage(join(__dirname, `backgrounds/${background}.png`));
    const fg = await loadImage(join(__dirname, `foregrounds/${foreground}.png`));

    const canvas = createCanvas(bg.width, bg.height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(bg, 0, 0);
    ctx.drawImage(fg, 0, 0);

    registerFont(join(__dirname, 'fonts/AAKHIRTAHUN.otf'), { family: 'AAKHIRTAHUN' });
    ctx.font = '34px AAKHIRTAHUN';
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    const maxTextWidth = canvas.width * 0.9; // Limit text width to 90% of the canvas width
    const words = text.split(' ');
    let lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        let testLine = currentLine + ' ' + words[i];
        let testWidth = ctx.measureText(testLine).width;

        if (testWidth > maxTextWidth) {
            lines.push(currentLine);
            currentLine = words[i];
        } else {
            currentLine = testLine;
        }
    }
    lines.push(currentLine);

    const lineHeight = 34; // Line height equal to font size
    const yPos = canvas.height - 10 - (lineHeight * (lines.length - 1)); // Adjust the position based on line count

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineWidth = ctx.measureText(line).width;
        const xPos = (canvas.width / 2) - (lineWidth / 2);
        const lineYPos = yPos + (i * lineHeight);

        ctx.strokeText(line, xPos, lineYPos);
        ctx.fillText(line, xPos, lineYPos);
    }

    return canvas.toBuffer();
}

client.login('MTEwMTE1NTc5MTY2NDMxNjQ2Ng.GZLYEh.MRFHhILkF0D5LqCJ6TdzOh8rD6yRMZatWxvO6E');
