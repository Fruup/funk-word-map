<script lang="ts">
	import { toast } from 'svelte-sonner'
	import { CheckIcon, BugIcon } from 'lucide-svelte'
	import Button from './ui/button/button.svelte'
	import { slide } from 'svelte/transition'

	let isOpen = $state(false)

	function clearVote() {
		localStorage.removeItem('vote')
		toast(CheckIcon, {
			class: 'w-fit',
			duration: 2000,
		})
	}
</script>

<div class="fixed bottom-0 left-0 z-20 m-2">
	{#if isOpen}
		<div
			transition:slide={{ duration: 200 }}
			class="bg-background my-2 flex flex-col gap-2 rounded-xl border-[1px] p-2 shadow-md"
		>
			<Button variant="secondary" onclick={clearVote}>Vote löschen</Button>
		</div>
	{/if}

	<Button
		variant="secondary"
		class="size-12 rounded-full shadow-md"
		onclick={() => (isOpen = !isOpen)}
	>
		<BugIcon />
	</Button>
</div>
