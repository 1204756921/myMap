import { clone } from "../Source/Mcs.js";
import { Texture } from "../Source/Mcs.js";
import { GlobeSurfaceTile } from "../Source/Mcs.js";
import { ImageryLayer } from "../Source/Mcs.js";
import { TerrainState } from "../Source/Mcs.js";
import { when } from "../Source/Mcs.js";

function TerrainTileProcessor(
  frameState,
  terrainProvider,
  imageryLayerCollection
) {
  this.frameState = frameState;
  this.terrainProvider = terrainProvider;
  this.imageryLayerCollection = imageryLayerCollection;
}

// Processes the given list of tiles until all terrain and imagery states stop changing.
TerrainTileProcessor.prototype.process = function (tiles, maxIterations) {
  var that = this;

  var deferred = when.defer();

  function getState(tile) {
    return [
      tile.state,
      tile.data ? tile.data.terrainState : undefined,
      tile.data && tile.data.imagery
        ? tile.data.imagery.map(function (imagery) {
            return [
              imagery.readyImagery ? imagery.readyImagery.state : undefined,
              imagery.loadingImagery ? imagery.loadingImagery.state : undefined,
            ];
          })
        : [],
    ];
  }

  function statesAreSame(a, b) {
    if (a.length !== b.length) {
      return false;
    }

    var same = true;
    for (var i = 0; i < a.length; ++i) {
      if (Array.isArray(a[i]) && Array.isArray(b[i])) {
        same = same && statesAreSame(a[i], b[i]);
      } else if (Array.isArray(a[i]) || Array.isArray(b[i])) {
        same = false;
      } else {
        same = same && a[i] === b[i];
      }
    }

    return same;
  }

  var iterations = 0;

  function next() {
    ++iterations;
    ++that.frameState.frameNumber;

    // Keep going until all terrain and imagery provider are ready and states are no longer changing.
    var changed = !that.terrainProvider.ready;

    for (var i = 0; i < that.imageryLayerCollection.length; ++i) {
      changed =
        changed || !that.imageryLayerCollection.get(i).imageryProvider.ready;
    }

    if (that.terrainProvider.ready) {
      tiles.forEach(function (tile) {
        var beforeState = getState(tile);
        GlobeSurfaceTile.processStateMachine(
          tile,
          that.frameState,
          that.terrainProvider,
          that.imageryLayerCollection
        );
        var afterState = getState(tile);
        changed =
          changed ||
          tile.data.terrainState === TerrainState.RECEIVING ||
          tile.data.terrainState === TerrainState.TRANSFORMING ||
          !statesAreSame(beforeState, afterState);
      });
    }

    if (!changed || iterations >= maxIterations) {
      deferred.resolve(iterations);
    } else {
      setTimeout(next, 0);
    }
  }

  next();

  return deferred.promise;
};

TerrainTileProcessor.prototype.mockWebGL = function () {
  spyOn(GlobeSurfaceTile, "_createVertexArrayForMesh").and.callFake(
    function () {
      var vertexArray = jasmine.createSpyObj("VertexArray", ["destroy"]);
      return vertexArray;
    }
  );

  spyOn(ImageryLayer.prototype, "_createTextureWebGL").and.callFake(function (
    context,
    imagery
  ) {
    var texture = jasmine.createSpyObj("Texture", ["destroy"]);
    texture.width = imagery.image.width;
    texture.height = imagery.image.height;
    return texture;
  });

  spyOn(ImageryLayer.prototype, "_finalizeReprojectTexture");

  spyOn(Texture, "create").and.callFake(function (options) {
    var result = clone(options);
    result.destroy = function () {};
    return result;
  });
};
export default TerrainTileProcessor;
