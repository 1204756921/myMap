import { Cartesian3 } from "../../Source/Mcs.js";
import { LinearSpline } from "../../Source/Mcs.js";

describe("Core/LinearSpline", function () {
  var points;
  var times;

  beforeEach(function () {
    points = [
      new Cartesian3(-1.0, -1.0, 0.0),
      new Cartesian3(-0.5, -0.125, 0.0),
      new Cartesian3(0.5, 0.125, 0.0),
      new Cartesian3(1.0, 1.0, 0.0),
    ];
    times = [0.0, 1.0, 2.0, 3.0];
  });

  it("constructor throws without points or times", function () {
    expect(function () {
      return new LinearSpline();
    }).toThrowDeveloperError();
  });

  it("constructor throws when control points length is less than 2", function () {
    expect(function () {
      return new LinearSpline({
        points: [Cartesian3.ZERO],
      });
    }).toThrowDeveloperError();
  });

  it("constructor throws when times.length is not equal to points.length", function () {
    expect(function () {
      return new LinearSpline({
        points: points,
        times: [0.0, 1.0],
      });
    }).toThrowDeveloperError();
  });

  it("evaluate throws without time", function () {
    var ls = new LinearSpline({
      points: points,
      times: times,
    });

    expect(function () {
      ls.evaluate();
    }).toThrowDeveloperError();
  });

  it("evaluate throws when time is out of range", function () {
    var ls = new LinearSpline({
      points: points,
      times: times,
    });

    expect(function () {
      ls.evaluate(times[0] - 1.0);
    }).toThrowDeveloperError();
  });

  it("evaluate without result parameter", function () {
    var ls = new LinearSpline({
      points: points,
      times: times,
    });

    expect(ls.evaluate(times[0])).toEqual(points[0]);

    var time = (times[1] + times[0]) * 0.5;
    var t = (time - times[0]) / (times[1] - times[0]);
    expect(ls.evaluate(time)).toEqual(
      Cartesian3.lerp(points[0], points[1], t, new Cartesian3())
    );
  });

  it("evaluate with result parameter", function () {
    var ls = new LinearSpline({
      points: points,
      times: times,
    });
    var result = new Cartesian3();

    var point = ls.evaluate(times[0], result);
    expect(point).toBe(result);
    expect(result).toEqual(points[0]);
  });
});
