const rp = require('request-promise');

const fs = require('fs');

const Discord = require('discord.js');
const client = new Discord.Client();
const talkedRecently = new Set();
const channelMessaged = new Set();
const userBlocked = new Set();
const bizaamType = 'bizaam';
const bestPonyType = 'best-pony';
const assfartType = 'assfart';
const fantaType = 'cocacola';
const interjectType = 'interject';
const canniBestPonyType = 'canni-best-pony';
const bizaamBestPonyType = 'bizaam-best-pony';
const assFartBestPonyType = 'assfart-best-pony';
const canniworstPonyType = 'canny-worst-pony';
const loveCanniType = 'love-canni';
const galaconDate = Date.parse('01 aug 2020 09:00:00 GMT+2');

const auth = require('./auth.json');

var channelUploadID = undefined;
var channelUploadList = undefined;

var data = require('./data.json');
var messaged = false;
var bizaamEmoji = null;
var hugEmoji = null;
var loveEmoji = null;
var errorEmoji = null;
var shyEmohi = null;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    setInterval(() => {
        let now = Date.now();
        let diff =  galaconDate - now;
        var seconds = parseInt(diff) / 1000;
        let days = Math.floor(seconds / (3600 * 24));
        seconds -= days*3600*24;
        let hrs = Math.floor(seconds / 3600);
        seconds -= hrs * 3600;
        let minutes = Math.floor(seconds / 60);
        if(minutes < 10) { // Lazyness is real
            client.user.setActivity(`Time to Galacon: ${days} days, ${hrs}:0${minutes} left! Hype!`, { type: 'PLAYING' });
        }
        else {
            client.user.setActivity(`Time to Galacon: ${days} days, ${hrs}:${minutes} left! Hype!`, { type: 'PLAYING' });
        }
    }, 10000); // Every 10s?
    setInterval(() => {
        updateChannel();
    }, 3600000);
});

