<script lang="ts">
  import { onMount } from "svelte";
  import { watchResize } from "svelte-watch-resize";
  import { AssetsAnimation } from "./ts/assetsAnimation";
  import { MainAnimation } from "./ts/mainAnimation";
  import { DragAnimation } from "./ts/dragAnimation";
  import Assets from "./components/Assets.svelte";
  import { Vector2 } from "three";
  import { Mesh } from "three";

  let mainAnimation: MainAnimation;
  let assetsAnimation : AssetsAnimation;
  let dragAnimation : DragAnimation;

  let dragging : boolean = false;
  let dragMesh : Mesh = null;

  const resizeViewer = (element: HTMLElement) => {
    if (mainAnimation) mainAnimation.resize(element);
  };

  const resizeAssets = (element: HTMLElement) => {
    if (assetsAnimation) assetsAnimation.resize(element);
  };

  const resizeDrag = (element: HTMLElement) => {
    if (dragAnimation) dragAnimation.resize(element);
  };

  const startDrag = (mesh) => {
    if (dragAnimation) dragAnimation.setMesh(mesh);
    dragMesh = mesh;

    const dragWrapper = document.getElementById("wrapper-drag");
    dragWrapper.style.display = "block";

    dragging = true;
  };

  const endDrag = () => {
    if (!dragging)
      return;

    const dragWrapper = document.getElementById("wrapper-drag");
    dragWrapper.style.display = "none";

    dragging = false;
    
    mainAnimation.placePreview();

    console.log("end drag");
  };

  const onMouseMove = (event) => {

    if (!dragging)
      return;
    
    const x = event.clientX;
    const y = event.clientY;

    const dragWrapper = document.getElementById("wrapper-drag");

    const rect = dragWrapper.getBoundingClientRect();
    
    dragWrapper.style.left = `${x - rect.width / 2}px`;
    dragWrapper.style.top = `${y - rect.height / 2}px`;

    const wrapperViewer: HTMLElement = document.getElementById("wrapper-viewer");
    const rectViewer = wrapperViewer.getBoundingClientRect();
    
    const inside = 
      rectViewer.left < x 
      && x < rectViewer.right && 
      rectViewer.top < y 
      && y < rectViewer.bottom;

    if (inside && dragging) {
      const vec = mainAnimation.documentToCanvasPosition(new Vector2(x, y));
      mainAnimation.previewPlacement(dragMesh, vec);
    }
  };

  const loadedScene = () => {
    console.log("loaded scene");
    //document.getElementById("loading-screen").style.display = "none";
  };

  mainAnimation = new MainAnimation(loadedScene);
  assetsAnimation = new AssetsAnimation(loadedScene, mainAnimation.addMesh);
  dragAnimation = new DragAnimation();

  onMount(async () => {
    const canvasViewer: HTMLCanvasElement = document.getElementById(
      "canvas-viewer"
    ) as HTMLCanvasElement;
    const canvasAssets: HTMLCanvasElement = document.getElementById(
      "canvas-assets"
    ) as HTMLCanvasElement;
    const canvasDrag: HTMLCanvasElement = document.getElementById(
      "canvas-drag"
    ) as HTMLCanvasElement;
    
    const wrapperViewer: HTMLElement = document.getElementById("wrapper-viewer");
    const wrapperAssets: HTMLElement = document.getElementById("wrapper-assets");
    const dragWrapper : HTMLElement = document.getElementById("wrapper-drag");

    mainAnimation.setElements(canvasViewer, wrapperViewer);
    assetsAnimation.setElements(canvasAssets, wrapperAssets);
    dragAnimation.setElements(canvasDrag, dragWrapper);
  });
</script>

<main>
  <div class="configurator" on:mousemove={onMouseMove} on:mouseup={endDrag}>
    <div id="wrapper-viewer" class="viewer" use:watchResize={resizeViewer}>
      <canvas id="canvas-viewer" />
    </div>
    <div id="wrapper-assets" class="assets" use:watchResize={resizeAssets}>
      <canvas id="canvas-assets" />
    </div>
    <div id="wrapper-drag" class="drag" use:watchResize={resizeDrag}>
      <canvas id="canvas-drag" />
    </div>

    <div id="assets-html" class="assets">
      <Assets updateAssets={assetsAnimation.updateAssets} startDrag={startDrag}/>   
    </div>
  </div>
</main>

<svelte:window/>

<style>

  .configurator {
    width: 100vw;
    height: 100vh;
    position: absolute;
    top: 0;
    left: 0;
  }

  .viewer {
    position: absolute;
    width: 70%;
    height: 100%;
    left: 0;
    top: 0;
  }

  .assets {
    position: absolute;
    width: 30%;
    height: 100%;
    right: 0;
    top: 0;
  }

  #wrapper-assets {
    pointer-events: none;
    z-index: 5;
  }

  #assets-html {
    z-index: 2;
    overflow-y: scroll;
    background-color: rgb(214, 214, 214);
  }

  #wrapper-drag {
    position: absolute;
    width: 100px;
    height: 100px;
    z-index: 10;
    display: none;
  }

  canvas {
    width: 100%;
    height: 100%;
  }
</style>
