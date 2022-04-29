"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseError = void 0;
/**
 * Class to represent an error where a line of input from a user could not be parsed
 */
class ParseError extends Error {
    /**
     * Constructor for a ParseError
     *
     * @param message String for a message to accompany this error
     */
    constructor(message) {
        super(message);
    }
}
exports.ParseError = ParseError;
//# sourceMappingURL=ParseError.js.map