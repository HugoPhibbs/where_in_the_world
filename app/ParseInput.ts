import {ParseError} from "./ParseError";

let prompt_sync = require("prompt-sync")();

/*
Class to parse input for the "Where In The World" program
 */
export class ParseInput {

    private longitudeDirections = ["E", "W"]
    private latitudeDirections= ["N", "S"]

    /**
     * Valid directions on a map
     * @private
     */
    private validDirections = this.latitudeDirections.concat(this.longitudeDirections)

    /**
     * Constructor for a ParseInput object
     */
    constructor() {}

    /*
    Starts getting input from a user
     */
    public start(): void {
        let input = ParseInput.getInput()
        let geoJSONFeatures = this.parseLines(input);
        this.writeToOutput(geoJSONFeatures)
    }

    /**
     * Parses lines of input from a user
     *
     * @param inputtedLines
     * @return object array containing GeoJSON objects which are the inputted lines parsed into GeoJSON
     * @private
     */
    private parseLines(inputtedLines : string[]) : object[]{
        let geoJSONFeatures : object[] = []
        for (let line in inputtedLines) {
            geoJSONFeatures.push(this.parseLine(line));
        }
        return geoJSONFeatures
    }

    /**
     * Gets an input of lines from a user.
     *
     * These lines are to be converted into a GeoJSON format
     *
     * @return list of strings for the inputted lines from a user
     * @private
     */
    private static getInput(): string[] {
        console.log("Welcome to 'Where in the world is CS'\n" +
            "Please enter locations one per line\n" +
            "Press enter on an empty line to submit")
        let output: string[] = []
        let currLine;
        currLine = prompt_sync()
        while (currLine != ""){
            output.push(currLine);
            currLine = prompt_sync()
        }
        return output
    }

    /**
     * Parses the part of a line from a user that is assumed to contain coordinates in some form.
     *
     * @return object with keys for values for latitude and longitude. Each rounded to 6dp
     * @private
     * @param coords string for coordinates
     */
    public parseCoords(coords : string) : { latitude:number, longitude:number } {
        let latLongObj
        try {
            latLongObj = this.parseStandardForm(coords)
        } catch (error) {
            if (error instanceof ParseError) {
                latLongObj = this.parseDegreesMinutesSecondsForm(coords)
            } else {
                throw error
            }
        }
        this.checkLatitudeAndLongitude(latLongObj["latitude"], latLongObj["longitude"])
        return this.roundLatLongObj(latLongObj)
    }

    /**
     * Rounds an object describing latitude and longitude as described by roundLatOrLong(number)
     *
     * @param latLongObj object as described
     * @return another object that is latLongObj rounded
     * @private
     */
    private roundLatLongObj(latLongObj : {latitude:number, longitude:number})  : { latitude:number, longitude:number } {
        return {
            latitude: this.roundLatOrLong(latLongObj.latitude),
            longitude: this.roundLatOrLong(latLongObj.longitude)
        }
    }

    /**
     * Parses a coordinates line of input from a user
     *
     * Prints to output if the inputted line could not be parsed
     *
     * @param line string for line of input from a user
     * @return a the inputted line parsed into a GeoJSON object
     * @private
     */
    public parseLine(line: string): object {
        try {
             return this.parseLineHelper(line)
        }
        catch (error){
            if (error instanceof ParseError) {
                console.log("Line of input could not be parsed!")
            } else {
                throw error
            }
        }
    }

    /**
     * Runs basic checks on an inputted line
     *
     * Throws a ParseError if the inputted line isn't valid
     *
     * @param line string for an inputted line
     * @private
     */
    private checkLine(line : string) {
        if (line == "") {
            throw new ParseError("Line cannot be an empty string!")
        } else if (line == null){
            throw new ParseError("Line cannot be null")
        }
    }

