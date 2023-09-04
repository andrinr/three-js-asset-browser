<script lang="ts">
  import { onMount } from "svelte";
  import { watchResize } from "svelte-watch-resize";
  import { Vector2 } from "three";
  import "smelte/src/tailwind.css";
  // local imports
  import Assets from "./components/Assets.svelte";
  import ContextMenu from "./components/menu.svelte";
  import {dragID, notification} from "./stores";
  import { AssetsAnimation } from "./ts/assetsAnimation";
  import { MainAnimation } from "./ts/mainAnimation";
  import { DragAnimation } from "./ts/dragAnimation";

  let mainAnimation: MainAnimation;
  let assetsAnimation : AssetsAnimation;
  let dragAnimation : DragAnimation;

  let wrapperViewer : HTMLElement;
  let wrapperAssets : HTMLElement;
  let wrapperDrag : HTMLElement;
  let canvasViewer : HTMLCanvasElement;
  let canvasAssets : HTMLCanvasElement;
  let canvasDrag : HTMLCanvasElement;

  let mousePos : Vector2 = new Vector2(0, 0);

  const setCanvasDrag = () => {
    const dragWrapper = document.getElementById("wrapper-drag");

    const rect = dragWrapper.getBoundingClientRect();
    
    dragWrapper.style.left = `${mousePos.x - rect.width / 2}px`;
    dragWrapper.style.top = `${mousePos.y - rect.height / 2}px`;

    const wrapperViewer: HTMLElement = document.getElementById("wrapper-viewer");
    const rectViewer = wrapperViewer.getBoundingClientRect();
    
    const inside = 
      rectViewer.left < mousePos.x
      && mousePos.x < rectViewer.right && 
      rectViewer.top < mousePos.y
      && mousePos.y < rectViewer.bottom;

    if (!inside) {
      dragWrapper.style.display = "block";
    }
    else {
      dragWrapper.style.display = "none";
    }
  }

  const onMouseMove = (event) => {

    mousePos.set(event.clientX, event.clientY);

    if ($dragID === -1)
      return;

    setCanvasDrag();
  };

  const loadedScene = () => {
    console.log("loaded scene");
    //document.getElementById("loading-screen").style.display = "none";
  };

  mainAnimation = new MainAnimation(loadedScene);
  assetsAnimation = new AssetsAnimation(loadedScene);
  dragAnimation = new DragAnimation();

  onMount(() => {
    mainAnimation.setElements(canvasViewer, wrapperViewer);
    assetsAnimation.setElements(canvasAssets, wrapperAssets);
    dragAnimation.setElements(canvasDrag, wrapperDrag);

    dragID.subscribe((id) => {
      if (id !== -1) {
        const dragWrapper = document.getElementById("wrapper-drag");
        dragWrapper.style.display = "block";
        setCanvasDrag();
      }
      else {
        const dragWrapper = document.getElementById("wrapper-drag");
        dragWrapper.style.display = "none";
      }
    });

  });

</script>


<main>

  <div 
    class="configurator" 
    on:mousemove={onMouseMove} 
    on:mouseup={() => {dragID.set(-1)}}>

    <div 
      id="wrapper-viewer" 
      class="viewer" 
      use:watchResize={mainAnimation.resize}
      bind:this={wrapperViewer}
    >
      <canvas id="canvas-viewer" bind:this={canvasViewer}/>
    </div>
    
    <div 
      id="wrapper-assets" 
      class="assets bg-0" 
      use:watchResize={assetsAnimation.resize}
      bind:this={wrapperAssets}
    >
      <canvas id="canvas-assets" bind:this={canvasAssets}/>
    </div>
    
    <div 
      id="wrapper-drag" 
      class="drag" 
      use:watchResize={dragAnimation.resize}
      bind:this={wrapperDrag}
    >
      <canvas id="canvas-drag" bind:this={canvasDrag}/>
    </div>

    <div id="assets-html" class="assets">
      <Assets/>   
    </div>

    <!-- <div id="impatct" class="impact">
      
    </div> -->
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
    width: 75%;
    height: 100%;
    left: 0;
    top: 0;
  }

  .assets {
    position: absolute;
    width: 25%;
    height: 100%;
    right: 0;
    top: 0;
  }

  .impact {
    position: absolute;
    width: 25%;
    height: 100%;
    left: 0;
    top: 0;
  }

  #wrapper-assets {
    pointer-events: none;
    z-index: 5;
  }

  #assets-html {
    z-index: 2;
    overflow-y: scroll;
    color: black;
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
    background-color: var(--white-0);
  }

  #assets-html::-webkit-scrollbar {
    display: none;
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
