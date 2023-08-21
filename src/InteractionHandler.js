class InteractionHandler {
    _prefix;
    _allCustomIds = [];

    /**
     * Creates a interaction handler to help the command handle if the interaction is from its own ActionRow
     * @param {String} prefix the prefix to add to every new CustomID
     */
    constructor(prefix) {
        this._prefix = prefix;
    }

    /**
     * Adds the custom ID to the list and returns a new, throws exeption if id exists
     * @param {String} id the unique ID to add the prefix to 
     * @returns {String} the unique ID with the prefix added
     */
    createCustomID = (id) => { 
        const customID = `${this._prefix}${id}`;
        if (this._allCustomIds.includes(customID)) {
            throw new Error(`The CustomID "${customID}" already exists in the interaction handler with the prefix "${this._prefix}"!`);
        }

        this._allCustomIds.push(customID);
        return customID;
    }
    
    /**
     * Checks of the CustomID exists in the list, NOTE: this function checks with the prefix
     * @param {String} id the unique ID to check if it exists
     * @returns {Boolean} true if it exists, false otherwise
     */
    hasCustomID = (id) => { return this._allCustomIds.includes(id); }
    
    get prefix() { return this._prefix; }
}

exports.default = InteractionHandler;
module.exports = InteractionHandler;