import { Clock } from "../../../Source/Mcs.js";
import { Timeline } from "../../../Source/Mcs.js";

describe("Widgets/Timeline/Timeline", function () {
  var container;
  beforeEach(function () {
    container = document.createElement("span");
    container.id = "container";
    container.style.width = "1px";
    container.style.height = "1px";
    document.body.appendChild(container);
  });

  afterEach(function () {
    document.body.removeChild(container);
  });

  it("sanity check", function () {
    var timeline = new Timeline(container, new Clock());
    timeline.resize();
    expect(timeline.isDestroyed()).toEqual(false);
    timeline.destroy();
    expect(timeline.isDestroyed()).toEqual(true);
  });
});
