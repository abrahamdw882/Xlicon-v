module.exports = {
    name: "crm",
    aliases: ["getmsg", "msgcode"],

    async execute(sock, m, args) {
        try {
            if (!m.isOwner) {
                return;
            }

            const key = m.quoted?.key;

            if (!key) {
                return await m.reply("Please quote a message.");
            }

            let result = await sock.ws.config.getMessage(key);

            if (!result) {
                result = m.quoted.message;
            }

            if (!result) {
                return await m.reply("Message not found.");
            }

            const additionalNodes = [
                {
                    tag: "biz",
                    attrs: {},
                    content: [
                        {
                            tag: "interactive",
                            attrs: {
                                type: "native_flow",
                                v: "1",
                            },
                            content: [
                                {
                                    tag: "native_flow",
                                    attrs: {
                                        v: "9",
                                        name: "mixed",
                                    },
                                },
                            ],
                        },
                    ],
                },
            ];

            result = proto.Message.fromObject(result);
            result = proto.Message.toObject(result, {
                enums: Number,
                longs: String,
                bytes: String,
            });

            const dataPath = result?.botForwardedMessage?.message?.richResponseMessage?.unifiedResponse;
            let dataCode = null;
            
            if (dataPath?.data) {
                try {
                    const parsedData = JSON.parse(
                        Buffer.from(dataPath.data, "base64").toString("utf-8"),
                    );
                    const formattedData = JSON.stringify(parsedData, null, 2).replace(
                        /^(\s*)"([A-Za-z_$][A-Za-z0-9_$]*)":/gm,
                        "$1$2:",
                    );
                    dataCode = `Buffer.from(JSON.stringify(${formattedData}), "utf-8").toString("base64")`;
                    dataPath.data = "__DATA_CODE_MARKER__";
                } catch {}
            }

            let messageCode = JSON.stringify(result, null, 2).replace(
                /^(\s*)"([A-Za-z_$][A-Za-z0-9_$]*)":/gm,
                "$1$2:",
            );

            if (dataCode) {
                messageCode = messageCode.replace('"__DATA_CODE_MARKER__"', dataCode);
            }

            const additionalNodesCode = JSON.stringify(additionalNodes, null, 2).replace(
                /^(\s*)"([A-Za-z_$][A-Za-z0-9_$]*)":/gm,
                "$1$2:",
            );

            const fullCodeText = `
try {
  const msg = generateWAMessageFromContent(
    m.from,
    ${messageCode},
    {
      userJid: m.sender,
      messageId: generateMessageID()
    }
  );

  await sock.relayMessage(
    m.from,
    msg.message,
    {
      messageId: msg.key.id,
      additionalNodes: ${additionalNodesCode}
    }
  );

  await sock.sendMessage(m.from, {
    react: {
      text: "✅",
      key: m.key
    }
  });

} catch (e) {
  await m.reply(String(e.stack || e));
}
`.trim();

            await m.reply(fullCodeText);

        } catch (err) {
            console.error("crm error:", err);
            await m.reply(`Error: ${err.message}`);
        }
    }
};
