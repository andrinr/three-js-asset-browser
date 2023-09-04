
<script lang="ts">
    import { NotificationType } from "../stores";
    import { fade, fly } from 'svelte/transition';
    
    export let message : string;
    export let type : NotificationType;
</script>

<div class="notification"  out:fade in:fade>
    <p>{message}</p>
    {#if type === NotificationType.ERROR}
        <div class="bar error"></div>
    {:else if type === NotificationType.SUCCESS}
        <div class="bar success"></div>
    {:else if type === NotificationType.INFO}
        <div class="bar info"></div>
    {/if}
</div>

<style>
    .notification { 
        z-index: 200;
        background-color: var(--black);
        margin: 10px;
        width: 200px;
        color: var(--white);
    }

    .bar {
        height: 5px;
    }

    .error {
        background-color: var(--color-2);
    }

    .info {
        background-color: var(--color-1);
    }

    .success {
        background-color: var(--color-3);
    }

    p {
        margin: 10px 20px;
    }

</style>