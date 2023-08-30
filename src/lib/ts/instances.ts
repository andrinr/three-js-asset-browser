import type { Mesh, Vector3, Vector2 } from 'three';

export interface Area {
    name : string;
    normal : Vector3;
    boundingBox : {
        min : Vector2;
        max : Vector2;
    };
}
    
export interface AssetInstance {
    name : string;
    mesh : Mesh;
    areas : Area[];
    visible : boolean;
    focused : boolean;
    viewerPosition : Vector2;
    id : number;
}