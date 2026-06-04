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
                return await m.reply('⚠️ This command is made for my owner.')
            }

            await m.reply('♻️ Updating bot...\n🗑️ Deleting old files...')

            const base = path.join(__dirname, '..')
            const targets = ['plugins', 'lib', 'handler.js', 'xliconmd.js']
            let deleted = []

            for (const file of targets) {
                const targetPath = path.join(base, file)
                if (fs.existsSync(targetPath)) {
                    fs.rmSync(targetPath, { recursive: true, force: true })
                    deleted.push(file)
                    console.log(`🗑️ Deleted: ${file}`)
                }
            }

            await m.reply(`✅ Deleted:\n${deleted.map(v => `• ${v}`).join('\n')}\n\n📥 Downloading fresh files...`)

            // NOW DOWNLOAD THE FILES BACK
            const user = 'abrahamdw882'
            const repo = 'xlicon-v'
            const branch = 'main'
            const githubFolderPath = 'xliconmd-db'

            async function downloadFolder(folderPath, localPath) {
                const url = `https://api.github.com/repos/${user}/${repo}/contents/${folderPath}?ref=${branch}`
                const { data } = await axios.get(url, { headers: { 'User-Agent': 'axios' } })

                for (const item of data) {
                    const localFilePath = path.join(localPath, item.path.replace(githubFolderPath + '/', ''))
                    
                    if (item.type === 'file') {
                        fs.mkdirSync(path.dirname(localFilePath), { recursive: true })
                        const fileData = await axios.get(item.download_url, { responseType: 'text' })
                        fs.writeFileSync(localFilePath, fileData.data, 'utf8')
                        console.log(`✅ Downloaded: ${item.name}`)
                    } else if (item.type === 'dir') {
                        fs.mkdirSync(localFilePath, { recursive: true })
                        await downloadFolder(item.path, localPath)
                    }
                }
            }

            await downloadFolder(githubFolderPath, base)
            
            await m.reply('✅ Files re-downloaded successfully!\n\n🔄 Restarting bot...')
            
            setTimeout(() => {
                process.exit(0)
            }, 3000)

        } catch (err) {
            console.error(err)
            await m.reply(`❌ Update failed:\n\`\`\`\n${err.message}\n\`\`\``)
        }
    }
}
