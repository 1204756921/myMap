import ProviderLayer from "../mcsBaseMap/ProviderLayer";
/**
   * @constructor
   * @param {Object} options - 图层选项
   * @param {String} options.id - 图层id
   * @param {String} options.name - 图层显示名称
   * @param {Boolean} options.show - 图层是否显示
   */
export default class VectorLayer extends ProviderLayer {
    constructor(options) {
        super();
        this.id = options.id;
        this.name = options.name;
        this._show = options.show;
        this.type = 'VectorLayer';
    }
    set show(val) {
        this._show = val;
        this.entityMap.forEach(element => {
            element.show = val;
        });
    }
    get show() {
        return this._show;
    }
    addTo(map) {
        this.map = map;
        this.entityMap.forEach(value => {
            this.map.Viewer.entities.add(value);
        });
    }
    remove() {
        if (this.map) {
            this.entityMap.forEach(element => {
                this.map.Viewer.entities.remove(element);
            });
        }
    }
    flyTo() {
        if (this.map) {
            this.map.Viewer.flyTo(this.entityMap.values().next().value);
        }
    }
    addEntity(Entity) {
        this.entityMap.set(Entity.id, Entity);
    }
    removeEntity(Entity) {
        this.entityMap.delete(Entity.id);
    }
}
