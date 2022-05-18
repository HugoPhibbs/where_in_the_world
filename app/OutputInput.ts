/**
 * File with methods to handle getting input from a user, then writing any output.
 *
 * Was going to put these methods into different classes, but I think that was too java like, and I didn't think
 * they needed their own classes since they would be static methods anyway
 */

import {ParseInput} from "./ParseInput";
import {EOL} from "os"; // For splitting file input

/**
 * Handles command line argument input from a user
 *
 * @param args String array containing arguments
 * @return object array for parsed GeoJSON objects from ParseInput
 */
export function handleArgInput(args: string[]): object[] {
    console.assert(args.length < 2, "Only one input directory should be entered, otherwise it should be none")
    if (args.length == 1) {
        return new ParseInput().parseLines(fileToLineArray(args[0]))
    } else {
        return new ParseInput().parseLines(getInput());
    }
}


/**
 * Gets an input of lines from a user.
 *
 * @return list of strings for the inputted lines from a user
 * @private
 */
export function getInput(): string[] {
    process.stdout.write("Welcome to 'Where in the world is CS'\n" +
        "Please enter locations one per line\n" +
        "Press enter on an empty line to submit\n")
    let output: string[] = []
    // TODO reconstruct node_modules
    let readLineSync = require("readline-sync")
    let currLine = readLineSync.question()
    while (currLine != "") {
        output.push(currLine);
        currLine = readLineSync.question()
    }
    return output
}

/**
 * Converts a txt file to an array of strings, one entry for each line of the file
 *
 * @param fileDirectory string for directory of a file
 * @return string[] as described
 * @private
 */
export function fileToLineArray(fileDirectory: string): string[] {
    let data;
    try {
        data = require("fs").readFileSync(fileDirectory, 'utf-8');
    } catch (error) {
        throw new Error(`File specified at: '${fileDirectory}' could not be loaded!`);
    }
    return data.split(EOL)
}

/**
 * Writes a GeoJSON object to a JSON file.
 *
 * Main file for writing to output
 *
 * The output of this program
 *
 * @private
 * @param geoJSONFeatures array containing GeoJSON feature objects
 */
export function writeToOutput(geoJSONFeatures: object[]): void {
    if (geoJSONFeatures.length > 0) {
        let geoJSONOutput = {"type": "FeatureCollection", "features": []}
        for (let geoJSON of geoJSONFeatures) {
            geoJSONOutput["features"].push(geoJSON)
        }
        let fs = require("fs");
        let filePath = "output/GeoJSON_FeatureCollection.json";
        fs.writeFileSync(`${filePath}`, JSON.stringify(geoJSONOutput));
        console.log(`Please see '${filePath}' for the created GeoJSON FeatureCollection`)
    } else {
        console.log("No lines of inputted could be parsed, so no output file was created!")
    }
}