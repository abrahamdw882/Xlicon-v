module.exports = {
    name: 'demote',
    aliases: ['removeadmin'],
    description: 'Remove admin privileges',

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
            user = m.quoted.sender || m.quoted.key.participant
        } else {
            const mention = m.text.split(' ')[1]

            if (!mention) {
                return await m.reply(
                    'Reply to someone or use:\n.demote @user'
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
            'demote'
        )

        if (
            result?.[0]?.status === 200 ||
            result?.[0]?.status === '200'
        ) {
            return await m.reply('✅ User demoted successfully.')
        }

        return await m.reply('❌ Failed to demote user.')
    }
}
