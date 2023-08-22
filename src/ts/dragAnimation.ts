// Three.js
import { 
    Mesh,
    HemisphereLight,} from 'three';

// Local imports
import { ThreeAnimation } from "./animation";
import { dragMesh } from '../stores';
import { deepClone } from './helpers';

export class DragAnimation extends ThreeAnimation {

    private mesh : Mesh;

    public constructor() {
        super(true, false);
    }

    public init(): void {
        dragMesh.subscribe((mesh) => {
            if (mesh && mesh !== this.mesh ) {
                this.scene.remove(this.mesh);
                this.mesh = deepClone(mesh);
                this.mesh.rotateX(Math.PI / 4);
                this.scene.add(this.mesh);
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