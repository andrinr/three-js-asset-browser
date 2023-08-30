import { AdditiveBlending, Mesh, MeshBasicMaterial, MeshPhongMaterial } from "three";
import type { Color, Group, Material } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import type THREE from 'three';
import { highlightColor, wrongColor } from "../stores";
import { get } from 'svelte/store';

export function highlight(mesh : Mesh, valid : boolean) {
    let previousMaterial = undefined;
    if (mesh.material instanceof Array) {
        previousMaterial = mesh.material[0].clone();
    } else {
        previousMaterial = mesh.material.clone();
    }

    mesh.renderOrder = -1000;
    setMeshMaterial(mesh, new MeshBasicMaterial(
        {
            color: (valid ? get(highlightColor) : get(wrongColor)),
            transparent: true,
            opacity: 0.6,
        }
    ));

    console.log("select")
    console.log(mesh.userData['assetID'])
    console.log(mesh.userData['previousMaterial'])

    if (mesh.userData['previousMaterial'])
        return;
    
    mesh.userData['previousMaterial'] = previousMaterial;

}

export function unhighlight(mesh : Mesh) {

    console.log("unselect")
    console.log(mesh.userData['assetID'])
    console.log(mesh.userData['previousMaterial'])

    if (!mesh.userData['previousMaterial'])
        return;

    mesh.renderOrder = 0;
    setMeshMaterial(mesh, mesh.userData['previousMaterial']);
}

export function deepClone(mesh : Mesh) : Mesh{
    if (mesh.material instanceof Array) {
        const clone =  new Mesh(mesh.geometry.clone(), mesh.material[0].clone());
        clone.userData['previousMaterial'] = mesh.userData['previousMaterial'];
        return clone;
    }
    else {
        const clone = new Mesh(mesh.geometry.clone(), mesh.material.clone());
        clone.userData['previousMaterial'] = mesh.userData['previousMaterial'];
        return clone;
    }
}

export function setMeshMaterial(mesh : Mesh, material : Material) {
    if (mesh.material instanceof Array) {
        mesh.material.forEach((mat) => {
            mat = material;
        });
    }
    else {
        mesh.material = material;
    }
}

export function setMeshMaterialProperties(mesh : Mesh, properties : THREE.MeshStandardMaterialParameters) {
    if (mesh.material instanceof Array) {
        mesh.material.forEach((material) => {
            setMaterialProperties(material, properties);
        });
    }
    else {
        setMaterialProperties(mesh.material, properties);
    }
}

export function setMaterialProperties(material : Material, properties : THREE.MeshStandardMaterialParameters) {
    if (material instanceof MeshPhongMaterial) {
        material.color.set(properties.color);
        material.emissive.set(properties.emissive);
        material.emissiveIntensity = properties.emissiveIntensity;
        material.opacity = properties.opacity;
        material.transparent = properties.transparent;
        material.side = properties.side;
        material.blending = properties.blending;
        material.visible = properties.visible;
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
