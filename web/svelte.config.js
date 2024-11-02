import adapter from 'svelte-adapter-bun'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'
// import { sveltePreprocess } from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// preprocess: sveltePreprocess({
	// 	scss: {
	// 		api: 'modern',
	// 	},
	// }),

	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),
	},
}

export default config
