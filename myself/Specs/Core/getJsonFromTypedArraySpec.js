import { getJsonFromTypedArray } from "../../Source/Mcs.js";

describe("Core/getJsonFromTypedArray", function () {
  it("converts a typed array to string", function () {
    if (TextEncoder === undefined) {
      return;
    }

    var json = {
      a: [0, 1, 2],
      b: "b",
      c: {
        d: true,
      },
    };

    var string = JSON.stringify(json);
    var encoder = new TextEncoder();
    var typedArray = encoder.encode(string);
    var result = getJsonFromTypedArray(typedArray);

    expect(result).toEqual(json);
  });

  it("converts a sub-region of a typed array to json", function () {
    if (TextEncoder === undefined) {
      return;
    }

    var json = {
      a: [0, 1, 2],
      b: "b",
      c: {
        d: true,
      },
    };

    var string = JSON.stringify(json);
    var encoder = new TextEncoder();
    var typedArray = encoder.encode(string);
    var result = getJsonFromTypedArray(typedArray, 25, 10);

    expect(result).toEqual(json.c);
  });
});
