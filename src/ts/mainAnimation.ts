// Three.js
import { 
    Vector3,
    DirectionalLight, 
    AmbientLight,
    MathUtils,
    Mesh,
    HemisphereLight,
    Raycaster,
    DirectionalLightHelper,
    MeshPhongMaterial,
    PlaneGeometry,
    Color} from 'three';

import { Sky } from 'three/examples/jsm/objects/Sky.js';
// Local imports
import { ThreeAnimation } from "./animation";
import * as dat from 'lil-gui'
import { dragMesh } from '../stores';
import { deepClone, setMeshColor } from './helpers';

export class MainAnimation extends ThreeAnimation {

    private scale : number;
    private sunPosition : Vector3;
    private floorPlane : Mesh;

    private loadedCallback : () => void;

    private localDragMesh : Mesh;

    public constructor(
        loadedCallback : () => void
        ) {
        super(false, true, true);
        this.loadedCallback = loadedCallback;
    }

    public init(): void {
        this.scale = 1;

        this.controls.enableDamping = true;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;

        this.camera.position.set(0, 15, 10);
        this.camera.lookAt(new Vector3(0,0,0));
        this.controls.maxDistance = 30 * this.scale ;
        this.controls.minDistance = 3 * this.scale ;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.minPolarAngle = Math.PI / 6;
    
        this.sunPosition = new Vector3(0, 0, 0);
        const phi : number = MathUtils.degToRad( 90 - 20 );
        const theta : number = MathUtils.degToRad( 50 );
        this.sunPosition.setFromSphericalCoords( 1, phi, theta );
        this.sunPosition.multiplyScalar( this.scale );

        this.addLights();
        this.addSky();
        this.addModels(); 

        dragMesh.subscribe((mesh) => {
            if (mesh) {
                this.localDragMesh = deepClone(mesh);
                this.localDragMesh.castShadow = true;
                this.localDragMesh.receiveShadow = true;

                this.scene.add(this.localDragMesh);
            }
            else {
                if (this.mouseOnScreen) {
                    this.scene.add(this.localDragMesh);
                    console.log("end drag");	
                }
                else {
                    this.scene.remove(this.localDragMesh);
                }

                this.localDragMesh = undefined;
            }
        });

        this.selectables = [];
    }

    public update(delta: number): void {
        this.raycaster.setFromCamera( this.mousePosition, this.camera );
        if (this.localDragMesh && this.mouseOnScreen) {
            const intersections = this.raycaster.intersectObject(this.floorPlane);

            if (intersections.length > 0) {
                const intersection = intersections[0];

                const position = intersection.point;

                const prevY = this.localDragMesh.position.y;
                this.localDragMesh.position.set(position.x, prevY, position.z);
            }
        }
        else if (this.localDragMesh) {
            this.localDragMesh.position.set(10000, 0, 0);
        }
        
        if (this.selectedMesh && this.click) {
            dragMesh.set(this.selectedMesh);
        }

        if (this.selectedMesh && !this.mouseDown) {
            dragMesh.set(undefined);
        }
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
		const light = new DirectionalLight( "#ffd1d1", 1.5 );
	    light.position.multiplyScalar(0).add(this.sunPosition.clone().multiplyScalar(this.scale * 30));

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

        this.scene.add(hemiLight);
        this.scene.add(light);
        this.scene.add(light);
		this.scene.add(ambientLight);
	}

	private async addModels() {

        const planeY = -1;
        const floor = new PlaneGeometry(2000, 2000, 8, 8);
        const floorMesh = new Mesh(floor, new MeshPhongMaterial({color: 0x999999}));
        this.floorPlane = floorMesh;
        floorMesh.position.set(0, planeY, 0);
        floorMesh.rotateX(-Math.PI / 2);
        floorMesh.receiveShadow = true;
        this.scene.add(floorMesh);

        //  loadGLTF('./models/model4.gltf', this.scene);

        // const outline = new Shape();

        // const size = 5;

        // outline.moveTo(size, size);
        // outline.lineTo(-size, size);
        // outline.lineTo(-size, -size);
        // outline.lineTo(size, -size);

        // const extrudeSettings : ExtrudeGeometryOptions = {
        //     steps: 2,
        //     depth: 16,
        //     bevelEnabled: false,
        // };
        
        // const geometry = new ExtrudeGeometry( outline, extrudeSettings );
        // const material = new MeshBasicMaterial( { color: 0x00ff00 } );

        // material.side = DoubleSide;

        // const mesh = new Mesh(geometry, material);
        // mesh.position.set(0, -3, 0);
        
        // mesh.rotateX(-Math.PI / 2);

        // this.scene.add(mesh);

        setTimeout(() => {
            this.loadedCallback();
        }, 10);
	}
}