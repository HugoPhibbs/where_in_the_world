// Start the "Where in the world" program

import {ParseInput} from './ParseInput'
import {getInput, writeToOutput, fileToLineArray} from "./OutputInput";

const args = process.argv.slice(2)
console.assert(args.length < 2, "Only one input directory should be entered, otherwise it should be none")

let parsedLines;
if (args.length == 1){
    parsedLines = new ParseInput().parseLines(fileToLineArray(args[0]))
}
else {
    parsedLines = new ParseInput().parseLines(getInput());
}

writeToOutput(parsedLines)
