import { ApproximateTerrainHeights } from "../../Source/Mcs.js";
import { BoundingSphere } from "../../Source/Mcs.js";
import { Cartesian3 } from "../../Source/Mcs.js";
import { Iso8601 } from "../../Source/Mcs.js";
import { BoundingSphereState } from "../../Source/Mcs.js";
import { DataSourceCollection } from "../../Source/Mcs.js";
import { DataSourceDisplay } from "../../Source/Mcs.js";
import { Entity } from "../../Source/Mcs.js";
import { GroundPolylinePrimitive } from "../../Source/Mcs.js";
import { GroundPrimitive } from "../../Source/Mcs.js";
import createScene from "../createScene.js";
import MockDataSource from "../MockDataSource.js";
import { when } from "../../Source/Mcs.js";

describe(
  "DataSources/DataSourceDisplay",
  function () {
    var dataSourceCollection;
    var scene;
    var display;
    beforeAll(function () {
      scene = createScene();
      dataSourceCollection = new DataSourceCollection();

      return when.join(
        GroundPrimitive.initializeTerrainHeights(),
        GroundPolylinePrimitive.initializeTerrainHeights()
      );
    });

    afterAll(function () {
      scene.destroyForSpecs();

      // Leave ground primitive uninitialized
      ApproximateTerrainHeights._initPromise = undefined;
      ApproximateTerrainHeights._terrainHeights = undefined;
    });

    afterEach(function () {
      if (!display.isDestroyed()) {
        display.destroy();
      }
      dataSourceCollection.removeAll();
    });

    function MockVisualizer() {
      this.updatesCalled = 0;
      this.lastUpdateTime = undefined;
      this.destroyed = false;

      this.getBoundingSphereResult = undefined;
      this.getBoundingSphereState = undefined;
    }

    MockVisualizer.prototype.update = function (time) {
      this.lastUpdateTime = time;
      this.updatesCalled++;
      return true;
    };

    MockVisualizer.prototype.getBoundingSphere = function (entity, result) {
      this.getBoundingSphereResult.clone(result);
      return this.getBoundingSphereState;
    };

    MockVisualizer.prototype.isDestroyed = function () {
      return this.destroyed;
    };

    MockVisualizer.prototype.destroy = function () {
      this.destroyed = true;
    };

    function visualizersCallback() {
      return [new MockVisualizer()];
    }

    it("constructor sets expected values", function () {
      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
        visualizersCallback: visualizersCallback,
      });

      expect(display.scene).toBe(scene);
      expect(display.dataSources).toBe(dataSourceCollection);
      expect(display.isDestroyed()).toEqual(false);
      expect(display.defaultDataSource).toBeDefined();

      display.destroy();
    });

    it("Computes complete bounding sphere.", function () {
      var visualizer1 = new MockVisualizer();
      visualizer1.getBoundingSphereResult = new BoundingSphere(
        new Cartesian3(1, 2, 3),
        456
      );
      visualizer1.getBoundingSphereState = BoundingSphereState.DONE;

      var visualizer2 = new MockVisualizer();
      visualizer2.getBoundingSphereResult = new BoundingSphere(
        new Cartesian3(7, 8, 9),
        1011
      );
      visualizer2.getBoundingSphereState = BoundingSphereState.DONE;

      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
        visualizersCallback: function () {
          return [visualizer1, visualizer2];
        },
      });

      var entity = new Entity();
      var dataSource = new MockDataSource();
      dataSource.entities.add(entity);
      display.dataSources.add(dataSource);

      display.update(Iso8601.MINIMUM_VALUE);

      var result = new BoundingSphere();
      var state = display.getBoundingSphere(entity, true, result);

      var expected = BoundingSphere.union(
        visualizer1.getBoundingSphereResult,
        visualizer2.getBoundingSphereResult
      );

      expect(state).toBe(BoundingSphereState.DONE);
      expect(result).toEqual(expected);
    });

    it("Computes partial bounding sphere.", function () {
      var visualizer1 = new MockVisualizer();
      visualizer1.getBoundingSphereResult = new BoundingSphere(
        new Cartesian3(1, 2, 3),
        456
      );
      visualizer1.getBoundingSphereState = BoundingSphereState.PENDING;

      var visualizer2 = new MockVisualizer();
      visualizer2.getBoundingSphereResult = new BoundingSphere(
        new Cartesian3(7, 8, 9),
        1011
      );
      visualizer2.getBoundingSphereState = BoundingSphereState.DONE;

      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
        visualizersCallback: function () {
          return [visualizer1, visualizer2];
        },
      });

      var entity = new Entity();
      var dataSource = new MockDataSource();
      dataSource.entities.add(entity);
      display.dataSources.add(dataSource);

      display.update(Iso8601.MINIMUM_VALUE);

      var result = new BoundingSphere();
      var state = display.getBoundingSphere(entity, true, result);

      expect(state).toBe(BoundingSphereState.DONE);
      expect(result).toEqual(visualizer2.getBoundingSphereResult);
    });

    it("Fails complete bounding sphere if allowPartial false.", function () {
      var visualizer1 = new MockVisualizer();
      visualizer1.getBoundingSphereResult = new BoundingSphere(
        new Cartesian3(1, 2, 3),
        456
      );
      visualizer1.getBoundingSphereState = BoundingSphereState.PENDING;

      var visualizer2 = new MockVisualizer();
      visualizer2.getBoundingSphereResult = new BoundingSphere(
        new Cartesian3(7, 8, 9),
        1011
      );
      visualizer2.getBoundingSphereState = BoundingSphereState.DONE;

      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
        visualizersCallback: function () {
          return [visualizer1, visualizer2];
        },
      });

      var entity = new Entity();
      display.defaultDataSource.entities.add(entity);

      var result = new BoundingSphere();
      var state = display.getBoundingSphere(entity, false, result);

      expect(state).toBe(BoundingSphereState.PENDING);
    });

    it("Fails bounding sphere for entity without visualization.", function () {
      display = new DataSourceDisplay({
        dataSourceCollection: dataSourceCollection,
        scene: scene,
      });
      var entity = new Entity();
      var dataSource = new MockDataSource();
      dataSource.entities.add(entity);
      display.dataSources.add(dataSource);
      display.update(Iso8601.MINIMUM_VALUE);

      var result = new BoundingSphere();
      var state = display.getBoundingSphere(entity, false, result);
      expect(state).toBe(BoundingSphereState.FAILED);
      display.destroy();
    });

    it("Fails bounding sphere for entity not in a data source.", function () {
      display = new DataSourceDisplay({
        dataSourceCollection: dataSourceCollection,
        scene: scene,
      });
      display.update(Iso8601.MINIMUM_VALUE);

      var entity = new Entity();
      var result = new BoundingSphere();
      var state = display.getBoundingSphere(entity, false, result);
      expect(state).toBe(BoundingSphereState.FAILED);
      display.destroy();
    });

    it("Compute bounding sphere throws without entity.", function () {
      display = new DataSourceDisplay({
        dataSourceCollection: dataSourceCollection,
        scene: scene,
      });
      var result = new BoundingSphere();
      expect(function () {
        display.getBoundingSphere(undefined, false, result);
      }).toThrowDeveloperError();
    });

    it("Compute bounding sphere throws without result.", function () {
      display = new DataSourceDisplay({
        dataSourceCollection: dataSourceCollection,
        scene: scene,
      });
      var entity = new Entity();
      expect(function () {
        display.getBoundingSphere(entity, false, undefined);
      }).toThrowDeveloperError();
    });

    it("Compute bounding sphere throws without allowPartial.", function () {
      display = new DataSourceDisplay({
        dataSourceCollection: dataSourceCollection,
        scene: scene,
      });
      var entity = new Entity();
      var result = new BoundingSphere();
      expect(function () {
        display.getBoundingSphere(entity, undefined, result);
      }).toThrowDeveloperError();
    });

    it("destroy does not destroy underlying data sources", function () {
      var dataSource = new MockDataSource();
      dataSourceCollection.add(dataSource);

      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
      });

      expect(dataSource.destroyed).toEqual(false);

      display.destroy();

      expect(dataSource.destroyed).toEqual(false);
      expect(display.isDestroyed()).toEqual(true);
    });

    it("calling update updates data sources", function () {
      var source1 = new MockDataSource();
      var source2 = new MockDataSource();

      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
        visualizersCallback: visualizersCallback,
      });
      dataSourceCollection.add(source1);
      dataSourceCollection.add(source2);

      var source1Visualizer = source1._visualizers[0];
      expect(source1Visualizer).toBeInstanceOf(MockVisualizer);

      var source2Visualizer = source2._visualizers[0];
      expect(source2Visualizer).toBeInstanceOf(MockVisualizer);

      //Nothing should have happened yet because we haven't called update.
      expect(source1Visualizer.updatesCalled).toEqual(0);
      expect(source2Visualizer.updatesCalled).toEqual(0);

      //Update should call update on the visualizers
      display.update(Iso8601.MINIMUM_VALUE);
      expect(source1Visualizer.lastUpdateTime).toEqual(Iso8601.MINIMUM_VALUE);
      expect(source1Visualizer.updatesCalled).toEqual(1);
      expect(source2Visualizer.lastUpdateTime).toEqual(Iso8601.MINIMUM_VALUE);
      expect(source2Visualizer.updatesCalled).toEqual(1);
    });

    it("ready is true when datasources are ready", function () {
      var source1 = new MockDataSource();
      var source2 = new MockDataSource();

      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
        visualizersCallback: visualizersCallback,
      });
      expect(display.ready).toBe(false);

      dataSourceCollection.add(source1);
      dataSourceCollection.add(source2);
      display.update(Iso8601.MINIMUM_VALUE);
      expect(display.ready).toBe(true);

      spyOn(MockVisualizer.prototype, "update").and.returnValue(false);
      display.update(Iso8601.MINIMUM_VALUE);
      expect(display.ready).toBe(false);
    });

    it("constructor throws if scene undefined", function () {
      expect(function () {
        return new DataSourceDisplay({
          scene: undefined,
          dataSourceCollection: dataSourceCollection,
          visualizersCallback: visualizersCallback,
        });
      }).toThrowDeveloperError();
    });

    it("constructor throws if options undefined", function () {
      expect(function () {
        return new DataSourceDisplay(undefined);
      }).toThrowDeveloperError();
    });

    it("constructor throws if dataSourceCollection undefined", function () {
      expect(function () {
        return new DataSourceDisplay({
          scene: scene,
          dataSourceCollection: undefined,
          visualizersCallback: visualizersCallback,
        });
      }).toThrowDeveloperError();
    });

    it("update throws if time undefined", function () {
      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
        visualizersCallback: visualizersCallback,
      });
      expect(function () {
        return display.update();
      }).toThrowDeveloperError();
    });

    it("verify update returns false till terrain heights are initialized", function () {
      ApproximateTerrainHeights._initPromise = undefined;
      ApproximateTerrainHeights._terrainHeights = undefined;

      var source1 = new MockDataSource();
      var source2 = new MockDataSource();

      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
        visualizersCallback: visualizersCallback,
      });
      dataSourceCollection.add(source1);
      dataSourceCollection.add(source2);
      display.update(Iso8601.MINIMUM_VALUE);
      expect(display.ready).toBe(false);

      return GroundPrimitive.initializeTerrainHeights().then(function () {
        display.update(Iso8601.MINIMUM_VALUE);
        expect(display.ready).toBe(true);
      });
    });

    it("sets dataSource primitives on add", function () {
      var source = new MockDataSource();

      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
        visualizersCallback: visualizersCallback,
      });

      dataSourceCollection.add(source);

      expect(source._primitives).toBeDefined();
      expect(source._groundPrimitives).toBeDefined();

      expect(display._primitives.contains(source._primitives)).toBe(true);
      expect(display._groundPrimitives.contains(source._groundPrimitives)).toBe(
        true
      );
    });

    it("cleans up primitives on dataSource removed", function () {
      var source = new MockDataSource();

      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
        visualizersCallback: visualizersCallback,
      });

      dataSourceCollection.add(source);

      expect(display._primitives.contains(source._primitives)).toBe(true);
      expect(display._groundPrimitives.contains(source._groundPrimitives)).toBe(
        true
      );

      dataSourceCollection.remove(source);

      expect(display._primitives.length).toBe(1);
      expect(display._groundPrimitives.length).toBe(1);
    });

    it("raises primitives on dataSource raise", function () {
      var source1 = new MockDataSource();
      var source2 = new MockDataSource();
      var source3 = new MockDataSource();

      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
        visualizersCallback: visualizersCallback,
      });

      dataSourceCollection.add(source1);
      dataSourceCollection.add(source2);
      dataSourceCollection.add(source3);

      dataSourceCollection.raise(source1);

      expect(display._primitives.get(1)).toBe(source2._primitives);
      expect(display._primitives.get(2)).toBe(source1._primitives);
      expect(display._primitives.get(3)).toBe(source3._primitives);
    });

    it("lowers primitives on dataSource lower", function () {
      var source1 = new MockDataSource();
      var source2 = new MockDataSource();
      var source3 = new MockDataSource();

      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
        visualizersCallback: visualizersCallback,
      });

      dataSourceCollection.add(source1);
      dataSourceCollection.add(source2);
      dataSourceCollection.add(source3);

      dataSourceCollection.lower(source3);

      expect(display._primitives.get(1)).toBe(source1._primitives);
      expect(display._primitives.get(2)).toBe(source3._primitives);
      expect(display._primitives.get(3)).toBe(source2._primitives);
    });

    it("raises primitives to top on dataSource raiseToTop", function () {
      var source1 = new MockDataSource();
      var source2 = new MockDataSource();
      var source3 = new MockDataSource();

      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
        visualizersCallback: visualizersCallback,
      });

      dataSourceCollection.add(source1);
      dataSourceCollection.add(source2);
      dataSourceCollection.add(source3);

      dataSourceCollection.raiseToTop(source1);

      expect(display._primitives.get(1)).toBe(source2._primitives);
      expect(display._primitives.get(2)).toBe(source3._primitives);
      expect(display._primitives.get(3)).toBe(source1._primitives);
    });

    it("lowers primitives to bottom on dataSource lowerToBottom", function () {
      var source1 = new MockDataSource();
      var source2 = new MockDataSource();
      var source3 = new MockDataSource();

      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
        visualizersCallback: visualizersCallback,
      });

      dataSourceCollection.add(source1);
      dataSourceCollection.add(source2);
      dataSourceCollection.add(source3);

      dataSourceCollection.lowerToBottom(source3);

      expect(display._primitives.get(1)).toBe(source3._primitives);
      expect(display._primitives.get(2)).toBe(source1._primitives);
      expect(display._primitives.get(3)).toBe(source2._primitives);
    });

    it("adds primitives to scene when dataSource is added to the collection", function () {
      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
        visualizersCallback: visualizersCallback,
      });
      expect(scene.primitives.contains(display._primitives)).toBe(false);
      expect(scene.groundPrimitives.contains(display._groundPrimitives)).toBe(
        false
      );

      dataSourceCollection.add(new MockDataSource());

      expect(scene.primitives.contains(display._primitives)).toBe(true);
      expect(scene.groundPrimitives.contains(display._groundPrimitives)).toBe(
        true
      );
    });

    it("adds primitives to scene if dataSourceCollection is not empty", function () {
      dataSourceCollection.add(new MockDataSource());
      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
        visualizersCallback: visualizersCallback,
      });

      expect(scene.primitives.contains(display._primitives)).toBe(true);
      expect(scene.groundPrimitives.contains(display._groundPrimitives)).toBe(
        true
      );
    });

    it("adds primitives to the scene when entities are added to the default dataSource", function () {
      display = new DataSourceDisplay({
        scene: scene,
        dataSourceCollection: dataSourceCollection,
        visualizersCallback: visualizersCallback,
      });
      expect(scene.primitives.contains(display._primitives)).toBe(false);
      expect(scene.groundPrimitives.contains(display._groundPrimitives)).toBe(
        false
      );

      display.defaultDataSource.entities.add(new Entity());

      expect(scene.primitives.contains(display._primitives)).toBe(true);
      expect(scene.groundPrimitives.contains(display._groundPrimitives)).toBe(
        true
      );
    });
  },
  "WebGL"
);
