var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database(":memory:", err => {
  if (err) throw err
  console.log('La base de donnée a bien été démarrée !')
});

app.use(express.static(__dirname + '/public'));

app.get('/', function(res, res) {
    res.render('index.html');
});

app.use(function(req, res, next) {
    res.setHeader('Content-type', 'text/html');
    res.status(404).send('<h1>ERREUR</h1>');
});

server.listen(8080, () => console.log('Le bot a bien été lancé !'));

const Discord = require("discord.js"),
client = new Discord.Client(),
settings = {
    prefix: "_",
    token: "ODEyMzcxMjExNDg4MTk4NjY2.YC_xpQ.cWdYufkBUiEpOIjgUJGONREBLXk"
};

const { Player } = require("discord-player");
const player = new Player(client);
client.player = player;
client.player.on('trackAdd', (message, queue, track) => message.channel.send(`${track.title} has been added to the queue!`))
client.player.on('trackStart', (message, track) => message.channel.send(`Now playing ${track.title}...`))
client.player.on('channelEmpty', (message, queue) => message.channel.send('Tout les utilisateurs ont quittés le channel !'))

io.on('connection', socket => {
  socket.join('clientsroom');
  var memberCount1 = client.users.cache.size;
  io.in("clientsroom").emit("membercount", memberCount1);
});

client.on("message", async (message) => {

  const args = message.content.slice(settings.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  if(message.content.startsWith("_play")){
    if (!args.length) {
      message.channel.send("Vous devez mettre le nom de la musique !");
    }
    else {
      let track = client.player.play(message, args.slice(0).join(" "), message.member.user.tag);
      io.in("clientsroom").emit("logplay", message.member.user.tag, args.slice(0).join(" "), message.member.guild.name)
    }
  };
  if(message.content.startsWith("_pause")){
    client.player.pause(message);
    message.channel.send(`Pause !`);
  }
  if(message.content.startsWith("_resume")){
    client.player.resume(message);
    message.channel.send(`Resume !`);
  }
  if(message.content.startsWith("_skip")){
    client.player.skip(message);
    message.channel.send(`Skipped !`);
  }

});

client.player.on('error', (error, message) => {
  switch(error){
      case 'NotPlaying':
          message.channel.send("There is no music being played on this server!")
          break;
      case 'NotConnected':
          message.channel.send("Tu n'es pas connecté dans un vocale !")
          break;
      case 'UnableToJoin':
          message.channel.send("Je n'ai pas la permission de rejoindre ton channel !")
          break;
      case 'LiveVideo':
          message.channel.send("Les lives youtube ne sont pas suportés !")
          break;
      case 'VideoUnavailable':
          message.channel.send("This YouTube video is not available!");
          break;
      default:
          message.channel.send(`Something went wrong... Error: ${error}`)
  }
});

db.close(err => {
  if (err) throw err
  console.log('La base de donnée a bien été enregistré !')
});

client.login(settings.token);
