const fs_1 = require('fs');
const { Collection } = require('discord.js');
const { GetFilesFromDirectory, isMemberAdmin } = Patterns = require('../generalUtilies');
const command_1 = require('./BaseCommand');
const permissions_1 = require('./enums/Permissions');
const consolelLogLevels_1 = require('./enums/ConsolelLogLevels');
const commandsExecute_1 = require('./enums/CommandsExecute');

class CommandHandler {
    // general 
    _client;

    // properties
    _commandsDefaultFunctions;
    _commands = new Collection();

    /*
    folderName: {
        name: String,
        emoji: Emoji,
        customEmoji: Boolean,
        hidden: Boolean,
        commandObjects: [...String],
    }
    */
    _categories = new Collection();
    
    constructor(instance, client, dir, commandsDefaultFunctions) {
        this._client = client;
        this._commandsDefaultFunctions = commandsDefaultFunctions;
        this.SetUp(instance, dir);
    }

    /**
     * Returns the command object from command name
     * @param {String} commandName the name of the command to retrive
     * @returns {BaseCommand} returns the command object from command name
     */
    getCommand(name) { return this._commands.get(name); }

    get commands() { return this._commands; }
    get categories() { return this._categories; }

    async SetUp(instance, dir) {
        // if 'dir' defined and exists
        if(dir) {
            const defaultFunctionsFileName = instance.commandsDefaultFunctions;
            if(!fs_1.existsSync(dir)) {
                throw new Error(`Commands directory "${dir} doesn't exist!"`);
            } else {
                // load default functions
                let defaultFunctions;
                if(defaultFunctionsFileName) {
                    if(fs_1.existsSync(`${dir}\\${defaultFunctionsFileName}`)) {
                        defaultFunctions = await require(`${dir}\\${defaultFunctionsFileName}`);
                    } else {
                        throw new Error(`Commands default functions file property defined but no file in directory "${dir}" was found with the name "${defaultFunctionsFileName}"! Make sure the file isn\'t inside any folders.`);
                    }
                }

                // load commands
                let commandsFiles = GetFilesFromDirectory(dir, '.js');
                if(instance.ignoreFilePrefix && instance.ignoreFilePrefix !== '') {
                    commandsFiles = commandsFiles.filter(((fileObject) => {
                        let [file, fileName] = fileObject;
                        return !(fileName.startsWith(instance.ignoreFilePrefix) || fileName === defaultFunctionsFileName.split('.')[0]);
                    }))
                }

                instance.ConsoleLogInfo(
                    __filename,
                    `Loaded ${commandsFiles.length} command${(commandsFiles.length !== 1)? 's': ''} from "${dir}"`,
                    consolelLogLevels_1.GENERAL
                );
                
                for(const [file, fileName] of commandsFiles) {
                    await this.RegisterCommand(instance, file, defaultFunctions, dir);
                }

                instance.emit('finishRegisterCommand');
            }
        } else {
            instance.ConsoleLogInfo(
                __filename,
                `No commands dir is available, Loaded 0 commands.`,
                consolelLogLevels_1.GENERAL
            );
            return;
        }

        this._client.on('messageCreate', async (message) => {
            let content = message.content;
            const prefix = instance.prefix;
            
            if(!content.startsWith(prefix)) { return; }
            if(instance.ignoreBots && message.author.bot) { return; }

            content = content.substring(prefix.length);
            const args = content.split(/[ ]+/g);
            const firstElement = args.shift();
            if(!firstElement) { return; }
            
            const name = firstElement.toLowerCase();
            const command = this._commands.get(name);
            if(!command) { return; }

            // if admin dont check permissions and ignore req roles.
            if(!isMemberAdmin(message.member)) {
                let missingPerms = [];
                // check Permissions
                command.permissions.forEach(perm => {
                    if(!message.member.permissions.has(perm, true)) {
                        missingPerms.push(perm);
                    }
                });

                if(missingPerms.length !== 0) {
                    try {
                        command.execute(commandsExecute_1.NO_REQUIRED_PREMISSIONS, message, args, missingPerms);
                        return;
                    } catch (e) { console.error(e); }
                }
                
                // check Roles
                let memberRolesID = [], missingRolesID = [];
                message.member.roles.cache.each((role, roleid) => {
                    memberRolesID.push(roleid);
                });

                command.roles.forEach(roleID => {
                    if(!memberRolesID.includes(roleID)) {
                        missingRolesID.push(roleID);
                    }
                })

                if(missingRolesID.length !== 0) {
                    try {
                        command.execute(commandsExecute_1.NO_REQUIRED_ROLE, message, args, missingRolesID);
                        return;
                    } catch (e) { console.error(e); }
                }
            }

            // check Categories
            let commandCategories = command.categories;
            if(commandCategories.length !== 0 && !commandCategories.includes(message.channel.parentId)) {
                try {
                    command.execute(commandsExecute_1.NO_REQUIRED_CATEGORIES, message, args);
                    return;
                } catch (e) { console.error(e); }
            }

            // check Channels
            let commandChannels = command.channels;
            if(commandChannels.length !== 0 && !commandChannels.includes(message.channel.id)) {
                try {
                    command.execute(commandsExecute_1.NO_REQUIRED_CHANNELS, message, args);
                    return;
                } catch (e) { console.error(e); }
            }

            // check args
            if(args.length < command.minArgs || ((args.length > command.maxArgs) && (command.maxArgs >= 0))) {
                try {
                    command.execute(commandsExecute_1.SYNTAX_ERROR, message, args);
                    return;
                } catch (e) { console.error(e); }
            }

            // command is good to run!
            try {
                instance.ConsoleLogInfo(
                    __filename,
                    `User "${message.author.tag}" ran the command "${firstElement}" (name > "${command.name}")`,
                    consolelLogLevels_1.COMMAND_RAN
                );
                command.execute(commandsExecute_1.CALL_BACK, message, args);
            } catch (e) { console.error(e); }
        })
    }

