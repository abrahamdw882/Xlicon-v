const axios = require('axios');
const sharp = require('sharp');

module.exports = {
name: 'menu',
description: 'Show available bot commands',
aliases: ['help', 'cmdlist', 'commands'],

async execute(sock, m) {
    const prefix = global.BOT_PREFIX || '.';
    const chatId = m.key.remoteJid;

    const now = new Date();

    const date = now.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'Africa/Accra'
    });

    const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZone: 'Africa/Accra'
    });

    const botOwner = global.ownerName || 'ABZTECH';
    const user = m.pushName || m.sender?.split('@')[0] || 'User';

    const menuText = `

┌─ム xʟɪᴄᴏɴ ᴍᴜʟᴛɪᴅᴇᴠɪᴄᴇ
│ ᴏᴡɴᴇʀ: ${botOwner}
│ ᴜsᴇʀ: ${user}
│ ᴅᴀᴛᴇ: ${date}
│ ᴛɪᴍᴇ: ${time} (GMT)
│ ᴘʀᴇғɪx: ${prefix}
╰──────────────────╯

┌─ム ᴀᴠᴀɪʟᴀʙʟᴇ ᴄᴏᴍᴍᴀɴᴅs
│
├─ム *ɢᴇɴᴇʀᴀʟ*
│ ᪣ ${prefix}ᴀʟɪᴠᴇ
│ ᪣ ${prefix}ᴘɪɴɢ
│ ᪣ ${prefix}ᴜᴘᴛɪᴍᴇ
│ ᪣ ${prefix}ᴏᴡɴᴇʀ
│ ᪣ ${prefix}ᴍᴇɴᴜ2
│
├─ム *ᴅᴏᴡɴʟᴏᴀᴅᴇʀs*
│ ᪣ ${prefix}ᴛɪᴋᴛᴏᴋ / ${prefix}ᴛᴛ
│ ᪣ ${prefix}ʏᴛᴍᴘ3
│ ᪣ ${prefix}ɪɢ
│
├─ム *ᴛᴏᴏʟs*
│ ᪣ ${prefix}sᴛɪᴄᴋᴇʀ
│ ᪣ ${prefix}ᴏᴄʀ
│ ᪣ ${prefix}ᴛᴛs
│ ᪣ ${prefix}ᴘᴏʟʟ
│ ᪣ ${prefix}sʜᴀᴢᴀᴍ
│
├─ム *ᴀɪ*
│ ᪣ ${prefix}ᴀɪ
│ ᪣ ${prefix}ᴀɪ-sᴇᴀʀᴄʜ
│ ᪣ ${prefix}ᴀɪᴠ
│ ᪣ ${prefix}ɢᴇɴ
│
├─ム *ғᴜɴ*
│ ᪣ ${prefix}ʙʟᴜᴇ
│
├─ム *ɢʀᴏᴜᴘ*
│ ᪣ ${prefix}ᴛᴀɢᴀʟʟ
│ ᪣ ${prefix}ᴛᴀɢᴀʟʟ1
│ ᪣ ${prefix}ᴛᴀɢᴍᴇ
│ ᪣ ${prefix}ᴄᴏᴜᴘʟᴇᴘᴘ
│ ᪣ ${prefix}ɢʀᴏᴜᴘ
│
├─ム *sᴛᴀᴛᴜs*
│ ᪣ ${prefix}ɢsᴛᴀᴛᴜs
│
├─ム *ᴄʜᴀɴɴᴇʟ*
│ ᪣ ${prefix}ᴄʜᴀɴɴᴇʟɪᴅ
│
├─ム *ᴀᴅᴍɪɴ*
│ ᪣ ${prefix}ᴋɪᴄᴋ
│
╰─────────◆────────╯

> 「 𝙏𝙞𝙢𝙚 - 𝙏𝙞𝙢𝙚𝙡𝙚𝙨𝙨 」
`.trim();

    try {
        let thumb;
        try {
            const { data } = await axios.get(global.menuImage, { responseType: 'arraybuffer' });
            thumb = await sharp(Buffer.from(data))
                .resize(120, 120, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
                .jpeg({ quality: 85 })
                .toBuffer();
        } catch {
            thumb = null;
        }

        await sock.relayMessage(
            chatId,
            {
                buttonsMessage: {
                    text: menuText,
                    contentText: menuText,
                    footerText: '「 𝙏𝙞𝙢𝙚 - 𝙏𝙞𝙢𝙚𝙡𝙚𝙨𝙨 」',
                    locationMessage: {
                        name: 'Menu',
                        address: botOwner,
                        jpegThumbnail: thumb
                    },
                    buttons: [
                        {
                            buttonId: `${prefix}ping`,
                            buttonText: { displayText: 'Ping' },
                            type: 1
                        },
                        {
                            buttonId: `${prefix}owner`,
                            buttonText: { displayText: 'Owner' },
                            type: 1
                        }
                    ],
                    headerType: 6
                }
            },
            {
                additionalNodes: [
                    {
                        tag: 'biz',
                        attrs: {},
                        content: [
                            {
                                tag: 'interactive',
                                attrs: { type: 'native_flow', v: '1' },
                                content: [
                                    { tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }
                                ]
                            }
                        ]
                    }
                ]
            }
        );

        await sock.sendMessage(chatId, {
            react: { text: '✅', key: m.key }
        });

    } catch (err) {
        console.error('Menu error:', err);
        return;
    }
}

};
