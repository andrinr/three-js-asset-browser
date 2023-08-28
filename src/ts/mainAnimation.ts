// Three.js
import { 
    Vector3,
    DirectionalLight, 
    AmbientLight,
    MathUtils,
    Matrix4,
    Mesh,
    ExtrudeGeometry,
    Box3,
    BackSide,
    DoubleSide,
    Shape,
    HemisphereLight,
    DirectionalLightHelper,
    MeshPhongMaterial,
    PlaneGeometry,
    ShapeGeometry,
    Color,
    FrontSide,
    MeshStandardMaterial} from 'three';

import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { get } from 'svelte/store';
// Local imports
import { ThreeAnimation } from "./animation";
import { dragID, assets } from '../stores';
import { deepClone, setMeshColor, loadGLTF } from './helpers';


export class MainAnimation extends ThreeAnimation {

    private scale : number;
    private sunPosition : Vector3;
    private floorPlane : Mesh;
    private intersectionPlane : Mesh;

    private loadedCallback : () => void;

    private localDragMesh : Mesh;
    private dragPreviousPosition : Vector3;
    private dragValid : boolean;
    private areas : Mesh[];

    private emissiveBack : MeshStandardMaterial;
    private emissiveFront : MeshStandardMaterial;

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

        this.selectables = [];
        this.areas = [];

        this.dragValid = false;

        this.emissiveBack = new MeshStandardMaterial({
            emissive: 0x3dc8ff, 
            transparent: true,
            emissiveIntensity: 0.5,
            opacity: 0.3,
            side: BackSide});

        this.emissiveFront = new MeshStandardMaterial({
                emissive: 0x3dc8ff,
                transparent: true,
                emissiveIntensity: 0.5,
                opacity: 0.3,
                side: FrontSide});

