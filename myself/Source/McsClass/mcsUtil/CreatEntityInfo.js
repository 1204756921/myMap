import { default as SceneTransforms } from '../.././Scene/SceneTransforms.js';
import { default as Cartesian3 } from '../../Core/Cartesian3.js';
import { defaultValue } from '../mcsUtil/defind';
/**
 * 将dom元素创建到地图中
 */
export default class CreatEntityInfo {
    constructor() {
    }
    /**
     * @creat 在视图中创建一个dom 元素
     * @param {HTMLElement} dom - dom元素
     * @param {any} viewer - 视图
     * @param {Vector3} point- 坐标
     * @param {string} domId - dom 元素的Id
     *  @param {number} xOffe - 屏幕横向偏移值
     * @param {number} yOffe - 屏幕纵向偏移值
     */
    static creatDom(dom, viewer, point, domId, xOffe, yOffe,) {
        viewer.container.appendChild(dom);
        let dirmoveHandler = function() {
            try {
                let pos = SceneTransforms.wgs84ToWindowCoordinates(viewer.scene, new Cartesian3(point.x, point.y, point.z));
                dom.style.bottom = viewer.canvas.clientHeight - defaultValue(yOffe,0) - pos.y + 'px';
                dom.style.left = pos.x + defaultValue(xOffe,0) + 'px';
            }
            catch (error) {
                console.log(error);
            }
        };
        viewer.scene.postRender.removeEventListener(dirmoveHandler, domId);
        viewer.scene.postRender.addEventListener(dirmoveHandler, domId);
    }
}
