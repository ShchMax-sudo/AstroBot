const Discord = require('discord.js');
const config = require('../config.json');
const constellations = require('./constellations.json')
const prefix = config.prefix;
const versions = config.versions;

var users = new Set();
const MainChName = "боттание";

class Tournir {
	constructor() {
		this.g = constellations;
	}
}

// Команды //

function rules(robot, mess, args) {
	if (mess.channel.name != MainChName) {
		return;
	}
	mess.channel.send("Б.к.")
}

function hello(robot, mess, args) {
	if (mess.channel.name != MainChName) {
		return;
	}
  	mess.reply("Привет!")
}

function remember(robot, mess, args) {
	if (mess.channel.name != MainChName) {
		return;
	}
	user = mess.author.username + "#" + mess.author.discriminator;
	if (users.has(user)) {
		mess.reply("Я тебя знаю!");
	} else {
		users.add(user);
		mess.reply("Ты вообще кто");
	}
}

// Список комманд //

var comms_list = [{
    	name: "rules",
    	out: rules,
    	about: "Правила турнира"
  	},
  	{
    	name: "hello",
    	out: hello,
    	about: "Команда для приветствия!",
	},
	{
    	name: "remember",
    	out: remember,
    	about: "Тест на память",
	}
]

module.exports.comms = comms_list;
