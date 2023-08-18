<script lang="ts">
  import type AssetInstance from "../ts/assetInstance";
  import Asset from "./Asset.svelte";

  let assets : AssetInstance[] = [];

  for (let i = 0; i < 20; i++) {
    assets.push(
      {
        name : 'example',
        path : 'alkd',
        visible : true
      }
    )
  }
  
</script>
  
<div class="container">
  {#each assets as asset}
    <div class="item">
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
    overflow: scroll;
  }

  .item {
    width: 150px;
    height: 150px;
    margin: 10px;
    background-color: red;
  }
</style>
