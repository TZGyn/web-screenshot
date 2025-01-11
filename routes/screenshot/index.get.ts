import puppeteer from 'puppeteer'
import { z } from 'zod'

export default eventHandler(async (event) => {
	const query = z
		.object({
			url: z.string(),
			theme: z
				.union([z.literal('light'), z.literal('dark')])
				.default('light'),
			device: z.enum(devices).default('desktop'),
			fullPage: z
				.enum(['true', 'false'])
				.transform((value) => value === 'true'),
		})
		.safeParse(getQuery(event))

	if (!query.success) {
		return 'Invalid'
	}

	const { url, theme, device, fullPage } = query.data

	const browser = await puppeteer.launch({
		headless: true,
		defaultViewport: deviceViewPort[device],
		args: ['--no-sandbox'],
	})

	const page = await browser.newPage()

	await page.emulateMediaFeatures([
		{
			name: 'prefers-color-scheme',
			value: theme,
		},
	])

	await page.goto(url, {
		waitUntil: 'networkidle2',
	})

	const data = await page.screenshot({ fullPage: fullPage })

	await browser.close()

	return new Response(data, {
		headers: { 'Content-Type': 'image/png' },
	})
})
