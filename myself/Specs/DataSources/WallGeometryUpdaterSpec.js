import { Cartesian3 } from "../../Source/Mcs.js";
import { Color } from "../../Source/Mcs.js";
import { JulianDate } from "../../Source/Mcs.js";
import { TimeInterval } from "../../Source/Mcs.js";
import { TimeIntervalCollection } from "../../Source/Mcs.js";
import { ConstantProperty } from "../../Source/Mcs.js";
import { Entity } from "../../Source/Mcs.js";
import { PropertyArray } from "../../Source/Mcs.js";
import { SampledPositionProperty } from "../../Source/Mcs.js";
import { SampledProperty } from "../../Source/Mcs.js";
import { TimeIntervalCollectionProperty } from "../../Source/Mcs.js";
import { WallGeometryUpdater } from "../../Source/Mcs.js";
import { WallGraphics } from "../../Source/Mcs.js";
import { PrimitiveCollection } from "../../Source/Mcs.js";
import createDynamicGeometryUpdaterSpecs from "../createDynamicGeometryUpdaterSpecs.js";
import createDynamicProperty from "../createDynamicProperty.js";
import createGeometryUpdaterSpecs from "../createGeometryUpdaterSpecs.js";
import createScene from "../createScene.js";

describe(
  "DataSources/WallGeometryUpdater",
  function () {
    var time;
    var time2;
    var scene;

    beforeAll(function () {
      scene = createScene();
      time = new JulianDate(0, 0);
      time2 = new JulianDate(10, 0);
    });

    afterAll(function () {
      scene.destroyForSpecs();
    });

    function createBasicWall() {
      var wall = new WallGraphics();
      wall.positions = new ConstantProperty(
        Cartesian3.fromRadiansArrayHeights([0, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1])
      );
      var entity = new Entity();
      entity.wall = wall;
      return entity;
    }

    function createDynamicWall() {
      var entity = createBasicWall();
      entity.wall.granularity = createDynamicProperty(1);
      return entity;
    }

    it("A time-varying positions causes geometry to be dynamic", function () {
      var entity = createBasicWall();
      var updater = new WallGeometryUpdater(entity, scene);
      var point1 = new SampledPositionProperty();
      point1.addSample(time, new Cartesian3());
      var point2 = new SampledPositionProperty();
      point2.addSample(time, new Cartesian3());
      var point3 = new SampledPositionProperty();
      point3.addSample(time, new Cartesian3());

      entity.wall.positions = new PropertyArray();
      entity.wall.positions.setValue([point1, point2, point3]);
      updater._onEntityPropertyChanged(entity, "wall");

      expect(updater.isDynamic).toBe(true);
    });

    it("A time-varying minimumHeights causes geometry to be dynamic", function () {
      var entity = createBasicWall();
      var updater = new WallGeometryUpdater(entity, scene);
      entity.wall.minimumHeights = new TimeIntervalCollectionProperty();
      entity.wall.minimumHeights.intervals.addInterval(
        new TimeInterval({
          start: time,
          stop: time2,
          data: [],
        })
      );
      updater._onEntityPropertyChanged(entity, "wall");

      expect(updater.isDynamic).toBe(true);
    });

    it("A time-varying maximumHeights causes geometry to be dynamic", function () {
      var entity = createBasicWall();
      var updater = new WallGeometryUpdater(entity, scene);
      entity.wall.maximumHeights = new TimeIntervalCollectionProperty();
      entity.wall.maximumHeights.intervals.addInterval(
        new TimeInterval({
          start: time,
          stop: time2,
          data: [],
        })
      );
      updater._onEntityPropertyChanged(entity, "wall");

      expect(updater.isDynamic).toBe(true);
    });

    it("A time-varying granularity causes geometry to be dynamic", function () {
      var entity = createBasicWall();
      var updater = new WallGeometryUpdater(entity, scene);
      entity.wall.granularity = new SampledProperty(Number);
      entity.wall.granularity.addSample(time, 1);
      updater._onEntityPropertyChanged(entity, "wall");

      expect(updater.isDynamic).toBe(true);
    });

    it("Creates geometry with expected properties", function () {
      var options = {
        minimumHeights: [0, 1, 2, 3],
        maximumHeights: [4, 5, 6, 7],
        granularity: 0.97,
      };

      var entity = createBasicWall();

      var wall = entity.wall;
      wall.outline = true;
      wall.minimumHeights = new ConstantProperty(options.minimumHeights);
      wall.maximumHeights = new ConstantProperty(options.maximumHeights);
      wall.granularity = new ConstantProperty(options.granularity);

      var updater = new WallGeometryUpdater(entity, scene);

      var instance;
      var geometry;
      instance = updater.createFillGeometryInstance(time);
      geometry = instance.geometry;
      expect(geometry._granularity).toEqual(options.granularity);
      expect(geometry._minimumHeights).toEqual(options.minimumHeights);
      expect(geometry._maximumHeights).toEqual(options.maximumHeights);

      instance = updater.createOutlineGeometryInstance(time);
      geometry = instance.geometry;
      expect(geometry._granularity).toEqual(options.granularity);
      expect(geometry._minimumHeights).toEqual(options.minimumHeights);
      expect(geometry._maximumHeights).toEqual(options.maximumHeights);
    });

    it("dynamic updater sets properties", function () {
      var wall = new WallGraphics();
      wall.positions = createDynamicProperty(
        Cartesian3.fromRadiansArray([0, 0, 1, 0, 1, 1, 0, 1])
      );
      wall.show = createDynamicProperty(true);
      wall.minimumHeights = createDynamicProperty([1, 2, 3, 4]);
      wall.maximumHeights = createDynamicProperty([2, 3, 4, 5]);
      wall.granularity = createDynamicProperty(1);
      wall.fill = createDynamicProperty(true);
      wall.outline = createDynamicProperty(true);
      wall.outlineColor = createDynamicProperty(Color.RED);

      var entity = new Entity();
      entity.wall = wall;

      var updater = new WallGeometryUpdater(entity, scene);
      var dynamicUpdater = updater.createDynamicUpdater(
        new PrimitiveCollection(),
        new PrimitiveCollection()
      );
      dynamicUpdater.update(time);

      var options = dynamicUpdater._options;
      expect(options.id).toEqual(entity);
      expect(options.positions).toEqual(wall.positions.getValue());
      expect(options.minimumHeights).toEqual(wall.minimumHeights.getValue());
      expect(options.maximumHeights).toEqual(wall.maximumHeights.getValue());
      expect(options.granularity).toEqual(wall.granularity.getValue());
    });

    it("geometryChanged event is raised when expected", function () {
      var entity = createBasicWall();
      var updater = new WallGeometryUpdater(entity, scene);
      var listener = jasmine.createSpy("listener");
      updater.geometryChanged.addEventListener(listener);

      entity.wall.positions = new ConstantProperty([]);
      updater._onEntityPropertyChanged(entity, "wall");
      expect(listener.calls.count()).toEqual(1);

      entity.wall.granularity = new ConstantProperty(82);
      updater._onEntityPropertyChanged(entity, "wall");
      expect(listener.calls.count()).toEqual(2);

      entity.availability = new TimeIntervalCollection();
      updater._onEntityPropertyChanged(entity, "availability");
      expect(listener.calls.count()).toEqual(3);

      entity.wall.positions = undefined;
      updater._onEntityPropertyChanged(entity, "wall");
      expect(listener.calls.count()).toEqual(4);

      //Since there's no valid geometry, changing another property should not raise the event.
      entity.wall.granularity = undefined;
      updater._onEntityPropertyChanged(entity, "wall");

      //Modifying an unrelated property should not have any effect.
      entity.viewFrom = new ConstantProperty(Cartesian3.UNIT_X);
      updater._onEntityPropertyChanged(entity, "viewFrom");
      expect(listener.calls.count()).toEqual(4);
    });

    function getScene() {
      return scene;
    }

    createGeometryUpdaterSpecs(
      WallGeometryUpdater,
      "wall",
      createBasicWall,
      getScene
    );

    createDynamicGeometryUpdaterSpecs(
      WallGeometryUpdater,
      "wall",
      createDynamicWall,
      getScene
    );
  },
  "WebGL"
);
