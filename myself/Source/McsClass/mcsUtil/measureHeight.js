import { default as ScreenSpaceEventType } from '../../Core/ScreenSpaceEventType.js';
import { default as ScreenSpaceEventHandler } from '../../Core/ScreenSpaceEventHandler.js';
import { default as Math } from '../../Core/Math.js';
import { default as Color } from '../../Core/Color.js';
import { default as HeightReference } from '../../Scene/HeightReference.js';
import { default as LabelStyle } from '../../Scene/LabelStyle.js';
import { default as Cartesian3 } from '../.././Core/Cartesian3.js';
import { default as PolylineDashMaterialProperty } from '../.././DataSources/PolylineDashMaterialProperty.js';
import { default as CallbackProperty } from '../.././DataSources/CallbackProperty.js';

export default class measureHeight{
    constructor(viewer){
        this.viewer = viewer;
        this.scene = this.viewer.scene;
        this.canvas = this.viewer.scene.canvas;
        this.camera = this.viewer.scene.camera;
        this.ellipsoid = this.viewer.scene.globe.ellipsoid;
        this.entity = null;
        this.entity1 = null;
        this.entity2 = null;
        this.positions = null;
        this.drawHandler = null;
        this.layerId = 'meaHeight';
        this.markers = {};
        this.material = null;
    }
    startDraw(callBack){
        let _this = this;
        this.positions = [];
        this.positions1 = [];
        this.positions2 = [];
        this.fontColor = Color.LIGHTCYAN;
        this.lineColor = Color.fromCssColorString('#0d8fe5');

        if (this.entity != null) {
            this.viewer.entities.remove(this.entity);
        }
        this.entity = null;
        var floatingPoint = [];
        this.drawHandler = new ScreenSpaceEventHandler(this.canvas);
        _this.drawHandler.setInputAction(function (event) {
            var position = event.position;
            if (!position) {
                return;
            }
            var cartesian = _this.scene.pickPosition(position);
            
            //var cartesian = _this.scene.pickPosition(position); // _this.scene.globe.pick(ray, _this.scene);
            if (!cartesian) {
                cartesian = _this.positions[_this.positions.length - 1];
            }
            if(_this.positions.length > 2){
                return
            }
            var num = _this.positions.length;
            if (num == 0) {
                _this.positions.push(cartesian);
                _this.positions1.push(cartesian);
                floatingPoint.push(_this._createPoint(cartesian));
               _this.entity = _this._showPolyline2Map(_this.positions);
            }
            _this.positions.push(cartesian);
            _this.positions1.push(cartesian);
        
        }, ScreenSpaceEventType.LEFT_CLICK);
        _this.drawHandler.setInputAction(function (movement) {
            if (_this.drawHandler) {
                _this.drawHandler.destroy();
                _this.drawHandler = null;
            }
             if (callBack) {
                callBack([floatingPoint[0],floatingPoint[1],floatingPoint[2],_this.entity,_this.entity1,_this.entity2]);
             }
        }, ScreenSpaceEventType.RIGHT_CLICK);
        _this.drawHandler.setInputAction(function (event) {
            var position = event.endPosition;
            if (!position) {
                return;
            }
            if (_this.positions.length < 1) {
                return;
            }
            if(_this.positions.length > 2){
                return
            }
            var cartesian = _this.scene.pickPosition(position);
            //var cartesian = _this.scene.pickPosition(position) //_this.scene.globe.pick(ray, _this.scene);
            if (!cartesian) {
                return;
            }
            if(floatingPoint.length == 3){
                _this.viewer.entities.remove(floatingPoint[1]);
                _this.viewer.entities.remove(floatingPoint[2]);
                floatingPoint.splice(1,2)
            }
            _this.positions.pop();
            _this.positions.push(cartesian);
            floatingPoint.push(_this._createPoint(_this.positions[1]));
            let pos1 = _this._cartesianToLola(_this.positions[0]);
            let pos2 = _this._cartesianToLola(_this.positions[1]);
            let pos3 = null;
            var text1 ='';
            var text2 = '';
            if(pos1.height > pos2.height){
               pos3 = Cartesian3.fromDegrees(pos2.longitude,pos2.latitude,pos1.height);
               text1 = _this._getMeasureTip([pos3,_this.positions[0]],'水平距离');
               text2 = _this._getMeasureTip([_this.positions[1],pos3],'垂直距离');
            }else{
               pos3 = Cartesian3.fromDegrees(pos1.longitude,pos1.latitude,pos2.height);
               text1 = _this._getMeasureTip([pos3,_this.positions[0]],'垂直距离');
               text2 = _this._getMeasureTip([_this.positions[1],pos3],'水平距离');
            }
            _this.positions1.pop()
            _this.positions1.push(pos3);
            _this.positions2.pop();
            _this.positions2.pop();
            _this.positions2.push(pos3);
            _this.positions2.push(cartesian);
            floatingPoint.push(_this._createPoint(pos3));
            if(_this.entity1 == null){
                _this.entity1 = _this._showPolyline2Map(_this.positions1);
                _this.entity2 = _this._showPolyline2Map(_this.positions2);
            }else{
                let point = Cartesian3.midpoint(_this.positions[0],cartesian,new Cartesian3());
                let point1 = Cartesian3.midpoint(_this.positions[0],pos3,new Cartesian3());
                let point2 = Cartesian3.midpoint(pos3,cartesian,new Cartesian3());

                _this.entity.position.setValue(point);
                _this.entity1.position.setValue(point1);
                _this.entity2.position.setValue(point2);
            }
            var text = _this._getMeasureTip(_this.positions,'空间距离');
            _this.entity.label.text = text;
            _this.entity1.label.text = text1;
            _this.entity2.label.text = text2;
        }, ScreenSpaceEventType.MOUSE_MOVE);
    }
    _createPoint(cartesian) {
        var point = this.viewer.entities.add({
            position: cartesian,
            point: {
                show: true,
                color:Color.GOLD,
                pixelSize: 10,
                heightReference: HeightReference.NONE,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
        });
        return point;
    }
    _showPolyline2Map(points) {
        var _this = this;
        if (_this.material == null) {
            _this.material = new PolylineDashMaterialProperty({
                color: _this.lineColor
            });
        }
        var dynamicPositions = new CallbackProperty(function () {
            return points;
        }, false);
        var bData = {
            position: points[0],
            label: {
                text: "",
                font: '16px "微软雅黑", Arial, Helvetica, sans-serif, Helvetica',
                fillColor: _this.fontColor,
                style: LabelStyle.FILL_AND_OUTLINE,
                showBackground:true,
                heightReference: HeightReference.NONE,
                disableDepthTestDistance: Number.POSITIVE_INFINITY
            },
            polyline: {
                positions: dynamicPositions,
                clampToGround: false,
                width: 3,
                material: _this.lineColor
            }
        };
       let ent = _this.viewer.entities.add(bData);
       ent.layerId = _this.layerId;
       return ent
    }
    _getMeasureTip(pntList,txt) {
        var _this = this;
        var dis3d = Cartesian3.distance(pntList[0],pntList[1]);
        var tip = txt +"：" + dis3d.toFixed(3) + "米";
       
        return tip;
        
    }
    _cartesianToLola(poinstion) {
        var cartographic = this.scene.globe.ellipsoid.cartesianToCartographic(poinstion);
        //cartographic.height = this.scene.globe.getHeight(cartographic);
        var pos = {
            longitude: cartographic.longitude,
            latitude: cartographic.latitude,
            height: cartographic.height
        };
        pos.longitude = Math.toDegrees(pos.longitude);
        pos.latitude = Math.toDegrees(pos.latitude);
        return pos;
    }
}