    /**
     * Writes a GeoJSON object to a JSON file
     *
     * The output of this program
     *
     * @private
     * @param geoJSONFeatures array containing GeoJSON feature objects
     */
    private writeToOutput(geoJSONFeatures : object[]) : void{
        let geoJSONOutput = {"type" : " FeatureCollection", "features" : []}
        for (let geoJSON in geoJSONFeatures) {
            geoJSON["features"].push(geoJSON)
        }
        let fs = require("fs");
        fs.writeFile("GeoJSON_FeatureCollection", JSON.stringify(geoJSONOutput))
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
    public parseLineHelper(line : string) : object {
        this.checkLine(line)
        line = line.trim()
        let components = this.parseLabel(line)
        let latLongObj = this.parseCoords(components['coords'])
        return ParseInput.constructGeoJSON(latLongObj["latitude"], latLongObj["longitude"], components["label"])
    }

    /**
     * Checks if an inputted line can be parsed or not
     *
     * Implemented for easy testing
     *
     * @param line string for line to be checked
     * @return boolean if the line can be parsed or not
     */
    public canParseLine(line : string) : boolean {
        try {
            this.parseLineHelper(line)
            return true
        }
        catch (error) {
            if (error instanceof ParseError) {
                return false
            }
            else {
                throw error
            }
        }
    }

    /**
     * Constructs a GeoJSON object from inputted parameters
     *
     * @param latitude number of latitude
     * @param longitude number for longitude
     * @param label string for label of the point this GEOJSON object describes, default is null
     * @private
     */
    private static constructGeoJSON(latitude: number, longitude: number, label : string=null) {
        let geoJSON = {
            "type" : "Feature",
            "geometry": {
                "type" : "point",
                "coordinates" : [latitude, longitude]
                }
            }
        if (label == null) {
            geoJSON["properties"] = {"name" : label}
        }
        return geoJSON;
    }

    /**
     * Parses an input from an user, assuming that it is in standard form.
     *
     * Throws a Parse error if this cannot be completed
     *
     * It is assumed that there is no label attached
     *
     * @param line string for a line inputted from a user
     * @return object for the line parsed if it can be
     * @private
     */
    private parseStandardForm(line : string) : object{
        let splitLine
        if (ParseInput.countCharInString(line, ",") > 0) {
            splitLine = this.handleStandardFormWithCommas(line)
        }
        else {
            splitLine = line.split( " ")
        }
        return this.handleStandardFormSplitLine(splitLine);
    }

    /**
     * Parses an input that is assumed to be in standard form, split into each word (elements)
     *
     * @param splitLine string array for a split line of input from a user
     * @return object, with keys for latitude and longitude
     * @private
     */
    private handleStandardFormSplitLine(splitLine : string[]) : object {
        switch (splitLine.length) {
            case 2:
                return {latitude : this.convertStringToNumber(splitLine[0]), longitude: this.convertStringToNumber(splitLine[1])};
            case 3:
                return this.handleStandardFormLength3(splitLine);
            case 4:
                return this.handleStandardFormLength4(splitLine)
            default:
                throw new ParseError("Inputted line could not be parsed")
        }
    }

    /**
     * Handles case where an inputted standard form has a length of 4
     *
     * @param splitLine stirng array for a split line from a user
     * @return object with keys for latitude and longitude values
     * @private
     */
    private handleStandardFormLength4(splitLine : string[]) : object{
        console.assert(splitLine.length == 4, "Split line must have a length of 4")
        let firstDirection = splitLine[1]
        let secondDirection = splitLine[3]
        let firstCoord = this.convertLongLatWithDirection(this.convertStringToNumber(splitLine[0]), firstDirection)
        let secondCoord = this.convertLongLatWithDirection(this.convertStringToNumber(splitLine[2]), secondDirection)
        if (this.latitudeDirections.includes(firstDirection) && this.longitudeDirections.includes(secondDirection)) {
            return {latitude : firstCoord, longitude : secondCoord}
        }
        else if (this.longitudeDirections.includes(firstDirection) && this.latitudeDirections.includes(secondDirection)) {
            return {latitude : secondCoord, longitude : firstCoord}
        }
        else {
            throw new ParseError("Inputted split line doesnt contain mutually exclusive directions!")
        }
    }

    /**
     * Rounds a number for latitude or longitude to 6dp
     *
     * @param latOrLong number for latitude or longitude
     * @return number as described
     * @private
     */
    private roundLatOrLong(latOrLong : number) : number{
        return parseFloat(latOrLong.toFixed(6))
    }

    /**
     * Handles case where an inputted line from a user is in (supposed) standard form, and it has a length of 3
     * (excludes a label)
     *
     * @param splitLine string array for a split line from a user
     * @return object with keys for latitude and longitude
     * @private
     */
    private handleStandardFormLength3(splitLine : string[]) : object{
        console.assert(splitLine.length == 3, "Split line must have a length of 3");
        let directionIndex : number
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
    private handleStandardFormLengthLength3Helper(splitLine : string[], directionIndex : number) :object {
        console.assert(splitLine.length == 3, "Split line must have a length of 3");
        console.assert(1 <= directionIndex && directionIndex < 3, "Direction index is not in range")
        let direction = splitLine[directionIndex]
        let indexes = [0, 1, 2]
        indexes.splice(directionIndex, 1)
        indexes.splice(directionIndex-1, 1)
        let firstCoord = this.convertStringToNumber(splitLine[indexes[0]]);
        let secondCoord = this.convertLongLatWithDirection(this.convertStringToNumber(splitLine[directionIndex-1]), direction)
        if (this.longitudeDirections.includes(direction)) {
            return {latitude : firstCoord, longitude : secondCoord}
        } else {
            return  {latitude :secondCoord, longitude : firstCoord}
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
     * @throws ParseError if the inputted latOrLong value is negative
     * @private
     */
    private convertLongLatWithDirection(latOrLong : number, direction : string) : number {
        if (!(this.validDirections.includes(direction))) {
            throw new ParseError(`Inputted direction ${direction} is not valid!`)
        }
        if (latOrLong < 0){
            throw new ParseError("Inputted latitude or longitude value is negative")
        }
        if (["S", "W"].includes(direction)) {
            return -latOrLong
        }
        return latOrLong
    }

    /**
     * Finds out if a given latitude value is in range or not
     *
     * @param latitude number value for latitude
     * @return boolean as described
     * @private
     */
    private latitudeInRange(latitude : number) : boolean {
        return ParseInput.absValueInRange(latitude, 90)
    }

    /**
     * Finds out if a given longitude value is in range or not
     *
     * @param longitude number value for latitude
     * @return boolean as described
     * @private
     */
    private longitudeInRange(longitude : number) : boolean {
        return ParseInput.absValueInRange(longitude, 180)
    }

    /**
     * Handles case where a (supposed) input from a user is in standard form and has commas
     *
     * @param line string for a line of input from a user
     * @return string array for the inputted line split into its words
     * @throws ParseError if the inputted line is not a valid form
     * @private
     */
    private handleStandardFormWithCommas(line : string) : string[] {
        if (ParseInput.countCharInString(line, ",") != 1){
            throw new ParseError("Inputted line should only contain 1 comma")
        }
        return line.split(",").join('').split(" ")

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
    private parseDegreesMinutesSecondsForm(coords : string) : object {
        let splitLine = coords.split(",")
        if (splitLine.length == 2) {
            return {
                "latitude" : this.dmsStringToStandardCoords(splitLine[0]),
                "longitude" : this.dmsStringToStandardCoords(splitLine[1])
                }
            }
        throw new ParseError("Could not be parsed to degrees-minutes-seconds format")
    }


    /**
     * Converts a string describing a Degrees-Minutes-Seconds coordinate into a standard form latitude/longitude
     *
     * Accounts for if a Degrees-Minutes-Seconds coordinate doesn't have a value for seconds
     *
     * @param dmsString string as described
     * @return number for latitude or longitude as described
     * @private
     */
    private dmsStringToStandardCoords(dmsString : string) : number {
        dmsString = dmsString.trim()
        let dmsNumArray = this.stringToNumberArray(this.removeMarkersFromDMSForm(dmsString.split(" ")));
        switch (dmsNumArray.length) {
            case 2:
                return this.dMSToStandardForm(dmsNumArray[0], dmsNumArray[1])
            case 3:
                return this.dMSToStandardForm(dmsNumArray[0], dmsNumArray[1], dmsNumArray[2])
            default:
                throw new ParseError("Input could not be parsed assuming its in DMS form!")
        }
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
    private removeMarkersFromDMSForm(dmsCoords : string[]) {
        let markers = ["°", "\"", "\'"]
        for (let i = 0; i < dmsCoords.length; i++) {
            let part = dmsCoords[i]
            console.assert(part.length > 0, "Part must have a length greater than zero!")
            for (let marker in markers) {
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
    private dMSToStandardForm(degrees: number, minutes: number, seconds: number=0): number {
        return degrees + minutes / 60 + seconds / 3600
    }

    // General methods

    /**
     * Checks if inputted latitude and longitude values are valid
     *
     * @param latitude number
     * @param longitude number
     * @throws ParseError if the inputted latLongObj contains invalid latitude or longitude values
     * @private
     */
    private checkLatitudeAndLongitude(latitude : number, longitude : number) : void {
        if (!(this.latitudeInRange(latitude) && this.longitudeInRange(longitude))){
            throw new ParseError("Latitude and longitude values are not in range!"   )
        }
    }

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
    public parseLabel(line : string) : object {
        let splitLine = line.split(" ")
        if (splitLine.length < 2) {
            throw new ParseError("Input is invalid!, Needs to have a length of more than 2!")
        }
        let i = splitLine.length - 1;
        let lastComponent = ""
        let labelComponents : string[] = []

        while (i >= 0) {
            lastComponent = splitLine[i]
            if (!ParseInput.isAlphabetical(lastComponent) || this.validDirections.includes(lastComponent)) {
                break
            }
            labelComponents.push(lastComponent)
            i -= 1
        }

        if (labelComponents.length > 0) {
            splitLine = splitLine.slice(0, -1)
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

    // Utility Methods

    /**
     * Checks if a string contains only alphabet characters. Not to confused as finding if a string is in alphabetical
     * order
     *
     * @param str string to be checked
     * @boolean if a string is alphabetical or not
     * @private
     */
    private static isAlphabetical(str : string) : boolean {
        let char
        for (let i = 0; i < str.length; i ++) {
            char = str[i]
            if (!(/[a-zA-Z]/).test(char)) {
                return false
            }
        }
        return true
    }

    /**
     * Counts the number of occurances of a character in a string
     *
     * @param str inputted string
     * @param char string for a character
     * @return number for count of a given character as described
     * @private
     */
    private static countCharInString(str : string, char : string) : number{
        console.assert(char.length == 1, "Inputted char must have a length of 1")
        let count = 0
        for (let i = 0; i< str.length; i++) {
            if (str.charAt(i) == char) {
                count ++
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
    private stringToNumberArray(array : string[]) : number[]{
        let result : number[] = []
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
    private static absValueInRange(val : number, limit : number) : boolean {
        return Math.abs(val) <= limit
    }

    /**
     * Finds out if an inputted string is valid or not
     *
     * @param val string to be checked
     * @return boolean as described
     * @private
     */
    private static strIsNumber(val : string) : boolean {
        return (!isNaN(parseFloat(val)))
    }

    /**
     * Converts a given string to a number
     *
     * @param str value for strig
     * @return number for the inputted string converted
     * @throw ParseError if the inputted string could not be converted
     * @private
     */
    private convertStringToNumber(str : string) : number {
        if (ParseInput.strIsNumber(str)) {
            return parseFloat(str)
        }
        throw new ParseError("String could not be converted")
    }
}
