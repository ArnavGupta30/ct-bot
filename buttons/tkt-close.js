const { MessageEmbed, MessageButton, MessageActionRow } = require("discord.js");
const discordTranscripts = require("discord-html-transcripts");

module.exports = {
  id: "tkt:c",
  run: async (client, interaction) => {
    const m = interaction.message.components[0];
    m.components[0].disabled = true;
    await interaction.message.edit({ components: [m] });

    await interaction.deferReply();
    var c = interaction.channel;
    const au = c.topic.slice(14, -1);
    c.permissionOverwrites.create(au, { VIEW_CHANNEL: false });

    const att = await discordTranscripts.createTranscript(c);

    var link = ""
    var sc = client.channels.cache.get(client.config.ticket.scripts);
    if (sc) {
      sc.send({
        content: `Ticket of <@!${au}>`,
        files: [att],
      }).then((msg) => {
        link = `https://support.spectral.host/?url=${msg.attachments.first().url
          }`;
        const emb = new MessageEmbed()
          .setTitle("Ticket Transcript")
          .setURL(link)
          .setDescription(`**URL -** ${link}`);
        msg.edit({ embeds: [emb] });
      });
    }

    const btn = new MessageActionRow().setComponents(
      new MessageButton()
        .setLabel("Delete Ticket")
        .setCustomId("tkt:d")
        .setStyle("DANGER")
    );
    
    if (link !== "") {
      btn.addComponents(new MessageButton()
        .setLabel("Ticket Transcript")
        .setStyle("LINK")
        .setURL(link)
      );
    }

    const emb = new MessageEmbed()
      .setTitle("The ticket was closed!")
      .setDescription(
        `By - <@!${interaction.user.id}>\nTicket Owner - <@!${au}>`
      )
      .setColor("RED");

    var stuf = {
      content: "Ticket Closed!",
      embeds: [emb],
      components: [btn],
    };

    c = c.setName(`closed-${au}`);

    interaction.followUp(stuf);

    stuf.components.components.shift();
    client.users.cache
      .get(au)
      .send(stuf)
      .catch(() => {
        c.send("I was unable to DM the ticket owner");
      });
  },
};
