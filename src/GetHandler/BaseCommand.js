// default values set in SetupConfig in CommandHandler.js
const commandsExecute_1 = require('./enums/CommandsExecute');

class Command {
    // general
    instance;
    client;

    // properties
    _aliases = []; // [0] = 'name', [!0] = 'aliases'
    _description;
    _expectedArgs;
    _minArgs;
    _maxArgs;
    _permissions = [];
    _roles = []; // Role ID
    _categories = []; // Category ID
    _channels = []; // Channel ID
    
    //functions
    _callback = () => { }; 
    _syntaxError = () => { };
    _noPermissions = () => { };
    _noRoles = () => { };
    _noCategories = () => { };
    _noChannels = () => { };

    /**
     * Creates new command instance
     * @param {GetHandler} instance the GetHandler instance
     * @param {Discord.Client} client the Discord Client
     * @param {{
     * aliases: string[],
     * description: string,
     * expectedArgs: string,
     * minArgs: number,
     * maxArgs: number,
     * permissions: string[],
     * roles: Snowflake[],
     * categories: Snowflake[],
     * channels: Snowflake[],
     * syntaxError: function,
     * noPermissions: function,
     * noRoles: function,
     * noCategories: function,
     * noChannels: function,
     * }} options the options for the command
     */
    constructor(instance, client, options) {
        let {
            aliases,
            description,
            expectedArgs,
            minArgs,
            maxArgs,
            permissions,
            roles,
            categories,
            channels,
            callback,
            syntaxError,
            noPermissions,
            noRoles,
            noCategories,
            noChannels
        } = options;

        // general
        this.instance = instance;
        this.client = client;

        // properties
        this._aliases = aliases;
        this._description = description;
        this._expectedArgs = expectedArgs;
        this._minArgs = minArgs
        this._maxArgs = maxArgs;
        this._permissions = permissions;
        this._roles = roles;
        this._categories = categories;
        this._channels = channels;

        // functions
        this._callback = callback;
        this._syntaxError = syntaxError;
        this._noPermissions = noPermissions;
        this._noRoles = noRoles;
        this._noCategories = noCategories;
        this._noChannels = noChannels;
    }

    async execute(executeMode, message, args, other = null) {
        let objectInfo = {
            message,
            channel: message.channel,
            args,
            text: args.join(' '),
            client: this.client,
            prefix: this.instance.prefix,
            instance: this.instance,
            user: message.author,
            member: message.member,
            guild: message.guild,
            commandObject: this,
        };

        if(executeMode === commandsExecute_1.CALL_BACK) {
            await this._callback(objectInfo);
            if (this.instance.deleteMessageAfterCallBack) {
                await message.delete();
            }
        } else if(executeMode === commandsExecute_1.SYNTAX_ERROR) {
            await this._syntaxError(objectInfo);
        } else if(executeMode === commandsExecute_1.NO_REQUIRED_PREMISSIONS) {
            objectInfo.missingPermissions = other;
            await this._noPermissions(objectInfo);
        } else if(executeMode === commandsExecute_1.NO_REQUIRED_ROLE) {
            objectInfo.missingRoles = other;
            await this._noRoles(objectInfo);
        } else if(executeMode === commandsExecute_1.NO_REQUIRED_CATEGORIES) {
            await this._noCategories(objectInfo);
        } else if(executeMode === commandsExecute_1.NO_REQUIRED_CHANNELS) {
            await this._noChannels(objectInfo);
        }
    }

    get name() { return this._aliases[0]; }
    get aliases() { return [...this._aliases]; }
    get description() { return this._description; }
    get expectedArgs() { return this._expectedArgs; }
    get minArgs() { return this._minArgs; };
    get maxArgs() { return this._maxArgs; };
    get permissions() { return this._permissions; };
    get roles() { return this._roles; }
    get categories() { return this._categories; }
    get channels() { return this._channels; }
}

exports.default = Command;
exports.module = Command;