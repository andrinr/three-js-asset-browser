<script lang="ts">
  import { onMount } from "svelte";
  import { watchResize } from "svelte-watch-resize";
  import { Klybeck } from "./animation/Klybeck";
  import Tile from "./components/Tile.svelte";
  import Loader from "./components/Loader.svelte";

  // @ts-ignore
  import * as data from "./content.json";
  let contentId = 0;
  let buttons: HTMLElement;

  const contentIDCallback = (id: number) => {
    contentId = id;
  };

  let animation: Klybeck;

  const resize = (element: HTMLElement) => {
    if (animation) {
      animation.resize(element);
    }
  };

  const loadedScene = () => {
    console.log("loaded scene");
    document.getElementById("loading-screen").style.display = "none";
  };

  onMount(async () => {
    const canvas: HTMLCanvasElement = document.getElementById(
      "three"
    ) as HTMLCanvasElement;
    const wrapper: HTMLElement = document.getElementById("wrapper");
    buttons = document.getElementById("buttons");
    animation = new Klybeck(canvas, wrapper, contentIDCallback, loadedScene);
  });
</script>

<main>
  <div id="wrapper" class="wrapper" use:watchResize={resize}>
    <canvas id="three" />
    <div class="loading-screen" id="loading-screen">
      <div class=loader>
        <Loader />
      </div>
    </div>
    <div class="wrapper-content">
      <div class="tile">
        <Tile
          title={data.content[contentId].title}
          subtitle={data.content[contentId].subtitle}
          description={data.content[contentId].description}
          learnMoreTitle={data.content[contentId].learnMoreTitle}
          learnMoreContent={data.content[contentId].learnMoreContent}
        >
        </Tile>
      </div>
    </div>
  </div>
</main>

<svelte:window/>

<style>
  .wrapper {
    position: absolute;
    transition: 0.3s ease-in-out;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }

  #three {
    position: relative;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  .wrapper-content {
    position: absolute;
    top: 50%;
    -ms-transform: translateY(-50%);
    transform: translateY(-50%);
    left: 0;
    z-index: 100;
  }

  .loading-screen{
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 200;
    background-color: #ffffff;
  }

  .loader {
    /* Center vertically and horizontally */
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .tile {
    margin-left: 60px;
    z-index: 100;
  }


  @media (orientation: portrait) {
    .wrapper-content {
      top: auto;
      bottom: 0;
      width: 100%;
      transform: none;
      -ms-transform: none;
    }

    .tile {
      margin: 10px;
      z-index: 100;
    }

  }
</style>
