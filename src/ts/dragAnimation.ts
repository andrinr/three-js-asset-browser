// Three.js
import { 
    sRGBEncoding, 
    ACESFilmicToneMapping, 
    VSMShadowMap,
    Mesh,
    HemisphereLight,} from 'three';

// Local imports
import { ThreeAnimation } from "./animation";

export class DragAnimation extends ThreeAnimation {

    private mesh : Mesh;
    public constructor(
        mesh : Mesh
        ) {
        super(true, false);

        this.mesh = mesh;
    }

    public init(): void {

        
        //this.camera.position.set(1, 1, 1);

        this.camera.position.set(0, 0, 10);
        this.camera.zoom = 100;

        this.addLights();
        this.addModels(); 
    }

    public update(delta: number): void {

    }


	private addLights() : void {
        const hemiLight = new HemisphereLight( 0xffffff, 0x737373, 1.0 );
        hemiLight.position.set( 0, 50, 0 );
        this.scene.add( hemiLight );
	}

	private async addModels() : Promise<void> {


	}
}