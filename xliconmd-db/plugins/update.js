const fs = require('fs')
const path = require('path')
const axios = require('axios')
const { exec } = require('child_process')

module.exports = {
    name: 'update',
    aliases: ['refresh', 'reload'],
    description: 'Refresh bot files from GitHub',
    owner: true,

    async execute(sock, m) {
        try {
            if (!m.isOwner) {
                return await m.reply('⚠️ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ ɪs ᴍᴀᴅᴇ ғᴏʀ ᴍʏ ᴏᴡɴᴇʀ.')
            }

            await m.reply('🔄 ᴜᴘᴅᴀᴛɪɴɢ ʙᴏᴛ...\n🗑️ ʀᴇᴍᴏᴠɪɴɢ ᴏʟᴅ ғɪʟᴇs...')

            const base = path.join(__dirname, '..')
            const targets = ['plugins', 'lib', 'handler.js', 'xliconmd.js']
            let deleted = []

            for (const file of targets) {
                const targetPath = path.join(base, file)
                if (fs.existsSync(targetPath)) {
                    fs.rmSync(targetPath, { recursive: true, force: true })
                    deleted.push(file)
                    console.log(`🗑️ Removed: ${file}`)
                }
            }

            await m.reply(`✅ ʀᴇᴍᴏᴠᴇᴅ:\n${deleted.map(v => `• ${v}`).join('\n')}\n\n📦 ғᴇᴛᴄʜɪɴɢ ʟᴀᴛᴇsᴛ ғɪʟᴇs...`)

            // Fetch fresh files from GitHub
            const user = 'abrahamdw882'
            const repo = 'xlicon-v'
            const branch = 'main'
            const githubFolderPath = 'xliconmd-db'

            async function fetchFolder(folderPath, localPath) {
                const url = `https://api.github.com/repos/${user}/${repo}/contents/${folderPath}?ref=${branch}`
                const { data } = await axios.get(url, { headers: { 'User-Agent': 'axios' } })

                for (const item of data) {
                    const localFilePath = path.join(localPath, item.path.replace(githubFolderPath + '/', ''))
                    
                    if (item.type === 'file') {
                        fs.mkdirSync(path.dirname(localFilePath), { recursive: true })
                        const fileData = await axios.get(item.download_url, { responseType: 'text' })
                        fs.writeFileSync(localFilePath, fileData.data, 'utf8')
                        console.log(`✅ Restored: ${item.name}`)
                    } else if (item.type === 'dir') {
                        fs.mkdirSync(localFilePath, { recursive: true })
                        await fetchFolder(item.path, localPath)
                    }
                }
            }

            await fetchFolder(githubFolderPath, base)
            
            await m.reply('✅ ғɪʟᴇs ʀᴇsᴛᴏʀᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ!\n\n🔄 ʀᴇʙᴏᴏᴛɪɴɢ ʙᴏᴛ...')
            
            setTimeout(() => {
                process.exit(0)
            }, 3000)

        } catch (err) {
            console.error(err)
            await m.reply(`❌ ᴜᴘᴅᴀᴛᴇ ғᴀɪʟᴇᴅ:\n\`\`\`\n${err.message}\n\`\`\``)
        }
    }
}
