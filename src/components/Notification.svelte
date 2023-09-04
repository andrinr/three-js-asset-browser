<script lang="ts">
  import { onMount } from "svelte";
  import { notification } from "../stores";

  let notifications : HTMLElement;
  let id : number = 0;

  onMount(() => {
    notification.subscribe((value) => {
      id += 1;
      const notification = document.createElement("div");
      notification.id = `notification-${id}`;
      notification.className = "notification";

      const text = document.createElement("p");
      text.innerHTML = value.message;

      notification.appendChild(text);

      notifications.appendChild(notification);

      const interval = setInterval(() => {
        notifications.removeChild(notification);
        clearInterval(interval);
      }, 10000);
    });
  });

  
</script>
  

<div id="notifications" bind:this={notifications} class="notifications">
  <div class="notification">

  </div>

</div>

<style>

  .notifications {
    display: flex;
    flex-direction: column;
    z-index: 200;
    position: absolute;
    top: 0;
    left: 0;

  }
  
  .notification { 
      z-index: 200;
      background-color: var(--white);
      border-radius: 10px;
  }

  @media screen and (orientation: portrait) {
    
  }
</style>
  