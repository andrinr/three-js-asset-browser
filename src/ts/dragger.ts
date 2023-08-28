import { 
    Mesh, 
    OrthographicCamera, 
    PerspectiveCamera, 
    Raycaster,
    Vector2,
    Color} from "three";

class Dragger {
    private selectables : Mesh[];
    private raycaster : Raycaster;
    private camera : PerspectiveCamera | OrthographicCamera;
    private emissiveColor : Color;

    constructor (
        camera : PerspectiveCamera | OrthographicCamera,
        emissiveColor : Color,
    ) {
        this.raycaster = new Raycaster();
        this.camera = camera;
        this.emissiveColor = emissiveColor;
    }

    public update(mousePosition : Vector2) {
        this.raycaster.setFromCamera(mousePosition, this.camera);
        const intersects = this.raycaster.intersectObjects(this.selectables);

        if (intersects.length > 0) {

            const intersect = intersects[0];

            const mesh = intersect.object as Mesh;




    private addAsset(asset : Mesh, id : number) {
        asset.userData.id = id;
        this.selectables.push(asset);
    }

    private removeAsset(asset : Mesh) {
        this.selectables.splice(this.selectables.indexOf(asset), 1);
    }


}