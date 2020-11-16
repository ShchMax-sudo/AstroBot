const Discord = require('discord.js');
const config = require('../config.json');
const constellations = require('./constellations.json')
const Mutex = require('./mutex.js');
const prefix = config.prefix;
const versions = config.versions;

class Tournir {
	constructor() {
		this.g = constellations;
		this.was = new Set();
	}
}

// Команды //

function rules(robot, mess, args) {
	mess.channel.send("Б.к.")
}

function hello(robot, mess, args) {
  	mess.reply("Привет!")
}

function russian(robot, mess, args) {
	if (args.length != 1) {
		mess.reply("Я не понимаю, что вы хотите.")
		return
	}
	var need = args[0]
	if (constellations[need] === undefined) {
		mess.reply("Нет такого созвездия.")
	} else {
		mess.reply(constellations[need].rus);
	}
}

function greek(robot, mess, args) {
	if (args.length != 1) {
		mess.reply("Я не понимаю, что вы хотите.")
		return
	}
	var need = args[0]
	if (constellations[need] === undefined) {
		mess.reply("Нет такого созвездия.")
	} else {
		mess.reply(constellations[need].greek);
	}
}

function short(robot, mess, args) {
	if (args.length < 1) {
		mess.reply("Я не понимаю, что вы хотите.")
		return
	}
	var need = args.join(' ');
	var ans = null;
	for (var name in constellations) {
		if (constellations[name].rus == need) {
			ans = name;
		}
	}
	if (ans === null) {
		mess.reply("Нет такого созвездия.");
	} else {
		mess.reply(ans);
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
    	name: "russian",
    	out: russian,
    	about: "Русское название созвездия по его сокращённому.",
	},
	{
    	name: "greek",
    	out: greek,
    	about: "Греческое название созвездия по его сокращённому.",
	},
	{
    	name: "short",
    	out: short,
    	about: "Сокращённое название созвездия по его русскому.",
	},
]

module.exports.comms = comms_list;