        dragID.subscribe((id) => {
            if (id !== -1) {
                const asset = get(assets)[id];
                this.localDragMesh = deepClone(asset.mesh);
                this.localDragMesh.userData['assetID'] = id;
                this.localDragMesh.castShadow = true;
                this.localDragMesh.receiveShadow = true;

                this.scene.add(this.localDragMesh);

                this.setDragMeshPosition();

                this.controls.enabled = false;

                for (let area of asset.areas) {
                    const outline = new Shape();
                    outline.moveTo(area.boundingBox.min.x, area.boundingBox.min.y);
                    outline.lineTo(area.boundingBox.max.x, area.boundingBox.min.y);
                    outline.lineTo(area.boundingBox.max.x, area.boundingBox.max.y);
                    outline.lineTo(area.boundingBox.min.x, area.boundingBox.max.y);
                    outline.lineTo(area.boundingBox.min.x, area.boundingBox.min.y);

                    const extrudeSettings = {
                        depth: -3,
                        bevelEnabled: false
                    };

                    const geometry = new ExtrudeGeometry(outline, extrudeSettings);

                    const meshFront = new Mesh(geometry, this.emissiveFront);
                    const meshBack = new Mesh(geometry, this.emissiveBack);

                    const lookAt = new Matrix4().lookAt(new Vector3(0, 0, 0), area.normal, new Vector3(0, 1, 0));

                    meshFront.applyMatrix4(lookAt);
                    meshFront.position.set(0, -2, 0);

                    meshBack.applyMatrix4(lookAt);
                    meshBack.position.set(0, -2, 0);

                    this.scene.add(meshFront);
                    this.scene.add(meshBack);

                    this.areas.push(meshBack);
                    this.areas.push(meshFront);
                }
            }
            else {
                if (this.mouseOnScreen) {
                    this.unselect(this.localDragMesh);
                    this.selectables.push(this.localDragMesh);

                    if (!this.dragValid) {
                        this.localDragMesh.position.set(this.dragPreviousPosition.x, this.dragPreviousPosition.y, this.dragPreviousPosition.z);
                    }
                }
                else {
                    this.scene.remove(this.localDragMesh);
                }
                this.controls.enabled = true;
                this.localDragMesh = undefined;

                for (let area of this.areas) {
                    this.scene.remove(area);
                }
            }
        });
    }

    public update(delta: number): void {
        this.setDragMeshPosition();
        if (this.selectedMesh && this.click) {
            this.scene.remove(this.selectedMesh);
            dragID.set(this.selectedMesh.userData['assetID']);
            this.dragPreviousPosition = this.selectedMesh.position.clone();
        }

        if (this.selectedMesh && !this.mouseDown) {
            dragID.set(-1);
        }
    }

    private setDragMeshPosition() {
        this.raycaster.setFromCamera( this.mousePosition, this.camera );
        if (this.localDragMesh && this.mouseOnScreen) {
            const intersections = this.raycaster.intersectObject(this.intersectionPlane);

            if (intersections.length > 0) {
                const intersection = intersections[0];

                const position = intersection.point;

                const prevY = this.localDragMesh.position.y;
                this.localDragMesh.position.set(position.x, prevY, position.z);
            }

            const boundingBoxDrag = new Box3().setFromObject(this.localDragMesh);

            for (let area of this.areas) {
                const boundingBoxArea = new Box3().setFromObject(area);
                if (!boundingBoxArea.intersectsBox(boundingBoxDrag)) {
                    setMeshColor(this.localDragMesh, new Color(0xff0000));
                    this.dragValid = false;
                    return;
                }
                else {
                    setMeshColor(this.localDragMesh, new Color(0xffffff));
                    this.dragValid = true;
                }
            }

        }
        else if (this.localDragMesh) {
            this.localDragMesh.position.set(10000, 0, 0);
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
		const light = new DirectionalLight( "0xffffff", 1.0 );
	    light.position.multiplyScalar(0).add(this.sunPosition.clone().multiplyScalar(this.scale * 10));
		light.castShadow = true;
		light.shadow.mapSize.width = 4096; 
		light.shadow.mapSize.height = 1024;
        light.shadow.camera.top = 5;
        light.shadow.camera.bottom = -5;
        light.shadow.camera.left = -30;
        light.shadow.camera.right = 30;
		light.shadow.camera.near = 0.1;
		light.shadow.camera.far = 100 * this.scale;
		light.shadow.bias = -0.00001;
        light.shadow.radius = 0.7;

        const helper = new DirectionalLightHelper( light, 5 );
        this.scene.add( helper );

		//const ambientLight = new AmbientLight( "0xffffff");
        //ambientLight.intensity = 0.1;
        
        const hemiLight = new HemisphereLight( 0xffffff, 0x8d8d8d, 0.3 );
        hemiLight.position.set(0, 20, 0);

        this.scene.add(light);
        this.scene.add(hemiLight);
		//this.scene.add(ambientLight);
	}

	private async addModels() {

        const planeY = -1;
        const floor = new PlaneGeometry(2000, 2000, 8, 8);
        const floorMesh = new Mesh(floor, new MeshPhongMaterial({color: 0xffffff}));
        this.floorPlane = floorMesh;
        floorMesh.position.set(0, planeY, 0);
        floorMesh.rotateX(-Math.PI / 2);
        floorMesh.receiveShadow = true;
        this.scene.add(floorMesh);

        this.intersectionPlane = new Mesh(new PlaneGeometry(2000, 2000, 8, 8), new MeshPhongMaterial({color: 0x999999}));
        this.intersectionPlane.position.set(0, 0, 0);
        this.intersectionPlane.rotateX(-Math.PI / 2);
        this.intersectionPlane.visible = false;
        this.scene.add(this.intersectionPlane);

        // const model = await loadGLTF('./models/model5.gltf');

        // this.scene.add(model);
        // model.scale.setScalar(0.1);

        setTimeout(() => {
            this.loadedCallback();
        }, 10);
	}
}