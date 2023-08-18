// Three.js
import { 
    sRGBEncoding, 
    ACESFilmicToneMapping, 
    PlaneGeometry, 
    Raycaster,
    Vector2,
    SphereGeometry,
    VSMShadowMap,
    Mesh,
    HemisphereLight,
    BoxGeometry,
    MeshPhongMaterial,
    PointLight} from 'three';

// Local imports
import { ThreeAnimation } from "./animation";
import type AssetInstance from './assetInstance';

export class AssetsAnimation extends ThreeAnimation {

    private loadedCallback : () => void;
    private addMeshCallback : (mesh : Mesh) => void;
    private floorPlane : Mesh;

    private assetMeshes : Mesh[];

    private raycaster : Raycaster;
    private selectedObject : Mesh;

    private hemiLight : HemisphereLight;
    private mouseLight : PointLight;

    public constructor(
        loadedCallback : () => void,
        addMeshCallback : (mesh : Mesh) => void
        ) {
        super(true, false);
        this.loadedCallback = loadedCallback;
        this.addMeshCallback = addMeshCallback;

        this.updateAssets = this.updateAssets.bind(this);
    }

    public init(): void {
   
        this.assetMeshes = [];
        this.raycaster = new Raycaster();

        //this.camera.position.set(1, 1, 1);

        this.camera.position.set(0, 0, 10);
        this.camera.zoom = 100;

        this.addLights();
        this.addModels(); 
    }

    public update(delta: number): void {
        for (let i = 0; i < this.assetMeshes.length; i++) {
            const element = this.assetMeshes[i];
            //element.rotation.x += 0.01;
            element.rotation.y += 0.01;
        }
    }

    private select(mesh : Mesh) {
        this.selectedObject = mesh;
        // @ts-ignore
        mesh.material.color.set(0xffff00);
    }

    private unselect() {
        if (this.selectedObject === undefined) return;
        // @ts-ignore
        this.selectedObject.material.color.set(0xffffff);
        this.selectedObject = undefined;
    }
    
    public onScroll(event: WheelEvent): void {
        //event.preventDefault();
        //event.stopPropagation();

        const delta = event.deltaY;
        this.camera.position.y += delta * 0.01;
    }

    public updateAssets(assets : AssetInstance[]) {

        console.log(assets);
        for (let i = 0; i < assets.length; i++) {

            const pos = new Vector2(assets[i].posX, assets[i].posY);

            this.raycaster.setFromCamera(pos, this.camera);

            const intersects = this.raycaster.intersectObject(this.floorPlane);

            if (assets[i].focused) {
                this.assetMeshes[i].material.color.set(0xffff00);
            }
            else {
                this.assetMeshes[i].material.color.set(0xffffff);
            }
            if (intersects.length > 0) {   
                const intersect = intersects[0];
                const point = intersect.point;


                this.assetMeshes[i].position.set(point.x, point.y, point.z);
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
        //floorMesh.rotateX(-Math.PI / 2);
        floorMesh.receiveShadow = true;

        //this.scene.add(floorMesh);

        for (let i = 0; i < 20; i++) {

            let geometry : BoxGeometry | SphereGeometry = new BoxGeometry( 0.5, 0.5, 0.5 );
            
            if (Math.random() > 0.5) {
                geometry = new SphereGeometry(0.5, 5, 5);
            }
            const material = new MeshPhongMaterial( { color: 0xffffff } );
            const cube = new Mesh( geometry, material );
            //cube.material.wireframe = true;

            cube.rotation.x = Math.PI / 4;
            this.scene.add( cube );
            this.assetMeshes.push( cube );
        }
    
        setTimeout(() => {
            this.loadedCallback();
        }, 3);
	}
}