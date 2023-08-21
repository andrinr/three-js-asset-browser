import { Writable, writable} from "svelte/store";
import type { Mesh } from "three";
import type AssetInstance from "./ts/assetInstance";

export const dragMesh : Writable<Mesh | undefined> = writable(undefined);

export const assets : Writable<AssetInstance[]> = writable([]);

