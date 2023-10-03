// Three.js
import { 
    PlaneGeometry, 
    Raycaster,
    Vector2,
    Vector3,
    Mesh,
    Box3,
    HemisphereLight,
    MeshPhongMaterial,
    Object3D} from 'three';

// Local imports
import { ThreeAnimation } from "./animation";
import type {AssetInstance} from './assetInstance';
import { assets } from '../stores';
import { deepCloneObject, highlightObject, unhighlightObject } from './helpers';

export class AssetsAnimation extends ThreeAnimation {

    private loadedCallback : () => void;
    private floorPlane : Mesh;

    private assetMap : Map<number, Object3D>;

    private hemiLight : HemisphereLight;

    private raycaster : Raycaster;

    public constructor(
        loadedCallback : () => void,
        ) {
        super(true, false, false);
        this.loadedCallback = loadedCallback;

        this.updateAssets = this.updateAssets.bind(this);  
    }

    public init(): void {
   
        //this.camera.position.set(1, 1, 1);

        this.camera.position.set(0, 0, 10);
        this.camera.zoom = 100;

        this.raycaster = new Raycaster();

        this.addLights();
        this.addModels(); 

        this.assetMap = new Map<number, Object3D>();
        assets.subscribe(this.updateAssets);

    }

    public update(delta: number): void {
        for (let [key, value] of this.assetMap) {
            value.rotation.y += 0.01;
        }
    }
    
    public onScroll(event: WheelEvent): void {
        const delta = event.deltaY;
        this.camera.position.y += delta * 0.002;
    }

    public updateAssets(assets : AssetInstance[]) {

        for (let i = 0; i < assets.length; i++) {

            const id = assets[i].id;

            if (!this.assetMap.has(id)) {
                const object = deepCloneObject(assets[i].object);

                const boundingBox = new Box3().setFromObject(object)
                let size : Vector3 = new Vector3();
                boundingBox.getSize(size);

                const scale = 1.0 / Math.max(size.x, size.y, size.z);
                console.log(Math.max(size.x, size.y, size.z));
                console.log(scale);
                object.scale.set(scale, scale, scale);
                object.rotateX(Math.PI / 4);

                this.scene.add(object);
                this.assetMap.set(id, object);
            }

            let pos = new Vector2(assets[i].viewerPosition.x, assets[i].viewerPosition.y);
            let relativePos = this.documentToCanvasPosition(pos);

            this.raycaster.setFromCamera(relativePos, this.camera);
            const intersects = this.raycaster.intersectObject(this.floorPlane);

            if (assets[i].focused) 
                highlightObject(this.assetMap.get(id), true);
            else
                unhighlightObject(this.assetMap.get(id));
        

            if (intersects.length > 0) {  
                const intersect = intersects[0];
                const point = intersect.point;

                this.assetMap.get(id).position.set(point.x, point.y, point.z);
            }
        }
    }

	private addLights() : void {
        this.hemiLight = new HemisphereLight( 0xffffff, 0x737373, 1.0 );
        this.hemiLight.position.set( 0, 50, 0 );
        this.scene.add( this.hemiLight );
	}

	private async addModels() : Promise<void> {
        const planeY = -1;
        const floor = new PlaneGeometry(2000, 2000, 8, 8);
        const floorMesh = new Mesh(floor, new MeshPhongMaterial({color: 0xff000}));
        this.floorPlane = floorMesh;
        floorMesh.position.set(0, planeY, 0);
    
        setTimeout(() => {
            this.loadedCallback();
        }, 3);
	}
}