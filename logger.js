const clc = require("cli-color");


const info = (name, message) =>
	console.log(clc.red(`${"[LOGSHIELD]"} [${name}] => `) + clc.green(message));


const debug = (name, message) =>
    console.log(clc.green(`${"[DEBUG]"} [${name}] => `) + clc.yellow(message));


const error = (name, message) =>
    console.log(clc.red(`${"[ERROR]"} [${name}] => `) + clc.red(message));


const success = (name, message) =>
    console.log(clc.green(`${"[NODE]"} [${name}] => `) + clc.green(message));


module.exports = {
	info,
	debug,
	error,
	success,
};