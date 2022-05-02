# Where in the world?
![Node Build](https://github.com/HugoPhibbs/where_in_the_world/actions/workflows/node.js.yml/badge.svg)
![TypeScript Build](https://github.com/HugoPhibbs/where_in_the_world/actions/workflows/typescript.yml/badge.svg)

*By Hugo Phibbs*

## My Approach

- I wrote the entire project with TypeScript, using node to compile.
- My design philosophy for this program was similar to Etude 1. That is try to parse an input for a given format, then
  throw an error if this cannot be done. 
- The program first tries to parse with standard form, if this doesn't work, then it tries to parse using the
  Degrees-Minutes-Seconds format
- The main API method is ```ParseInput.parseLine(string)```, this is used for examples bellow

## Using the program via Command line
- I included all dependencies in the node_modules folder, this should save you from installing them yourself.
- For the next steps, ensure that you are in the top level directory of this project.
- Ensure that node and npm is installed before running (node is not installed on lab machines for some reason).
- To install necessary dependencies just to run the program, enter:
```shell
npm install --production
```
- To run the project enter:
```shell
node app/app_js_out/app/Main.js
``` 
- Then follow the prompts, a file will be created in the app folder when finished.

## Examples

- These are done using the API

### Finding Paris

- Running:

```typescript
import {ParseInput} from "./ParseInput";

let ParisGeoJSON = new ParseInput.parseLine("48.853524, 2.348262 Paris")
```

- Gives ParisGeoJSON as::

```json
{
  "type": "Feature",
  "properties": {
    "name": "Paris"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [
      2.348262,
      48.853524
    ]
  }
}
```

- Which can be visualised on geoJSON.io, by placing it into a FeatureCollection (how output is formatted if using the
  program via command line):
  ![](https://github.com/HugoPhibbs/where_in_the_world/blob/main/examples/paris.png)

### Finding New York

- Running:

```typescript
import {ParseInput} from "./ParseInput";

let NewYorkGeoJSON = new ParseInput.parseLine("40° 45' 53.28\", 73° 58' 50.88\" W New York")
```
- Gives NewYorkGeoJSON as:
```json
{
  "type": "Feature",
  "properties": {
    "name": "New York"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [
      40.7648, 
      -73.9808
    ]
  }
}
```
- Which can be visualised in geoJSON.io (again by placing it in a FeatureCollection):
  ![](https://github.com/HugoPhibbs/where_in_the_world/blob/main/examples/newyork.png)

## Libraries and External sources
- Jest was used for testing
- prompt-sync was used for getting command line input from a user

## Tests
- I used Jest for testing, bellow is the test class that I used:
```typescript
import {ParseInput} from "../app/ParseInput";
import {ParseError} from "../app/ParseError";

let testParseInput : ParseInput = new ParseInput();

describe("Test irrelevant Input", () => {
    test("Empty String", () => {
        expect(() => {testParseInput.parseLineHelper("")}).toThrowError(ParseError)
    })
    test("Null input", () => {
        expect(() => {testParseInput.parseLineHelper(null)}).toThrowError(ParseError)
    })
    test("Irrelevant strings", () => {
        expect(() => {testParseInput.parseLineHelper("Ha tricked you")}).toThrowError(ParseError)
        expect(() => {testParseInput.parseLineHelper("Gibberish")}).toThrowError(ParseError)
        expect(() => {testParseInput.parseLineHelper("Hugo Phibbs")}).toThrowError(ParseError)
    })
    test("Irrelevant Numbers", () => {
        expect(testParseInput.canParseLine("120, 120")).toBeFalsy()
        expect(testParseInput.canParseLine("90 12, 90 12")).toBeFalsy()
        expect(testParseInput.canParseLine("120, 120")).toBeFalsy()
        expect(testParseInput.canParseLine("120, 120, 120")).toBeFalsy()
    })
})

describe("Test regular standard form", () => {
    test("Length 2 input", () => {
        let latLongObj1 = testParseInput.parseCoords("49.5, 170.5")
        expect(latLongObj1.latitude).toEqual(49.5)
        expect(latLongObj1.longitude).toEqual(170.5)
    })

    test("Test with labels", () => {
        let components = testParseInput.parseLabel("48.853524, 2.348262 Paris");
        expect(components['label']).toBe("Paris")
        expect(components['coords']).toBe("48.853524, 2.348262");
    })
})

describe("Test range standard form", () => {
    test("Test range of latitude", () => {
        expect(testParseInput.canParseLine("91, 170.5")).toBeFalsy()
        expect(testParseInput.canParseLine("90, 170.5")).toBeTruthy()
        expect(testParseInput.canParseLine("-91, 170.5")).toBeFalsy()
        expect(testParseInput.canParseLine("-90, 170.5")).toBeTruthy()
        expect(testParseInput.canParseLine("10000, 170.5")).toBeFalsy()
        expect(testParseInput.canParseLine("49.5, 170.5")).toBeTruthy()
    })
    test("Test range of longitude", () => {
        expect(testParseInput.canParseLine("90, 180")).toBeTruthy()
        expect(testParseInput.canParseLine("90, 181")).toBeFalsy()
        expect(testParseInput.canParseLine("90, -180")).toBeTruthy()
        expect(testParseInput.canParseLine("90, -181")).toBeFalsy()
    })
    test("Both out of range", () => {
        expect(testParseInput.canParseLine("91, -181")).toBeFalsy()
    })
})

describe("Mixed standard form input", () =>{
    test("Test length 3", () => {
        let latLong1 = testParseInput.parseCoords("120 E, 90")
        expect(latLong1.latitude).toBe(90)
        expect(latLong1.longitude).toBe(120)

        let latLong2 = testParseInput.parseCoords("120 W, 90")
        expect(latLong2.longitude).toBe(-120)
        expect(latLong2.latitude).toBe(90)

        let latLong3 = testParseInput.parseCoords("120, 90 N")
        expect(latLong3.latitude).toBe(90)
        expect(latLong3.longitude).toBe(120)

        let latLong4 = testParseInput.parseCoords("120, 90 S")
        expect(latLong4.latitude).toBe(-90)
        expect(latLong4.longitude).toBe(120)

        expect(testParseInput.canParseLine("120, 120S")).toBeFalsy()
    })

    test("Test length 4", () => {
        let latLong1 = testParseInput.parseCoords("120 E, 90 N")
        expect(latLong1.latitude).toBe(90)
        expect(latLong1.longitude).toBe(120)

        let latLong2 = testParseInput.parseCoords("120 W 90 S")
        expect(latLong2.latitude).toBe(-90)
        expect(latLong2.longitude).toBe(-120)

        let latLong3 = testParseInput.parseCoords("90 N, 120 E")
        expect(latLong3.latitude).toBe(90)
        expect(latLong3.longitude).toBe(120)

        let latLong4 = testParseInput.parseCoords("90 N, 120 W")
        expect(latLong4.latitude).toBe(90)
        expect(latLong4.longitude).toBe(-120)

        expect(testParseInput.canParseLine("120 W 120 W")).toBeFalsy()
        expect(testParseInput.canParseLine("90 N, 90 N")).toBeFalsy()
    })

    test("Test length 2", () => {
        let latLong1 = testParseInput.parseCoords("90 120")
        expect(latLong1.latitude).toBe(90)
        expect(latLong1.longitude).toBe(120)
    })
})

describe("Test DMS coords", () => {
    test("Test standard Degrees-Minutes-Seconds", () => {
        expect(testParseInput.parseCoords("48 51 8.262, 2 20 49.8084")).toStrictEqual({latitude:48.852295, longitude:2.347169})
        expect(testParseInput.parseCoords("48° 51' 8.262\", 2° 20' 49.8084\"")).toStrictEqual({latitude:48.852295, longitude:2.347169})
        expect(testParseInput.parseCoords("48° 51' 8.262\", 2° 20' 49.8084\"")).toStrictEqual({latitude:48.852295, longitude:2.347169})
    })

    // TODO test with directions and DMS form

    test("Test DMS with directions", () => {
        let geoJSON = testParseInput.parseLineHelper("40° 45' 53.28\", 73° 58' 50.88\" W New York")
        expect(geoJSON["properties"]["name"]).toBe("New York")
        expect(geoJSON["geometry"]["coordinates"]).toStrictEqual([-73.9808, 40.7648])
    })

    test("Test Degrees-Minutes", () => {
        expect(testParseInput.parseCoords("48° 51', 2° 20'")).toStrictEqual({latitude:48.85, longitude:2.333333})
        expect(testParseInput.parseCoords("48 51, 2 20")).toStrictEqual({latitude:48.85, longitude:2.333333})
    })

    test("Test with labels", () => {
        expect(testParseInput.parseLabel("48° 51' 8.262\", 2° 20' 49.8084\" Paris")["label"]).toBe("Paris")
        expect(testParseInput.parseLabel("48° 51' 8.262\", 2° 20' 49.8084\" Central Paris")["label"]).toBe("Central Paris")
        expect(testParseInput.parseLabel("48° 51' 8.262\" 2° 20' 49.8084\" Central Paris")["label"]).toBe("Central Paris")
    })
})

test("Test labels", () => {
    expect(testParseInput.parseLabel("90, 180 Dunedin")["label"]).toBe(("Dunedin"))
    expect(testParseInput.parseLabel("90 180 E Dunedin")["label"]).toBe("Dunedin")
    expect(testParseInput.parseLabel("90 180 E North Dunedin")["label"]).toBe("North Dunedin")
    expect(testParseInput.parseLabel("90 180 E Far Far Away")["label"]).toBe("Far Far Away")
    expect(testParseInput.parseLabel("120 E, 90 N North Dunedin")["label"]).toBe("North Dunedin")
    expect(testParseInput.parseLabel("90 180 E")["label"]).toBe(null)
    expect(testParseInput.parseLabel("90 180")["label"]).toBe(null)
    expect(testParseInput.parseLabel("40° 45' 53.28\", 73° 58' 50.88\"")["label"]).toBe(null)
    expect(testParseInput.parseLabel("40° 45' 53.28\", 73° 58' 50.88\" New York")["label"]).toBe("New York")

    let components1 = testParseInput.parseLabel("90 180 E Far Far Away")
    expect(components1["label"]).toBe("Far Far Away")
    expect(components1["coords"]).toBe("90 180 E")

    let components2 = testParseInput.parseLabel("Far Far Away")
    expect(components2["label"]).toBe("Far Far Away")
    expect(components2["coords"]).toBe("")
})

```
