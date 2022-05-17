"use strict";
// Start the "Where in the world" program
Object.defineProperty(exports, "__esModule", { value: true });
const OutputInput_1 = require("./OutputInput");
const args = process.argv.slice(2);
console.assert(args.length < 2, "Only one input directory should be entered, otherwise it should be none");
(0, OutputInput_1.writeToOutput)((0, OutputInput_1.handleArgInput)(args));
//# sourceMappingURL=Main.js.map