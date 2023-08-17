<script lang="ts">
  import type Asset from "../animation/asset";

  let assets : Asset[] = [];

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
      <Asset {asset} />
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
    width: 100px;
    height: 100px;
    margin: 10px;
    background-color: red;
  }
</style>
