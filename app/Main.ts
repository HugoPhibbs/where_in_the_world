// Start the "Where in the world" program

import {ParseInput} from './ParseInput'
import {getInput, writeToOutput} from "./OutputInput";

let input = getInput();
let parsedLines = new ParseInput().parseLines(input);
writeToOutput(parsedLines)