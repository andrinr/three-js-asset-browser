import { AdditiveBlending, Mesh, MeshBasicMaterial, MeshPhongMaterial } from "three";
import type { Color, Group, Material } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import type THREE from 'three';
import { highlightColor } from "../stores";
import { get } from 'svelte/store';

export function highlight(mesh : Mesh) {
    if (mesh.material instanceof Array) {
        mesh.userData['previousMaterial'] = mesh.material[0].clone();
        mesh.userData['highlighted'] = true;
    }
    else {
        mesh.userData['previousMaterial'] = mesh.material.clone();
        mesh.userData['highlighted'] = true;
    }
    setMeshMaterial(mesh, new MeshBasicMaterial(
        {
            color: get(highlightColor),
            transparent: true,
            opacity: 0.6,
        }
    ));
}

export function unhighlight(mesh : Mesh) {
    if (!mesh.userData['highlighted'])
        return;

    setMeshMaterial(mesh, mesh.userData['previousMaterial']);
    mesh.userData['highlighted'] = false;
}

export function deepClone(mesh : Mesh) : Mesh{
    if (mesh.material instanceof Array) {
        return new Mesh(mesh.geometry.clone(), mesh.material[0].clone());
    }
    else {
        return new Mesh(mesh.geometry.clone(), mesh.material.clone());
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