client.on('message', msg => {
    var messageSent = false;
    if(msg.author.bot){
        return;
    }

    if (msg.isMemberMentioned(client.user)) {
        if (msg_contains(msg, 'i\'m sorry') || msg_contains(msg, 'i am sorry')) {
            if (userBlocked.has(msg.author.id)) {
                msg.channel.send(dparse("ans_forgive", [msg.author, getLoveEmoji()]));
                if (talkedRecently.has(msg.author.id)) {
                    talkedRecently.delete(msg.author.id);
                }
                if (channelMessaged.has(msg.author.id)) {
                    channelMessaged.delete(msg.author.id);
                }
                unblockUser(msg);
                messageSent = true;
            }
            return;
        }
        if (msg_contains(msg, 'i love you')) {
            if (controlTalkedRecently(msg, loveCanniType)) {
                msg.channel.send(dparse("ans_love",[msg.author,getLoveEmoji()]));
                messageSent = true;
            }
            return;
        }
     }

    if (userBlocked.has(msg.author.id)) {
        return;
    }

    if (msg_starts(msg,'boop')) {
        if(msg.mentions !== null && !msg.mentions.everyone && msg.mentions.users.array().length > 0) {
            let users = msg.mentions.users.array();
            for(let i = 0; i < users.length; i++)
            {
                msg.channel.send(dparse("ans_boop", [msg.author, users[i].id]));  // not sure how to implement mention in json
                messageSent = true;
            }
            msg.delete(0);//make sure the bot gets manage text permissions , otherwise it will fail silently-Merte
        }
    }

    if (msg_contains_word(msg, "fanta")) {//Fanta jokes! -merte
        if (controlTalkedRecently(msg, fantaType)) {
            let rndm = randomIntFromInterval(0, data["ans_fanta_list"].length-1);
            msg.channel.send(parse(data["ans_fanta_list"][rndm]));
            messageSent = true;
        }
    }
    //i noticed there was a lot of interest in becomming a memer, sooo i thought lets automate!-Merte
    //the bot will need to have the rights to give/take meme rolls
    if (msg_contains(msg, 'i want to be a meme master')) {
        try {
            if (!msg.mentions.everyone && msg.isMentioned(client.user)) {
                let memeroll = msg.guild.roles.find(role => role.name === "Meme");
                if (msg.member.roles.some(r => ["Meme"].includes(r.name))) {
                    msg.channel.send(dparse("ans_meme_already", [msg.author]));
                }
                else {
                    msg.channel.send(dparse("ans_meme1", [msg.author])).then(message => message.delete(15000));
                    msg.delete(10);

                }
            }
            messageSent = true;
        }catch (e) {
            msg.channel.send(dparse("ans_meme_error",[msg.author]))
        }
    }
    if (msg_contains(msg, 'i really want to be a meme master')) {// create stuff to automaticly become a memer
        try {
            if (!msg.mentions.everyone && msg.isMentioned(client.user)) {
                let memeroll = msg.guild.roles.find(role => role.name === "Meme");
                if (msg.member.roles.some(r => ["Meme"].includes(r.name))) {
                    msg.channel.send(dparse("ans_meme_already", [msg.author]));
                }
                else {
                    msg.channel.send(dparse("ans_meme1", [msg.author,getBizaamEmoji()])).then(message => message.delete(15000));
                    msg.member.addRole(memeroll).catch(console.error);
                    msg.delete(10);
                }
                messageSent = true;
            }
        }catch (e) {
            msg.channel.send(dparse("ans_meme_error",[msg.author]))
        }
    }


    if (msg_contains(msg, "bizaam") && (!msg_contains(msg, 'is best pony'))) {
        if (controlTalkedRecently(msg, bizaamType)) {
            msg.channel.send(dparse("ans_bizaam",[getBizaamEmoji()])).then(sentEmbed => {
                sentEmbed.react(getBizaamEmoji())
            });

            msg.react(getBizaamEmoji());
            messageSent = true;
        }
    }

    if (msg_contains(msg, "assfart") && !msg_contains(msg, 'assfart is best pony')) {
        if (controlTalkedRecently(msg, assfartType)) {
            msg.channel.send(dparse("ans_assfart",[msg.author]));
            messageSent = true;
        }
    }

    if (msg_starts(msg,"!when")) {
        msg.channel.send(dparse("ans_next_gala1",[getBizaamEmoji()]));
        let now = Date.now();
        let diff =  galaconDate - now;
        var seconds = parseInt(diff) / 1000;
        let days = Math.floor(seconds / (3600 * 24));
        seconds -= days*3600*24;
        let hrs = Math.floor(seconds / 3600);
        seconds -= hrs * 3600;
        let minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;
        msg.channel.send(dparse("ans_next_gala2",[days,hrs,minutes,Math.floor(seconds)]));
        messageSent = true;
    }

    if (msg_contains(msg, ' is best pony')) {
        if (msg_contains(msg, 'who is best pony')) {
            if (controlTalkedRecently(msg, bestPonyType)) {
                msg.channel.send(dparse("ans_best_pony1",[msg.author,getBizaamEmoji()]));
                messageSent = true;
            }
        } else if (msg_contains(msg, 'canni is best pony') || msg_contains(msg, 'canni soda is best pony')) {
            if (controlTalkedRecently(msg, canniBestPonyType)) {
                msg.channel.send(dparse("ans_best_pony2",[msg.author]));
                messageSent = true;
            }
        } else if (msg_contains(msg, 'bizaam is best pony') || msg_contains(msg, `${getBizaamEmoji()} is best pony`)) {
            if (controlTalkedRecently(msg, bizaamBestPonyType, false)) { // Don't send CD message here. It's not required.
                msg.channel.send(dparse("ans_best_pony3",[msg.author]));
                messageSent = true;
            }
        } else if (msg_contains(msg, 'assfart is best pony')) {
            if (controlTalkedRecently(msg, assFartBestPonyType, false)) { // Don't send CD message here. It's not required.
                msg.channel.send(dparse("ans_best_pony4",[msg.author]));
                messageSent = true;
            }
        }else {
            if (controlTalkedRecently(msg, interjectType, false)) { // Don't set a CD message here. It'll feel more natural if Canni doesn't respond every time in case people spam the command.
                msg.channel.send(dparse("ans_best_pony5",[msg.author]));
                messageSent = true;
            }
        }

    }

    if (msg_contains(msg, ' is worst pony')) {
        if (msg_contains(msg, 'canni is worst pony') || msg_contains(msg, 'canni soda is worst pony')) {
            if (controlTalkedRecently(msg, canniworstPonyType, true, 60000, 'individual')) {
                msg.channel.send(dparse("ans_worst_pony1",[msg.author]));
                messageSent = true;
            }

        }
    }

    if (msg_starts(msg,"hug")) {
        if (msg.mentions !== null && !msg.mentions.everyone && msg.mentions.users.array().length > 0) {
            let user = msg.mentions.users.array()[0];
            if (!userBlocked.has(user.id)) {
                msg.channel.send(dparse("ans_hug",[user.id,msg.author,getHugEmoji()])); // not sure how to implement mention in json
                msg.delete(0);
                messageSent = true;
            }
        }
    }
    if(!messageSent){
        if(msg.isMemberMentioned(client.user)){
            msg.channel.send(dparse("ans_still_learning",[getShyEmoji()]));
        }else{
            let rnd = randomIntFromInterval(0, 200);
            if(rnd === 10){
                msg.channel.send(`Boop ${msg.author}! I'm bored!`)
            }
        }
    }
});
function sendCooldownMessage(msg, type, cooldownTarget) {
    switch (type) {
        case canniworstPonyType:
            var cooldownMessage = dparse("ans_cooldown_worst",[msg.author]);
            cooldownTarget = msg.author.id;
            blockUser(msg, 300000);
            break;
        case loveCanniType:
            var cooldownMessage = dparse("ans_cooldown_love",[msg.getErrorEmoji()]);
            break;
        default:
            var cooldownMessage = dparse("ans_cooldown_love",[msg.author,msg.getErrorEmoji()]);
    }

    if (channelMessaged.has(cooldownTarget)) {
        // Do nothing. We don't want to spam everyone all the time.
    } else {
        msg.channel.send(cooldownMessage)

        messaged = true;
        channelMessaged.add(cooldownTarget);
        setTimeout(() => {
            channelMessaged.delete(cooldownTarget);
        }, 60000);

    }
}

