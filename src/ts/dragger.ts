import { 
    Mesh, 
    OrthographicCamera, 
    PerspectiveCamera, 
    Raycaster,
    Vector2,
    Box3,
    Scene,
    Object3D,
    Vector3} from "three";
import {deepCloneObject, highlightObject, unhighlightObject } from "./helpers";

import { dragID } from '../stores';

export enum DragState {
    IDLE,
    SELECTED,
    DRAGGING,
}

export class Dragger {
    private selectables : Object3D[];
    private raycaster : Raycaster;
    private camera : PerspectiveCamera | OrthographicCamera;
    private scene : Scene;

    public state : DragState;
    public object : Object3D;
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

        const intersectionObject = this.getIntersObject(mousePosition);

        // Mouse intersects with a mesh but is not pressed
        // In this case we highlight the mesh
        if (intersectionObject && !click && this.state === DragState.IDLE) {
            this.select(intersectionObject);
            this.object = intersectionObject;
            this.state = DragState.SELECTED;
        }
        // Mouse intersects with a mesh and is pressed for the first time
        // In this case we trigger the drag
        else if (intersectionObject && click && this.state !== DragState.DRAGGING) {
            this.state = DragState.DRAGGING;
            this.object = intersectionObject;
            this.scene.remove(this.object);
            this.selectables.splice(this.selectables.indexOf(this.object), 1);
            dragID.set(this.object.userData['assetID']);
        }
        // Mouse is still pressed and dragging the mesh
        // In this case we simply update the mesh position
        else if (this.state === DragState.DRAGGING) {
            this.dragMesh(this.object, mousePosition, mouseOnScreen);
        }
        else if (!intersectionObject && this.object) {
            this.unselect(this.object);
            this.state = DragState.IDLE;
        }
    }

    public startDrag(object : Object3D, id : number, areas : Mesh[]) {
        this.object = deepCloneObject(object);
        this.object.castShadow = true;
        this.object.receiveShadow = true;
        this.state = DragState.DRAGGING;

        console.log(this.object);

        // console.log("Start drag");

        this.select(this.object);

        this.areas = areas;
    }

    public stopDrag() {
        this.state = DragState.SELECTED;
    }

    public dragMesh(object : Object3D, mousePosition : Vector2, mouseOnScreen : boolean) {
        this.object = object;
        if (!mouseOnScreen) {
            object.visible = false;
        }
        else {
            object.visible = true;
        }

        this.raycaster.setFromCamera(mousePosition, this.camera);
        const intersections = this.raycaster.intersectObject(this.intersectionPlane);
        
        if (intersections.length > 0) {
            const intersection = intersections[0];

            const position = intersection.point;
            
            object.position.set(position.x, position.y, position.z);
            object.position.x = Math.round(object.position.x + 0.5) - 0.5;
            object.position.z = Math.round(object.position.z + 0.5) - 0.5;
        }

        const boundingBox = new Box3().setFromObject(object);
        let intersect = false;
        for (let area of this.areas) {
            const areaBoundingBox = new Box3().setFromObject(area);
            
            
            if (areaBoundingBox.containsBox(boundingBox)) {
                intersect = true;
                break;
            }
        }

        if (!intersect) {
            this.valid = false;
            highlightObject(object, false);
        }
        else {
            this.valid = true;
            highlightObject(object, true);
        }
    }
    
    private getRoot(object : Object3D) : Object3D {
        if (object.parent && object.userData['assetID'] === undefined) {
            return this.getRoot(object.parent);
        }
        else {
            return object;
        }
    }

    private getIntersObject(mousePosition : Vector2) : Object3D | undefined {
        this.raycaster.setFromCamera(mousePosition, this.camera);
        const intersects = this.raycaster.intersectObjects(this.selectables);

        if (intersects.length > 0) {
            const intersect = intersects[0];
            // check if inside groupz

            const object = this.getRoot(intersect.object) as Object3D;

            return object;
        }

        return undefined;
    }

    public select(object : Object3D) {
        highlightObject(object, true);
    }

    public unselect(object : Object3D) {      
        unhighlightObject(object);
    }

    public addAsset(asset : Object3D) {
        this.selectables.push(asset);
    }

    public removeAsset(asset : Mesh) {
        this.selectables.splice(this.selectables.indexOf(asset), 1);
    }
}