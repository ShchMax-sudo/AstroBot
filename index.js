const Discord = require('discord.js'); // Подключаем библиотеку discord.js
const robot = new Discord.Client(); // Объявляем, что robot - бот
const comms = require("./ShchMax.js"); // Подключаем файл с командами для бота
const fs = require('fs'); // Подключаем родной модуль файловой системы node.js
let config = require('../config.json'); // Подключаем файл с параметрами и информацией
let token = config.token; // «Вытаскиваем» из него токен
let prefix = config.prefix; // «Вытаскиваем» из него префикс

function help(robot, mess, args) {
    if (args.length > 0) {
        mess.reply("Слишком много аргументов.");
    } else {
        var ans = "\n";
        for (comm_count in comms.comms) {
            ans += "$" + comms.comms[comm_count].name + " - " + comms.comms[comm_count].about + "\n";
        }
        mess.reply(ans);
    }
}

comms.comms.push({
    name: "help",
    out: help,
    about: "Помощь в пользовании ботом.",
});

robot.on("ready", function() {
    /* При успешном запуске, в консоли появится сообщение «[Имя бота] запустился!» */
    console.log(robot.user.username + " запустился!");
});


robot.on('message', (msg) => { // Реагирование на сообщения
    if (msg.author.username != robot.user.username && msg.author.discriminator != robot.user.discriminator) {
            var comm = msg.content.trim() + " ";
            var comm_name = comm.slice(0, comm.indexOf(" "));
            var messArr = comm.split(" ");
            for (comm_count in comms.comms) {
                var comm2 = prefix + comms.comms[comm_count].name;
                if (comm2 == comm_name) {
                    messArr.splice(0, 1)
                    messArr.pop();
                    comms.comms[comm_count].out(robot, msg, messArr);
                }
            }
        }
});


robot.login(token); // Авторизация бота
