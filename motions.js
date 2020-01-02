'use strict';

//Base class
class Motion {
	constructor(message, args) {
		this.message = message;
		this.args = args;
		//Functional properties
		this.threshold = 0.5;
		this.hours = 2;
		//Metadata
		this.description = '';
	}
	pass() {}
	static get help() { return '' }
}

//Category: Administration
class Ban extends Motion {
	constructor(message, args) {
		super(message, args);
		this.description = 'Ban';
		for (member of message.mentions.members.array()) {
			description += (' @' + member.id);
		}
	}
	pass() {
		for (member of this.message.mentions.members.array()) {
			member.ban();
		}
	}
	static get help() { return 'Ban a fool(s).' }
	static get syntax() { return '[mentions...]' }
}

class Kick extends Motion {
	constructor(message, args) {
		super(message, args);
		this.description = 'Kick';
		for(member of message.mentions.members.array()) {
			this.description += (' @' + member.id);
		}
	}
	pass() {
		for(member of this.message.mentions.members.array()) {
			member.kick();
		}
	}
	static get help() { return 'Kick a fool(s).' }
	static get syntax() { return '[mentions...]' }
}

//Category: Server customization
class ServerName extends Motion {
	constructor(message, args) {
		super(message, args);
		this.description = 'Change server name to ' + args.join(' ');
	}
	pass() {
		message.guild.setName(args.join(' '));
	}
	static get help() { return 'Change the server name.' }
	static get syntax() { return '[new_name]' }
}

//Category: Miscellaneous
class Test extends Motion {
	constructor(message, args) {
		super(message, args);
		this.description = 'Perform a test';
	}
	pass() { this.message.channel.send('TEST: ' + this.args); }
	static get help() { return 'Perform some tests.' }
	static get syntax() { return '' }
}

module.exports = {Ban, Kick, ServerName, Test}
