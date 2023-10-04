<script lang="ts">
  import { watchResize } from "svelte-watch-resize";
  import {
    Vector3, 
    Vector2 } from "three";

  // local imports
  import { dragID, assets } from '../stores';
  import { loadGLTF } from '../ts/helpers';
  import type { Area } from "../ts/assetInstance";
  import { onMount } from "svelte";

  const nItems = 20;
  
  const floor1 : Area = {
      name : 'floor',
      normal : new Vector3(0, 1, 0),
      boundingBox : {
        min : new Vector2(-90, -10),
        max : new Vector2(20, 60)
      },
  }

  const floor3 : Area = {
    name : 'floor2',
    normal : new Vector3(0, 1, 0),
    boundingBox : {
      min : new Vector2(-120, -50),
      max : new Vector2(40, -150)
    },
  }


  onMount(async () => {
    const solar = await loadGLTF('./models/solar6.gltf');
    solar.userData["assetID"] = 1;

    solar.castShadow = true;
    solar.receiveShadow = true;
    solar.scale.setScalar(20.0);
    solar.position.set(0, -100, 0);
    //solar.rotateY(-Math.PI);
    
    assets.update( items => {
      items.push(
        {
          name : "Solar",
          object : solar,
          areas : [floor1, floor3],
          focused : false,
          visible : true,
          viewerPosition : new Vector2(0, 0),
          id : 1,
          previewScale : 4.0,
          scale : 20.0
        }
      )
      return items;
    });

    const tree = await loadGLTF('./models/tree3.gltf');
    tree.userData["assetID"] = 2;

    tree.castShadow = true;
    tree.receiveShadow = true;
    tree.scale.setScalar(600.0);
    
    assets.update( items => {
      items.push(
        {
          name : "Tree",
          object : tree,
          areas : [floor1, floor3],
          focused : false,
          visible : true,
          viewerPosition : new Vector2(0, 0),
          id : 2,
          previewScale: 40,
          scale : 600.0
        }
      )
      return items;
    });

    const erne = await loadGLTF('./models/erne3.gltf');
    erne.userData["assetID"] = 0;
    
    erne.castShadow = true;
    erne.receiveShadow = true;
    erne.scale.setScalar(1.0);

    assets.update( items => {
      items.push(
        {
          name : "Erne",
          object : erne,
          areas : [floor1, floor3],
          focused : false,
          visible : true,
          viewerPosition : new Vector2(0, 0),
          id : 0,
          previewScale : 0.02,
          scale : 1.0,
        }
      )
      return items;
    });
  });

  // for (let i = 0; i < nItems; i++) {
  //   let geometry : BoxGeometry | SphereGeometry = new BoxGeometry( 0.5, 0.5, 0.5 );
            
  //   if (Math.random() > 0.5)
  //     geometry = new SphereGeometry(0.5, 5, 5);

  //   const material = new MeshPhongMaterial( { color: 0xffffff } );
  //   const mesh = new Mesh( geometry, material );
  //   const meshGroup = new Group();
  //   meshGroup.add(mesh);

  //   mesh.rotateX(Math.PI / 4);

  //   assets.update( items => {
  //     items.push(
  //       {
  //         name : 'CUBE',
  //         group : meshGroup,
  //         areas : [floor1, floor2],
  //         focused : false,
  //         visible : true,
  //         viewerPosition : new Vector2(0, 0),
  //         id : i
  //       }
  //     )
  //     return items;
  //   });
  // };

  const update = () => {
    for (let i = 0; i < nItems; i++) {
      const item = document.getElementById(`item-${i}`);
      if (item) {
        const rect = item.getBoundingClientRect();

        const x = rect.left + rect.width / 2;
		    const y = rect.top + rect.height / 2 + 30;

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
  <h2>Assets</h2>
  <br>
  <div class="container" on:wheel={update} use:watchResize={update} bind:this={assetsHtml} >
  
    {#each $assets as asset, i}
      <div 
        class="item soft-shadow" 
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
    margin: 20px;
  }

  .item {
    flex-basis: 130px;
    flex-grow: 1;
    height: 130px;
    margin: 10px;
    transition: 0.1s;
    font-weight: bold;
    color: var(--black-1);
    border: solid 1px transparent;
  }

  .item:hover{
    cursor: pointer;
    border: solid 1px var(--black);
  }

  p{
    margin: 8px;
    text-align: center;
  }

  h2 {
    font-size: 3rem;
    margin-top: 2rem;
    margin-bottom: 0rem;
    margin-left: 2rem;
    color: var(--black-1)
  }
</style>
