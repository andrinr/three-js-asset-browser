// Three.js
import { 
    BoxGeometry,
    MeshPhongMaterial,
    Mesh,
    HemisphereLight,} from 'three';

// Local imports
import { ThreeAnimation } from "./animation";
import { dragMesh } from '../stores';

export class DragAnimation extends ThreeAnimation {

    private mesh : Mesh;

    public constructor() {
        super(true, false);
    }

    public init(): void {
        //this.camera.position.set(1, 1, 1);
        dragMesh.subscribe((mesh) => {
            if (mesh !== this.mesh) {
                const clone = new Mesh(mesh.geometry.clone(), mesh.material.clone());
                this.mesh = clone;
                this.scene.add(clone);
            }
            else {
                this.scene.remove(this.mesh);
                this.mesh = undefined;
            }
        });

        this.camera.position.set(0, 0, 10);
        this.camera.zoom = 100;

        this.addLights(); 
    }

    public update(delta: number): void {
        if (!this.mesh)
            return;

        this.mesh.rotation.y += 0.01;
    }

	private addLights() : void {
        const hemiLight = new HemisphereLight( 0xffffff, 0x737373, 1.0 );
        hemiLight.position.set( 0, 50, 0 );
        this.scene.add( hemiLight );
	}
}