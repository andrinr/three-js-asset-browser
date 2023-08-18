import type { Mesh } from 'three';
    
export default interface AssetInstance {
    name : string;
    mesh : Mesh;
    visible : boolean;
    focused : boolean;
    posX : number;
    posY : number;
    id : number;
}