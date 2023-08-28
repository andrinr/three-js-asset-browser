import { 
    Mesh, 
    OrthographicCamera, 
    PerspectiveCamera, 
    Raycaster,
    Vector2,
    Color} from "three";
import { setMeshMaterialProperties } from "./helpers";

import { dragID, assets } from '../stores';

class Dragger {
    private selectables : Mesh[];
    private raycaster : Raycaster;
    private camera : PerspectiveCamera | OrthographicCamera;
    private emissiveColor : Color;

    private hoveredMesh : Mesh;
    private draggedMesh : Mesh;
    private intersectionPlane : Mesh;


    constructor (
        camera : PerspectiveCamera | OrthographicCamera,
        emissiveColor : Color,
        intersectionPlane : Mesh
    ) {
        this.raycaster = new Raycaster();
        this.camera = camera;
        this.emissiveColor = emissiveColor;
        this.intersectionPlane = intersectionPlane;
    }

    public update(mousePosition : Vector2, click : boolean, mouseDown : boolean, mouseOnScreen : boolean) {

        const intersectionMesh = this.getIntersectedMesh(mousePosition);

        if (intersectionMesh && !mouseDown) {
            this.select(intersectionMesh);
            this.hoveredMesh = intersectionMesh;
        }
        else if (intersectionMesh && click) {
            this.select(intersectionMesh);
            this.draggedMesh = intersectionMesh;
            dragID.set(this.draggedMesh.userData['id']);
        }
        else if (this.draggedMesh && mouseDown) {
            this.dragMesh(this.draggedMesh, mousePosition);
        }
        else if (this.draggedMesh && !mouseDown) {
            this.unselect(this.draggedMesh);
            this.draggedMesh = undefined;
            dragID.set(-1);
        }
        
    }

    private dragMesh(mesh : Mesh, mousePosition : Vector2) {
        const intersections = this.raycaster.intersectObject(this.intersectionPlane);

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

    private select(mesh : Mesh) {
        setMeshMaterialProperties(mesh, {
            emissive: this.emissiveColor,
            emissiveIntensity: 1,
        });
    }

    private unselect(mesh : Mesh) {
        setMeshMaterialProperties(mesh, {
            emissive: new Color(0x000000),
            emissiveIntensity: 0,
        });
    }




    private addAsset(asset : Mesh, id : number) {
        asset.userData.id = id;
        this.selectables.push(asset);
    }

    private removeAsset(asset : Mesh) {
        this.selectables.splice(this.selectables.indexOf(asset), 1);
    }


}