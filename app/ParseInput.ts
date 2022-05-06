import {ParseError} from "./ParseError";

/**
 * Class to parse input for the "Where In The World" program
 *
 * @author Hugo Phibbs
 */
export class ParseInput {

    private longitudeDirections = ["E", "W"]
    private latitudeDirections = ["N", "S"]

    /**
     * Valid directions on a map
     * @private
     */
    private validDirections = this.latitudeDirections.concat(this.longitudeDirections)

    /**
     * Constructor for a ParseInput object
     */
    constructor() {
    }

    // Handling output

    /**
     * Constructs a GeoJSON object from inputted parameters
     *
     * @param latitude number of latitude
     * @param longitude number for longitude
     * @param label string for label of the point this GEOJSON object describes, default is null
     * @private
     */
    private static constructGeoJSON(latitude: number, longitude: number, label: string = null) {
        let geoJSON = {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Point",
                "coordinates": [longitude, latitude]
            }
        }
        if (label != null) {
            geoJSON["properties"] = {"name": label}
        }
        return geoJSON;
    }

    // Parsing Lines of input

    /**
     * Parses lines of input from a user.
     *
     * Main method for ParseInput
     *
     * @param inputtedLines
     * @return object array containing GeoJSON features which are the inputted lines parsed into GeoJSON
     * @private
     */
    public parseLines(inputtedLines: string[]): object[] {
        let geoJSONFeatures: object[] = []
        for (let line of inputtedLines) {
            let geoJSONFeature = this.parseLine(line)
            if (geoJSONFeature != null) {
                geoJSONFeatures.push(geoJSONFeature);
            }
        }
        return geoJSONFeatures
    }

    /**
     * Parses a coordinates line of input from a user
     *
     * Prints to output if the inputted line could not be parsed
     *
     * Line should have coordinates in standard or in DMS form, followed by an optional string label
     *
     * @param line string for line of input from a user
     * @return a the inputted line parsed into a GeoJSON object, otherwise null if the line couldn't be parsed
     * @private
     */
    public parseLine(line: string): object {
        try {
            return this.parseLineHelper(line)
        } catch (error) {
            if (error instanceof ParseError) {
                console.log(`Unable to Process: ${line}`)
            } else {
                throw error
            }
        }
        return null
    }

    /**
     * Helper for parseLine(string), made it into its own public method in order to throw errors up to test level.
     *
     * Does the actual logic part
     *
     * @param line string for a line of input from a user
     * @return object for a GeoJSON object constructed
     * @throws ParseError if the inputted line could not be parsed into GeoJSON
     */
    public parseLineHelper(line: string): object {
        ParseInput.checkLine(line)
        line = line.trim()
        let components = this.parseLabel(line)
        let latLongObj = this.parseCoords(components['coords'])
        return ParseInput.constructGeoJSON(latLongObj["latitude"], latLongObj["longitude"], components["label"])
    }

    /**
     * Runs basic checks on an inputted line
     *
     * Throws a ParseError if the inputted line isn't valid
     *
     * @param line string for an inputted line
     * @private
     */
    private static checkLine(line: string) {
        if (line == "") {
            throw new ParseError("Line cannot be an empty string!")
        } else if (line == null) {
            throw new ParseError("Line cannot be null")
        }
    }

    /**
     * Checks if an inputted line can be parsed or not
     *
     * Implemented for easy testing
     *
     * @param line string for line to be checked
     * @return boolean if the line can be parsed or not
     */
    public canParseLine(line: string): boolean {
        try {
            this.parseLineHelper(line)
            return true
        } catch (error) {
            if (error instanceof ParseError) {
                return false
            } else {
                throw error
            }
        }
    }

    // Lower level parsing methods

    /**
     * Finds if there is a label attached to inputted coordinates
     *
     * If it does, returns the attached label, and the inputted coordinates with the
     * label removed.
     *
     * @param line for inputted coordinates from a user, with an optional label
     * @return object with keys for 'coords' and 'label'. If the inputted line does not have a label, then the key for 'label' is left null
     * @private
     */
    public parseLabel(line: string): { 'label': string, 'coords': string } {
        let splitLine = line.split(" ")
        if (splitLine.length < 2) {
            throw new ParseError("Input is invalid!, Needs to have a length of more than 2!")
        }
        let i = splitLine.length - 1;
        let lastComponent = ""
        let labelComponents: string[] = []
        while (i >= 0) {
            lastComponent = splitLine[i]
            if (!ParseInput.isAlphabetical(lastComponent) || this.validDirections.includes(lastComponent)) {
                break
            }
            labelComponents.push(lastComponent)
            i -= 1
        }
        if (labelComponents.length > 0) {
            splitLine = splitLine.slice(0, -labelComponents.length)
            return {
                'label': labelComponents.reverse().join(" "),
                'coords': splitLine.join(" ")
            }
        }
        return {
            'label': null,
            'coords': splitLine.join(" ")
        }
    }

    /**
     * Parses the part of a line from a user that is assumed to contain coordinates in some form.
     *
     * @return object with keys for values for latitude and longitude. Each rounded to 6dp
     * @private
     * @param coords string for coordinates
     */
    public parseCoords(coords: string): { latitude: number, longitude: number } {
        let latLongObj
        coords = ParseInput.removeCommaFromCoords(coords);
        try {
            latLongObj = this.parseStandardForm(coords)
        } catch (error) {
            if (error instanceof ParseError) {
                latLongObj = this.parseDegreesMinutesSecondsForm(coords)
            } else {
                throw error
            }
        }
        latLongObj['latitude'] = ParseInput.scaleLatitude(latLongObj['latitude']);
        latLongObj['longitude'] = ParseInput.scaleLongitude(latLongObj['longitude'])
        return ParseInput.roundLatLongObj(latLongObj)
    }

    // Parsing Standard Form

    /**
     * Parses an input from an user, assuming that it is in standard form.
     *
     * Throws a Parse error if this cannot be completed
     *
     * It is assumed that there is no label attached
     *
     * @param coords string for a coords inputted from a user, with separating comma removed
     * @return object for coords parsed if it can be
     * @private
     */
    private parseStandardForm(coords: string): object {
        console.assert(ParseInput.countCharInString(coords, ",") == 0, "Line cannot contain commas!")
        let splitLine = coords.split(" ");
        switch (splitLine.length) {
            case 2:
                return {
                    latitude: ParseInput.convertStringToNumber(splitLine[0]),
                    longitude: ParseInput.convertStringToNumber(splitLine[1])
                };
            case 3:
                return this.handleStandardFormLength3(splitLine);
            case 4:
                return this.handleStandardFormLength4(splitLine)
            default:
                throw new ParseError("Inputted coords could not be parsed")
        }
    }

    /**
     * Handles case where an inputted line from a user is in (supposed) standard form, and it has a length of 3
     * (excludes a label)
     *
     * @param splitLine string array for a split line from a user
     * @return object with keys for latitude and longitude
     * @private
     */
    private handleStandardFormLength3(splitLine: string[]): object {
        console.assert(splitLine.length == 3, "Split line must have a length of 3");
        let directionIndex: number
        if (this.validDirections.includes(splitLine[2])) {
            directionIndex = 2
        } else if (this.validDirections.includes(splitLine[1])) {
            directionIndex = 1
        } else {
            throw new ParseError("Split line could not be parsed!")
        }
        return this.handleStandardFormLengthLength3Helper(splitLine, directionIndex)
    }

    /**
     * Helper method for handleStandardFormLength3
     *
     * Extracts latitude and longitude values from an inputted standard form
     *
     * @param splitLine string array for a split line from a user
     * @param directionIndex number for index that a direction is specified at
     * @return object, for extracted latitude values
     * @private
     */
    private handleStandardFormLengthLength3Helper(splitLine: string[], directionIndex: number): object {
        console.assert(splitLine.length == 3, "Split line must have a length of 3");
        console.assert(1 <= directionIndex && directionIndex < 3, "Direction index is not in range")
        let direction = splitLine[directionIndex]
        let indexes = [0, 1, 2]
        indexes.splice(directionIndex, 1)
        indexes.splice(directionIndex - 1, 1)
        let firstCoord = ParseInput.convertStringToNumber(splitLine[indexes[0]]);
        let secondCoord = this.convertLongLatWithDirection(ParseInput.convertStringToNumber(splitLine[directionIndex - 1]), direction)
        if (this.longitudeDirections.includes(direction)) {
            return {latitude: firstCoord, longitude: secondCoord}
        } else {
            return {latitude: secondCoord, longitude: firstCoord}
        }
    }

    /**
     * Handles case where an inputted standard form has a length of 4
     *
     * @param splitLine string array for a split line from a user
     * @return object with keys for latitude and longitude values
     * @private
     */
    private handleStandardFormLength4(splitLine: string[]): object {
        console.assert(splitLine.length == 4, "Split line must have a length of 4")
        let firstDirection = splitLine[1]
        let secondDirection = splitLine[3]
        let firstCoord = this.convertLongLatWithDirection(ParseInput.convertStringToNumber(splitLine[0]), firstDirection)
        let secondCoord = this.convertLongLatWithDirection(ParseInput.convertStringToNumber(splitLine[2]), secondDirection)
        if (this.latitudeDirections.includes(firstDirection) && this.longitudeDirections.includes(secondDirection)) {
            return {latitude: firstCoord, longitude: secondCoord}
        } else if (this.longitudeDirections.includes(firstDirection) && this.latitudeDirections.includes(secondDirection)) {
            return {latitude: secondCoord, longitude: firstCoord}
        } else {
            throw new ParseError("Inputted split line doesn't contain mutually exclusive directions!")
        }
    }

    // Parsing DMS form

    /**
     * Attempts to parse coordinates according to a degrees-minutes-seconds format
     *
     * @param coords string for inputted coords from a user
     * @return object for the inputted coords in standard form, with keys for 'latitude' and 'longitude' respectively
     * @throws ParseError if the inputted coords could not be parsed as described
     * @private
     */
    private parseDegreesMinutesSecondsForm(coords: string): object {
        console.assert(ParseInput.countCharInString(coords, ",") == 0, "Coordinates cannot contain a separating comma!");
        // TODO handle length of coords with no comma!
        let coordsDirectionObj = this.stripDirectionsDMS(coords);
        coords = coordsDirectionObj['coords']
        let directions = coordsDirectionObj['directions']
        let splitCoords = coords.split(" ")
        let firstCoord, secondCoord;
        if (!(splitCoords.length == 4 || splitCoords.length == 6)) {
            throw new ParseError("Length of DMS coords is not valid!");
        }
        let mid = Math.floor(splitCoords.length / 2);
        firstCoord = splitCoords.slice(0, mid).join(" ")
        secondCoord = splitCoords.slice(mid).join(" ")
        return {
            "latitude": this.dmsCoordsToLatLong(firstCoord, directions[0]),
            "longitude": this.dmsCoordsToLatLong(secondCoord, directions[1])
        }
    }

    /**
     * Removes directions from a coordinate string. Returns any directions in order they were removed
     *
     * Used for DMS coordinates only, as ordering of Standard form complicates things.
     *
     * @param coords string for coords to be removed
     * @return object with a key 'coords' for the inputted coords without any directions,
     * and an array of length 2 containing any direction characters removed. The ordering of this array corresponds to which
     * coordinate a direction specifies. If a coordinate is not specified by any direction, direction is left null.
     * @throws ParseError if inputted coordinates contain more than 2 directions
     * @private
     */
    private stripDirectionsDMS(coords: string): { 'coords': string, 'directions': string[] } {
        let splitCoords = coords.split(" ")
        let directions = [null, null]
        let directionIndexes = []
        let lastIndex = splitCoords.length - 1
        let mid = Math.floor(splitCoords.length / 2)
        switch (splitCoords.length) {
            case 4:
                break;
            case 5:
            case 7:
                if (this.directionIsValid(splitCoords[mid])) {
                    directions[0] = splitCoords[mid]
                    directionIndexes.push(mid)
                } else if (this.directionIsValid(splitCoords[lastIndex])) {
                    directions[1] = splitCoords[lastIndex]
                    directionIndexes.push(lastIndex)
                }
                break;
            case 6:
            case 8:
                mid--
                if (this.directionIsValid(splitCoords[mid])) {
                    directions[0] = splitCoords[mid];
                    directions[1] = splitCoords[lastIndex]
                    directionIndexes.push(mid)
                    directionIndexes.push(lastIndex)
                }
                break;
            default:
                throw new ParseError("Length of inputted DMS phrase is not valid!")
        }
        let i = 0;
        for (let index of directionIndexes) {
            splitCoords.splice(index - i, 1);
            i = 1;
        }
        return {
            'coords': splitCoords.join(" "),
            'directions': directions
        }
    }

    /**
     * Checks if an inputted direction is valid or not
     *
     * // TODO refactor code for this!
     *
     * @param direction
     * @private
     */
    private directionIsValid(direction: string): boolean {
        return this.validDirections.includes(direction)
    }

    /**
     * Converts a string describing a Degrees-Minutes-Seconds coordinate into a standard form latitude/longitude
     *
     * Accounts for if a Degrees-Minutes-Seconds coordinate doesn't have a value for seconds
     *
     * @param dmsCoords string as described
     * @param direction string for direction of these DMS coords, default is null if no direction specified by user.
     * @return number for latitude or longitude as described
     * @private
     */
    private dmsCoordsToLatLong(dmsCoords: string, direction: string = null): number {
        dmsCoords = dmsCoords.trim()
        let latLong: number
        let dmsNumArray = ParseInput.stringToNumberArray(ParseInput.removeMarkersFromDMSForm(dmsCoords.split(" ")));
        switch (dmsNumArray.length) {
            case 2:
                latLong = ParseInput.dMSToStandardForm(dmsNumArray[0], dmsNumArray[1])
                break
            case 3:
                latLong = ParseInput.dMSToStandardForm(dmsNumArray[0], dmsNumArray[1], dmsNumArray[2])
                break
            default:
                throw new ParseError("Input could not be parsed assuming its in DMS form!")
        }
        if (direction != null) {
            return this.convertLongLatWithDirection(latLong, direction)
        }
        return latLong;
    }

    /**
     * Removes the markers from a Degrees-minutes-seconds form angular coordinates (either latitude or longitude)
     *
     * Then returns the inputted array with markers removed if applicable
     *
     * @param dmsCoords: array for the degrees-minutes-seconds form of an angular position on earth
     * @return array as described
     * @private
     */
    private static removeMarkersFromDMSForm(dmsCoords: string[]) {
        let markers = ["°", "\"", "\'"]
        for (let i = 0; i < dmsCoords.length; i++) {
            let part = dmsCoords[i]
            console.assert(part.length > 0, "Part must have a length greater than zero!")
            for (let marker of markers) {
                if (part[-1] == marker) {
                    dmsCoords[i] = part.slice(0, -1) // remove marker
                    break
                }
            }
        }
        return dmsCoords
    }

    /**
     * Converts an inputted latitude/longitude expressed in degrees-minutes-seconds to
     * standard form decimal degrees.
     *
     * Credit to: https://www.rapidtables.com/convert/number/degrees-minutes-seconds-to-degrees.html
     *
     * @param degrees number
     * @param minutes number
     * @param seconds number
     * @return number for standard form latitude/longitude as described
     * @private
     */
    private static dMSToStandardForm(degrees: number, minutes: number, seconds: number = 0): number {
        return degrees + minutes / 60 + seconds / 3600
    }

    // General methods

    /**
     * Removes a separating comma from inputted coordinates, if it exists
     *
     * @throw ParseError if the inputted coordinates contain more than one comma
     * @param coords string for coordinates as inputted from a user
     * @return inputted coords, with it's separating comma removed if applicable
     * @private
     */
    private static removeCommaFromCoords(coords: string): string {
        let commaCount = ParseInput.countCharInString(coords, ",")
        switch (commaCount) {
            case 0:
                return coords
            case 1:
                return coords.split(",").join('')
            default:
                throw new ParseError("Inputted coords should only contain 1 comma")
        }
    }

    /**
     * Converts a given latitude or longitude with a given direction into a number across the whole range of latitude or longitude.
     *
     * For example, 120 W is converted to -120.
     *
     * @param latOrLong number for a latitude or longitude value
     * @param direction string for the direction of latOrLong
     * @return number as described
     * @private
     */
    private convertLongLatWithDirection(latOrLong: number, direction: string): number {
        if (!(this.validDirections.includes(direction))) {
            throw new ParseError(`Inputted direction ${direction} is not valid!`)
        }
        if (["S", "W"].includes(direction)) {
            return -latOrLong
        }
        return latOrLong
    }

    /**
     * Checks if inputted latitude and longitude values are valid
     *
     * @param latitude number
     * @param longitude number
     * @throws ParseError if the inputted latLongObj contains invalid latitude or longitude values
     * @private
     */
    private static checkLatitudeAndLongitude(latitude: number, longitude: number): void {
        if (!(ParseInput.latitudeInRange(latitude) && ParseInput.longitudeInRange(longitude))) {
            throw new ParseError("Latitude and longitude values are not in range!")
        }
    }

    /**
     * Finds out if a given latitude value is in range or not
     *
     * @param latitude number value for latitude
     * @return boolean as described
     * @private
     */
    private static latitudeInRange(latitude: number): boolean {
        return ParseInput.absValueInRange(latitude, 90)
    }

    /**
     * Scales a latitude value to be in the range -90 to 90.
     *
     * I.e. -100->10
     * @param latitude number
     * @return number as described
     * @private
     */
    private static scaleLatitude(latitude: number): number {
        let mod360 = Math.abs(latitude % 360)
        let sign = Math.sign(latitude)
        if (mod360 <= 90) {
            return sign * mod360
        } else if (90 < mod360 && mod360 <= 270) {
            return sign * (180 - mod360);
        }
        return sign * (mod360-360)
    }

    /**
     * Scales a longitude value to be in range -180 and 180
     *
     * @param longitude number
     * @return number as described
     * @private
     */
    private static scaleLongitude(longitude: number): number {
        let mod360 = Math.abs(longitude % 360)
        let sign = Math.sign(longitude)
        if (mod360 <= 180) {
            return sign * mod360
        } else {
            return sign * (180-longitude)
        }
    }

    /**
     * Finds out if a given longitude value is in range or not
     *
     * @param longitude number value for latitude
     * @return boolean as described
     * @private
     */
    private static longitudeInRange(longitude: number): boolean {
        return ParseInput.absValueInRange(longitude, 180)
    }

    /**
     * Rounds an object describing latitude and longitude as described by roundLatOrLong(number)
     *
     * @param latLongObj object as described
     * @return another object that is latLongObj rounded
     * @private
     */
    private static roundLatLongObj(latLongObj: { latitude: number, longitude: number }): { latitude: number, longitude: number } {
        return {
            latitude: ParseInput.roundLatOrLong(latLongObj.latitude),
            longitude: ParseInput.roundLatOrLong(latLongObj.longitude)
        }
    }

    /**
     * Rounds a number for latitude or longitude to 6dp
     *
     * @param latOrLong number for latitude or longitude
     * @return number as described
     * @private
     */
    private static roundLatOrLong(latOrLong: number): number {
        return parseFloat(latOrLong.toFixed(6))
    }

    // Utility Methods

    /**
     * Checks if a string contains only alphabet characters. Not to confused as finding if a string is in alphabetical
     * order
     *
     * @param str string to be checked
     * @boolean if a string is alphabetical or not
     * @private
     */
    private static isAlphabetical(str: string): boolean {
        let char
        for (let i = 0; i < str.length; i++) {
            char = str[i]
            if (!(/[a-zA-Z]/).test(char)) {
                return false
            }
        }
        return true
    }

    /**
     * Counts the number of occurrences of a character in a string
     *
     * @param str inputted string
     * @param char string for a character
     * @return number for count of a given character as described
     * @private
     */
    private static countCharInString(str: string, char: string): number {
        console.assert(char.length == 1, "Inputted char must have a length of 1")
        let count = 0
        for (let i = 0; i < str.length; i++) {
            if (str.charAt(i) == char) {
                count++
            }
        }
        return count
    }

    /**
     * Attempts to convert a string array to a number array.
     *
     * Preserves ordering of elements
     *
     * @param array inputted string array
     * @throws ParseError if the inputted could not be converted
     * @private
     */
    private static stringToNumberArray(array: string[]): number[] {
        let result: number[] = []
        for (let str of array) {
            let strNum = parseFloat(str)
            if (isNaN(strNum)) {
                throw new ParseError("String array could not be converted to a number array")
            }
            result.push(strNum)
        }
        return result
    }

    /**
     * Finds out if the absolute value of a given number is in less than or equal to a number or not
     *
     * @param val number for value to be checked
     * @param limit number for a limit of absolute value
     * @return boolean as described
     * @private
     */
    private static absValueInRange(val: number, limit: number): boolean {
        return Math.abs(val) <= limit
    }

    /**
     * Finds out if an inputted string is valid or not
     *
     * @param val string to be checked
     * @return boolean as described
     * @private
     */
    private static strIsNumber(val: string): boolean {
        return (!isNaN(parseFloat(val)))
    }

    /**
     * Converts a given string to a number
     *
     * @param str value for string
     * @return number for the inputted string converted
     * @throw ParseError if the inputted string could not be converted
     * @private
     */
    private static convertStringToNumber(str: string): number {
        if (ParseInput.strIsNumber(str)) {
            return parseFloat(str)
        }
        throw new ParseError("String could not be converted")
    }
}
