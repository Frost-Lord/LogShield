const fs = require("fs");

module.exports = (client) => {  
  fs.readdirSync('./plugin/DISCORD/src/events').forEach(dir => {
		const commands = fs.readdirSync(`./plugin/DISCORD/src/events/${dir}`).filter(file => file.endsWith('.js'));
		for (let file of commands) {
      
			let pull = require(`../../src/events/${dir}/${file}`);
			if (pull.name) {
				client.events.set(pull.name, pull);
				console.log(`[E] ${"(#" + client.events.size + ")"} Loaded a file: ${pull.name} + successfully!`);
			} else {
				console.log(`[E] Couldn't load the file ${file}. missing name or aliases.`)
				continue;
			}
      
		}
	});
}