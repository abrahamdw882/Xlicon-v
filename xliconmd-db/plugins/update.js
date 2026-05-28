const fs = require('fs')
const path = require('path')

module.exports = {
    name: 'update',
    aliases: ['refresh', 'reload'],
    description: 'Refresh bot files from GitHub',
    owner: true,

    async execute(sock, m) {
        try {

            if (!m.isOwner) {
                return await m.reply(
                    '⚠️ This command is made for my owner.'
                )
            }

            await m.reply(
                '♻️ Updating bot...\n🗑️ Deleting old files...'
            )

            const base = path.join(__dirname, '..')

            const targets = [
                'plugins',
                'lib',
                'handler.js',
                'xliconmd.js'
            ]

            let deleted = []

            for (const file of targets) {
                const targetPath = path.join(base, file)

                if (fs.existsSync(targetPath)) {

                    fs.rmSync(targetPath, {
                        recursive: true,
                        force: true
                    })

                    deleted.push(file)

                    console.log(`🗑️ Deleted: ${file}`)
                }
            }

            await m.reply(
                `✅ Update started successfully.\n\nDeleted:\n${deleted.map(v => `• ${v}`).join('\n')}\n\n🔄 Restarting bot...`
            )

            setTimeout(() => {
                process.exit(0)
            }, 3000)

        } catch (err) {
            console.error(err)

            await m.reply(
                `❌ Update failed:\n\`\`\`\n${err.message}\n\`\`\``
            )
        }
    }
}
