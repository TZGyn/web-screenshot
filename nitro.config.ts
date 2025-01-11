//https://nitro.unjs.io/config
export default defineNitroConfig({
	srcDir: './',
	compatibilityDate: '2025-01-09',
	experimental: {
		openAPI: true,
	},
	openAPI: {
		meta: {
			title: 'Web Screenshot',
			description: 'Screen record any website',
			version: '1.0',
		},
	},
})
