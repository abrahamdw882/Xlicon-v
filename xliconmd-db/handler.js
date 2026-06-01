const { downloadMediaMessage } = require('@whiskeysockets/baileys')
const groupMetadataCache = new Map()
const CACHE_TTL = 5 * 60 * 1000 

function normalizeJid(jid = '') {
    return String(jid).split(':')[0]
}

function getNumberFromJid(jid = '') {
    return normalizeJid(jid).split('@')[0]
}

function checkOwner(sender = '', sockUser = {}) {
    const owners = Array.isArray(global.owners)
        ? global.owners.map(normalizeJid)
        : []

    const user = normalizeJid(sender)

    const botIds = [
        normalizeJid(sockUser?.id),
        normalizeJid(sockUser?.lid)
    ].filter(Boolean)

    return owners.includes(user) || botIds.includes(user)
}

function checkDev(sender = '') {
    if (!global.dev || !Array.isArray(global.dev)) return false
    const user = normalizeJid(sender)
    const devIds = global.dev.map(normalizeJid)
    return devIds.includes(user)
}

async function getCachedGroupMetadata(sock, groupId) {
    const cached = groupMetadataCache.get(groupId)
    const now = Date.now()
    
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
        return cached.data
    }
    
    const metadata = await sock.groupMetadata(groupId).catch(() => null)
    if (metadata) {
        groupMetadataCache.set(groupId, {
            data: metadata,
            timestamp: now
        })
    }
    return metadata
}