// "controlTalkedRecently" simplifies the antispam check. Sends the cooldown message as default. Retruns true when message can be send.
function controlTalkedRecently(msg, type, cooldownmessage = true, cooldowntime = 60000, target = 'channel') {
    switch (target) {
        case 'channel':
            var cooldownTarget = msg.channel.id + type;
            break;
        case 'individual':
            var cooldownTarget = msg.author.id;
            break;
    }

    if (talkedRecently.has(cooldownTarget)) {
        if (cooldownmessage) {
            sendCooldownMessage(msg, type, cooldownTarget);
        }
        return false;
    } else {
        talkedRecently.add(cooldownTarget);
                setTimeout(() => {
                  talkedRecently.delete(cooldownTarget);
                }, cooldowntime);
        return true;
    }
}

// Temporarily block a user after they've been mean to Canni.
function blockUser(msg, timeout) {
    userBlocked.add(msg.author.id);
    setTimeout(() => {
        userBlocked.delete(msg.author.id);
    }, timeout);
}

// Manually unblock a user.
function unblockUser(msg) {
    userBlocked.delete(msg.author.id);
}

function getBizaamEmoji() {
    if (bizaamEmoji === null) {
        bizaamEmoji = client.emojis.find(emoji => emoji.name === "bizaam");
        if (bizaamEmoji === null) {// added little code for when the bot is running ouside of galacon server
            bizaamEmoji = "😃";
        }
    }
    return bizaamEmoji;
}

function getHugEmoji() {
    if(hugEmoji === null) {
        hugEmoji = client.emojis.find(emoji => emoji.name === "hug");
        if(hugEmoji === null) {// added little code for when the bot is running ouside of galacon server
            hugEmoji = "🤗";
        }
    }
    return hugEmoji;
}

