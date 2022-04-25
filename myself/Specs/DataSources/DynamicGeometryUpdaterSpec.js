import { DynamicGeometryUpdater } from "../../Source/Mcs.js";
import { Entity } from "../../Source/Mcs.js";
import { GeometryUpdater } from "../../Source/Mcs.js";
import { PrimitiveCollection } from "../../Source/Mcs.js";
import createScene from "../createScene.js";

describe("DataSources/DynamicGeometryUpdater", function () {
  var scene;

  beforeAll(function () {
    scene = createScene();
  });

  afterAll(function () {
    scene.destroyForSpecs();
  });

  it("Constructor throws with no updater", function () {
    expect(function () {
      return new DynamicGeometryUpdater(
        undefined,
        new PrimitiveCollection(),
        new PrimitiveCollection()
      );
    }).toThrowDeveloperError();
  });

  it("Constructor throws with no primitives", function () {
    var updater = new GeometryUpdater({
      entity: new Entity(),
      scene: scene,
      geometryOptions: {},
      geometryPropertyName: "box",
      observedPropertyNames: ["availability", "box"],
    });
    expect(function () {
      return new DynamicGeometryUpdater(
        updater,
        undefined,
        new PrimitiveCollection()
      );
    }).toThrowDeveloperError();
  });

  it("Constructor throws with no groundPrimitives", function () {
    var updater = new GeometryUpdater({
      entity: new Entity(),
      scene: scene,
      geometryOptions: {},
      geometryPropertyName: "box",
      observedPropertyNames: ["availability", "box"],
    });
    expect(function () {
      return new DynamicGeometryUpdater(
        updater,
        undefined,
        new PrimitiveCollection()
      );
    }).toThrowDeveloperError();
  });

  it("update throws with no time", function () {
    var updater = new GeometryUpdater({
      entity: new Entity(),
      scene: scene,
      geometryOptions: {},
      geometryPropertyName: "box",
      observedPropertyNames: ["availability", "box"],
    });
    var dynamicUpdater = new DynamicGeometryUpdater(
      updater,
      new PrimitiveCollection(),
      new PrimitiveCollection()
    );
    expect(function () {
      return dynamicUpdater.update();
    }).toThrowDeveloperError();
  });
});
