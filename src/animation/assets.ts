// Three.js
import { 
    sRGBEncoding, 
    ACESFilmicToneMapping, 
    Scene, 
    Vector3,
    Raycaster,
    MathUtils,
    VSMShadowMap,
    Mesh,
    HemisphereLight,
    OrthographicCamera,
    MeshBasicMaterial,
    BoxGeometry,
    MeshPhongMaterial} from 'three';

// Local imports
import { ThreeAnimation } from "./animation";
import * as dat from 'lil-gui'

export class Assets extends ThreeAnimation {
	scene: Scene;
    private scale : number;
    private sunPosition : Vector3;
    private displayGui : boolean;

    private mouseHasMoved : boolean;
    private loadedCallback : () => void;
    private addMeshCallback : (mesh : Mesh) => void;
    private gui : dat.GUI;

    private selectables : Mesh[];

    private raycaster : Raycaster;
    private selectedObject : Mesh;

    public constructor(
        canvas: HTMLCanvasElement, 
        wrapper: HTMLElement, 
        loadedCallback : () => void,
        addMeshCallback : (mesh : Mesh) => void
        ) {
        super(canvas, wrapper, true, false);
        this.loadedCallback = loadedCallback;
        this.addMeshCallback = addMeshCallback;
        this.displayGui = true;
        this.mouseHasMoved = false;

    }

    public init(): void {
        this.scale = 1;

        this.selectables = [];
        this.raycaster = new Raycaster();

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = VSMShadowMap; // 

        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = sRGBEncoding;
        this.renderer.toneMapping = ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.40;
        
        //this.camera.position.set(1, 1, 1);

        this.gui = new dat.GUI();

        this.camera.position.set(0, 0, 10);
        this.camera.zoom = 100;

        this.gui.add(this.camera.position, 'x', -100, 100).step(0.1);
        this.gui.add(this.camera.position, 'y', -100, 100).step(0.1);
        this.gui.add(this.camera.position, 'z', -100, 100).step(0.1);

        this.gui.add((this.camera as OrthographicCamera), 'near', 0, 100).step(0.1);
        this.gui.add((this.camera as OrthographicCamera), 'far', 0, 100).step(0.1);
        
        this.sunPosition = new Vector3(0, 0, 0);
        const phi : number = MathUtils.degToRad( 90 - 20 );
        const theta : number = MathUtils.degToRad( 50 );
        this.sunPosition.setFromSphericalCoords( 1, phi, theta );
        this.sunPosition.multiplyScalar( this.scale );

        this.addLights();
        this.addModels(); 
    }

    public update(delta: number): void {
        for (let i = 0; i < this.selectables.length; i++) {
            const element = this.selectables[i];
            //element.rotation.x += 0.01;
            element.rotation.y += 0.001;
        }

        this.raycaster.setFromCamera( this.mousePosition, this.camera );
        const intersects = this.raycaster.intersectObjects( this.selectables );

        if (intersects.length > 0) {
            const intersect = intersects[0];
            const object = intersect.object as Mesh;

            if (object !== this.selectedObject && this.selectedObject !== undefined) {
                this.unselect();
            }

            this.select(object);
        }
        else {
            this.unselect();
        }

        if (this.click && this.selectedObject !== undefined) {
            const geometry = this.selectedObject.geometry;
            const material = new MeshBasicMaterial( { color: 0xffffff } );
    
            const clone = new Mesh( geometry.clone(), material.clone() );
            this.addMeshCallback(clone);
        }
    }

    private select(mesh : Mesh) {
        this.selectedObject = mesh;
        mesh.material.color.set(0xff0000);
    }

    private unselect() {
        if (this.selectedObject === undefined) return;
        this.selectedObject.material.color.set(0xffffff);
        this.selectedObject = undefined;
    }
    
    public onScroll(event: WheelEvent): void {
        event.preventDefault();
        event.stopPropagation();

        const delta = event.deltaY;
        this.camera.position.y += delta * 0.01;
    }

	private addLights() : void {
        const hemiLight = new HemisphereLight( 0xb0d4ff, 0xfcb928, 1.0 );
        hemiLight.position.set( 0, 50, 0 );
        this.scene.add( hemiLight );

	}

	private async addModels() : Promise<void> {

        const gridX = 3;

        for (let i = 0; i < 40; i++) {
            const geometry = new BoxGeometry( 1, 1, 1 );
            const material = new MeshPhongMaterial( { color: 0xffffff } );
            const cube = new Mesh( geometry, material );

            cube.position.set(
                (i % gridX) * 2 - 2,
                -Math.floor(i / gridX) * 2 + 2,
                0
            );
            
            cube.rotation.x = Math.PI / 4;
            this.scene.add( cube );
            this.selectables.push( cube );
        }
    
        setTimeout(() => {
            this.loadedCallback();
        }, 3);
	}
}