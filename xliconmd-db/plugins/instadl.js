const axios = require('axios');

module.exports = {
    name: 'instadl',
    aliases: ['insta', 'instagram', 'ig'],
    
    async execute(sock, m, args) {
        if (!args.length) {
            return m.reply(`📸 ɪɴsᴛᴀɢʀᴀᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ\n\nᴜsᴀɢᴇ: .ɪɢᴅʟ <ɪɴsᴛᴀɢʀᴀᴍ ᴜʀʟ>\n\nexᴀᴍᴘʟᴇ: .ɪɢᴅʟ ʜᴛᴛᴘs://ᴡᴡᴡ.ɪɴsᴛᴀɢʀᴀᴍ.ᴄᴏᴍ/ʀᴇᴇʟ/xxxxxxxx`);
        }
        
        const url = args[0];
        
        if (!url.includes('instagram.com')) {
            return m.reply('❌ ᴘʟᴇᴀsᴇ ᴘʀᴏᴠɪᴅᴇ ᴀ ᴠᴀʟɪᴅ ɪɴsᴛᴀɢʀᴀᴍ ᴜʀʟ');
        }
        
        await m.reply(`⏳ ᴅᴏᴡɴʟᴏᴀᴅɪɴɢ ɪɴsᴛᴀɢʀᴀᴍ ᴄᴏɴᴛᴇɴᴛ...`);
        
        try {
            const apiUrl = `https://api-abztech.zone.id/download/instadl?url=${encodeURIComponent(url)}&type=video`;
            
            const response = await axios({
                method: 'get',
                url: apiUrl,
                timeout: 30000
            });
            
            if (!response.data.status || !response.data.data) {
                throw new Error(response.data.message || 'API returned error');
            }
            
            const data = response.data.data;
            const metadata = data.metadata || {};
            const media = data.media || {};
            
            const videoItem = media.videos?.[0];
            if (!videoItem || !videoItem.url) {
                throw new Error('No video URL found in response');
            }
            
            const mediaUrl = videoItem.url;
            const quality = videoItem.quality || 'HD';
            
            const mediaResponse = await axios({
                method: 'get',
                url: mediaUrl,
                responseType: 'arraybuffer',
                timeout: 60000
            });
            
            const buffer = Buffer.from(mediaResponse.data);
            
            const caption = `📸 *ɪɴsᴛᴀɢʀᴀᴍ ᴅᴏᴡɴʟᴏᴀᴅᴇʀ*\n\n` +
                           `📹 *ǫᴜᴀʟɪᴛʏ:* ${quality}\n` +
                           `📅 *ᴛɪᴍᴇ:* ${metadata.createTime || 'Unknown'}\n` +
                           `📝 *ᴄᴀᴘᴛɪᴏɴ:* ${metadata.caption || 'No caption'}\n\n` +
                           `> ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴀʙᴢᴛᴇᴄʜ`;
            
            await m.reply(buffer, { 
                caption: caption,
                video: buffer,
                mimetype: 'video/mp4'
            });
            
        } catch (err) {
            console.error('instadl error:', err);
            
            if (err.response?.data) {
                await m.reply(`❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ\n\n${err.response.data.message || JSON.stringify(err.response.data)}`);
            } else {
                await m.reply(`❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ\n\n${err.message}`);
            }
        }
    }
};
