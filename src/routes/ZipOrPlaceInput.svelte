<script lang="ts">
	import { type Infer, type SuperForm } from 'sveltekit-superforms'
	import { tick } from 'svelte'
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down'
	import { useId } from 'bits-ui'
	import * as Form from '$lib/components/ui/form'
	import * as Popover from '$lib/components/ui/popover'
	import * as Command from '$lib/components/ui/command'
	import { cn } from '$lib/utils'
	import { buttonVariants } from '$lib/components/ui/button'
	import type { formSchema } from './schema'
	import { Loader2 } from 'lucide-svelte'
	import { clientApi } from '$lib/clientApi'

	let {
		form,
	}: {
		form: SuperForm<Infer<typeof formSchema>>
	} = $props()

	let { form: formData } = form

	let open = $state(false)
	let isLoading = $state(false)

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		open = false
		tick().then(() => {
			document.getElementById(triggerId)?.focus()
		})
	}
	const triggerId = useId()

	let inputValue = $state('')
	let options = $state<{ zipCode: string; place: string }[]>([])

	let timer: ReturnType<typeof setTimeout>

	$effect(() => {
		if (!inputValue.length) return

		clearTimeout(timer)
		timer = setTimeout(async () => {
			loadOptions().then((result) => {
				options = result
			})
		}, 300)
	})

	async function loadOptions() {
		try {
			const result = await clientApi.call('getOptions', inputValue)
			if (!result) return []

			return result.map(({ zipCode, place }) => ({
				zipCode,
				place,
			}))
		} catch (error) {
			console.warn(error)
			return []
		}
	}
</script>

<Form.Field {form} name="zipCode" class="flex flex-col">
	<Popover.Root bind:open>
		<Form.Control id={triggerId}>
			{#snippet children({ props })}
				<Form.Label>Und wo kommst Du her?</Form.Label>

				<Popover.Trigger
					class={cn(
						buttonVariants({ variant: 'outline' }),
						'justify-between',
						!$formData.zipCode && 'text-muted-foreground',
					)}
					role="combobox"
					{...props}
				>
					{$formData.zipCode || 'PLZ oder Ort'}
					<ChevronsUpDown class="ml-2 size-4 shrink-0 opacity-50" />
				</Popover.Trigger>

				<input hidden value={$formData.zipCode} name={props.name} />
			{/snippet}
		</Form.Control>

		<Popover.Content class="w-[200px] p-0">
			<Command.Root shouldFilter={false}>
				<Command.Input
					autofocus
					placeholder="Suche PLZ oder Ort..."
					class="h-9"
					bind:value={inputValue}
				/>

				<Command.Empty>
					<span class="text-3xl">🤷</span>
				</Command.Empty>

				<Command.Group class="max-h-64 overflow-auto">
					{#if isLoading}
						<div class="m-1 text-center">
							<Loader2 class="m-auto inline-block animate-spin opacity-30" />
						</div>
					{:else}
						{#each options as option}
							<Command.Item
								value={option.zipCode + ' ' + option.place}
								onSelect={() => {
									$formData.zipCode = option.zipCode
									closeAndFocusTrigger(triggerId)
								}}
								class="block"
							>
								<div>
									{option.zipCode}
								</div>
								<div class="text-sm text-slate-500">
									{option.place}
								</div>
							</Command.Item>
						{/each}
					{/if}
				</Command.Group>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>

	<Form.FieldErrors />
</Form.Field>
