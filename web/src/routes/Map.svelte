<script lang="ts">
	import { controlledEffect } from '$lib/utils.svelte'
	import { onMount, type ComponentProps, type Snippet } from 'svelte'
	import { MapLibre, type Map, type LngLatLike } from 'svelte-maplibre'
	import geoJson from '../../../data/3_mittel.geo.json'

	let {
		children,
		map = $bindable(),
		zoom = $bindable(4.8),
		onLoaded,
		...rest
	}: Partial<ComponentProps<MapLibre>> & {
		children?: Snippet
		onLoaded?: (map: Map) => void
	} = $props()

	const mapLoaded = Promise.withResolvers()

	mapLoaded.promise.then(() => {
		onLoaded?.(map!)
	})

	controlledEffect((cleanup) => {
		if (!map) return

		map.on('error', (e) => {
			console.error(e)
		})

		map.on('load', async () => {
			if (!map) return

			map.addSource('germany', {
				type: 'geojson',
				// @ts-ignore
				data: geoJson,
			})

			map.addLayer({
				id: 'germany-line',
				type: 'line',
				source: 'germany',
				layout: {
					'line-join': 'round',
					'line-cap': 'round',
				},
				paint: {
					'line-color': '#555',
					'line-width': 1,
				},
			})

			map.addLayer({
				id: 'germany-fill',
				type: 'fill',
				source: 'germany',
				paint: {
					'fill-color': '#888',
					'fill-opacity': 0.2,
				},
			})

			mapLoaded.resolve()
			cleanup()
		})
	})

	let center: LngLatLike = [10.4515, 51.1657]
	// let center: LngLatLike = [8.2473, 49.9929]
	// let zoom = 5.3

	onMount(async () => {
		await mapLoaded.promise
	})
</script>

<MapLibre {...rest} class="h-full w-full" style="/map-style.json" {center} bind:zoom bind:map>
	{@render children?.()}
</MapLibre>
