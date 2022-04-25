import { defaultValue } from "../Source/Mcs.js";
import { GeographicProjection } from "../Source/Mcs.js";
import { JulianDate } from "../Source/Mcs.js";
import { Camera } from "../Source/Mcs.js";
import { CreditDisplay } from "../Source/Mcs.js";
import { FrameState } from "../Source/Mcs.js";
import { JobScheduler } from "../Source/Mcs.js";

function createFrameState(context, camera, frameNumber, time) {
  // Mock frame-state for testing.
  var frameState = new FrameState(
    context,
    new CreditDisplay(
      document.createElement("div"),
      undefined,
      document.createElement("div")
    ),
    new JobScheduler()
  );

  var projection = new GeographicProjection();
  frameState.mapProjection = projection;
  frameState.frameNumber = defaultValue(frameNumber, 1.0);
  frameState.time = defaultValue(
    time,
    JulianDate.fromDate(new Date("January 1, 2011 12:00:00 EST"))
  );

  camera = defaultValue(
    camera,
    new Camera({
      drawingBufferWidth: 1,
      drawingBufferHeight: 1,
      mapProjection: projection,
    })
  );
  frameState.camera = camera;
  frameState.cullingVolume = camera.frustum.computeCullingVolume(
    camera.position,
    camera.direction,
    camera.up
  );

  frameState.terrainExaggeration = 1.0;

  frameState.passes.render = true;
  frameState.passes.pick = false;

  frameState.minimumDisableDepthTestDistance = 0.0;

  return frameState;
}
export default createFrameState;
