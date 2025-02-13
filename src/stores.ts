import { Readable, Writable, readable, writable} from "svelte/store";
import type { AssetInstance } from "./ts/assetInstance";
import { Color, Material } from "three";

export const dragID : Writable<number> = writable(-1);

export const assets : Writable<AssetInstance[]> = writable([]);

export const highlightColor : Readable<Color> = readable(new Color(0x33e678));

export const wrongColor : Readable<Color> = readable(new Color(0xDB5516));
export const areaColor : Readable<Color> = readable(new Color(0x33e678));

export enum NotificationType {
    SUCCESS,
    ERROR,
    WARNING,
    INFO,
}

export interface NotificationInstance {
    message : string;
    type : NotificationType;
    id? : number;
}

export const notification  : Writable<NotificationInstance> = writable({
    message: "",
    type: NotificationType.INFO,
    id: 0,
});