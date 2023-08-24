import { Writable, writable} from "svelte/store";
import type { AssetInstance } from "./ts/assetInstance";

export const dragID : Writable<number> = writable(-1);

export const assets : Writable<AssetInstance[]> = writable([]);

