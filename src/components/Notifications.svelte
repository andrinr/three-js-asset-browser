<script lang="ts">
  import { onMount } from "svelte";
  import { notification, NotificationInstance } from "../stores";
  import Notification from "./Notification.svelte";
  import { fly } from "svelte/transition";
  import { flip } from "svelte/animate";

  let notifications : NotificationInstance[] = [];
  let notificationID = 0;

  onMount(() => {
    notification.subscribe((value) => {
      if (!value.message)
        return;

      value.id = notificationID++;
      notifications = [...notifications, value];

      console.log(notifications);

      const interval = setInterval(() => {
        // find index and remove
        const index = notifications.findIndex((notification) => notification.id === value.id);
        notifications.splice(index, 1);
        notifications = [...notifications];

        clearInterval(interval);
      }, 7000);
    });
  });

  
</script>
  

<div id="notifications" class="notifications">
  {#each notifications as item, index (item)}
    <div id={item.id.toString()} out:fly={{y: -100, duration: 500}} in:fly={{y: 100, duration: 500}} animate:flip>
      <Notification message={item.message} type={item.type}/>
    </div>
  {/each}
 
</div>

<style>

  .notifications {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    z-index: 200;
    position: absolute;
    top: 0;
    left: 0;
  }
  
  @media screen and (orientation: portrait) {
    
  }
</style>
  