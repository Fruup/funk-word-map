<script lang="ts">
	import '../app.css'
	import { Toaster } from 'svelte-sonner'

	let { children } = $props()
</script>

<Toaster position="bottom-center" />

<div class="grid min-h-[100svh] grid-rows-[auto_1fr]" data-vaul-drawer-wrapper>
	<header
		class="border-foreground bg-background/80 grid place-content-center border-b-[1px] p-4 backdrop-blur-sm"
	>
		<nav>
			<ul class="flex flex-row place-content-center items-center space-x-4">
				<li>
					<h1 class="text-xl font-bold">
						<a href="/">funk survey</a>
					</h1>
				</li>

				<li>
					<a href="/info">info</a>
				</li>
			</ul>
		</nav>
	</header>

	<main class="relative">
		{@render children()}
	</main>
</div>
