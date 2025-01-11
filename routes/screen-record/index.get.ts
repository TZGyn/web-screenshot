import puppeteer from 'puppeteer'
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder'
import { unlink } from 'node:fs/promises'
import { z } from 'zod'

defineRouteMeta({
	openAPI: {
		tags: ['screen record'],
		description: 'Screenshot a web page',
		parameters: [
			{ in: 'query', name: 'url', required: true },
			{
				in: 'query',
				name: 'theme',
				schema: { type: 'string', enum: ['light', 'dark'] },
			},
			{
				in: 'query',
				name: 'device',
				schema: {
					type: 'string',
				},
			},
		],
		responses: {
			200: {
				description: 'Video',
				content: {
					'video/mp4': {
						schema: {
							type: 'string',
							format: 'binary',
						},
					},
				},
			},
		},
	},
})

export default eventHandler(async (event) => {
	const query = z
		.object({
			url: z.string(),
			theme: z
				.union([z.literal('light'), z.literal('dark')])
				.default('light'),
			device: z.enum(devices).default('desktop'),
		})
		.safeParse(getQuery(event))

	if (!query.success) {
		return 'Invalid'
	}

	const { url, theme, device } = query.data

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

	const recorderOptions = {
		fps: 60,
	}

	const recorder = new PuppeteerScreenRecorder(page, recorderOptions)

	const id = nanoid()

	await recorder.start(`${id}.mp4`)

	const height = await page.evaluate(() => {
		return document.body.scrollHeight
	})

	// https://github.com/puppeteer/puppeteer/issues/13296
	const session = await page.createCDPSession()

	await session.send('Input.synthesizeScrollGesture', {
		x: 0,
		y: 0,
		yDistance: -height,
		speed: 400,
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
