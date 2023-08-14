<script lang="ts">
  import { onMount } from "svelte";
  import { watchResize } from "svelte-watch-resize";
  //import { Klybeck } from "./animation/klybeck";
  import { Assets } from "./animation/assets";

  // @ts-ignore
  import * as data from "./content.json";
  import { Viewer } from "./animation/viewer";

  let contentId = 0;
  let buttons: HTMLElement;

  const contentIDCallback = (id: number) => {
    contentId = id;
  };

  let viewer: Viewer;
  let assets : Assets;

  const resizeViewer = (element: HTMLElement) => {
    if (viewer) {
      viewer.resize(element);
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
    buttons = document.getElementById("buttons");
    
    assets = new Assets(canvasAssets, wrapperAssets, loadedScene);
    viewer = new Viewer(canvasViewer, wrapperViewer, contentIDCallback, loadedScene);

  });
</script>

<main>
  <div id="wrapper-viewer" class="wrapper" use:watchResize={resizeViewer}>
    <canvas id="canvas-viewer" />
  </div>
  <div id="wrapper-assets" class="wrapper" use:watchResize={resizeAssets}>
    <canvas id="canvas-assets" />
  </div>
</main>

<svelte:window/>

<style>
  #wrapper-viewer {
    position: absolute;
    transition: 0.3s ease-in-out;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    bottom: 0;
  }

  #wrapper-assets {
    position: absolute;
    transition: 0.3s ease-in-out;
    height: 80%;
    width: 30%;
    top: 10%;
    bottom: 0;
    right: 10%;
    background-color: white;
  }

  canvas {
    width: 100%;
    height: 100%;
  }


</style>
