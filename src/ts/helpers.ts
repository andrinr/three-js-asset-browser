import { Mesh, MeshBasicMaterial, MeshPhongMaterial } from "three";
import type { Color, Group, Material } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import type THREE from 'three';

export function deepClone(mesh : Mesh) : Mesh{
    if (mesh.material instanceof Array) {
        return new Mesh(mesh.geometry.clone(), mesh.material[0].clone());
    }
    else {
        return new Mesh(mesh.geometry.clone(), mesh.material.clone());
    }
}

export function setMeshColor(mesh : Mesh, color : Color) {
    if (mesh.material instanceof Array) {
        mesh.material.forEach((material) => {
            setMaterialColor(material, color);
        });
    }
    else {
        setMaterialColor(mesh.material, color);
    }
}

export function setMaterialColor(material : Material, color : Color) {
   if (material instanceof MeshBasicMaterial 
        || material instanceof MeshPhongMaterial) {
        material.color.set(color);
    }
}

export async function loadGLTF(modelPath) : Promise<Group> {
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderConfig({ type: 'js' });
    dracoLoader.setDecoderPath( 'models/draco/' );

    //dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const response = await gltfLoader.loadAsync(modelPath);

    const model = response.scene;

    return model;
}