function getShyEmoji() {
    if(shyEmohi === null) {
        shyEmohi = client.emojis.find(emoji => emoji.name === "Shy");
        if(shyEmohi === null) {// added little code for when the bot is running ouside of galacon server
            shyEmohi = "😳";
        }
    }
    return shyEmohi;
}

function getLoveEmoji() {
    if (loveEmoji === null) {
        loveEmoji = client.emojis.find(emoji => emoji.name === "Love");
        if(loveEmoji === null) {// added little code for when the bot is running ouside of galacon server
            loveEmoji = "🤗";
        }
    }

    return loveEmoji;
}

function getErrorEmoji() {
    if (errorEmoji === null) {
        errorEmoji = client.emojis.find(emoji => emoji.name === "Error");
        if(errorEmoji === null) {// added little code for when the bot is running ouside of galacon server
            errorEmoji = "😫";
        }
    }

    return errorEmoji;
}

async function updateChannel() {
    channelUploadList = [];
    let token = "";
    while(token !== undefined) {
        const uploads = await getChannelUploadList(token);
        if(!uploads) {
            break;
        }
        for(let i = 0; i < uploads.body.items.length; i++)
        channelUploadList.push(uploads.body.items[i]);
        token = uploads.body.nextPageToken;
    }
}

async function getChannelUploadID(channelName = "CanniSoda")
{
    let options = {
        uri: "https://www.googleapis.com/youtube/v3/channels",
        qs: {
            part:           "contentDetails",
            forUsername:    channelName,
            key:            auth.youtube
        },
        resolveWithFullResponse:    true,
        json:   true
    }
    try {
        let response = await rp(options);
        return Promise.resolve(response);
    }
    catch (error) {
        return Promise.reject(error)
    }
}

async function getChannelUploadList(pageToken = "")
{
    if(channelUploadID === undefined) {
        let body = await getChannelUploadID();
        channelUploadID = body.body.items[0].contentDetails.relatedPlaylists.uploads;
    }
    let options = {
        uri: "https://www.googleapis.com/youtube/v3/playlistItems",
        qs: {
            part:           "snippet",
            playlistId:     channelUploadID,
            key:            auth.youtube,
            maxResults:     50
        },
        resolveWithFullResponse:    true,
        json:   true
    }
    if(pageToken !== "")
        options.qs.pageToken = pageToken;
    try {
        let response = await rp(options);
        return Promise.resolve(response);
    }
    catch (error) {
        return Promise.reject(error)
    }
}


// "msg_contains(msg, text)" is a shorter version of "msg.content.toLowerCase().includes(text)"
function msg_contains(msg, text) {
    if(msg.content.toLowerCase().includes(text)) {
        return true;
    } else {
        return false;
    }
}

// "msg_starts(msg, text)" is a shorter version of "msg.content.toLowerCase().startsWith(text)"
function msg_starts(msg, text) {
    if(msg.content.toLowerCase().startsWith(text)) {
        return true;
    } else {
        return false;
    }
}
function randomIntFromInterval(min, max) { //random number generator with min-max -merte
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function msg_contains_word(msg, word)
{
    let content = msg.content.toLowerCase();
    let wrd = word.toLowerCase();
    let wrdArray = content.split(" ");
    for(var i = 0; i < wrdArray.length; i++)
    {
        if(wrd === wrdArray[i])
            return true;
    }
    return false;
}


//parses variables into strings from data. After string argument a list element with the variables is required.
function dparse(str) {
    var raw = data[str];
    var args = [].slice.call(arguments, 1), i = 0;
    try {return raw.replace(/%s/g, () => args[0][i++])}
    catch {return raw.replace(/%s/g, () => args[i++])}
}

function parse(str) {
    var args = [].slice.call(arguments, 1), i = 0;
    try {return str.replace(/%s/g, () => args[0][i++])}
    catch {return str.replace(/%s/g, () => args[i++])}
}

client.login(auth.token);