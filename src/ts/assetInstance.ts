import type { Mesh, Vector3, Vector2, Group, Object3D } from 'three';

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
    object : Object3D;
    areas : Area[];
    visible : boolean;
    focused : boolean;
    viewerPosition : Vector2;
    id : number;
}