    async RegisterCommand(instance, file, defaultFunctions, dir) {
        let configuration = await require(file);
        let processedConfig = this.SetupConfig(instance, file, configuration, defaultFunctions);
        const command = new command_1.default(instance, this._client, processedConfig);
        let { aliases } = processedConfig;
        for(const alias of aliases) { this._commands.set(alias, command); }
        let name = aliases.shift();
        const commandCategory = file.replace(dir, '').replace(/\\[a-zA-Z0-9_]+\.js/g, '').replace('\\', ''); 
        if(commandCategory !== '' && this._categories.get(commandCategory)) {
            this._categories.get(commandCategory).commandObjects.push(command);
        }
        instance.ConsoleLogInfo(
            __filename,
            `Registered command "${name}" (Aliases > [${aliases.join(', ')}]) (Category > ${commandCategory}) from file "...${file.replace(dir, '')}"`,
            consolelLogLevels_1.DEFINED_OBJECTS
        );
        aliases.unshift(name);
    }

    SetupConfig(instance, file, configuration, defaultFunctions) {
        let { 
            name,
            aliases = [],
            description,
            expectedArgs,
            minArgs = 0,
            maxArgs = -1,
            permissions = [],
            roles = [],
            categories = [],
            channels = [],
            init,
            callback,
            syntaxError,
            noPermissions,
            noRoles,
            noCategories,
            noChannels, 
        } = configuration;
        
        const errorPrefix  = `Command located at "${file}"`;

        // name + aliases
        if(!name && (!aliases || aliases.length === 0)) { throw new Error(`${errorPrefix} is messing a name and aliases! Please set atlest one property.`); }
        if(typeof name !== 'string') { throw new Error(`${errorPrefix} does not have a string as a name.`); }
        if(typeof aliases === 'string') { aliases = [aliases]; }
        if (name && !aliases.includes(name.toLowerCase())) { aliases.unshift(name.toLowerCase()); }
        
        // description
        if(!description) {
            description = '';
        }

        // expectedArgs
        if(!expectedArgs) {
            expectedArgs = '';
        }

        // min + max args
        if((maxArgs >= 0) && (minArgs >  maxArgs)) { throw new Error(`${errorPrefix} has the property "minArgs" set to a bigger value then the property "maxArgs"!`); }
        
        // permissions
        if(typeof permissions === 'string') { permissions = [permissions]; }
        for(const perm of permissions) {
            if(!permissions_1.permissionList.includes(perm)) {
                throw new Error(`${errorPrefix} has an invalid permission node: "${perm}". Permissions must be all upper case and be one of the following: "${[
                    ...permissions_1.permissionList,
                ].join('", "')}"`);
            }
        }

        // roles
        if(typeof roles === 'string') { roles = [roles]; }

        // categories
        if(typeof categories === 'string') { categories = [categories]; }

        // channels
        if(typeof channels === 'string') { channels = [channels]; }

        // callback
        if(!callback) { throw new Error(`${errorPrefix} is messing the function "callback"!`); }
        
        /**
         * syntaxError
         * if there isnt any permission in the file
         * no need to check for function 
         */
        if(!syntaxError) {
           const default_syntaxError = defaultFunctions.syntaxError;
           if (!default_syntaxError) {
               this.#ErrorDefaultFunction(errorPrefix, 'syntaxError'); 
            } else { syntaxError = default_syntaxError; }
        }

        /**
         * noPermissions
         * if there isnt any permission in the file
         * no need to check for function 
         */
        if(!noPermissions && permissions.length !== 0) {
            const default_noPermissions = defaultFunctions.noPermissions;
            if (!default_noPermissions) {
                this.#ErrorDefaultFunction(errorPrefix, 'noPermissions'); 
            } else { noPermissions = default_noPermissions; }
        }
        
        /**
         * noRoles
         * if there isnt any roles in the file
         * no need to check for function
         */
        if(!noRoles && roles.length !== 0) {
            const default_noRoles = defaultFunctions.noRoles;
            if(!default_noRoles) {
                this.#ErrorDefaultFunction(errorPrefix, 'noRoles');
            } else { noRoles = default_noRoles; }
        }
        
        /** 
         * noCategories
         * if there isnt any categories in the file
         * no need to check for function
         */
        if(!noCategories && categories.length !== 0) {
            const default_noCategories = defaultFunctions.noCategories;
            if (!default_noCategories) {
                this.#ErrorDefaultFunction(errorPrefix, 'noCategories');
            } else { noCategories = default_noCategories; }
        }
        
        /**
         * noChannels
         * if there isnt any channels in the file
         * no need to check for function
         */
        if(!noChannels && channels.length !== 0) {
            const default_noChannels = defaultFunctions.noChannels;
            if (!default_noChannels) {
                this.#ErrorDefaultFunction(errorPrefix, 'noChannels');
            } else { noChannels = default_noChannels; }
        }

        if(init) {
            try {
                init(this._client, instance);
            } catch (e) { console.error(e); }
        }
        
        return {
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
            noChannels,
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
    setCategorySettings(instance, categories) {
        let categoryIndex = 0;
        for(const category of categories) {
            categoryIndex++;
            let Reasons = [];
            /* 
            name -  
            if name isn't specified, use folderName
            */
            
            // emoji + customEmoji
            let emojiFound;
            category.emoji = category.emoji.trim();
            if(category.emoji !== '') {
               if(category.customEmoji) { // custom emoji
                   if(category.emoji.match(Patterns.CustomEmojiPattern)) { // is <:aaaa:123456789>
                       emojiFound = this._client.emojis.cache.get(category.emoji.replace(/(<:.+:)|(>)/g, ""));
                   } else if(category.emoji.match(Patterns.SnowFlakePattern)) { // is 123456798
                       emojiFound = this._client.emojis.cache.get(category.emoji);
                   }
               } else { // is unicode
                   if(!category.emoji.match(Patterns.EmojiPattern)) {
                       emojiFound = category.emoji;
                   }
               }
               
               if(!emojiFound) { // emoji found, if custom = object else :aaa:
                   Reasons.push(`Couldn\'t find ${(category.customEmoji) ? "custom ": ""}emoji "${category.emoji}"`);
               }
            } else {
                Reasons.push(`Couldn\'t find emoji property`);
            }

            // folderName
            if (!category.folderName) { Reasons.push('Missing "folderName" as parameter'); }

            if (this._categories.has(category.folderName)) { 
                Reasons.push('Found another category with the same "folderName"');
            }


            // finish check 
            if (Reasons.length === 0) {
                this._categories.set(category.folderName, {
                    name: category.name,
                    emoji: emojiFound,
                    customEmoji: category.customEmoji || false,
                    folderName: category.folderName,
                    hidden: category.hidden || false,
                    options: category.options || {},
                    commandObjects: [],
                });
            } else {
                instance.ConsoleLogInfo(
                    __filename,
                    `Skipped registering category #${categoryIndex}! Reason: ${Reasons.join(',')}.`,
                    consolelLogLevels_1.GENERAL
                );
            }
        }

        // put hidden categories in last
        let hiddenCategories = new Collection();
        this._categories.sweep((category, folderName) => {
            if(category.hidden) {
                hiddenCategories.set(folderName, category);
                return true;
            } 

            return false;
        })

        for(const [folderName, category] of hiddenCategories) {
            this._categories.set(folderName, category);
        }

        instance.ConsoleLogInfo(
            __filename,
            `Loaded ${this._categories.size} categor${(this._categories.size === 1) ? "y": "ies"} from the category settings`,
            consolelLogLevels_1.DEFINED_OBJECTS
        );
    }

    #ErrorDefaultFunction(errorPrefix, functionName) {
        throw new Error(`${errorPrefix} is messing the function "${functionName}", and there isnt a "${functionName}" function in the default functions file! Please define one of the two.`);
    }
}

exports.default = CommandHandler;
module.exports = CommandHandler;