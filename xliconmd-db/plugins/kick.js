module.exports = {
    name: 'kick',
    aliases: ['remove'],
    description: 'Remove member from group',

    async execute(sock, m) {

        if (!m.isGroup) {
            return await m.reply('❌ This command only works in groups!')
        }

        if (!m.isAdmin) {
            return await m.reply('❌ Admin only command!')
        }

        if (!m.isBotAdmin) {
            return await m.reply('❌ Bot must be admin!')
        }

        let user

        if (m.quoted) {
            user = m.quoted.key.participant
        } else {
            const mention = m.text.split(' ')[1]

            if (!mention) {
                return await m.reply(
                    'Reply to someone or use:\n.kick @user'
                )
            }

            user = mention.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        }

        if (!user) {
            return await m.reply('❌ User not found.')
        }

        const botId = sock.user.id.split(':')[0]

        if (user.split(':')[0] === botId) {
            return await m.reply("❌ Can't remove myself.")
        }

        await sock.groupParticipantsUpdate(
            m.from,
            [user],
            'remove'
        )

        await m.reply('✅ User removed.')
    }
}
