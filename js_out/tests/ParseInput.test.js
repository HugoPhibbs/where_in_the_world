"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ParseInput_1 = require("../app/ParseInput");
const ParseError_1 = require("../app/ParseError");
let testParseInput = new ParseInput_1.ParseInput();
describe("Test irrelevant Input", () => {
    test("Empty String", () => {
        expect(() => { testParseInput.parseLineHelper(""); }).toThrowError(ParseError_1.ParseError);
    });
    test("Null input", () => {
        expect(() => { testParseInput.parseLineHelper(null); }).toThrowError(ParseError_1.ParseError);
    });
    test("Irrelevant strings", () => {
        expect(() => { testParseInput.parseLineHelper("Ha tricked you"); }).toThrowError(ParseError_1.ParseError);
        expect(() => { testParseInput.parseLineHelper("Gibberish"); }).toThrowError(ParseError_1.ParseError);
        expect(() => { testParseInput.parseLineHelper("Hugo Phibbs"); }).toThrowError(ParseError_1.ParseError);
    });
    test("Irrelevant Numbers", () => {
        expect(testParseInput.canParseLine("120, 120")).toBeFalsy();
        expect(testParseInput.canParseLine("90 12, 90 12")).toBeFalsy();
        expect(testParseInput.canParseLine("120, 120")).toBeFalsy();
        expect(testParseInput.canParseLine("120, 120, 120")).toBeFalsy();
    });
});
describe("Test regular standard form", () => {
    test("Length 2 input", () => {
        let latLongObj1 = testParseInput.parseCoords("49.5, 170.5");
        expect(latLongObj1.latitude).toEqual(49.5);
        expect(latLongObj1.longitude).toEqual(170.5);
    });
    test("Test with labels", () => {
        let components = testParseInput.parseLabel("48.853524, 2.348262 Paris");
        expect(components['label']).toBe("Paris");
        expect(components['coords']).toBe("48.853524, 2.348262");
    });
});
describe("Test range standard form", () => {
    test("Test range of latitude", () => {
        expect(testParseInput.canParseLine("91, 170.5")).toBeFalsy();
        expect(testParseInput.canParseLine("90, 170.5")).toBeTruthy();
        expect(testParseInput.canParseLine("-91, 170.5")).toBeFalsy();
        expect(testParseInput.canParseLine("-90, 170.5")).toBeTruthy();
        expect(testParseInput.canParseLine("10000, 170.5")).toBeFalsy();
        expect(testParseInput.canParseLine("49.5, 170.5")).toBeTruthy();
    });
    test("Test range of longitude", () => {
        expect(testParseInput.canParseLine("90, 180")).toBeTruthy();
        expect(testParseInput.canParseLine("90, 181")).toBeFalsy();
        expect(testParseInput.canParseLine("90, -180")).toBeTruthy();
        expect(testParseInput.canParseLine("90, -181")).toBeFalsy();
    });
    test("Both out of range", () => {
        expect(testParseInput.canParseLine("91, -181")).toBeFalsy();
    });
});
describe("Mixed standard form input", () => {
    test("Test length 3", () => {
        let latLong1 = testParseInput.parseCoords("120 E, 90");
        expect(latLong1.latitude).toBe(90);
        expect(latLong1.longitude).toBe(120);
        let latLong2 = testParseInput.parseCoords("120 W, 90");
        expect(latLong2.longitude).toBe(-120);
        expect(latLong2.latitude).toBe(90);
        let latLong3 = testParseInput.parseCoords("120, 90 N");
        expect(latLong3.latitude).toBe(90);
        expect(latLong3.longitude).toBe(120);
        let latLong4 = testParseInput.parseCoords("120, 90 S");
        expect(latLong4.latitude).toBe(-90);
        expect(latLong4.longitude).toBe(120);
        expect(testParseInput.canParseLine("120, 120S")).toBeFalsy();
    });
    test("Test length 4", () => {
        let latLong1 = testParseInput.parseCoords("120 E, 90 N");
        expect(latLong1.latitude).toBe(90);
        expect(latLong1.longitude).toBe(120);
        let latLong2 = testParseInput.parseCoords("120 W 90 S");
        expect(latLong2.latitude).toBe(-90);
        expect(latLong2.longitude).toBe(-120);
        let latLong3 = testParseInput.parseCoords("90 N, 120 E");
        expect(latLong3.latitude).toBe(90);
        expect(latLong3.longitude).toBe(120);
        let latLong4 = testParseInput.parseCoords("90 N, 120 W");
        expect(latLong4.latitude).toBe(90);
        expect(latLong4.longitude).toBe(-120);
        expect(testParseInput.canParseLine("120 W 120 W")).toBeFalsy();
        expect(testParseInput.canParseLine("90 N, 90 N")).toBeFalsy();
    });
    test("Test length 2", () => {
        let latLong1 = testParseInput.parseCoords("90 120");
        expect(latLong1.latitude).toBe(90);
        expect(latLong1.longitude).toBe(120);
    });
});
describe("Test DMS coords", () => {
    test("Test standard Degrees-Minutes-Seconds", () => {
        expect(testParseInput.parseCoords("48 51 8.262, 2 20 49.8084")).toStrictEqual({ latitude: 48.852295, longitude: 2.347169 });
        expect(testParseInput.parseCoords("48° 51' 8.262\", 2° 20' 49.8084\"")).toStrictEqual({ latitude: 48.852295, longitude: 2.347169 });
        expect(testParseInput.parseCoords("48° 51' 8.262\", 2° 20' 49.8084\"")).toStrictEqual({ latitude: 48.852295, longitude: 2.347169 });
    });
    test("Test DMS with directions", () => {
        let geoJSON = testParseInput.parseLineHelper("40° 45' 53.28\", 73° 58' 50.88\" W New York");
        expect(geoJSON["properties"]["name"]).toBe("New York");
        expect(geoJSON["geometry"]["coordinates"]).toStrictEqual([-73.9808, 40.7648]);
    });
    test("Test Degrees-Minutes", () => {
        expect(testParseInput.parseCoords("48° 51', 2° 20'")).toStrictEqual({ latitude: 48.85, longitude: 2.333333 });
        expect(testParseInput.parseCoords("48 51, 2 20")).toStrictEqual({ latitude: 48.85, longitude: 2.333333 });
    });
    test("Test with labels", () => {
        expect(testParseInput.parseLabel("48° 51' 8.262\", 2° 20' 49.8084\" Paris")["label"]).toBe("Paris");
        expect(testParseInput.parseLabel("48° 51' 8.262\", 2° 20' 49.8084\" Central Paris")["label"]).toBe("Central Paris");
        expect(testParseInput.parseLabel("48° 51' 8.262\" 2° 20' 49.8084\" Central Paris")["label"]).toBe("Central Paris");
    });
});
test("Test labels", () => {
    expect(testParseInput.parseLabel("90, 180 Dunedin")["label"]).toBe(("Dunedin"));
    expect(testParseInput.parseLabel("90 180 E Dunedin")["label"]).toBe("Dunedin");
    expect(testParseInput.parseLabel("90 180 E North Dunedin")["label"]).toBe("North Dunedin");
    expect(testParseInput.parseLabel("90 180 E Far Far Away")["label"]).toBe("Far Far Away");
    expect(testParseInput.parseLabel("120 E, 90 N North Dunedin")["label"]).toBe("North Dunedin");
    expect(testParseInput.parseLabel("90 180 E")["label"]).toBe(null);
    expect(testParseInput.parseLabel("90 180")["label"]).toBe(null);
    expect(testParseInput.parseLabel("40° 45' 53.28\", 73° 58' 50.88\"")["label"]).toBe(null);
    expect(testParseInput.parseLabel("40° 45' 53.28\", 73° 58' 50.88\" New York")["label"]).toBe("New York");
    let components1 = testParseInput.parseLabel("90 180 E Far Far Away");
    expect(components1["label"]).toBe("Far Far Away");
    expect(components1["coords"]).toBe("90 180 E");
    let components2 = testParseInput.parseLabel("Far Far Away");
    expect(components2["label"]).toBe("Far Far Away");
    expect(components2["coords"]).toBe("");
});
//# sourceMappingURL=ParseInput.test.js.map