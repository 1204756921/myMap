import { defined } from "../Source/Mcs.js";
import { DeveloperError } from "../Source/Mcs.js";

function createTileKey(xOrTile, y, level) {
  if (!defined(xOrTile)) {
    throw new DeveloperError("xOrTile is required");
  }

  if (typeof xOrTile === "object") {
    var tile = xOrTile;
    xOrTile = tile.x;
    y = tile.y;
    level = tile.level;
  }
  return "L" + level + "X" + xOrTile + "Y" + y;
}
export default createTileKey;
