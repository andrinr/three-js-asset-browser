import { 
    Mesh, 
    OrthographicCamera, 
    PerspectiveCamera, 
    Raycaster,
    Vector2,
    Color,
    Scene} from "three";
import { deepClone, highlight, setMeshMaterialProperties, unhighlight } from "./helpers";

import { dragID } from '../stores';

export enum DragState {
    IDLE,
    SELECTED,
    DRAGGING,
}

export class Dragger {
    private selectables : Mesh[];
    private raycaster : Raycaster;
    private camera : PerspectiveCamera | OrthographicCamera;

    public state : DragState;
    public mesh : Mesh;
    public areas : Mesh[];
    private intersectionPlane : Mesh;

    constructor (
        camera : PerspectiveCamera | OrthographicCamera,
        intersectionPlane : Mesh,
    ) {
        this.raycaster = new Raycaster();
        this.camera = camera;
        this.intersectionPlane = intersectionPlane;

        this.state = DragState.IDLE;
        this.selectables = [];
    }

    public update(mousePosition : Vector2, click : boolean, mouseDown : boolean, mouseOnScreen : boolean) {

        const intersectionMesh = this.getIntersectedMesh(mousePosition);

        // Mouse intersects with a mesh but is not pressed
        // In this case we highlight the mesh
        if (intersectionMesh && !click && this.state === DragState.IDLE) {
            this.select(intersectionMesh);
            this.mesh = intersectionMesh;
            this.state = DragState.SELECTED;

            console.log("Mouse intersects with a mesh put not pressed");
        }
        // Mouse intersects with a mesh and is pressed for the first time
        // In this case we trigger the drag
        else if (intersectionMesh && click) {
  
            dragID.set(this.mesh.userData['assetID']);
   
            console.log("Mouse intersects with a mesh and is pressed for the first time");
        }
        // Mouse is still pressed and dragging the mesh
        // In this case we simply update the mesh position
        else if (this.state === DragState.DRAGGING && mouseOnScreen) {
            this.dragMesh(this.mesh, mousePosition);

            console.log("Mouse is still pressed and dragging the mesh");
        }
        else if (this.mesh && this.state !== DragState.DRAGGING) {
            this.unselect(this.mesh);
            this.state = DragState.IDLE;

            console.log("Stop drag")
        }
        
    }

    public startDrag(mesh : Mesh, id : number, areas : Mesh[]) {
        this.mesh = deepClone(mesh);
        this.mesh.userData['assetID'] = id;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.state = DragState.DRAGGING;

        console.log("Start drag");

        this.select(this.mesh);

        this.areas = areas;
    }

    public stopDrag() {
        this.state = DragState.SELECTED;
        this.unselect(this.mesh);
    }

    public dragMesh(mesh : Mesh, mousePosition : Vector2) {
        console.log(this.intersectionPlane);
        this.raycaster.setFromCamera(mousePosition, this.camera);
        const intersections = this.raycaster.intersectObject(this.intersectionPlane);
        
        console.log(mesh);
        if (intersections.length > 0) {
            const intersection = intersections[0];

            const position = intersection.point;

            const prevY = mesh.position.y;
            mesh.position.set(position.x, prevY, position.z);
        }
    }

    private getIntersectedMesh(mousePosition : Vector2) : Mesh | undefined {
        this.raycaster.setFromCamera(mousePosition, this.camera);
        const intersects = this.raycaster.intersectObjects(this.selectables);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            const mesh = intersect.object as Mesh;

            return mesh;
        }

        return undefined;
    }

    public select(mesh : Mesh) {
        highlight(mesh);
    }

    public unselect(mesh : Mesh) {        
        unhighlight(mesh);
    }

    public addAsset(asset : Mesh) {
        this.selectables.push(asset);
    }

    public removeAsset(asset : Mesh) {
        this.selectables.splice(this.selectables.indexOf(asset), 1);
    }
}