/* eslint-disable no-unused-vars */


import {default as defined} from '../../Core/defined'
import { default as Event} from '../../Core/Event'
import {default as knockout} from '../../ThirdParty/knockout'
import {default as DeveloperError} from '../../Core/DeveloperError'

import registerKnockoutBindings from './core/registerKnockoutBindings'
import DistanceLegendViewModel from './viewModels/DistanceLegendViewModel'
import NavigationViewModel from './viewModels/NavigationViewModel'

//import './styles/cesium-navigation.css'
var CesiumEvent = Event
var Knockout = knockout

/**
 * @alias Navigation
 * @constructor
 *
 * @param {Viewer|CesiumWidget} viewerCesiumWidget The Viewer or CesiumWidget instance
 */
var Navigation = function (viewerCesiumWidget) {
  initialize.apply(this, arguments)

  this._onDestroyListeners = []
}

Navigation.prototype.distanceLegendViewModel = undefined
Navigation.prototype.navigationViewModel = undefined
Navigation.prototype.navigationDiv = undefined
Navigation.prototype.distanceLegendDiv = undefined
Navigation.prototype.terria = undefined
Navigation.prototype.container = undefined
Navigation.prototype._onDestroyListeners = undefined
Navigation.prototype._navigationLocked = false

Navigation.prototype.setNavigationLocked = function (locked) {
  this._navigationLocked = locked
  this.navigationViewModel.setNavigationLocked(this._navigationLocked)
}

Navigation.prototype.getNavigationLocked = function () {
  return this._navigationLocked
}

Navigation.prototype.destroy = function () {
  if (defined(this.navigationViewModel)) {
    this.navigationViewModel.destroy()
  }
  if (defined(this.distanceLegendViewModel)) {
    this.distanceLegendViewModel.destroy()
  }

  if (defined(this.navigationDiv)) {
    this.navigationDiv.parentNode.removeChild(this.navigationDiv)
  }
  delete this.navigationDiv

  if (defined(this.distanceLegendDiv)) {
    this.distanceLegendDiv.parentNode.removeChild(this.distanceLegendDiv)
  }
  delete this.distanceLegendDiv

  if (defined(this.container)) {
    this.container.parentNode.removeChild(this.container)
  }
  delete this.container

  for (var i = 0; i < this._onDestroyListeners.length; i++) {
    this._onDestroyListeners[i]()
  }
}

Navigation.prototype.addOnDestroyListener = function (callback) {
  if (typeof callback === 'function') {
    this._onDestroyListeners.push(callback)
  }
}

/**
 * @param {Viewer|CesiumWidget} viewerCesiumWidget The Viewer or CesiumWidget instance
 * @param options
 */
function initialize(viewerCesiumWidget, options) {
  if (!defined(viewerCesiumWidget)) {
    throw new DeveloperError('CesiumWidget or Viewer is required.')
  }

  //        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

  var cesiumWidget = document.getElementsByClassName('mcsmap-viewer')[0] //defined(viewerCesiumWidget.cesiumWidget) ? viewerCesiumWidget.cesiumWidget : viewerCesiumWidget

  var container = document.createElement('div')
  container.className = 'NavigationContainer'
  cesiumWidget.appendChild(container)

  this.terria = viewerCesiumWidget
  this.terria.options = (defined(options)) ? options : {}
  this.terria.afterWidgetChanged = new CesiumEvent()
  this.terria.beforeWidgetChanged = new CesiumEvent()
  this.container = container

  // this.navigationDiv.setAttribute("id", "navigationDiv");

  // Register custom Knockout.js bindings.  If you're not using the TerriaJS user interface, you can remove this.
  registerKnockoutBindings()

  if (!defined(this.terria.options.enableDistanceLegend) || this.terria.options.enableDistanceLegend) {
    this.distanceLegendDiv = document.createElement('div')
    container.appendChild(this.distanceLegendDiv)
    this.distanceLegendDiv.setAttribute('id', 'distanceLegendDiv')
    this.distanceLegendViewModel = DistanceLegendViewModel.create({
      container: this.distanceLegendDiv,
      terria: this.terria,
      mapElement: container,
      enableDistanceLegend: true
    })
  }

  if ((!defined(this.terria.options.enableZoomControls) || this.terria.options.enableZoomControls) && (!defined(this.terria.options.enableCompass) || this.terria.options.enableCompass)) {
    this.navigationDiv = document.createElement('div')
    this.navigationDiv.setAttribute('id', 'navigationDiv')
    container.appendChild(this.navigationDiv)
    // Create the navigation controls.
    this.navigationViewModel = NavigationViewModel.create({
      container: this.navigationDiv,
      terria: this.terria,
      enableZoomControls: true,
      enableCompass: true
    })
  } else if ((defined(this.terria.options.enableZoomControls) && !this.terria.options.enableZoomControls) && (!defined(this.terria.options.enableCompass) || this.terria.options.enableCompass)) {
    this.navigationDiv = document.createElement('div')
    this.navigationDiv.setAttribute('id', 'navigationDiv')
    container.appendChild(this.navigationDiv)
    // Create the navigation controls.
    this.navigationViewModel = NavigationViewModel.create({
      container: this.navigationDiv,
      terria: this.terria,
      enableZoomControls: false,
      enableCompass: true
    })
  } else if ((!defined(this.terria.options.enableZoomControls) || this.terria.options.enableZoomControls) && (defined(this.terria.options.enableCompass) && !this.terria.options.enableCompass)) {
    this.navigationDiv = document.createElement('div')
    this.navigationDiv.setAttribute('id', 'navigationDiv')
    container.appendChild(this.navigationDiv)
    // Create the navigation controls.
    this.navigationViewModel = NavigationViewModel.create({
      container: this.navigationDiv,
      terria: this.terria,
      enableZoomControls: true,
      enableCompass: false
    })
  } else if ((defined(this.terria.options.enableZoomControls) && !this.terria.options.enableZoomControls) && (defined(this.terria.options.enableCompass) && !this.terria.options.enableCompass)) {
    // this.navigationDiv.setAttribute("id", "navigationDiv");
    // container.appendChild(this.navigationDiv);
    // Create the navigation controls.
    //            this.navigationViewModel = NavigationViewModel.create({
    //                container: this.navigationDiv,
    //                terria: this.terria,
    //                enableZoomControls: false,
    //                enableCompass: false
    //            });
  }
}

export default Navigation
