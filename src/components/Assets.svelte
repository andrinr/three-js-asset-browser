<script lang="ts">
  import type AssetInstance from "../ts/assetInstance";
  import Asset from "./Asset.svelte";

  let assets : AssetInstance[] = [];
  export let updateAssets : (assets : AssetInstance[]) => void;

  const nItems = 20;

  for (let i = 0; i < nItems; i++) {
    assets.push(
      {
        name : 'example',
        path : 'alkd',
        visible : true,
        posX : 0,
        posY : 0,
      }
    )
  }

  const onScroll = (event: WheelEvent) => {
    const assetsHtml = document.getElementById("assets-html");

    const rectHtml = assetsHtml.getBoundingClientRect();

    for (let i = 0; i < nItems; i++) {
      const item = document.getElementById(`item-${i}`);
      if (item) {
        const rect = item.getBoundingClientRect();

        const x = rect.left - rectHtml.left + rect.width / 2;
		    const y = rect.top - rectHtml.top + rect.height / 2;

        assets[i].posX = (x / rectHtml.width) * 2 - 1;
        assets[i].posY = -(y / rectHtml.height) * 2 + 1;

      }
    }

    updateAssets(assets);
  }

  let assetsHtml : HTMLElement;

</script>
  
<div class="container" on:wheel={onScroll} bind:this={assetsHtml}>
  {#each assets as asset, i}
    <div class="item" id="item-{i}">
      <p>{Asset.name}</p>
    </div>
  {/each}
</div>

<style>

  .container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }

  .item {
    width: 150px;
    height: 150px;
    margin: 10px;
    border: dashed 1px black;
    padding: margin;
  }

  p{
    margin: 10px;
  }
</style>
