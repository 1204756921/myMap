import meaDistance from './DrawLine'
import meaArea from './DrawPolygon'
import meaHeight from './measureHeight'


export default class MeasurementUtil{
    constructor(viewer){
        this.viewer = viewer;
        this.markers = [];
        this.measObj = null;
    }
    startMeasurement(type,drawType){
        switch (type) {
            case 'distance':
                 this.measObj = new meaDistance(this.viewer,drawType,true)
                break;
            case 'height':
                if(drawType != 'model'){
                    alert('在平面上无法测量高度')
                    return
                }
                 this.measObj = new meaHeight(this.viewer);
                break;
            case 'area':
                this.measObj = new meaArea(this.viewer,drawType,true)
                break;
            default:
                break;
        }
        this.measObj.startDraw(e=>{
            this.setMarkes(e)
        });
    }
    setMarkes(e){
        if(e instanceof Array){
            e.forEach(element => {
                this.markers.push(element);
            });
        }else{
            this.markers.push(e);
        }
        
    }
    clearMarke(){
        this.markers.forEach(element => {
            this.viewer.entities.remove(element);
        });
        
    }
}