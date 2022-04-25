import { default as Color } from '../../Core/Color.js';
import Overlay from '../mcsBaseMap/Overlay.js';
import { defaultValue } from '../mcsUtil/defind';
import ImageMaterialProperty from '../../DataSources/ImageMaterialProperty'
import CallbackProperty from '../../DataSources/CallbackProperty'
/**
     * @constructor
     * @param {Object} options - 实体选项
     * @param {String} options.id - 点标签id
     * @param {String} options.name - 点标签名称
     *  @param {Color} options.color - 点标签颜色
     * @param {Boolean} [options.show=true] - 是否显示
     * @param {Vector3[]} options.positions - 折线顶点坐标集合
     * @param {number[]} options.minimumHeights - 各点的最低高度，一个值就是统一高度
     * @param {number[]} options.maximumHeights - 各点的最高高度，一个值就是统一高度
     * @param {Boolean} options.lineMaterial -是否启用闪烁纹理
     * @param {String} options.img -闪烁纹理图片地址
     * @param {Boolean} options.outline -是否显示边框
     * @param {Boolean} options.outlineColor -边框线颜色
    */
export default class Wall extends Overlay {
    constructor(options) {
        super();
        this.positions = options.positions,
        this.id = defaultValue(options.id, null);
        this.name = options.name;
        this.show = defaultValue(options.show, true);
        this.color = defaultValue(options.color, Color.WHITE);
        this.minimumHeights = defaultValue(options.minimumHeights, 0);
        this.maximumHeights = defaultValue(options.maximumHeights, 20);
        this.outline = defaultValue(options.outline, true);
        this.lineMaterial = defaultValue(options.lineMaterial, false);
        this.img = options.img;
        this.outlineColor = defaultValue(options.outlineColor, Color.TRANSPARENT);
        this.keyArry = ['id', 'name','img','show', 'positions', 'minimumHeights', 'color', 'maximumHeights','outline','outlineColor'];
        this.options = options;
    }
    addTo(map) {
        let enti = {
            show: this.show,
            wall: {
                positions: this.positions,
                minimumHeights: this.minimumHeights,
                maximumHeights: this.maximumHeights,
                outline:this.outline,
                outlineColor:this.outlineColor,
                material:this.color
            }
        };
        if(this.lineMaterial){
            var alp = 1;
            var num = 0;
            enti.wall.material = new ImageMaterialProperty({
                image:this.img,
                transparent:true,
                color:new CallbackProperty(function () {
                    if ((num % 2) === 0){
                        alp -=0.05;
                    }else {
                        alp +=0.05;
                    }

                    if (alp <= 0.3){
                        num++;
                    }else if (alp >= 1){
                        num++;
                    }
                    return Color.WHITE.withAlpha(alp)
                },false)
              })
        }
        if (this.id && this.id != null) {
            enti.id = this.id;
        }
        for (let objKey of Object.keys(this.options)) {
            if (this.keyArry.indexOf(objKey) == -1) {
                enti[objKey] = this.options[objKey];
            }
        }
        this.map = map;
        this.entity = this.map.Viewer.entities.add(enti);
        this.id = enti.id;
        map.entityMap.set(this.id,this.entity);
        return this.entity;
    }
    remove() {
        if (this.map) {
            this.map.Viewer.entities.remove(this.entity);
            this.map.entityMap.delete(this.id);
        }
    }
    flyTo() {
        if (this.map) {
            this.map.Viewer.flyTo(this.entity);
        }
    }
}
