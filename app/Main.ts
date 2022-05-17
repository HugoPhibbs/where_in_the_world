// Start the "Where in the world" program

import {getInput, writeToOutput, fileToLineArray, handleArgInput} from "./OutputInput";

writeToOutput(handleArgInput(process.argv.slice(2)))
