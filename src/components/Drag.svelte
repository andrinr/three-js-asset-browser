<script lang="ts">
    import type { Mesh } from "three";
    import { onMount } from "svelte";
    import { DragAnimation } from "../ts/dragAnimation";

    export let mesh : Mesh;
    let dragAnimation : DragAnimation = new DragAnimation(mesh);

    onMount(async () => {

        const canvasDrag: HTMLCanvasElement = document.getElementById(
            "canvas-drag"
        ) as HTMLCanvasElement;

        const wrapperDrag: HTMLElement = document.getElementById("wrapper-drag");

        dragAnimation.setElements(canvasDrag, wrapperDrag);
    });
  
</script>

<div class="drag" id="wrapper-drag">
    <canvas id="canvas-drag" />
</div>
  

<style>
    .drag {
        width: 100px;
        height: 100px;
        position: relative;
    }

    canvas {
        width: 100%;
        height: 100%;
    }
</style>
