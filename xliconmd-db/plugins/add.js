module.exports = {
    name: 'add',
    aliases: ['invite'],
    description: 'Add member to group',

    async execute(sock, m) {

        if (!m.isGroup) {
            return await m.reply('❌ This command only works in groups!')
        }

        if (!m.isAdmin && !m.isOwner) {
            return await m.reply('❌ Admin only command!')
        }

        let user

        if (m.quoted) {
            user = m.quoted.sender
        } else {
            const number = m.text.split(' ')[1]

            if (!number) {
                return await m.reply(
                    'Use:\n.add 234xxxxxxxxxx'
                )
            }

            user = number.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        }

        if (!user) {
            return await m.reply('❌ Invalid number.')
        }

        const result = await sock.groupParticipantsUpdate(
            m.from,
            [user],
            'add'
        )

        if (
            result?.[0]?.status === 200 ||
            result?.[0]?.status === '200'
        ) {
            return await m.reply('✅ User added.')
        }

        if (result?.[0]?.invite_code) {
            await m.reply(
                '⚠️ Could not add directly, sending invite...'
            )

            return await sock.sendMessage(
                user,
                {
                    text:
`You have been invited to join a group.

https://chat.whatsapp.com/${result[0].invite_code}`
                }
            )
        }

        return await m.reply('❌ Failed to add user.')
    }
}
