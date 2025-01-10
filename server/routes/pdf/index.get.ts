import puppeteer from 'puppeteer'
import { z } from 'zod'

export default eventHandler(async (event) => {
	const query = z
		.object({
			url: z.string(),
		})
		.safeParse(getQuery(event))

	if (!query.success) {
		return 'Invalid'
	}

	const browser = await puppeteer.launch({
		headless: true,
		defaultViewport: { width: 1920, height: 1080 },
		args: ['--no-sandbox'],
	})
	const page = await browser.newPage()

	await page.goto(query.data.url, {
		waitUntil: 'networkidle2',
	})

	const data = await page.pdf({ format: 'A4' })

	await browser.close()

	return new Response(data, {
		headers: { 'Content-Type': 'application/pdf' },
	})
})
