import puppeteer from 'puppeteer'
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'
import { unlink } from 'node:fs/promises'
import { z } from 'zod'

export default eventHandler(async (event) => {
	const query = z
		.object({
			url: z.string(),
			theme: z
				.union([z.literal('light'), z.literal('dark')])
				.default('light'),
		})
		.safeParse(getQuery(event))

	if (!query.success) {
		return 'Invalid'
	}

	const { url, theme } = query.data

	const browser = await puppeteer.launch({
		headless: true,
		defaultViewport: { width: 1920, height: 1080 },
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

	const recorderOptions = {
		fps: 25,
	}

	const recorder = new PuppeteerScreenRecorder(page, recorderOptions)

	const id = nanoid()

	await recorder.start(`${id}.mp4`)

	await page.evaluate(async () => {
		await new Promise((resolve) => {
			var totalHeight = 0
			var distance = 100
			var timer = setInterval(() => {
				var scrollHeight = document.body.scrollHeight
				window.scrollBy(0, distance)
				totalHeight += distance

				if (totalHeight >= scrollHeight - window.innerHeight) {
					clearInterval(timer)
					resolve(0)
				}
			}, 150)
		})
	})

	await recorder.stop()

	await browser.close()

	const file = Bun.file(`${id}.mp4`)

	const buffer = await file.arrayBuffer()

	await unlink(`${id}.mp4`)

	return new Response(buffer, {
		headers: { 'Content-Type': 'video/mp4' },
	})
})

const urlAlphabet =
	'useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict'

const nanoid = (size = 21) => {
	let id = ''
	let bytes = crypto.getRandomValues(new Uint8Array((size |= 0)))
	while (size--) {
		// Using the bitwise AND operator to "cap" the value of
		// the random byte from 255 to 63, in that way we can make sure
		// that the value will be a valid index for the "chars" string.
		id += urlAlphabet[bytes[size] & 63]
	}
	return id
}
