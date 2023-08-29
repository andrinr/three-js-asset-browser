import { Readable, Writable, readable, writable} from "svelte/store";
import type { AssetInstance } from "./ts/assetInstance";
import { Color, Material } from "three";

export const dragID : Writable<number> = writable(-1);

export const assets : Writable<AssetInstance[]> = writable([]);

export const highlightColor : Readable<Color> = readable(new Color(0xff0040));

export const areaColor : Readable<Color> = readable(new Color(0x00ff00));
