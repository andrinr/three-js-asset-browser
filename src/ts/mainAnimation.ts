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
import { loadGLTF } from './loader';
import { setMeshColor } from './helpers';

export class MainAnimation extends ThreeAnimation {

    private scale : number;
    private sunPosition : Vector3;
    private displayGui : boolean = false;
    private floorPlane : Mesh;

    private loadedCallback : () => void;
    private startDragCallback : (mesh : Mesh) => void;
    private gui : dat.GUI;

    private raycaster : Raycaster;
    private selectables : Mesh[];
    private highlighted : Mesh;
    private dragging : Mesh;
    private dragMeshIsPreview : boolean = false;

    public constructor(
        loadedCallback : () => void
        ) {
        super(false, true);
        this.loadedCallback = loadedCallback;
    }

    public init(): void {
        this.scale = 1;

        this.raycaster = new Raycaster();0;
        
        this.controls.enableDamping = true;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;
        this.controls.enableRotate = true;
        // this.controls.screenSpacePanning = false;
        // this.controls.panSpeed = 0.5;
        // // auto rotation
        // this.controls.autoRotate = true;
        // this.controls.autoRotateSpeed = 0.1;
        // this.controls.mouseButtons = {
        //     LEFT: MOUSE.ROTATE,
        //     MIDDLE: MOUSE.DOLLY,
        //     RIGHT: MOUSE.PAN
        // }

        this.camera.position.set(0, 15, 10);
        this.camera.lookAt(new Vector3(0,0,0));
        this.controls.maxDistance = 30 * this.scale ;
        this.controls.minDistance = 3 * this.scale ;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.minPolarAngle = Math.PI / 6;
    
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

        this.selectables = [];
    }

    public update(delta: number): void {
        this.raycaster.setFromCamera( this.mousePosition, this.camera );
        if (this.dragging) {
            const intersections = this.raycaster.intersectObject(this.floorPlane);

            if (intersections.length > 0) {
                const intersection = intersections[0];

                const position = intersection.point;

                const prevY = this.dragging.position.y;
                this.dragging.position.set(position.x, prevY, position.z);
            }
        }
        else {
            const intersects = this.raycaster.intersectObjects( this.selectables);

            if (intersects.length > 0) {
                const intersect = intersects[0];
                const object = intersect.object as Mesh;

                this.drag(object);

                if (this.click) {
                    this.startDragCallback(object);
                }
            }
        }
    }

    public setPreview(mesh : Mesh) {
        this.dragMeshIsPreview = true;

        this.drag(mesh);

    }

    public removePreview() {
        if (this.dragging !== undefined && this.dragMeshIsPreview) {
            this.scene.remove(this.dragging);
            this.dragging = undefined;
            this.dragMeshIsPreview = false;
        }
    }

    public placePreview() {
        console.log("place");
        if (this.dragging !== undefined) {
            setMeshColor(this.dragging, new Color(0xffffff));
            this.selectables.push(this.dragging);
            this.dragging = undefined;
        }
    }

    public highlight(mesh : Mesh) {
        this.highlighted = mesh;
        setMeshColor(mesh, new Color(0xffff00));
    }

    public unhighlight() {
        if (this.highlighted === undefined) return;

        setMeshColor(this.highlighted, new Color(0xffffff));
        this.highlighted = undefined;
    }

    private drag(mesh : Mesh) {
        this.dragging = mesh;
        this.controls.enabled = false;

        this.startDragCallback(mesh);
    }

    private drop() {
        if (this.dragging === undefined) return;

        this.dragging = undefined;
        this.controls.enabled = true;
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