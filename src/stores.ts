import { Readable, Writable, readable, writable} from "svelte/store";
import type { AssetInstance } from "./ts/assetInstance";
import { Color, Material } from "three";

export const dragID : Writable<number> = writable(-1);

export const assets : Writable<AssetInstance[]> = writable([]);

export const highlightColor : Readable<Color> = readable(new Color(0x0000ff));

export const wrongColor : Readable<Color> = readable(new Color(0xDB5516));
export const areaColor : Readable<Color> = readable(new Color(0x4DDB16));

export interface Notification {
    message : string;
    type : string;
}

export const notification  : Writable<Notification> = writable(undefined);