import { Mesh, MeshBasicMaterial, MeshPhongMaterial } from "three";
import type { Color, Material } from "three";

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