import { defaultValue } from "../Source/Mcs.js";
import { when } from "../Source/Mcs.js";

function runLater(functionToRunLater, milliseconds) {
  milliseconds = defaultValue(milliseconds, 0);

  var deferred = when.defer();
  setTimeout(function () {
    try {
      deferred.resolve(functionToRunLater());
    } catch (e) {
      deferred.reject(e);
    }
  }, milliseconds);
  return deferred.promise;
}
export default runLater;
