import { Mesh, MeshBasicMaterial, MeshPhongMaterial, Group } from "three";
import type { Color, Material, Object3D } from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import type THREE from 'three';
import { highlightColor, wrongColor } from "../stores";
import { get } from 'svelte/store';

export function highlightObject(object : Object3D, valid : boolean) {
    if (object instanceof Mesh) {
        highlightMesh(object, valid);
    }
    else if (object instanceof Group) {
        highlightGroup(object, valid);
    }
}

export function unhighlightObject(object : Object3D) {
    if (object instanceof Mesh) {
        unhighlightMesh(object);
    }
    else if (object instanceof Group) {
        unhighlightGroup(object);
    }
}

export function highlightGroup(group : Group, valid : boolean) {
    group.children.forEach((child) => {
        highlightObject(child, valid);
    });
}

export function unhighlightGroup(group : Group) {
    group.children.forEach((child) => {
        unhighlightObject(child as Mesh);
    });
}

export function highlightMesh(mesh : Mesh, valid : boolean) {

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

    if (mesh.userData['previousMaterial'])
        return;
    
    mesh.userData['previousMaterial'] = previousMaterial;
}

export function unhighlightMesh(mesh : Mesh) {
        
    if (!mesh.userData['previousMaterial'])
        return;

    mesh.renderOrder = 0;
    setMeshMaterial(mesh, mesh.userData['previousMaterial']);
}

export function deepCloneObject(object : Object3D) : Object3D {
    if (object instanceof Mesh) {
        return deepCloneMesh(object);
    }
    else if (object instanceof Group) {
        return deepCloneGroup(object);
    }
    else {
        return object.clone();
    }
}

export function deepCloneMesh(mesh : Mesh) : Mesh {
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

export function deepCloneGroup(group : Group) : Group {
    // iterate over elements of the group
    const clone = new Group();
    clone.position.copy(group.position);
    clone.rotation.copy(group.rotation);
    clone.scale.copy(group.scale);

    group.children.forEach((child) => {
        clone.add(deepCloneObject(child));
    });
    return clone;
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
