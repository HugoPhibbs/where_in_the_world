"use strict";
// Start the "Where in the world" program
Object.defineProperty(exports, "__esModule", { value: true });
const ParseInput_1 = require("./ParseInput");
const OutputInput_1 = require("./OutputInput");
const args = process.argv.slice(2);
console.assert(args.length < 2, "Only one input directory should be entered, otherwise it should be none");
let parsedLines;
if (args.length == 1) {
    parsedLines = new ParseInput_1.ParseInput().parseLines((0, OutputInput_1.fileToLineArray)(args[0]));
}
else {
    parsedLines = new ParseInput_1.ParseInput().parseLines((0, OutputInput_1.getInput)());
}
(0, OutputInput_1.writeToOutput)(parsedLines);
//# sourceMappingURL=Main.js.map