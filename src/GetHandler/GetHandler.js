const { isMemberAdmin } = require('../generalUtilies');
const commandHandler_1 = require('./CommandHandler');
const featureHandler_1 = require('./FeatureHandler');
const consolelLogLevels_1 = require('./enums/ConsolelLogLevels');
const EventEmitter_1 = require('events');

class GetHandler extends EventEmitter_1 {
    // general
    guildID = '623044952699699201';
    _client;
    _commandHandler;
    _featureHandler;
    
    // properties - options
    _prefix;
    _commandsDir;
    _featuresDir;
    _commandsDefaultFunctions;
    _ignoreFilePrefix;
    _ignoreBots;
    _deleteMessageAfterCallBack;
    _logLevel;
    _errorEmbedColor;
    _normalEmbedColor;
    
    /**
     * Creates a new GetHandler instance
     * @param {Discord.Client} client the Discord Client
     * @param {{
     * prefix: String | "!",
     * commandsDir: Path,
     * featuresDir: Path,
     * commandsDefaultFunctions: String,
     * ignoreBots: Boolean | true,
     * ignoreFilePrefix: String,
     * deleteMessageAfterCallBack: boolean | false,
     * logLevel: Number,
     * errorEmbedColor: hexString,
     * normalEmbedColor: hexString,
     * }} options the options of the GetHandler
     * @return {GetHandler} the command handler
     */
	constructor(client, options) {
        super();
        let { 
            prefix = '!',
            commandsDir,
            featuresDir, 
            commandsDefaultFunctions,
            ignoreBots = true,
            ignoreFilePrefix,
            deleteMessageAfterCallBack = false,
            logLevel = consolelLogLevels_1.GENERAL,
            errorEmbedColor = 'RED',
            normalEmbedColor = 'WHITE',
        } = options; 

        this._client = client
        if(!this._client) { throw new Error('No Discord JS Client provided as first argument!'); }
        
        this._prefix = prefix;
        this._ignoreBots = ignoreBots;
        
        if(commandsDefaultFunctions) {
            this._commandsDefaultFunctions = commandsDefaultFunctions + ((commandsDefaultFunctions.endsWith('.js')) ? '' : '.js');
        }
        
        this._commandsDir = commandsDir;
        this._featuresDir = featuresDir;
        this._ignoreFilePrefix = ignoreFilePrefix;
        this._deleteMessageAfterCallBack = deleteMessageAfterCallBack;
        this._logLevel = logLevel;

        this.ConsoleLogInfo(__filename, `Starting up GetHandler...`, consolelLogLevels_1.GENERAL);
        
        this._errorEmbedColor = errorEmbedColor;
        this._errorEmbedColor = this._errorEmbedColor.toLowerCase();

        this._normalEmbedColor = normalEmbedColor;
        this._normalEmbedColor = this._normalEmbedColor.toLowerCase();
        
        this._commandHandler = new commandHandler_1(this, this._client, this._commandsDir, this._commandsDefaultFunctions);
        /*
        this._featureHandler = new featureHandler_1();
        */
    }

    get guildID() { return this.guildID; } 
    get client() { return this._client; }
    get prefix() { return this._prefix }
    get commandsDefaultFunctions() { return this._commandsDefaultFunctions; }
    get commandsDir() { return this._commandsDir; }
    get commandsHandler() { return this._commandHandler; }
    get featuresDir() { return this.featuresDir; }
    get featuresHandler() { return this.featureHandler_1; }
    get ignoreBots() { return this._ignoreBots; }
    get ignoreFilePrefix() { return this._ignoreFilePrefix; }
    get deleteMessageAfterCallBack() { return this._deleteMessageAfterCallBack; }
    get logLevel() { return this._logLevel; } ;
    get errorEmbedColor() { return this._errorEmbedColor; };
    get normalEmbedColor() { return this._normalEmbedColor; };

    /** 
     * Logs information 
     * @param {string} text the info the log in console.
     * @param {*} level the level of which you log,
     * check out 'CommandsLogLevels.js' for levels.
     */
    ConsoleLogInfo(fileDirectory, text, level) {
        if(level <= this._logLevel) {
            let fileName = fileDirectory.split('\\');
            fileName = fileName[fileName.length - 1];
            console.log(`${fileName} > ${text}`);
        }
    }

    /** 
     * Sets the categories of the commands
     * @param {[...{
     * name:string,
     * emoji: string,
     * customEmoji: boolean,
     * folderName: string,
     * hidden: boolean,
     * options: {any:any},
     * }]} categories array of categories
     * @param {String} category.name the name of the category
     * @param {String} category.emoji if (customEmoji = true) => emoji = <:name:id> OR id, if (customEmoji = false) => emoji = unicode
     * @param {Boolean} category.customEmoji whether the emoji is a custom 
     * @param {String} category.folderName the name of the folder of the commands to add to the category
     * @param {Boolean} category.hidden whether the category is hidden or not in help menu
     * @param {{any:any}} category.options other options to pass to each category
     */
    setCategorySettings = (categories) => {
        this._commandHandler.setCategorySettings(this, categories);
    }

    /** 
     * Returns the categories that the player is allowed to see using the category.hidden property
     * @param {GuildMember} member the guild member to check if he is allowed to see hidden categories
     * @returns {Collection<FolderName, Category>} returns a collection of all the categories that the player is allowed to see
     */
    getVisibleCategories = (member) => {   
        if(isMemberAdmin(member)) {
            return this.getCategories();
        } else {
            return this.getCategories().filter((category) => !category.hidden);
        }
    }

    /** 
     * Retuns all the categories available
     * @returns {Collection<FolderName, Category>} returns a collection of all the categories
     */
    getCategories = () => {
        return this._commandHandler.categories;
    }

    /** 
     * Returns the command object from command name
     * @param {String} commandName the name of the command to retrive
     * @returns {BaseCommand} returns the command object from command name
     */
    getCommand = (commandName) => {
        return this._commandHandler.getCommand(commandName);
    }
}

exports.default = GetHandler;
module.exports = GetHandler;