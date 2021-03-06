import { Cartesian3 } from "../../Source/Mcs.js";
import { Ray } from "../../Source/Mcs.js";

describe("Core/Ray", function () {
  it("default constructor create zero valued Ray", function () {
    var ray = new Ray();
    expect(ray.origin).toEqual(Cartesian3.ZERO);
    expect(ray.direction).toEqual(Cartesian3.ZERO);
  });

  it("constructor sets expected properties", function () {
    var origin = Cartesian3.UNIT_Y;
    var direction = Cartesian3.UNIT_X;
    var ray = new Ray(origin, direction);
    expect(ray.origin).toEqual(origin);
    expect(ray.direction).toEqual(direction);
  });

  it("constructor normalizes direction", function () {
    var origin = Cartesian3.UNIT_Y;
    var direction = Cartesian3.multiplyByScalar(
      Cartesian3.UNIT_X,
      18,
      new Cartesian3()
    );
    var ray = new Ray(origin, direction);
    expect(ray.origin).toEqual(origin);
    expect(ray.direction).toEqual(Cartesian3.UNIT_X);
  });

  it("clone without a result parameter", function () {
    var direction = Cartesian3.normalize(
      new Cartesian3(1, 2, 3),
      new Cartesian3()
    );
    var ray = new Ray(Cartesian3.UNIT_X, direction);
    var returnedResult = Ray.clone(ray);
    expect(ray).not.toBe(returnedResult);
    expect(ray.origin).not.toBe(returnedResult.origin);
    expect(ray.direction).not.toBe(returnedResult.direction);
    expect(ray).toEqual(returnedResult);
  });

  it("clone with a result parameter", function () {
    var direction = Cartesian3.normalize(
      new Cartesian3(1, 2, 3),
      new Cartesian3()
    );
    var ray = new Ray(Cartesian3.UNIT_X, direction);
    var result = new Ray();
    var returnedResult = Ray.clone(ray, result);
    expect(ray).not.toBe(result);
    expect(ray.origin).not.toBe(returnedResult.origin);
    expect(ray.direction).not.toBe(returnedResult.direction);
    expect(result).toBe(returnedResult);
    expect(ray).toEqual(result);
  });

  it("clone works with a result parameter that is an input parameter", function () {
    var direction = Cartesian3.normalize(
      new Cartesian3(1, 2, 3),
      new Cartesian3()
    );
    var ray = new Ray(Cartesian3.UNIT_X, direction);
    var returnedResult = Ray.clone(ray, ray);
    expect(ray).toBe(returnedResult);
  });

  it("clone returns undefined if ray is undefined", function () {
    expect(Ray.clone()).toBeUndefined();
  });

  it("getPoint along ray works without a result parameter", function () {
    var direction = Cartesian3.normalize(
      new Cartesian3(1, 2, 3),
      new Cartesian3()
    );
    var ray = new Ray(Cartesian3.UNIT_X, direction);
    for (var i = -10; i < 11; i++) {
      var expectedResult = Cartesian3.add(
        Cartesian3.multiplyByScalar(direction, i, new Cartesian3()),
        Cartesian3.UNIT_X,
        new Cartesian3()
      );
      var returnedResult = Ray.getPoint(ray, i);
      expect(returnedResult).toEqual(expectedResult);
    }
  });

  it("getPoint works with a result parameter", function () {
    var direction = Cartesian3.normalize(
      new Cartesian3(1, 2, 3),
      new Cartesian3()
    );
    var ray = new Ray(Cartesian3.UNIT_X, direction);
    var result = new Cartesian3();
    for (var i = -10; i < 11; i++) {
      var expectedResult = Cartesian3.add(
        Cartesian3.multiplyByScalar(direction, i, new Cartesian3()),
        Cartesian3.UNIT_X,
        new Cartesian3()
      );
      var returnedResult = Ray.getPoint(ray, i, result);
      expect(result).toBe(returnedResult);
      expect(returnedResult).toEqual(expectedResult);
    }
  });

  it("getPoint throws without a point", function () {
    var direction = Cartesian3.normalize(
      new Cartesian3(1, 2, 3),
      new Cartesian3()
    );
    var ray = new Ray(Cartesian3.UNIT_X, direction);
    expect(function () {
      Ray.getPoint(ray, undefined);
    }).toThrowDeveloperError();
  });
});
