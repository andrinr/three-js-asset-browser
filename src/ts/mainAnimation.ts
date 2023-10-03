// Three.js
import { 
    Vector3,
    DirectionalLight, 
    GridHelper,
    MathUtils,
    Matrix4,
    Mesh,
    ExtrudeGeometry,
    BackSide,
    Shape,
    HemisphereLight,
    AxesHelper,
    MeshPhongMaterial,
    PlaneGeometry,
    FrontSide,
    MeshStandardMaterial,
    PointLight} from 'three';

import { Sky } from 'three/examples/jsm/objects/Sky.js';
import { get } from 'svelte/store';
// Local imports
import { ThreeAnimation } from "./animation";
import { dragID, assets, areaColor, highlightColor, wrongColor, notification, NotificationType} from '../stores';
import { loadGLTF } from './helpers';
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
    private gridHelper : GridHelper;
    private axesHelper : AxesHelper;

    private tilesRenderer : any;

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

        this.camera.position.set(3, 150, 100);
        this.camera.lookAt(new Vector3(0,0,0));
        this.controls.maxDistance = 600 * this.scale ;
        this.controls.minDistance = 3 * this.scale ;
        this.controls.maxPolarAngle = Math.PI / 2 - Math.PI / 20;
        this.controls.minPolarAngle = Math.PI / 20;
    
        this.sunPosition = new Vector3(0, 0, 0);
        const phi : number = MathUtils.degToRad( 90 - 20 );
        const theta : number = MathUtils.degToRad( 50 );
        this.sunPosition.setFromSphericalCoords( 1, phi, theta );
        this.sunPosition.multiplyScalar( this.scale );

        this.addLights();
        this.addSky();
        this.addModels(); 

        this.areas = [];

        this.dragger = new Dragger(this.camera, this.intersectionPlane, this.scene);

        this.emissiveBack = new MeshStandardMaterial({
            emissive: get(areaColor),
            transparent: true,
            emissiveIntensity: 0.5,
            opacity: 0.6,
            side: FrontSide});

        this.emissiveFront = new MeshStandardMaterial({
                emissive: get(areaColor),
                transparent: true,
                emissiveIntensity: 0.5,
                opacity: 0.6,
                side: BackSide});

        dragID.subscribe((id) => {
            if (id !== -1) {
                const asset = get(assets)[id];

                console.log(asset);

                asset.object.userData['assetID'] = id;	

                const dragAreas = [];

                for (let area of asset.areas) {
                    const outline = new Shape();
                    outline.moveTo(area.boundingBox.min.x, area.boundingBox.min.y);
                    outline.lineTo(area.boundingBox.max.x, area.boundingBox.min.y);
                    outline.lineTo(area.boundingBox.max.x, area.boundingBox.max.y);
                    outline.lineTo(area.boundingBox.min.x, area.boundingBox.max.y);
                    outline.lineTo(area.boundingBox.min.x, area.boundingBox.min.y);

                    const extrudeSettings = {
                        depth: -20,
                        bevelEnabled: false
                    };

                    const geometry = new ExtrudeGeometry(outline, extrudeSettings);

                    const meshFront = new Mesh(geometry, this.emissiveFront);
                    // const meshBack = new Mesh(geometry, this.emissiveBack);

                    // meshBack.renderOrder = 1000;
                    meshFront.renderOrder = 1000;

                    const lookAt = new Matrix4().lookAt(new Vector3(0, 0, 0), area.normal, new Vector3(0, 1, 0));

                    meshFront.applyMatrix4(lookAt);
                    meshFront.position.set(0, -10, 0);

                    // meshBack.applyMatrix4(lookAt);
                    // meshBack.position.set(0, -2, 0);

                    this.scene.add(meshFront);
                    // this.scene.add(meshBack);

                    // this.areas.push(meshBack);
                    this.areas.push(meshFront);

                    dragAreas.push(meshFront);
                }

                this.dragger.startDrag(asset.object, id, dragAreas);
                this.dragger.dragMesh(this.dragger.object, this.mousePosition, this.mouseOnScreen);

                if (this.scene.getObjectById(asset.object.id) === undefined)
                    this.scene.add(this.dragger.object);

                this.controls.enabled = false;
            }
            else {
                if (this.dragger.state !== DragState.DRAGGING) return;

                if (this.mouseOnScreen && this.dragger.valid) {
                    this.dragger.stopDrag();
                    this.dragger.addAsset(this.dragger.object);
                    notification.set(
                        {
                            message : "Asset placed",
                            type : NotificationType.SUCCESS,
                        }
                    )
                }
                else {
                    this.scene.remove(this.dragger.object);
                    notification.set(
                        {
                            message : "Invalid area",
                            type : NotificationType.ERROR,
                        }
                    )
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

        if (this.dragger.state === DragState.DRAGGING) {
            this.gridHelper.visible = true;
            this.axesHelper.visible = true;
        }
        else {
            this.gridHelper.visible = false;
            this.axesHelper.visible = false;
        }
        
        if (this.dragger.state !== DragState.IDLE && this.mouseOnScreen) {
            this.selectedLight.position.copy(this.dragger.object.position);
            this.selectedLight.intensity = 1.0;
            this.selectedLight.color = this.dragger.valid ? get(highlightColor) : get(wrongColor);
        }
        else {
            this.selectedLight.intensity = 0.0;
        }

        if (this.tilesRenderer) 
            this.tilesRenderer.update();
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
        
        const hemiLight = new HemisphereLight( 0xffffff, 0x8d8d8d, 0.3 );
        hemiLight.position.set(0, 20, 0);

        this.selectedLight = new PointLight(get(highlightColor), 0, 3, 2);
        this.scene.add(this.selectedLight);
        this.scene.add(light);
	}

	private async addModels() {

        // const planeY = 0;
        // const floor = new PlaneGeometry(2000, 2000, 8, 8);
        // const floorMesh = new Mesh(floor, new MeshPhongMaterial({color: 0xffffff}));
        // this.floorPlane = floorMesh;
        // floorMesh.position.set(0, planeY, 0);
        // floorMesh.rotateX(-Math.PI / 2);
        // floorMesh.receiveShadow = true;
        // this.scene.add(floorMesh);

        this.intersectionPlane = new Mesh(new PlaneGeometry(2000, 2000, 8, 8), new MeshPhongMaterial({color: 0x999999}));
        this.intersectionPlane.position.set(0, -3, 0);
        this.intersectionPlane.rotateX(-Math.PI / 2);
        this.intersectionPlane.visible = true;
        this.scene.add(this.intersectionPlane);

        const size = 100;
        const divisions = 100;

        this.gridHelper = new GridHelper( size, divisions );
        // this.scene.add( this.gridHelper );

        this.axesHelper = new AxesHelper( 5 );
        // this.scene.add( this.axesHelper );

        // @ts-ignore
        this.tilesRenderer = await Nomoko.loadTile(
            "pub.OTFjOWU3ZjQtYWYwNi00MWNmLWFjNDAtNmRkNjA5MWZkNTdl.YSLcB8UuL0",
            "https://assets.platform.nomoko.world/u/a6fb8866/result_root_ext_tileset.json",
            this.renderer,
            this.camera
        );

        console.log("Tiles loaded");
        console.log(this.tilesRenderer);

        this.tilesRenderer.group.rotation.x = -Math.PI / 2;
        this.tilesRenderer.group.scale.setScalar(1);
        this.tilesRenderer.group.position.set(0, -304, 0);
        this.tilesRenderer.group.receiveShadow = true;
        this.scene.add(this.tilesRenderer.group);
    
        setTimeout(() => {
            this.loadedCallback();
        }, 10);
	}
}