/**
 * group utilities (welcome toggles, info)
 * Usage: !groupinfo
 */

export default async function (Miara, m, args) {
  if (!m.isGroup) return Miara.sendMessage(m.chat, { text: "This command only works in groups." }, { quoted: m });

  const metadata = await Miara.groupMetadata(m.chat);
  let text = `*Group Info*\n\nName: ${metadata.subject}\nParticipants: ${metadata.participants.length}\nOwner: ${metadata.owner || 'unknown'}`;
  await Miara.sendMessage(m.chat, { text }, { quoted: m });
}
