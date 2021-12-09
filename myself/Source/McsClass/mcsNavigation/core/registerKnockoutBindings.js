/* eslint-disable no-unused-vars */

import {default as SvgPathBindingHandler} from '../../../Widgets/SvgPathBindingHandler'
import {default as knockout} from '../../../ThirdParty/knockout'

var Knockout = knockout
var registerKnockoutBindings = function () {
  SvgPathBindingHandler.register(Knockout)


  Knockout.bindingHandlers.embeddedComponent = {
    init: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
      var component = Knockout.unwrap(valueAccessor())
      component.show(element)
      return { controlsDescendantBindings: true }
    },
    update: function (element, valueAccessor, allBindings, viewModel, bindingContext) {
    }
  }
}

export default registerKnockoutBindings
