import type { Readable, Writable} from "svelte/store";
import { readable, writable } from "svelte/store";
import { Color, Material } from "three";

import type { AssetInstance } from "./instances";

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