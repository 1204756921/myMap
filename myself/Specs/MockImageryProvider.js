import createTileKey from "./createTileKey.js";
import runLater from "./runLater.js";
import { GeographicTilingScheme } from "../Source/Mcs.js";
import { Resource } from "../Source/Mcs.js";
import { RuntimeError } from "../Source/Mcs.js";
import { when } from "../Source/Mcs.js";

function MockImageryProvider() {
  this.tilingScheme = new GeographicTilingScheme();
  this.ready = false;
  this.rectangle = this.tilingScheme.rectangle;
  this.tileWidth = 256;
  this.tileHeight = 256;
  this._requestImageWillSucceed = {};

  var that = this;
  Resource.fetchImage("./Data/Images/Green.png").then(function (image) {
    that.ready = true;
    that._image = image;
  });
}

MockImageryProvider.prototype.requestImage = function (x, y, level, request) {
  var willSucceed = this._requestImageWillSucceed[createTileKey(x, y, level)];
  if (willSucceed === undefined) {
    return undefined; // defer by default
  }

  var that = this;
  return runLater(function () {
    if (willSucceed === true) {
      return that._image;
    } else if (willSucceed === false) {
      throw new RuntimeError("requestImage failed as request.");
    }

    return when(willSucceed).then(function () {
      return that._image;
    });
  });
};

MockImageryProvider.prototype.requestImageWillSucceed = function (
  xOrTile,
  y,
  level
) {
  this._requestImageWillSucceed[createTileKey(xOrTile, y, level)] = true;
  return this;
};

MockImageryProvider.prototype.requestImageWillFail = function (
  xOrTile,
  y,
  level
) {
  this._requestImageWillSucceed[createTileKey(xOrTile, y, level)] = false;
  return this;
};

MockImageryProvider.prototype.requestImageWillDefer = function (
  xOrTile,
  y,
  level
) {
  this._requestImageWillSucceed[createTileKey(xOrTile, y, level)] = undefined;
  return this;
};

MockImageryProvider.prototype.requestImageWillWaitOn = function (
  promise,
  xOrTile,
  y,
  level
) {
  this._requestImageWillSucceed[createTileKey(xOrTile, y, level)] = promise;
  return this;
};
export default MockImageryProvider;
