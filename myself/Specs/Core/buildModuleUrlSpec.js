import { buildModuleUrl } from "../../Source/Mcs.js";
import { Resource } from "../../Source/Mcs.js";
import { Uri } from "../../Source/Mcs.js";

describe("Core/buildModuleUrl", function () {
  it("produces an absolute URL for a module", function () {
    var url = buildModuleUrl("Workers/transferTypedArrayTest.js");

    expect(url).toMatch(/Workers\/transferTypedArrayTest.js$/);
    expect(new Uri(url).isAbsolute()).toBe(true);

    // make sure it actually exists at that URL
    return Resource.fetchText(url);
  });

  it("matches the expected forms of URLs to Cesium.js", function () {
    var r = buildModuleUrl._cesiumScriptRegex;

    expect(r.exec("Cesium.js")[1]).toEqual("");
    expect(r.exec("Cesium.js?v=1.7")[1]).toEqual("");
    expect(r.exec("assets/foo/Cesium.js")[1]).toEqual("assets/foo/");
    expect(r.exec("assets/foo/Cesium.js?v=1.7")[1]).toEqual("assets/foo/");
    expect(
      r.exec("http://example.invalid/Cesium/assets/foo/Cesium.js")[1]
    ).toEqual("http://example.invalid/Cesium/assets/foo/");
    expect(
      r.exec("http://example.invalid/Cesium/assets/foo/Cesium.js?v=1.7")[1]
    ).toEqual("http://example.invalid/Cesium/assets/foo/");

    expect(r.exec("cesium.js")).toBeNull();
    expect(r.exec("Cesium.js%20")).toBeNull();
    expect(r.exec("Cesium.min.js")).toBeNull();
    expect(r.exec("CesiumSomething.js")).toBeNull();
    expect(r.exec("CesiumSomething.js?v=1.7")).toBeNull();
    expect(r.exec("assets/foo/bar.cesium.js")).toBeNull();
    expect(r.exec("assets/foo/bar.cesium.js?v=1.7")).toBeNull();
    expect(r.exec("assets/foo/CesiumSomething.js")).toBeNull();
    expect(r.exec("assets/foo/CesiumSomething.js?v=1.7")).toBeNull();
  });

  it("CESIUM_BASE_URL works with trailing slash", function () {
    // Set new variables
    var oldCESIUM_BASE_URL = window.CESIUM_BASE_URL;
    window.CESIUM_BASE_URL = "http://test.com/source/";
    buildModuleUrl._clearBaseResource();

    // Verify we use CESIUM_BASE_URL
    var url = buildModuleUrl._buildModuleUrlFromBaseUrl("Core/Cartesian3.js");
    expect(url).toEqual("http://test.com/source/Core/Cartesian3.js");

    // Reset old values
    window.CESIUM_BASE_URL = oldCESIUM_BASE_URL;
    buildModuleUrl._clearBaseResource();
  });

  it("CESIUM_BASE_URL works without trailing slash", function () {
    // Set new variables
    var oldCESIUM_BASE_URL = window.CESIUM_BASE_URL;
    window.CESIUM_BASE_URL = "http://test.com/source";
    buildModuleUrl._clearBaseResource();

    // Verify we use CESIUM_BASE_URL
    var url = buildModuleUrl._buildModuleUrlFromBaseUrl("Core/Cartesian3.js");
    expect(url).toEqual("http://test.com/source/Core/Cartesian3.js");

    // Reset old values
    window.CESIUM_BASE_URL = oldCESIUM_BASE_URL;
    buildModuleUrl._clearBaseResource();
  });
});
