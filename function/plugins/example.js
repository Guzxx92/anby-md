/* import meow from 'meow' 
<- you can import, add code or sometin here! if you want*/
// How to use my rxjs plugins? 
// Design reference: razaqq
// Dont listen to loosercore playlist, that dont make you cool
 
export default {
    command: 'ex', // ya know this thing?
    aliases: ['example', 'contoh'], // alias, other alternative command 
    expire: '2027-12-31', // kapan plugin ini udh gbs di pake? format: tahun-bulan-tanggal. cocok buat voucher diskon atau sesuatu lain yg sifatnya TRIAL, contohnya: .premium claim trial (klaim premium trial tersedia dari ... sampai ...)
    queue: 2, // slot kecoa yg bisa ngantri buat makanan (pake cmd ini dalam waktu dekat), contoh: gw dan lu beli buat ngantri mie ayam, gw duluan yg beli jadi lu nunggu gw dlu sampe mie ayam nya mateng, kalo udh giliran lu, klo yg ngantri 3 (yg pke dan ketik cmd ini bersamaan) yg terakhir ga di peduli in (bakal respon ngantri full) harus nunggu dulu lu (no ke 2) karna tukang mie ayam nya magang
    limit: -1, // kurangi 1 token limit user, misal: lu punya 30 limit, limit: -1 sesudah cmd, limit mu 29
    cooldown: 4000, // cooldown, 4000 = 4seconds
    media: ['image', 'video'], // lu harus bawa image atau video buat jalanin cmd ini
    meta: {
        category: 'owner', // for help or menu
        description: 'a test command', // for help or menu
        usage: '<biniku:text> <anak:number>', // dont use if (!args[0]) again, can use <number> (0-9) <text> (must be a text, string) <placeholder> (whatever you gonna name that args) <user> or <tag> (lid, jid, as example you can tag: .gao @someone) <link> (match a link args)
        target: 'reply' // apa wajib pesan nya di reply buat jalanin plugin ini?? 'reply' = YA, gada settings ini = NGAK, bisa 'tag' untuk tag atau 'both' tag atau ngak reply.
    }, // add knowledge into a 12 year old guy (he learn vibe code) also he pertend to be a girl, Dante 🗡️: that terible!!
    permission: {
        owner: false, // 'access' atau 'real'
        premium: false,
        group: true,
        admin: false,
        botadmin: false,
        private: false
    }, // furry customize premision, you can add tho, file: 'handler.js'
    run: async ({ m, meta, args, client, command, userdb }) => {
       const my = meta.input // ambil input dari args user misal args0 itu nekopara (tesk) gini dah, ku beri contoh user ketik: '.test nekopara 1' = meta.input.biniku akan ngambil args0 user, jadi meta.input.biniku adalah 'nekopara'. kalo meta.usage gada ga bakal gbs
       console.log({
 	       sender: m.sender,
  	       participant: m.participant,
           keyParticipant: m.key.participant,
  	       remoteJid: m.key.remoteJid
	   })

       m.reply(`*✨ args 1 adalah ${my.biniku}. args ke 2 adalah ${my.anak}*\n\n(biniku adalah ${my.biniku} aku punya ${my.anak} anak!!, dan *aku mengetik command:* .${command}, *limit ku tersisa:* ${userdb.limit}`) //reply pesan nya!
    } // run a fuckin CODEEEE
}

/*
async ({ m, meta, args, client })

You can add more, origin:
{
        client,
        m,
        qmsg,
        isMedia,
        userdb,
        chatdb,
        settingdb,
        runtime,
        quoted,
        itsMe,
        username,
        botLid,
        mime
    }

Name: global.payload (file: messages-upsert.js)
Example: async ({ m, meta, args, client }) -> async ({ m, meta, args, client, itsMe, mime, quoted, isMedia })
*/
// Dont hear my bs note, bs is BULLSHIT bukan 💅bestie. you dont get it? Gausah serius in komentar '//' ngawur ku.
//
// BRING ME BACK TO LIFE 🔥
