import { 
    Mesh, 
    OrthographicCamera, 
    PerspectiveCamera, 
    Raycaster,
    Vector2,
    Box3,
    Color,
    Scene} from "three";
import { deepClone, highlight, setMeshMaterialProperties, unhighlight } from "./helpers";

import { dragID } from './stores';

export enum DragState {
    IDLE,
    SELECTED,
    DRAGGING,
}

export class Dragger {
    private selectables : Mesh[];
    private raycaster : Raycaster;
    private camera : PerspectiveCamera | OrthographicCamera;
    private scene : Scene;

    public state : DragState;
    public mesh : Mesh;
    public areas : Mesh[];
    private intersectionPlane : Mesh;
    public valid : boolean;

    constructor (
        camera : PerspectiveCamera | OrthographicCamera,
        intersectionPlane : Mesh,
        scene : Scene
    ) {
        this.raycaster = new Raycaster();
        this.camera = camera;
        this.intersectionPlane = intersectionPlane;
        this.scene = scene;

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
        }
        // Mouse intersects with a mesh and is pressed for the first time
        // In this case we trigger the drag
        else if (intersectionMesh && click && this.state !== DragState.DRAGGING) {
            this.state = DragState.DRAGGING;
            this.mesh = intersectionMesh;
            this.scene.remove(this.mesh);
            // remove from selectables
            this.selectables.splice(this.selectables.indexOf(this.mesh), 1);
            dragID.set(this.mesh.userData['assetID']);
        }
        // Mouse is still pressed and dragging the mesh
        // In this case we simply update the mesh position
        else if (this.state === DragState.DRAGGING) {
            this.dragMesh(this.mesh, mousePosition, mouseOnScreen);
        }
        else if (!intersectionMesh && this.mesh) {
            this.unselect(this.mesh);
            this.state = DragState.IDLE;
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
    }

    public dragMesh(mesh : Mesh, mousePosition : Vector2, mouseOnScreen : boolean) {
        this.mesh = mesh;
        if (!mouseOnScreen) {
            mesh.visible = false;
        }
        else {
            mesh.visible = true;
        }

        this.raycaster.setFromCamera(mousePosition, this.camera);
        const intersections = this.raycaster.intersectObject(this.intersectionPlane);
        
        if (intersections.length > 0) {
            const intersection = intersections[0];

            const position = intersection.point;

            const prevY = mesh.position.y;
            mesh.position.set(position.x, prevY, position.z);
            mesh.position.x = Math.round(mesh.position.x);
            mesh.position.z = Math.round(mesh.position.z);
        }

        const boundingBox = new Box3().setFromObject(mesh);
        let intersect = false;
        for (let area of this.areas) {
            const areaBoundingBox = new Box3().setFromObject(area);

            if (boundingBox.intersectsBox(areaBoundingBox)) {
                intersect = true;
                break;
            }
        }

        if (!intersect) {
            this.valid = false;
            highlight(mesh, false);
        }
        else {
            this.valid = true;
            highlight(mesh, true);
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
        highlight(mesh, true);
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