<script lang="ts">
  import { onMount } from "svelte";
  import { watchResize } from "svelte-watch-resize";
  import { AssetsAnimation } from "./ts/assetsAnimation";
  import { MainAnimation } from "./ts/mainAnimation";
  import Assets from "./components/Assets.svelte";

  let mainAnimation: MainAnimation;
  let assetsAnimation : AssetsAnimation;

  const resizeViewer = (element: HTMLElement) => {
    if (mainAnimation) mainAnimation.resize(element);
  };

  const resizeAssets = (element: HTMLElement) => {
    if (assetsAnimation) assetsAnimation.resize(element);
  };

  const loadedScene = () => {
    console.log("loaded scene");
    //document.getElementById("loading-screen").style.display = "none";
  };

  mainAnimation = new MainAnimation(loadedScene);
  assetsAnimation = new AssetsAnimation(loadedScene, mainAnimation.addMesh);

  console.log(assetsAnimation);
  onMount(async () => {
    const canvasViewer: HTMLCanvasElement = document.getElementById(
      "canvas-viewer"
    ) as HTMLCanvasElement;
    const canvasAssets: HTMLCanvasElement = document.getElementById(
      "canvas-assets"
    ) as HTMLCanvasElement;
    
    const wrapperViewer: HTMLElement = document.getElementById("wrapper-viewer");
    const wrapperAssets: HTMLElement = document.getElementById("wrapper-assets");

    mainAnimation.setElements(canvasViewer, wrapperViewer);
    assetsAnimation.setElements(canvasAssets, wrapperAssets);
    
  });
</script>

<main>
  <div class="configurator">
    <div id="wrapper-viewer" class="viewer" use:watchResize={resizeViewer}>
      <canvas id="canvas-viewer" />
    </div>
    <div id="wrapper-assets" class="assets" use:watchResize={resizeAssets}>
      <canvas id="canvas-assets" />
    </div>

    <div id="assets-html" class="assets">
      <Assets updateAssets={assetsAnimation.updateAssets}/>   
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
  }

  canvas {
    width: 100%;
    height: 100%;
  }
</style>
