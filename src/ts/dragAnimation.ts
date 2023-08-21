// Three.js
import { 
    BoxGeometry,
    MeshPhongMaterial,
    Mesh,
    HemisphereLight,} from 'three';

// Local imports
import { ThreeAnimation } from "./animation";

export class DragAnimation extends ThreeAnimation {

    private mesh : Mesh;
    public constructor(
        ) {
        super(true, false);
    }

    public init(): void {
        //this.camera.position.set(1, 1, 1);

        this.camera.position.set(0, 0, 10);
        this.camera.zoom = 100;

        this.addLights(); 
    }

    public setMesh(mesh: Mesh) : void {
        if (this.mesh != null)
            this.scene.remove(this.mesh);
        
        this.mesh = mesh;
        this.mesh.position.set(0, 0, 0);
        this.scene.add(this.mesh);
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