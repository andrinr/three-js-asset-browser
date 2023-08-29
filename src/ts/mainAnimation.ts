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
    MeshStandardMaterial,
    PointLight} from 'three';

import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { get } from 'svelte/store';
// Local imports
import { ThreeAnimation } from "./animation";
import { dragID, assets, areaColor, highlightColor } from '../stores';
import { deepClone, setMeshColor, loadGLTF } from './helpers';
import { DragState, Dragger } from './dragger';


export class MainAnimation extends ThreeAnimation {

    private scale : number;
    private sunPosition : Vector3;
    private floorPlane : Mesh;
    private intersectionPlane : Mesh;

    private loadedCallback : () => void;
    private areas : Mesh[];

    private emissiveBack : MeshStandardMaterial;
    private emissiveFront : MeshStandardMaterial;

    private selectedLight : PointLight;

    private dragger : Dragger;

    public constructor(
        loadedCallback : () => void
        ) {
        super(false, true, false);
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

        this.areas = [];

        this.dragger = new Dragger(this.camera, this.intersectionPlane);

        this.emissiveBack = new MeshStandardMaterial({
            emissive: get(areaColor),
            transparent: true,
            emissiveIntensity: 0.5,
            opacity: 0.3,
            side: BackSide});

        this.emissiveFront = new MeshStandardMaterial({
                emissive: get(areaColor),
                transparent: true,
                emissiveIntensity: 0.5,
                opacity: 0.3,
                side: FrontSide});

        dragID.subscribe((id) => {
            if (id !== -1) {
                const asset = get(assets)[id];

                const dragAreas = [];

                this.scene.remove(asset.mesh);
                this.scene.remove(this.dragger.mesh);

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

                    //this.scene.add(meshFront);
                    //this.scene.add(meshBack);

                    this.areas.push(meshBack);
                    this.areas.push(meshFront);

                    dragAreas.push(meshBack);
                }

                this.dragger.startDrag(asset.mesh, id, dragAreas);
                this.dragger.dragMesh(this.dragger.mesh, this.mousePosition, this.mouseOnScreen);

                this.scene.add(this.dragger.mesh);
                this.controls.enabled = false;
            }
            else {
                if (this.dragger.state !== DragState.DRAGGING) return;

                if (this.mouseOnScreen) {
                    this.dragger.stopDrag();
                    this.dragger.addAsset(this.dragger.mesh);
                }
                else {
                    this.scene.remove(this.dragger.mesh);
                }
                this.controls.enabled = true;

                for (let area of this.areas) {
                    this.scene.remove(area);
                }

                this.dragger.stopDrag();
            }
        });
    }

    public update(delta: number): void {
        this.dragger.update(
            this.mousePosition, 
            this.click, 
            this.mouseDown, 
            this.mouseOnScreen);
        
        if (this.dragger.state !== DragState.IDLE) {
            console.log(this.dragger.state);
            this.selectedLight.position.copy(this.dragger.mesh.position);
            this.selectedLight.intensity = 1.0;
        }
        else {
            this.selectedLight.intensity = 0.0;
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

        this.selectedLight = new PointLight(get(highlightColor), 0, 5, 2);
        this.scene.add(this.selectedLight);
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