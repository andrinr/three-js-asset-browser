<script lang="ts">
  import { watchResize } from "svelte-watch-resize";
  import { Mesh, BoxGeometry, MeshPhongMaterial, SphereGeometry, Vector3, Vector2 } from "three";

  // local imports
  import { dragID, assets } from '../stores';
  import type { Area } from "../ts/assetInstance";

  const nItems = 20;

  for (let i = 0; i < nItems; i++) {
    let geometry : BoxGeometry | SphereGeometry = new BoxGeometry( 0.5, 0.5, 0.5 );
            
    if (Math.random() > 0.5)
      geometry = new SphereGeometry(0.5, 5, 5);

    const material = new MeshPhongMaterial( { color: 0xffffff } );
    const mesh = new Mesh( geometry, material );

    mesh.rotateX(Math.PI / 4);

    const floor : Area = {
      name : 'floor',
      normal : new Vector3(0, 1, 0),
      boundingBox : {
        min : new Vector2(-5, -5),
        max : new Vector2(5, 5)
      },
    }

    assets.update( items => {
      items.push(
        {
          name : 'Asset Name',
          mesh : mesh,
          areas : [floor],
          focused : false,
          visible : true,
          viewerPosition : new Vector2(0, 0),
          id : i
        }
      )
      return items;
    });
  };

  const update = () => {
    for (let i = 0; i < nItems; i++) {
      const item = document.getElementById(`item-${i}`);
      if (item) {
        const rect = item.getBoundingClientRect();

        const x = rect.left + rect.width / 2;
		    const y = rect.top + rect.height / 2 + 10;

        assets.update( assetsArray => {
          assetsArray[i].viewerPosition.x = x;
          assetsArray[i].viewerPosition.y = y;
          return assetsArray;
        });
      }
    }
  }

  let assetsHtml : HTMLElement;

</script>

<div class="assets">
  <h2>Assets:</h2>
  <br>
  <div class="container" on:wheel={update} use:watchResize={update} bind:this={assetsHtml} >
  
    {#each $assets as asset, i}
      <div 
        class="item" 
        id="item-{i}" 
        on:mouseenter={
          () => {
            assets.update( items => {
              items[i].focused = true;
              return items;
            });
          }
        }
        on:mouseleave={
          () => {
            assets.update( items => {
              items[i].focused = false;
              return items;
            });
          }
        }
        on:mousedown={
          () => {
            dragID.set(i);
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
    padding: 0;
    margin: 10px 0px;
    transition: 0.1s;
    border: solid 1px transparent;
  }

  .item:hover{
    border: dashed 1px black;
    border-radius: 10px;
    cursor: pointer;
  }

  p{
    margin: 2px;
    text-align: center;
  }

  h2 {
    margin-top: 1rem 2rem;
    text-align: center;
  }
</style>
