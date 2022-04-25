import ImageLayer from "../mcsBaseMap/ImageLayer";
import { defaultValue } from '../mcsUtil/defind';
import { default as WebMapServiceImageryProvider } from '../../Scene/WebMapServiceImageryProvider.js';
export default class WmsImageLayer extends ImageLayer {
    constructor(options) {
        super();
        this.id = defaultValue(options.id, (new Date()).getTime());
        this.name = defaultValue(options.name, 'wmsMap');
        this._show = defaultValue(options.show, true);
        this.url = options.url;
        this.layers = options.layers;
        this.parameters = options.parameters;
        this.type = "WmsImageLayer";
    }
    set show(val) {
        this._show = val;
        this.layer.show = val;
    }
    get show() {
        return this._show;
    }
    addTo(map) {
        this.map = map;
        this.layer = this.map.Viewer.imageryLayers.addImageryProvider(new WebMapServiceImageryProvider({
            url: this.url,
            layers: this.layers,
            parameters: this.parameters,
        }));
        map.mapLayer.set(this.id,this.layer);
    }
    remove() {
        if (this.map) {
            this.map.Viewer.imageryLayers.remove(this.layer);
            this.map.mapLayer.delete(this.id)
        }
    }
      /** 
    * 修改图层的颜色样式
    * @param {number} brightness —亮度 默认1.0
    * @param {number} contrast 对比度 默认1.0
    * @param {number} saturation —饱和度 默认1.0
    */ 
    changeStyle(brightness,contrast,saturation){
        if(this.layer){
            this.layer.brightness = defaultValue(brightness,1);
            this.layer.contrast = defaultValue(contrast,1);
            this.layer.saturation = defaultValue(saturation,1);
        }
    }
}
