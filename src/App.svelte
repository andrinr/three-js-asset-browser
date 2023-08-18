<script lang="ts">
  import { onMount } from "svelte";
  import { watchResize } from "svelte-watch-resize";
  //import { Klybeck } from "./animation/klybeck";
  import { AssetsAnimation } from "./ts/assetsAnimation";

  // @ts-ignore
  import { MainAnimation } from "./ts/mainAnimation";

  let main: MainAnimation;
  let assets : AssetsAnimation;

  const resizeViewer = (element: HTMLElement) => {
    if (main) {
      main.resize(element);
    }
  };

  const resizeAssets = (element: HTMLElement) => {
    if (assets) {
      assets.resize(element);
    }
  };

  const loadedScene = () => {
    console.log("loaded scene");
    //document.getElementById("loading-screen").style.display = "none";
  };

  onMount(async () => {
    const canvasViewer: HTMLCanvasElement = document.getElementById(
      "canvas-viewer"
    ) as HTMLCanvasElement;
    const canvasAssets: HTMLCanvasElement = document.getElementById(
      "canvas-assets"
    ) as HTMLCanvasElement;
    
    const wrapperViewer: HTMLElement = document.getElementById("wrapper-viewer");
    const wrapperAssets: HTMLElement = document.getElementById("wrapper-assets");

    main = new MainAnimation(canvasViewer, wrapperViewer, loadedScene);
    assets = new AssetsAnimation(canvasAssets, wrapperAssets, loadedScene, main.addMesh);

  });
</script>

<main>
  <div class="configurator">
    <div id="wrapper-viewer" use:watchResize={resizeViewer}>
      <canvas id="canvas-viewer" />
    </div>
    <div id="wrapper-assets" use:watchResize={resizeAssets}>
      <canvas id="canvas-assets" />
    </div>
  </div>
</main>

<svelte:window/>

<style>

  .configurator {
    display: flex;
    flex-direction: row;
    width: 100vw;
    height: 100vh;
  }

  #wrapper-viewer {
    width: 70vw;
  }

  #wrapper-assets {
    width: 30vw;
    border-left: solid black;
    border-width: 3px;
  }

  canvas {
    width: 100%;
    height: 100%;
  }


</style>
