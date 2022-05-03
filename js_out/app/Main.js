"use strict";
// Start the "Where in the world" program
Object.defineProperty(exports, "__esModule", { value: true });
const ParseInput_1 = require("./ParseInput");
const OutputInput_1 = require("./OutputInput");
let input = (0, OutputInput_1.getInput)();
let parsedLines = new ParseInput_1.ParseInput().parseLines(input);
(0, OutputInput_1.writeToOutput)(parsedLines);
//# sourceMappingURL=Main.js.map