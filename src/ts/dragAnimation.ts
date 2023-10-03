// Three.js
import { 
    HemisphereLight,
    Object3D,} from 'three';

// Local imports
import { ThreeAnimation } from "./animation";
import { dragID, assets } from '../stores';
import { deepCloneObject } from './helpers';
import { get } from 'svelte/store';

export class DragAnimation extends ThreeAnimation {

    private object : Object3D;

    public constructor() {
        super(true, false, false);
    }

    public init(): void {
        dragID.subscribe((id) => {
            if (id !== -1 && get(assets)[id].object !== this.object ) {
                console.log(id);
                this.scene.remove(this.object);
                this.object = deepCloneObject(get(assets)[id].object);
                this.object.rotateX(Math.PI / 4);
                this.scene.add(this.object);
            }
            else {
                this.scene.remove(this.object);
                this.object = undefined;
            }
        });

        this.camera.position.set(0, 0, 10);
        this.camera.zoom = 100;

        this.addLights(); 
    }

    public update(delta: number): void {
        if (!this.object)
            return;

        this.object.rotation.y += 0.01;
    }

	private addLights() : void {
        const hemiLight = new HemisphereLight( 0xffffff, 0x737373, 1.0 );
        hemiLight.position.set( 0, 50, 0 );
        this.scene.add( hemiLight );
	}
}