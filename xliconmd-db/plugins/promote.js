module.exports = {
    name: 'promote',
    aliases: ['makeadmin'],
    description: 'Promote member to admin',

    async execute(sock, m) {

        if (!m.isGroup) {
            return await m.reply('❌ This command only works in groups!')
        }

        if (!m.isAdmin && !m.isOwner) {
            return await m.reply('❌ Admin only command!')
        }

        let user

        if (m.quoted) {
            user = m.quoted.sender || m.quoted.key.participant
        } else {
            const mention = m.text.split(' ')[1]

            if (!mention) {
                return await m.reply(
                    'Reply to someone or use:\n.promote @user'
                )
            }

            user = mention.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        }

        if (!user) {
            return await m.reply('❌ User not found.')
        }

        const result = await sock.groupParticipantsUpdate(
            m.from,
            [user],
            'promote'
        )

        if (
            result?.[0]?.status === 200 ||
            result?.[0]?.status === '200'
        ) {
            return await m.reply('✅ User promoted to admin.')
        }

        return await m.reply('❌ Failed to promote user.')
    }
}
