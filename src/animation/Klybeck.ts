// Three.js
import { 
    sRGBEncoding, 
    ACESFilmicToneMapping, 
    Scene, 
    Fog, 
    Vector3,
    DirectionalLight, 
    AmbientLight,
    MathUtils,
    VSMShadowMap,
    PCFShadowMap,
    Mesh,
    Color,
    MOUSE,
    HemisphereLight,
    Raycaster,
    Vector2,
    Object3D,
    TOUCH,
    ShaderMaterial,
    DirectionalLightHelper,
    Plane,
    MeshPhongMaterial,
    PlaneBufferGeometry,
    MeshBasicMaterial,
    PlaneGeometry,
    BoxGeometry} from 'three';

import { Sky } from 'three/examples/jsm/objects/Sky.js';
// Local imports
import { loadGLTF } from './loader';
import { ThreeAnimation } from "./animation";
import { generateGradientMaterial } from './gradientMaterial';
import * as dat from 'lil-gui'

interface Map<T> {
    [key: number]: {
        name: string,
        data: T
    }
}

export class Klybeck extends ThreeAnimation {
	scene: Scene;
    private scale : number;
    private sunPosition : Vector3;
    private displayGui : boolean = true;
    private floor : Mesh;

    private mouseHasMoved : boolean = false;
    private loadedCallback : () => void;
    private gui : dat.GUI;

    public constructor(
        canvas: HTMLCanvasElement, 
        wrapper: HTMLElement, 
        contentIDCallback : (id : number) => void,
        loadedCallback : () => void
        ) {
        super(canvas, wrapper);
        this.loadedCallback = loadedCallback;
    }

    public init(): void {
        this.scale = 0.002;

        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = VSMShadowMap; // 

        this.renderer.setSize( window.innerWidth, window.innerHeight );
        this.renderer.outputEncoding = sRGBEncoding;
        this.renderer.toneMapping = ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 0.40;
        
        //this.scene.fog = new Fog(0xb4c1c2, 20 * this.scale , 45 * this.scale );
        this.controls.touches.ONE = TOUCH.PAN;

        //this.controls.enableDamping = false;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;
        this.controls.screenSpacePanning = false;
        this.controls.panSpeed = 0.5;

        this.camera.position.set(0, 0, 10);
        //this.controls.maxDistance = 30 * this.scale ;
        //this.controls.minDistance = 3 * this.scale ;
    
        this.controls.mouseButtons = {
            LEFT: MOUSE.PAN,
            MIDDLE: MOUSE.DOLLY,
            RIGHT: MOUSE.PAN
        }
        if (this.displayGui) this.gui = new dat.GUI();

        if (this.displayGui){
            this.gui.add(this.camera.position, 'x', -10, 10).step(0.1);
            this.gui.add(this.camera.position, 'y', -10, 10).step(0.1);
            this.gui.add(this.camera.position, 'z', -10, 10).step(0.1);
        }
        this.sunPosition = new Vector3(0, 0, 0);
        const phi : number = MathUtils.degToRad( 90 - 30 );
        const theta : number = MathUtils.degToRad( 80 );
        this.sunPosition.setFromSphericalCoords( 1, phi, theta );
        this.sunPosition.multiplyScalar( this.scale );

        this.addLights();
        //this.addSky();
        this.addModels(); 
    }

    public update(delta: number): void {
        
        this.controls.update();
        console.log(this.camera.position);
    }
    
    public onMouseMove(event: MouseEvent): void {
        this.mouseHasMoved = true;
        const mouse = new Vector2();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    }

    public onMouseUp(event: MouseEvent): void {
        if(this.mouseHasMoved || !this.mouseOnScreen)
            return;
    
        const mouse = new Vector2();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    }

    public onMouseDown(event: MouseEvent): void {
        this.mouseHasMoved = false;
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
	    light.position.multiplyScalar(0).add(this.sunPosition.clone().multiplyScalar(200));

		light.castShadow = true;

		light.shadow.mapSize.width = 2048; 
		light.shadow.mapSize.height = 2048;
		light.shadow.camera.near = 0.1;
		light.shadow.camera.far = 3;
		light.shadow.bias = -0.00001;
        light.shadow.radius = 0.7;

        //const helper = new DirectionalLightHelper( light, 5 );
        //this.scene.add( helper );

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
		this.scene.add(ambientLight);
	}

	private async addModels() {

        const plane = new PlaneGeometry(2000, 2000, 8, 8);
        const planeMesh = new Mesh(plane, new MeshBasicMaterial({color: 0xf00000}));
        this.scene.add(planeMesh);
  

        const box = new BoxGeometry (1, 1, 1);
        const boxMesh = new Mesh(box, new MeshBasicMaterial({color: 0x00ff00}));
        boxMesh.position.set(0, 0, 0);
        this.scene.add(boxMesh);

        setTimeout(() => {
            this.loadedCallback();
        }, 10);
	}
}