import ImageLayer from "../mcsBaseMap/ImageLayer";
import { defaultValue } from '../mcsUtil/defind';
import Rectangle from '../../Core/Rectangle'
import { default as UrlTemplateImageryProvider } from '../../Scene/UrlTemplateImageryProvider.js';
export default class TmsImageLayer extends ImageLayer {
    constructor(options) {
        super();
        this.id = defaultValue(options.id, (new Date()).getTime());
        this.name = defaultValue(options.name, 'tmsMap');
        this._show = defaultValue(options.show, true);
        this.url = options.url;
        this.rectangle = options.rectangle;
        this.maximumLevel = options.maximumLevel;
        this.type = "TmsImageLayer";
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
        this.layer = this.map.Viewer.imageryLayers.addImageryProvider(new UrlTemplateImageryProvider({
                  url: this.url,
                  rectangle: Rectangle.fromDegrees(this.rectangle[0],this.rectangle[2],this.rectangle[1],this.rectangle[3]),
                  maximumLevel: this.maximumLevel
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
