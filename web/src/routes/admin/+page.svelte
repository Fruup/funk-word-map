<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte'
	import { ChevronDownIcon } from 'lucide-svelte'
	import Map from '../Map.svelte'
	import { slide } from 'svelte/transition'
	import { cn } from '$lib/utils'
	import { Marker } from 'svelte-maplibre'
	import Input from '$lib/components/ui/input/input.svelte'
	import Label from '$lib/components/ui/label/label.svelte'
	import Slider from '$lib/components/ui/slider/slider.svelte'
	import Separator from '$lib/components/ui/separator/separator.svelte'
	import * as Select from '$lib/components/ui/select'
	import { SvelteSet } from 'svelte/reactivity'
	import { storedState } from '$lib/utils.svelte'
	import TrashIcon from 'lucide-svelte/icons/trash-2'
	import ToolIcon from 'lucide-svelte/icons/hammer'
	import PlusIcon from 'lucide-svelte/icons/plus'
	import * as Popover from '$lib/components/ui/popover'
	import Switch from '$lib/components/ui/switch/switch.svelte'

	let { data } = $props()

	const groups = storedState<
		{
			id: string
			label: string
			color: string
			values: string[]
		}[]
	>('groups', [], { debounce: 1000 })

	const uniqueEntries = $derived(new SvelteSet(data.entries.map(({ value }) => value).toSorted()))

	const getFilteredUniqueEntries = (groupId: string) =>
		Array.from(uniqueEntries).filter((value) => {
			return (
				groups.value.find(({ id }) => id === groupId)?.values.includes(value) ||
				!groups.value.some(({ values }) => values.includes(value))
			)
		})

	let isToolboxOpen = $state(true)
	let toolboxClosedStyle = $state(!isToolboxOpen)
	let zoom = $state<number>(5.3)
	let openGroupId = $state<string>()

	const markers: { lngLat: [number, number]; color: string }[] = $derived(
		data.entries.map(
			({
				value,
				expand: {
					zipCode: { lat, long },
				},
			}) => ({
				color: groups.value.find(({ values }) => values.includes(value))?.color || '#888',
				lngLat: [long, lat],
			}),
		),
	)

	const settings = storedState(
		'settings',
		{
			markerSize: [0.5],
			markerOpacity: [0.75],
			showLegend: true,
			legendPosition: [16.310406617354204, 51.574962467130405] as [number, number],
		},
		{
			debounce: 1000,
		},
	)

	function addGroup() {
		groups.value.push({ id: crypto.randomUUID(), label: '', color: '#888', values: [] })
	}

	function deleteGroup(id: string) {
		groups.value = groups.value.filter(({ id: _id }) => _id !== id)
	}
</script>

<div
	class={cn(
		'toolbox absolute z-10 m-3 w-[min(400px,90vw)] rounded-xl border-[1px] p-3 transition-all *:text-sm',
		toolboxClosedStyle && 'w-fit border-transparent',
		!toolboxClosedStyle && 'bg-background shadow-md',
	)}
