import { preprocessMeltUI } from '@melt-ui/pp'
import { vitePreprocess } from "@sveltejs/kit/vite";
import adapter from "svelte-adapter-bun";
import preprocess from "svelte-preprocess";
import sequence from 'svelte-sequential-preprocessor'

/** @type {import('@sveltejs/kit').Config}*/
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  kit: {
    // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
    // If your environment is not supported or you settled on a specific environment, switch out the adapter.
    // See https://kit.svelte.dev/docs/adapters for more information about adapters.
    adapter: adapter(),
    alias: {
      $components: "src/lib/components",
      "$components/*": "src/lib/components/*"
    }
  },
  // for more information about preprocessors
  preprocess: sequence([
    vitePreprocess(),
    preprocess({
      postcss: true
    }),
    preprocessMeltUI()
  ])
};
export default config;