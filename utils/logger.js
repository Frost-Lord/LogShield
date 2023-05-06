const clc = require("cli-color");


const info = (name, message) =>
	console.log(clc.red(`${"[LOGSHIELD]"} [${name}] => `) + clc.green(message));


const debug = (name, message) =>
    console.log(clc.green(`${"[LOGSHIELD]"} [${name}] => `) + clc.yellow(message));


const error = (name, message) =>
    console.log(clc.red(`${"[ERROR]"} [${name}] => `) + clc.red(message));


const success = (name, message) =>
    console.log(clc.green(`${"[NODE]"} [${name}] => `) + clc.green(message));

//Database

const warn = (name, message) =>
	console.log(clc.green(`${"[DATABASE]"} [${name}] => `) + clc.green(message));

//User

const user = (name, message) =>
	console.log(clc.green(`${"[USER]"} [${name}] => `) + clc.yellow(message));

module.exports = {
	info,
	debug,
	error,
	success,
	warn,
	user,
};