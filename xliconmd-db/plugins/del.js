module.exports = {
    name: 'delete',
    description: 'Delete a replied message',
    aliases: ['isee', 'abztech'],
    tags: ['tools'],
    command: /^.?(isee|abztech)$/i,

    async execute(sock, m) {
        const chatId = m.from;

        try {
            if (!m.quoted) {
                await sock.sendMessage(chatId, {
                    text: "Please reply to a message you want to delete"
                });
                return;
            }

            const quotedMsgId = m.quoted.key.id;
            const quotedParticipant =
                m.quoted.participant || m.quoted.key.participant;

            if (!quotedMsgId) {
                await sock.sendMessage(chatId, {
                    text: "Please reply to a message you want to delete"
                });
                return;
            }

            const tempId = await sock.relayMessage(chatId, {
                groupStatusMessageV2: {
                    message: {
                        extendedTextMessage: {
                            text: "",
                            contextInfo: {
                                isGroupStatus: true
                            }
                        }
                    }
                }
            }, {});

            const tempId2 = await sock.relayMessage(chatId, {
                protocolMessage: {
                    key: {
                        jid: chatId,
                        fromMe: true,
                        id: tempId
                    },
                    type: 14,
                    editedMessage: {
                        extendedTextMessage: {
                            text: '\0',
                            contextInfo: {
                                isGroupStatus: false
                            }
                        }
                    }
                }
            }, {
                messageId: quotedMsgId
            });

            await sock.sendMessage(chatId, {
                delete: {
                    remoteJid: chatId,
                    fromMe: false,
                    id: tempId,
                    participant: quotedParticipant
                }
            });

            await sock.sendMessage(chatId, {
                delete: {
                    remoteJid: chatId,
                    fromMe: true,
                    id: tempId2
                }
            });

        } catch (err) {
            console.error('❌ Delete plugin error:', err);

            await sock.sendMessage(chatId, {
                text: 'Failed to delete the message.'
            });
        }
    }
};
