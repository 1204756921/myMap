import { default as Cartesian3 } from '../.././Core/Cartesian3.js';
import { default as  Polyline} from '../mcsEntity/Polyline'
import * as turf from '@turf/turf'
import { default as Color } from '../../Core/Color.js';

export default class QueryMapData{
    constructor(){
        this.ajax = new XMLHttpRequest();
        this.instance = null
    }
    static init(){
        if(!this.instance){
            this.instance = new QueryMapData()
        }
        return this.instance;
    }
    /** 
    * @param url -地图服务地址
    * @param key -查询的字段名
    * @param value - 查询的字段值
    * @returns features 与传入多边形相交的几何对象数组
    */
    queryFromAttribute(url, key,value){
        this.ajax.open('post',url,false);
        this.ajax.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        let parme = 'cql_filter=' + encodeURIComponent( key +" like '%"+value+"%'")
        this.ajax.send(parme);
        if(this.ajax.status == 200){
             let data = JSON.parse(this.ajax.responseText)
             return data.features
        }
    }
    /** 
     * 地图空间查询
    * @param url -地图服务地址
    * @param points - 用来空间查询的多边形的顶点数组(经纬度)
    * @returns features 与传入多边形相交的几何对象数组
    */
    queryFromSpce(url,points){
        if(!points || points.length < 1){
            return
        }
        let str = null;
        points.forEach(element => {
            if(str != null){
                str += ','
                str += element.toString().replace(',',' ')
             }else{
               str = element.toString().replace(',',' ')
             }
        });
        this.ajax.open('post',url,false);
        this.ajax.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        let parme = 'cql_filter=' + "INTERSECTS(the_geom,POLYGON(("+str+")))"
        this.ajax.send(parme);
        if(this.ajax.status == 200){
            let data = JSON.parse(this.ajax.responseText)
             return data.features
       }
    }
    /** 
     地图属性查询
    * @param url -地图服务地址
    * @param key -查询的字段名
    * @param value - 查询的字段值
    * @param map -地图管理对象
    */
    queryAndPosition(url, key,value,map){
        if(!map || !url || !key || !value){
            return
        }
        this.ajax.open('post',url,false);
        this.ajax.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        let parme = 'cql_filter=' + encodeURIComponent( key +" like '%"+value+"%'")
        this.ajax.send(parme);
        if(this.ajax.status == 200){
             let data = JSON.parse(this.ajax.responseText)
             let laln = data.features[0].geometry.coordinates[0][0]
             let point = Cartesian3.fromDegrees(laln[0],laln[1],0)
             map.pointToTarget(point)
        }
    }
    /**
     * 获取专题地图数据分类
     * @param url 专题地图的WFS服务地址
     * @param key 分类依据的字段
     * @returns arr 分类之后的数据数组
     */
    getMapDataClassification(url,key){
        this.ajax.open('post',url,false);
        this.ajax.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        this.ajax.send();
        if(this.ajax.status == 200){
            let data = JSON.parse(this.ajax.responseText)
            let arr =[];
            let obj = {};
            data.features.forEach(element => {
                obj[element.properties[key]] = obj[element.properties[key]] || []
                obj[element.properties[key]].push(element);
            });
            for (const k in obj) {
               let oj ={name:k,value:obj[k].length}
               arr.push(oj);
            }
            return arr
       }
    }
    /**
     * 路劲规划
     * @param {string} url -路径地图wms服务
     * @param {string} layerName - sql视图图层名
     * @param {Array} startPoint - 起点坐标(经纬度)
     * @param {Array} endPoint - 终点坐标(经纬度)
     * @param {McsVeiwer} map - 地图管理器
     * @param {Color} color - 路径颜色
     * @returns line 路径实体
     */
    loadRoutPaht(url,layerName,startPoint,endPoint,map,color=new Color(0,1,1,1)){
        if(!url || !layerName || !startPoint || !endPoint || !map){
            return
        }
        var viewparams = [
            'x1:'+startPoint[0], 'y1:'+startPoint[1],
            'x2:'+endPoint[0], 'y2:'+endPoint[1]
        ];
        var vp = viewparams.join(';');
        let sr = url+"?service=WFS&version=1.1.0&request=GetFeature&typeName="+layerName+"&outputFormat=application/json&srsName=EPSG:4326&viewparams="+vp
        this.ajax.open('get',sr,false);
        this.ajax.send();
        if(this.ajax.status == 200){
            let points =[]
            let data = JSON.parse(this.ajax.responseText)
            points.push(Cartesian3.fromDegrees(startPoint[0],startPoint[1],0))
            for (let i = 0; i < data.features.length; i++) {
                let el = data.features[i];
      
                for (let j = 0; j < el.geometry.coordinates.length; j++) {
                    let p = el.geometry.coordinates[j];
                    // let pos = this.mercatorToLonlat({x:p[0],y:p[1]})
                    if(j == el.geometry.coordinates.length-1 && i == data.features.length-1){
                      
                    }else if(j == 0 && i == 0){
                      
                    }else{
                        points.push(Cartesian3.fromDegrees(p[0],p[1],0));
                    }
                    
                }
            }
            points.push(Cartesian3.fromDegrees(endPoint[0],endPoint[1],0))
            let polyline = new Polyline(
                {
                    name:'rout',
                    positions:points,
                    width:4,
                    color:color
                }
            )
            let line = polyline.addTo(map)
            return line
        }
    }
    /** 
     * 轨迹纠偏
     * @param {Array} points -路径坐标点数组(经纬度)
     * @param {Array} point - 需要纠正的点坐标(经纬度)
     * @returns {Array} snapped 纠正之后的点坐标
     */
    deviationChange(points,point){
        var line = turf.lineString(points);
        var pt = turf.point(point);
        
        var snapped = turf.nearestPointOnLine(line, pt, {units: 'miles'});
        return snapped
    }
}