/**
 * Class to represent an error where a line of input from a user could not be parsed
 */
export class ParseError extends Error {

    /**
     * Constructor for a ParseError
     *
     * @param message String for a message to accompany this error
     */
    constructor(message: string) {
        super(message);
    }
}