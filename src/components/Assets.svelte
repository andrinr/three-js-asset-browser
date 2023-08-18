<script lang="ts">
  import type AssetInstance from "../ts/assetInstance";
  import { watchResize } from "svelte-watch-resize";
  import Asset from "./Asset.svelte";

  let assets : AssetInstance[] = [];
  export let updateAssets : (assets : AssetInstance[]) => void;

  const nItems = 20;

  for (let i = 0; i < nItems; i++) {
    assets.push(
      {
        name : 'Asset Name',
        path : 'alkd',
        focused : false,
        visible : true,
        posX : 0,
        posY : 0,
      }
    )
  };

  const update = () => {
    console.log("update");

    const assetsHtml = document.getElementById("assets-html");
    const rectHtml = assetsHtml.getBoundingClientRect();

    for (let i = 0; i < nItems; i++) {
      const item = document.getElementById(`item-${i}`);
      if (item) {
        const rect = item.getBoundingClientRect();

        const x = rect.left - rectHtml.left + rect.width / 2;
		    const y = rect.top - rectHtml.top + rect.height / 2 + 10;

        assets[i].posX = (x / rectHtml.width) * 2 - 1;
        assets[i].posY = -(y / rectHtml.height) * 2 + 1;

      }
    }
    updateAssets(assets);
  }

  let assetsHtml : HTMLElement;

</script>

<div class="assets">
  <h2>Assets:</h2>
  <br>
  <div class="container" on:wheel={update} use:watchResize={update} bind:this={assetsHtml} >
  
    {#each assets as asset, i}
      <div 
        class="item" 
        id="item-{i}" 
        on:mouseenter={
          () => {
            assets[i].focused = true;
            updateAssets(assets);
          }
        }

        on:mouseleave={
          () => {
            assets[i].focused = false;
            updateAssets(assets);
          }
        }
      >
        <p>{asset.name}</p>
      </div>
    {/each}
  </div>
</div>


<style>

  .assets {
    margin: 0;
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
  }

  .container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
    margin: 10px;
  }

  .item {
    flex-basis: 130px;
    flex-grow: 1;
    height: 130px;
    margin: 10px 0px;
    transition: 0.1s;
  }

  .item:hover {
    text-decoration: solid underline;
    cursor: pointer;
  }

  p{
    margin: 2px;
    color: black;
    text-align: center;
  }

  h2 {
    margin: 0;
    color: black;
  }
</style>
