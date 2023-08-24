import type { Mesh, Vector3, Vector2 } from 'three';

export interface Area {
    name : string;
    boundingBox : {
        min : Vector3;
        max : Vector3;
    };
}
    
export interface AssetInstance {
    name : string;
    mesh : Mesh;
    area : Area[];
    visible : boolean;
    focused : boolean;
    position : Vector3;
    id : number;
}