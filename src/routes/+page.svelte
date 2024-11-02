<script lang="ts">
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte'
	import { type Map as MapLibreMap, Marker } from 'svelte-maplibre'
	import * as Form from '$lib/components/ui/form'
	import { Separator } from '$lib/components/ui/separator'
	import SuperDebug, { superForm } from 'sveltekit-superforms'
	import { formSchema } from './schema'
	import { zodClient } from 'sveltekit-superforms/adapters'
	import Input from '$lib/components/ui/input/input.svelte'
	import ZipOrPlaceInput from './ZipOrPlaceInput.svelte'
	import { browser } from '$app/environment'
	import * as Popover from '$lib/components/ui/popover'
	import { cn } from '$lib/utils'
	import { toast } from 'svelte-sonner'
	import { fly } from 'svelte/transition'
	import { storedState } from '$lib/utils.svelte'
	import type { ActionData } from './$types'
	import * as Drawer from '$lib/components/ui/drawer'
	import { MessageCircleQuestionIcon } from 'lucide-svelte'
	import InfoPage from './info/+page.svelte'
	import Map from './Map.svelte'

	let { data } = $props()

	let isPopupOpen = $state(false)
	let map = $state<MapLibreMap>()

	const loadedVote = storedState<{
		value: string
		lngLat: [number, number]
	}>('vote')

	let shouldShowForm = $derived(!loadedVote.value)

	const form = superForm(data.form, {
		validators: zodClient(formSchema),
		dataType: 'json',
		onResult(event) {
			if (event.result.type === 'success') {
				const data = (event.result.data as ActionData)?.data
				if (!data) return

				toast('🎉 Danke fürs Abstimmen!', { id: 'thanks', duration: 10000 })

				loadedVote.value = {
					value: data.value,
					lngLat: data.lngLat,
				}

				map?.panTo(loadedVote.value.lngLat, { duration: 1000 })
			}
		},
	})

	const { form: formData, enhance } = form

	function onMapLoaded() {
		setTimeout(() => {
			toast('🎉 Danke fürs Abstimmen!', { id: 'thanks', duration: 10000 })

			map?.panTo(loadedVote.value.lngLat, { duration: 1000 })
		}, 1000)
	}
</script>

{#if shouldShowForm}
	<div class="grid h-full place-content-center">
		<form
			transition:fly={{ duration: 300, y: 10 }}
			method="POST"
			use:enhance
			class="z-10 m-2 flex max-w-[400px] flex-col space-y-4 rounded-xl border-[1px] bg-background/70 p-4 shadow-md backdrop-blur-sm"
			id="form"
		>
			<Form.Field {form} name="value">
				<Form.Control>
					{#snippet children({ props })}
						<Form.Label class="leading-none"
							>Welches Wort benutzt Du für das Entfernen einer Mandarinenschale?</Form.Label
						>
						<Input {...props} bind:value={$formData.value} placeholder="🍊..." />
					{/snippet}
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>

			<Separator />

			<ZipOrPlaceInput {form} />

			<Separator />

			<div class="actions grid grid-cols-[1fr_auto_1fr] place-content-center">
				<div class="justify-items-start"></div>

				<Popover.Root bind:open={isPopupOpen}>
					<div class="text-center">
						<Popover.Trigger class={cn(buttonVariants())}>Senden</Popover.Trigger>
					</div>

					<Popover.Content
						portal={false}
						class="flex w-fit max-w-[min(90vw,300px)] flex-col gap-1"
						align="center"
					>
						<p class="prose mb-2 text-center text-sm text-muted-foreground">
							Bist Du sicher? Du kannst deine Auswahl nicht mehr ändern!
						</p>

						<Form.Button onclick={() => (isPopupOpen = false)}>OK!</Form.Button>
						<Button variant="outline" onclick={() => (isPopupOpen = false)}>Stop!</Button>
					</Popover.Content>
				</Popover.Root>

				<Drawer.Root shouldScaleBackground setBackgroundColorOnScale={false}>
					<Drawer.Trigger class="justify-items-end">
						<MessageCircleQuestionIcon class="text-muted-foreground" />
					</Drawer.Trigger>

					<Drawer.Content class="max-h-[90%]">
						<div class="overflow-auto">
							<InfoPage />
						</div>
					</Drawer.Content>
				</Drawer.Root>
			</div>

			<!-- {#if browser && import.meta.env.DEV}
		<SuperDebug data={$formData} />
	{/if} -->
		</form>
	</div>
{/if}

{#if import.meta.env.PUBLIC_IS_STAGING === 'true'}
	<div class="fixed">
		<button onclick={() => localStorage.clear()}>clear local storage</button>
	</div>
{/if}

<div class="pointer-events-none fixed inset-0 -z-10">
	<Map bind:map interactive={false} onLoaded={onMapLoaded}>
		{#if loadedVote.value}
			{@const { value, lngLat } = loadedVote.value}

			<Marker {lngLat} class="relative">
				<div in:fly={{ y: -20, duration: 1000, delay: 1000 }}>
					<span class="text-3xl drop-shadow-lg">🍊</span>
					<div
						class="absolute inline-block -translate-x-1/2 -translate-y-full rotate-6 rounded-lg bg-background p-1.5 text-xl font-semibold leading-tight text-foreground shadow-md"
					>
						"{value}"
					</div>
				</div>
			</Marker>
		{/if}
	</Map>
</div>
