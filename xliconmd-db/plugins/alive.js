module.exports = {
    name: 'alive',
    description: 'Check if the bot is alive',
    aliases: [],
    tags: ['main'],
    command: /^(alive)$/i,

    async execute(sock, m) {
        try {
            const name = m.pushName || m.sender.split('@')[0];
            const audioUrl = 'https://files.catbox.moe/tcz5xk.mp3';

            const quoted = {
                key: {
                    fromMe: false,
                    participant: m.sender,
                    ...(m.isGroup ? { remoteJid: m.from } : {}),
                },
                message: {
                    contactMessage: {
                        displayName: name,
                        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:${name}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
                    },
                },
            };

            await m.send(
                {
                    audio: { url: audioUrl },
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    waveform: [100, 0, 100, 0, 100, 0, 100],
                    fileName: 'Alive',
                },
                { quoted }
            );
        } catch (err) {
            console.error(' Alive plugin error:', err);
        }
    },
};
