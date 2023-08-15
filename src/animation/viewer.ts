// Three.js
import { 
    sRGBEncoding, 
    ACESFilmicToneMapping, 
    Vector3,
    DirectionalLight, 
    AmbientLight,
    MathUtils,
    VSMShadowMap,
    Mesh,
    ArrowHelper,
    MOUSE,
    HemisphereLight,
    Raycaster,
    Vector2,
    DirectionalLightHelper,
    MeshPhongMaterial,
    PlaneGeometry,
    BoxGeometry} from 'three';

import { Sky } from 'three/examples/jsm/objects/Sky.js';
// Local imports
import { ThreeAnimation } from "./animation";
import * as dat from 'lil-gui'

export class Viewer extends ThreeAnimation {

    private scale : number;
    private sunPosition : Vector3;
    private displayGui : boolean = true;
    private floorPlane : Mesh;

    private mouseHasMoved : boolean = false;
    private loadedCallback : () => void;
    private gui : dat.GUI;

    private selectedObject : Mesh;

    private raycaster : Raycaster;

    private mouseScreenPosition : Vector2 = new Vector2();

    public constructor(
        canvas: HTMLCanvasElement, 
        wrapper: HTMLElement, 
        contentIDCallback : (id : number) => void,
        loadedCallback : () => void
        ) {
        super(canvas, wrapper, false, true);
        this.loadedCallback = loadedCallback;

        this.addMesh = this.addMesh.bind(this);
    }

    public init(): void {
        this.scale = 1;

        this.raycaster = new Raycaster();

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = VSMShadowMap; // 

        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = sRGBEncoding;
        this.renderer.toneMapping = ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.40;
        
        this.controls.enableDamping = true;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;
        this.controls.screenSpacePanning = false;
        this.controls.panSpeed = 0.5;
        // auto rotation
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 0.1;
        this.controls.mouseButtons = {
            LEFT: MOUSE.ROTATE,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.PAN
        }

        this.camera.position.set(0, 5, 5);
        //this.controls.maxDistance = 30 * this.scale ;
        //this.controls.minDistance = 3 * this.scale ;
    
        if (this.displayGui) this.gui = new dat.GUI();

        if (this.displayGui){
            this.gui.add(this.camera.position, 'x', -10, 10).step(0.1);
            this.gui.add(this.camera.position, 'y', -10, 10).step(0.1);
            this.gui.add(this.camera.position, 'z', -10, 10).step(0.1);
        }
        this.sunPosition = new Vector3(0, 0, 0);
        const phi : number = MathUtils.degToRad( 90 - 20 );
        const theta : number = MathUtils.degToRad( 50 );
        this.sunPosition.setFromSphericalCoords( 1, phi, theta );
        this.sunPosition.multiplyScalar( this.scale );

        this.addLights();
        this.addSky();
        this.addModels(); 
    }

    public addMesh(mesh : Mesh) {
        mesh.translateX(Math.random() * 10);
        this.scene.add(mesh);
        console.log("added mesh");

        const origin = mesh.position.clone();
        const directionX = new Vector3(1, 0, 0);
        const directionZ = new Vector3(0, 0, 1);

        const arrowX = new ArrowHelper(directionX, origin, 2, 0xff0000, 0.2, 0.2);
        const arrowY = new ArrowHelper(directionZ, origin, 2, 0x00ff00, 0.2, 0.2);

        this.scene.add(arrowX);
        this.scene.add(arrowY);
    }

    public update(delta: number): void {
        this.raycaster.setFromCamera( this.mousePosition, this.camera );
        const intersects = this.raycaster.intersectObjects( this.scene.children );

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

        if (this.mouseDown && !this.click && this.selectedObject !== undefined) {
            const intersections = this.raycaster.intersectObject(this.floorPlane);

            if (intersections.length > 0) {
                const intersection = intersections[0];

                const position = intersection.point;

                this.selectedObject.position.set(position.x, position.y, position.z);
            }
        }
        else {
            this.controls.update();
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
    
	private addSky () {
		const sky : Sky = new Sky();
		sky.scale.setScalar( 20 * this.scale / 0.03 );
		this.scene.add( sky );

		const uniforms = sky.material.uniforms;
		uniforms[ 'turbidity' ].value = 0.6;
		uniforms[ 'rayleigh' ].value = 0.8;
		uniforms[ 'mieCoefficient' ].value = 0.01;
		uniforms[ 'mieDirectionalG' ].value = 0.7;
		uniforms[ 'sunPosition' ].value.copy( this.sunPosition );
	}

	private addLights() {
		const light = new DirectionalLight( "#ffd1d1", 3.5 );
	    light.position.multiplyScalar(0).add(this.sunPosition.clone().multiplyScalar(this.scale * 10));

		light.castShadow = true;

		light.shadow.mapSize.width = 2048; 
		light.shadow.mapSize.height = 2048;
		light.shadow.camera.near = 0.1;
		light.shadow.camera.far = 100 * this.scale;
		light.shadow.bias = -0.00001;
        light.shadow.radius = 0.7;

        const helper = new DirectionalLightHelper( light, 5 );
        this.scene.add( helper );

		const ambientLight = new AmbientLight( "0xa68195");
        ambientLight.intensity = 0.3;
        
        const hemiLight = new HemisphereLight( "#4dc1ff", "#ffdca8", 0.4);

        if (this.gui) {
            
            this.gui.add(light, 'intensity', 0,10,0.01).name("Sun Light");
            this.gui.add(ambientLight, 'intensity', 0,5,0.01).name("Ambient Light");
            this.gui.add(hemiLight, 'intensity', 0,5,0.01).name("Hemi Light");

            this.gui.addColor(light, 'color').name("Sun Color");
            this.gui.addColor(ambientLight, 'color').name("Ambient Color");
            this.gui.addColor(hemiLight, 'color').name("Hemi Color Sky");
            this.gui.addColor(hemiLight, 'groundColor').name("Hemi Color Ground");
        }

        this.scene.add(hemiLight);
        this.scene.add(light);
        this.scene.add(light);
		this.scene.add(ambientLight);
	}

	private async addModels() {

        const planeNormal = new Vector3(0, 1, 0);
        const planeY = -1;
        const floor = new PlaneGeometry(2000, 2000, 8, 8);
        const floorMesh = new Mesh(floor, new MeshPhongMaterial({color: 0xffffff}));
        this.floorPlane = floorMesh;
        floorMesh.position.set(0, planeY, 0);
        floorMesh.rotateX(-Math.PI / 2);
        floorMesh.receiveShadow = true;
        this.scene.add(floorMesh);

        const box = new BoxGeometry (1, 1, 1);
        box.translate(0, 0, 1);
        const boxMesh = new Mesh(box, new MeshPhongMaterial({color: 0xffffff}));
        boxMesh.castShadow = true;
        boxMesh.receiveShadow = true;
        boxMesh.position.set(0, 0, 0);
        this.scene.add(boxMesh);

        setTimeout(() => {
            this.loadedCallback();
        }, 10);
	}
}