async function serializeMessage(sock, msg) {
    const from = msg.key?.remoteJid || ''
    const isGroup = from.endsWith('@g.us')
    const sender = msg.key?.fromMe
        ? (sock.user?.id || sock.user?.lid || '')
        : (isGroup ? msg.key?.participant : from)

    const pushName = msg.pushName || (sender ? getNumberFromJid(sender) : 'Unknown')

    let body = ''
    const type = Object.keys(msg.message || {})[0] || ''

    const msgContent = msg.message
    if (msgContent?.conversation) {
        body = msgContent.conversation
    } else if (msgContent?.extendedTextMessage?.text) {
        body = msgContent.extendedTextMessage.text
    } else if (msgContent?.imageMessage?.caption) {
        body = msgContent.imageMessage.caption
    } else if (msgContent?.videoMessage?.caption) {
        body = msgContent.videoMessage.caption
    } else if (msgContent?.documentMessage?.caption) {
        body = msgContent.documentMessage.caption
    } else if (msgContent?.interactiveResponseMessage) {
        body = msgContent.interactiveResponseMessage.buttonId ||
               msgContent.interactiveResponseMessage?.body?.text || ''
    } else if (msgContent?.buttonsResponseMessage?.selectedButtonId) {
        body = msgContent.buttonsResponseMessage.selectedButtonId
    } else if (msgContent?.listResponseMessage?.singleSelectReply?.selectedRowId) {
        body = msgContent.listResponseMessage.singleSelectReply.selectedRowId
    } else if (msgContent?.templateButtonReplyMessage?.selectedId) {
        body = msgContent.templateButtonReplyMessage.selectedId
    }

    const isMedia = ['imageMessage', 'videoMessage', 'documentMessage', 'audioMessage', 'stickerMessage'].includes(type)
    const mediaType = type ? type.replace('Message', '').toLowerCase() : ''
    const mimetype = msgContent?.[type]?.mimetype || null
    const senderNormalized = normalizeJid(sender)
    const botNormalized = normalizeJid(sock.user?.id || sock.user?.lid || '')
    const senderNumber = getNumberFromJid(sender)
    let groupMetadata = null
    let groupParticipants = []
    let participantData = null
    let botData = null
    let groupOwnerId = ''
    let isAdmin = false
    let isBotAdmin = false
    let isGroupOwner = false
    if (isGroup) {
        groupMetadata = await getCachedGroupMetadata(sock, from)
        
        if (groupMetadata) {
            groupParticipants = groupMetadata.participants || []
            groupOwnerId = normalizeJid(
                groupMetadata.owner ||
                groupMetadata.subjectOwner ||
                ''
            )
            for (const p of groupParticipants) {
                const pid = normalizeJid(p?.id || p?.jid || '')
                if (pid === senderNormalized) {
                    participantData = p
                    isAdmin = !!p.admin
                    isGroupOwner = senderNormalized === groupOwnerId
                }
                if (pid === botNormalized) {
                    botData = p
                    isBotAdmin = !!p.admin
                }
                if (participantData && botData) break 
            }
        }
    }

    const isOwner = checkOwner(sender, sock.user)
    const isDev = checkDev(sender)

    let quoted
    const ctxInfo = msgContent?.extendedTextMessage?.contextInfo ||
                    msgContent?.imageMessage?.contextInfo ||
                    msgContent?.videoMessage?.contextInfo ||
                    msgContent?.documentMessage?.contextInfo

    if (ctxInfo?.quotedMessage) {
        const qMsg = ctxInfo.quotedMessage
        const qType = Object.keys(qMsg || {})[0] || ''

        quoted = {
            key: {
                remoteJid: from,
                id: ctxInfo.stanzaId,
                participant: ctxInfo.participant || from
            },
            message: qMsg,
            type: qType,
            body: qMsg?.conversation || qMsg?.extendedTextMessage?.text || qMsg?.[qType]?.caption || '',
            isMedia: ['imageMessage', 'videoMessage', 'documentMessage', 'audioMessage', 'stickerMessage'].includes(qType),
            mediaType: qType ? qType.replace('Message', '').toLowerCase() : '',
            mimetype: qMsg?.[qType]?.mimetype || null,
            download: async () => await downloadMediaMessage(
                {
                    key: {
                        remoteJid: from,
                        id: ctxInfo.stanzaId,
                        participant: ctxInfo.participant || from
                    },
                    message: qMsg
                },
                'buffer',
                {},
                sock
            )
        }
    }

    const messageObject = {
        key: msg.key,
        id: msg.key?.id,
        from,
        sender,
        senderNumber,
        pushName,
        isGroup,
        groupMetadata,
        body,
        text: body,
        type,
        mtype: type,
        isMedia,
        mediaType,
        mimetype,
        quoted,
        isOwner,
        isDev,
        isAdmin,
        isBotAdmin,
        isGroupOwner,
        isButtonResponse: !!msgContent?.interactiveResponseMessage,
        buttonId: msgContent?.interactiveResponseMessage?.buttonId || null,
        reply: async (content, options = {}) => {
            if (typeof content === 'string') {
                return await sock.sendMessage(from, { text: content, ...options }, { quoted: msg })
            }
            else if (Buffer.isBuffer(content)) {
                return await sock.sendMessage(from, { image: content, ...options }, { quoted: msg })
            }
            else if (typeof content === 'object') {
                return await sock.sendMessage(from, content, { quoted: msg })
            }
            else {
                return await sock.sendMessage(from, { text: String(content), ...options }, { quoted: msg })
            }
        },
        send: async (content, options = {}) =>
            await sock.sendMessage(
                from,
                typeof content === 'string'
                    ? { text: content, ...options }
                    : content,
                { quoted: msg }
            ),
        react: async emoji =>
            await sock.sendMessage(from, { react: { text: emoji, key: msg.key } }),
        forward: async (jid, force = false) =>
            await sock.sendMessage(jid, { forward: msg, force }),
        download: async () =>
            isMedia
                ? await downloadMediaMessage(msg, 'buffer', {}, sock)
                : (quoted?.isMedia ? await quoted.download() : null)
    }
    
    return messageObject
}

setInterval(() => {
    const now = Date.now()
    for (const [key, value] of groupMetadataCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
            groupMetadataCache.delete(key)
        }
    }
}, 60 * 1000) // Clean every minute

module.exports = serializeMessage