>
	<Button
		class="mb-2 rounded-full"
		variant="secondary"
		size="sm"
		onclick={() => (isToolboxOpen = !isToolboxOpen)}
	>
		<ToolIcon />
		Toolbox
	</Button>

	{#if isToolboxOpen}
		<div
			transition:slide={{ duration: 300 }}
			onintrostart={() => (toolboxClosedStyle = false)}
			onoutroend={() => (toolboxClosedStyle = true)}
			class="content flex flex-col space-y-4 overflow-hidden"
		>
			<Separator />

			<div>
				<h3>Settings</h3>

				<Label>
					Marker size
					<Slider class="my-2" bind:value={settings.value.markerSize} min={0} max={4} step={0.05} />
				</Label>

				<Label>
					Marker opacity
					<Slider
						class="my-2"
						bind:value={settings.value.markerOpacity}
						min={0}
						max={1}
						step={0.01}
					/>
				</Label>

				<Label>
					Zeige Legende
					<Switch class="block" bind:checked={settings.value.showLegend} />
				</Label>
			</div>

			<Separator />

			<div>
				<div class="flex flex-row place-content-between gap-2">
					<h3>Gruppen</h3>

					<Button variant="outline" size="sm" class="size-8 rounded-full" onclick={addGroup}>
						<PlusIcon />
					</Button>
				</div>

				<ul class="flex flex-col space-y-4">
					{#each groups.value as group (group.id)}
						<li class="border-l-2 pl-2">
							<Button
								variant="ghost"
								size="sm"
								onclick={() =>
									openGroupId === group.id ? (openGroupId = undefined) : (openGroupId = group.id)}
								class="bg-muted hover:bg-muted/25 min-h-fit w-full py-1 text-left"
							>
								<ChevronDownIcon />

								<div class="max-w-[90%] grow basis-0">
									Gruppe

									{#if group.values.length > 0}
										<div
											class="text-muted-foreground overflow-hidden overflow-ellipsis text-nowrap"
											title={group.values.join(', ')}
										>
											"{group.values.join(', ')}"
										</div>
									{/if}
								</div>
							</Button>

							{#if openGroupId === group.id}
								<ul transition:slide={{ duration: 200 }} class="mt-2 space-y-2">
									<li>
										<Label>Actions</Label>

										<div class="flex flex-row items-center gap-2">
											<Input bind:value={group.label} placeholder="Name..." class="grow" />

											<Popover.Root>
												<Popover.Trigger
													class="border-muted hover:bg-muted grid size-8 place-content-center rounded-full border-[1px]"
												>
													<TrashIcon size={16} />
												</Popover.Trigger>

												<Popover.Content class="flex w-fit flex-col gap-1">
													<Button onclick={() => deleteGroup(group.id)}>
														Ja! <TrashIcon />
													</Button>

													<Popover.Close>Stop!</Popover.Close>
												</Popover.Content>
											</Popover.Root>
										</div>
									</li>

									<li class="color-picker">
										<Label>
											Farbe
											<Input type="color" bind:value={group.color} />
										</Label>
									</li>

									<li>
										<Label>
											Worte
											<Select.Root type="multiple" bind:value={group.values}>
												<Select.Trigger>
													<div class="max-w-full overflow-hidden overflow-ellipsis text-nowrap">
														{group.values.join(', ')}
													</div>
												</Select.Trigger>

												<Select.Content>
													{#each getFilteredUniqueEntries(group.id) as value}
														<Select.Item class={cn()} {value}>{value}</Select.Item>
													{:else}
														<div class="p-2 grid place-content-center">
															Alle Worte sind bereits in einer Gruppe
														</div>
													{/each}
												</Select.Content>
											</Select.Root>
										</Label>
									</li>
								</ul>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}
</div>

<Map interactive bind:zoom>
	{#each markers as { color, lngLat }}
		<Marker {lngLat}>
			<div
				class="marker rounded-full shadow-sm"
				style:--size="{settings.value.markerSize[0]}rem"
				style:--color={color}
				style:opacity={settings.value.markerOpacity[0]}
			></div>
		</Marker>
	{/each}

	{#if settings.value.showLegend}
		<Marker bind:lngLat={settings.value.legendPosition} draggable>
			<div class="bg-background rounded-2xl border-[1px] p-4 text-[1rem] shadow-lg">
				<h4 class="mb-3 font-semibold">Legende</h4>

				<ul class="flex flex-col space-y-2">
					{#each groups.value as group}
						<li>
							<div
								class="inline-block size-4 rounded-full align-[-2px] shadow-sm"
								style:background-color={group.color}
							></div>
							<span>
								{group.label}
							</span>
						</li>
					{:else}
						<li class="text-sm text-muted-foreground">Keine Gruppen definiert.</li>
					{/each}
				</ul>
			</div>
		</Marker>
	{/if}
</Map>

<style lang="scss">
	.marker {
		$size: var(--size, 0.25rem);
		width: $size;
		height: $size;

		// background-image: radial-gradient(circle, var(--color) 0%, transparent 100%);
		background-color: var(--color);
	}

	h3 {
		@apply mb-2 text-lg font-semibold;
	}
</style>
