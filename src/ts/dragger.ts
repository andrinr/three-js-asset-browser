import { 
    Mesh, 
    OrthographicCamera, 
    PerspectiveCamera, 
    Raycaster,
    Vector2,
    Color,
    Scene} from "three";
import { deepClone, setMeshMaterialProperties } from "./helpers";

import { dragID, assets } from '../stores';
import type { Area } from "./assetInstance";

export class Dragger {
    private selectables : Mesh[];
    private raycaster : Raycaster;
    private camera : PerspectiveCamera | OrthographicCamera;
    private emissiveColor : Color;

    public mesh : Mesh;
    public areas : Mesh[];
    private dragging : boolean;
    private intersectionPlane : Mesh;

    constructor (
        camera : PerspectiveCamera | OrthographicCamera,
        emissiveColor : Color,
        intersectionPlane : Mesh,
    ) {
        this.raycaster = new Raycaster();
        this.camera = camera;
        this.emissiveColor = emissiveColor;
        this.intersectionPlane = intersectionPlane;

        this.dragging = false;
        this.selectables = [];
    }

    public update(mousePosition : Vector2, click : boolean, mouseDown : boolean, mouseOnScreen : boolean) {

        const intersectionMesh = this.getIntersectedMesh(mousePosition);
        // Mouse intersects with a mesh put not pressed
        // In this case we highlight the mesh
        if (intersectionMesh && !mouseDown) {
            this.select(intersectionMesh);
            this.mesh = intersectionMesh;
        }
        // Mouse intersects with a mesh and is pressed for the first time
        // In this case we select the mesh and start dragging it
        else if (intersectionMesh && click) {
            this.select(intersectionMesh);
            this.mesh = intersectionMesh;
            this.dragging = true;
            dragID.set(this.mesh.userData['id']);
        }
        // Mouse is still pressed and dragging the mesh
        // In this case we simply update the mesh position
        else if (this.dragging && mouseDown) {
            this.dragMesh(this.mesh, mousePosition);
        }
        // Mouse is not pressed anymore
        // In this case we unselect the mesh and stop dragging it
        else if (this.dragging && !mouseDown) {
            this.unselect(this.mesh);
            this.dragging = false;
            dragID.set(-1);
        }
        else {
            this.unselect(this.mesh);
            this.mesh = undefined;
        }
        
    }

    public startDrag(mesh : Mesh, id : number, areas : Mesh[]) {
        this.mesh = deepClone(mesh);
        this.mesh.userData['assetID'] = id;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.dragging = true;

        this.areas = areas;
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
        if (!mesh) return;

        setMeshMaterialProperties(mesh, {
            emissive: this.emissiveColor,
            emissiveIntensity: 1,
        });
    }

    public unselect(mesh : Mesh) {
        if (!mesh) return;
        
        setMeshMaterialProperties(mesh, {
            emissive: new Color(0x000000),
            emissiveIntensity: 0,
        });
    }

    public addAsset(asset : Mesh) {
        this.selectables.push(asset);
    }

    public removeAsset(asset : Mesh) {
        this.selectables.splice(this.selectables.indexOf(asset), 1);
    }
}