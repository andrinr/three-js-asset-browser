<script lang="ts">
  import type AssetInstance from "../ts/assetInstance";
  import Asset from "./Asset.svelte";

  let assets : AssetInstance[] = [];

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
    for (let i = 0; i < nItems; i++) {
      const item = document.getElementById(`item-${i}`);
      if (item) {
        const rect = item.getBoundingClientRect();
        assets[i].posX += rect.left;
        assets[i].posY += rect.top;
      }
    }
  }

  let assetsHtml : HTMLElement;

</script>
  
<div class="container" on:wheel={onScroll} bind:this={assetsHtml}>
  {#each assets as asset, i}
    <div class="item" id="item-{i}">
      {Asset.name}
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
    background-color: red;
  }
</style>
