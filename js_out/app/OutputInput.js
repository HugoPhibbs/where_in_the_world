"use strict";
/**
 * File with methods to handle getting input from a user, then writing any output.
 *
 * Was going to put these methods into different classes, but I think that was too java like, and I didn't think
 * they needed their own classes since they would be static methods anyway
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeToOutput = exports.fileToLineArray = exports.getInput = void 0;
/**
 * Gets an input of lines from a user.
 *
 * @return list of strings for the inputted lines from a user
 * @private
 */
function getInput() {
    process.stdout.write("Welcome to 'Where in the world is CS'\n" +
        "Please enter locations one per line\n" +
        "Press enter on an empty line to submit\n");
    let output = [];
    let currLine;
    let prompt_sync = require("prompt-sync")();
    currLine = prompt_sync();
    while (currLine != "") {
        output.push(currLine);
        currLine = prompt_sync();
    }
    return output;
}
exports.getInput = getInput;
/**
 * Converts a txt file to an array of strings, one entry for each line of the file
 *
 * @param fileDirectory string for directory of a file
 * @return string[] as described
 * @private
 */
function fileToLineArray(fileDirectory) {
    let data;
    try {
        data = require("fs").readFileSync(fileDirectory, 'utf-8');
    }
    catch (error) {
        throw new Error(`File specified at: '${fileDirectory}' could not be loaded!`);
    }
    return data.split("\r\n");
}
exports.fileToLineArray = fileToLineArray;
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
function writeToOutput(geoJSONFeatures) {
    if (geoJSONFeatures.length > 0) {
        let geoJSONOutput = { "type": "FeatureCollection", "features": [] };
        for (let geoJSON of geoJSONFeatures) {
            geoJSONOutput["features"].push(geoJSON);
        }
        let fs = require("fs");
        let filePath = "output/GeoJSON_FeatureCollection.json";
        fs.writeFileSync(`${filePath}`, JSON.stringify(geoJSONOutput));
        console.log(`Please see '${filePath}' for the created GeoJSON FeatureCollection`);
    }
    else {
        console.log("No lines of inputted could be parsed, so no output file was created!");
    }
}
exports.writeToOutput = writeToOutput;
//# sourceMappingURL=OutputInput.js.map