import { BoundingSphere } from "../../Source/Mcs.js";
import { Color } from "../../Source/Mcs.js";
import { defined } from "../../Source/Mcs.js";
import { Ellipsoid } from "../../Source/Mcs.js";
import { Matrix3 } from "../../Source/Mcs.js";
import { Simon1994PlanetaryPositions } from "../../Source/Mcs.js";
import { Transforms } from "../../Source/Mcs.js";
import { Moon } from "../../Source/Mcs.js";
import createScene from "../createScene.js";

describe(
  "Scene/Moon",
  function () {
    var scene;
    var backgroundColor = [255, 0, 0, 255];

    beforeAll(function () {
      scene = createScene();
      Color.unpack(backgroundColor, 0, scene.backgroundColor);
    });

    afterAll(function () {
      scene.destroyForSpecs();
    });

    function lookAtMoon(camera, date) {
      var icrfToFixed = new Matrix3();
      if (!defined(Transforms.computeIcrfToFixedMatrix(date, icrfToFixed))) {
        Transforms.computeTemeToPseudoFixedMatrix(date, icrfToFixed);
      }

      var moonPosition = Simon1994PlanetaryPositions.computeMoonPositionInEarthInertialFrame(
        date
      );
      Matrix3.multiplyByVector(icrfToFixed, moonPosition, moonPosition);

      camera.viewBoundingSphere(
        new BoundingSphere(moonPosition, Ellipsoid.MOON.maximumRadius)
      );
    }

    it("default constructs the moon", function () {
      var moon = new Moon();
      expect(moon.show).toEqual(true);
      expect(moon.textureUrl).toContain("Assets/Textures/moonSmall.jpg");
      expect(moon.ellipsoid).toBe(Ellipsoid.MOON);
      expect(moon.onlySunLighting).toEqual(true);
    });

    it("draws in 3D", function () {
      expect(scene).toRender(backgroundColor);
      scene.moon = new Moon();

      lookAtMoon(scene.camera, scene.frameState.time);

      expect(scene).notToRender(backgroundColor);
      scene.moon = scene.moon.destroy();
    });

    it("does not render when show is false", function () {
      expect(scene).toRender(backgroundColor);
      scene.moon = new Moon();

      lookAtMoon(scene.camera, scene.frameState.time);

      expect(scene).notToRender(backgroundColor);
      scene.moon.show = false;

      expect(scene).toRender(backgroundColor);
      scene.moon = scene.moon.destroy();
    });

    it("isDestroyed", function () {
      var moon = new Moon();
      expect(moon.isDestroyed()).toEqual(false);
      moon.destroy();
      expect(moon.isDestroyed()).toEqual(true);
    });
  },
  "WebGL"
);
