import { BoundingSphere } from "../../Source/Mcs.js";
import { BoxGeometry } from "../../Source/Mcs.js";
import { Cartesian3 } from "../../Source/Mcs.js";
import { ComponentDatatype } from "../../Source/Mcs.js";
import { Geometry } from "../../Source/Mcs.js";
import { GeometryAttribute } from "../../Source/Mcs.js";
import { GeometryAttributes } from "../../Source/Mcs.js";
import { PrimitiveType } from "../../Source/Mcs.js";
import { PrimitivePipeline } from "../../Source/Mcs.js";

describe(
  "Scene/PrimitivePipeline",
  function () {
    it("can pack and unpack geometry", function () {
      var boxGeometry = BoxGeometry.createGeometry(
        BoxGeometry.fromDimensions({
          dimensions: new Cartesian3(1, 2, 3),
        })
      );

      var boxGeometry2 = BoxGeometry.createGeometry(
        BoxGeometry.fromDimensions({
          dimensions: new Cartesian3(3, 4, 7),
        })
      );

      var geometryToPack = [boxGeometry, boxGeometry2];
      var transferableObjects = [];
      var results = PrimitivePipeline.packCreateGeometryResults(
        geometryToPack,
        transferableObjects
      );
      var unpackedGeometry = PrimitivePipeline.unpackCreateGeometryResults(
        results
      );

      expect(transferableObjects.length).toBe(1);
      expect(geometryToPack).toEqual(unpackedGeometry);
    });

    it("can pack and unpack geometry without indices", function () {
      var attributes = new GeometryAttributes();
      attributes.position = new GeometryAttribute({
        componentDatatype: ComponentDatatype.FLOAT,
        componentsPerAttribute: 3,
        values: new Float32Array([1, 2, 3, 4, 5, 6]),
      });

      var geometry = new Geometry({
        attributes: attributes,
        indices: undefined,
        primitiveType: PrimitiveType.POINTS,
        boundingSphere: BoundingSphere.fromVertices(attributes.position.values),
      });

      var geometryToPack = [geometry];
      var transferableObjects = [];
      var results = PrimitivePipeline.packCreateGeometryResults(
        geometryToPack,
        transferableObjects
      );
      var unpackedGeometry = PrimitivePipeline.unpackCreateGeometryResults(
        results
      );

      expect(transferableObjects.length).toBe(1);
      expect(geometryToPack).toEqual(unpackedGeometry);
    });
  },
  "WebGL"
);
