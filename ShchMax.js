const Discord = require('discord.js');
const config = require('../config.json');
const constellations = require('./constellations.json')
const Mutex = require('./mutex.js');
const prefix = config.prefix;
const versions = config.versions;

var consts = []
for (var UNname in constellations) {
	consts.push(UNname)
}

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

class Tournir {
	constructor() {
		this.was = new Set();
		this.players = [];
		this.errors = [];
		this.now = 0;
		this.started = false;
		this.const = consts[getRandomInt(consts.length)];
		this.was.add(this.const);
		this.end = false;
	}

	addUser(mess, name) {
		if (this.end) {
			mess.reply("Игра уже окончена.")
			return;
		}
		if (!this.started) {
			this.players.push(name);
			this.errors.push(3);
			mess.reply("Приветствую в турнире.")
		} else {
			mess.reply("Турнир уже начался.")
		}
	}

	start(mess) {
		if (this.end) {
			mess.reply("Игра уже окончена.")
			return;
		}
		if (this.started) {
			mess.reply("Турнир уже начался.")
		} else {
			mess.channel.send("Турнир начался.")
			mess.channel.send(this.const)
		}
		this.started = true;
	}

	step(mess, name, val) {
		if (this.end) {
			mess.reply("Игра уже окончена.")
			return;
		}
		var last = this.now;
		if (name !== this.players[this.now]) {
			mess.reply("Не твой ход!")
		} else {
			if (constellations[val] === undefined) {
				this.errors[this.now]--;
				mess.reply("Нет такого созвездия.");
			} else if (constellations[this.const].go.indexOf(val) > -1) {
				if (this.was.has(val)) {
					this.errors[this.now]--;
					mess.reply("Уже там были.");
				} else {
					mess.channel.send("Зачтено.");
					this.was.add(val);
					this.const = val;
					this.now++;
					this.now %= this.players.length;
				}
			} else {
				this.errors[this.now]--;
				mess.reply("Нельзя сделать такой переход.");
			}
		}
		if (this.errors[last] < 0) {
			mess.reply("Слишком много ошибок.");
			return -1;
		}
	}

	cant() {
		if (this.end) {
			return true;
		}
		for (var g in constellations[this.const].go) {
			if (!this.was.has(constellations[this.const].go[g])) {
				return false;
			}
		}
		return true;
	}
}

var tours = {};

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

function clear(robot, mess, args) {
	const arggs = mess.content.split(' ').slice(1);
	const amount = arggs.join(' ');
	if (!amount) {
		return mess.channel.send('Вы не указали, сколько сообщений нужно удалить.');
	}
	if (isNaN(amount)) {
		return mess.channel.send('Это не число.');
	}
	if (amount > 100) {
		return mess.channel.send('Вы не можете удалить 100 сообщений за раз.');
	}
	if (amount < 1) {
		return mess.channel.send('Вы должны ввести число больше чем 1.');
	}
	async function delete_messages() {

	    await mess.channel.messages.fetch({
	        limit: amount
	    }).then(messages => {
	        mess.channel.bulkDelete(messages)
	        // mess.channel.send(`Удалено ${amount} сообщений!`)
	    })
	};
	delete_messages();
}

function fadd(robot, mess, args) {
	var channame = mess.channel.id;
	var name = mess.author.id;
	if (args.length > 0) {
		mess.reply("Зачем параметры?");
		return
	}
	if (tours[channame] === undefined) {
		mess.reply("Игра не создана.");
	} else {
		while (!tours[channame].lock(name)) {}
		var game = tours[channame].get(name);
		game.addUser(mess, name);
		tours[channame].set(name, game);
		tours[channame].unlock(name);
	}
}

function fnew(robot, mess, args) {
	var channame = mess.channel.id;
	var name = mess.author.id;
	if (args.length > 0) {
		mess.reply("Зачем параметры?");
		return;
	}
	if (tours[channame] === undefined) {
		tours[channame] = new Mutex(new Tournir());
		mess.channel.send("Начинаем набор команды")
	} else {
		while (!tours[channame].lock(name)) {}
		if (tours[channame].get(name).end == true) {
			tours[channame] = new Mutex(new Tournir());
			mess.channel.send("Начинаем набор команды")
		} else {
			mess.reply("Игра уже не началась.")
		}
	}
}

function fstart(robot, mess, args) {
	var channame = mess.channel.id;
	var name = mess.author.id;
	if (args.length > 0) {
		mess.reply("Зачем параметры?");
		return;
	} else if (tours[channame] === undefined) {
		mess.reply("Игра ещё не создана.");
		return;
	} else {
		while (!tours[channame].lock(name)) {}
		var game = tours[channame].get(name);
		game.start(mess);
		tours[channame].set(name, game);
		tours[channame].unlock(name);
	}
}

function fend(robot, mess, args) {
	var channame = mess.channel.id;
	var name = mess.author.id;
	if (args.length > 0) {
		mess.reply("Зачем параметры?");
		return;
	} else if (tours[channame] === undefined) {
		mess.reply("Игра ещё не создана.");
		return;
	} else {
		while (!tours[channame].lock(name)) {}
		var game = tours[channame].get(name);
		game.end = true;
		tours[channame].set(name, game);
		tours[channame].unlock(name);
		mess.channel.send("Игра окончена.");
	}
}

function fstep(robot, mess, args) {
	var channame = mess.channel.id;
	var name = mess.author.id;
	if (args.length < 1) {
		mess.reply("А сам ход где?")
		return
	} else if (args.length > 1) {
		mess.reply("Не понимаю, чего ты хочешь.")
	} else {
		while (!tours[channame].lock(name)) {}
		var game = tours[channame].get(name);
		var verd = game.step(mess, name, args[0]);
		if (game.cant()) {
			mess.channel.send("Больше нет возможности ходить.");
			if (game.was.size == 88) {
				mess.channel.send("Не могу поверить! Вы прошлись по всем созаездиям!");
			}
			game.end = true;
			mess.channel.send("Игра окончена.");
		} else if (verd == -1) {
			game.end = true;
			mess.channel.send("Игра окончена.");
		}
		tours[channame].set(name, game);
		tours[channame].unlock(name);
	}
}

function about(robot, mess, args) {
	mess.channel.send(`Я - **AstroBot**. Я могу помочь с названиями созвездий (например перевод из краткой формы в полную русскую.). Также я могу устравивать Турнир Угольникова (для этого я и был создан). По всем вопросам к автору: ShchMax#0301. Исходники бота - https://github.com/ShchMax-sudo/AstroBot. Для большей информации воспользуйтесь командой \`$help\``);
}

// Список комманд //

var comms_list = [{
    	name: "rules",
    	out: rules,
    	about: "Правила турнира."
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
	{
    	name: "clear",
    	out: clear,
    	about: "Удаление сообщений в чате.",
	},
	{
    	name: "fadd",
    	out: fadd,
    	about: "Добавление игрока к первому туру.",
	},
	{
    	name: "fnew",
    	out: fnew,
    	about: "Новая игра первого тура.",
	},
	{
    	name: "fstart",
    	out: fstart,
    	about: "Стартует игру первого тура.",
	},
	{
    	name: "fstep",
    	out: fstep,
    	about: "Сам ход первого тура.",
	},
	{
    	name: "fend",
    	out: fend,
    	about: "Окончание первого тура.",
	},
	{
    	name: "about",
    	out: about,
    	about: "Кратко описание бота.",
	},
]

module.exports.comms = comms_list;
