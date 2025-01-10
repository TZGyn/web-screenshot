export const devices = [
	'desktop',
	'iPhone 15',
	'iPhone 15 Pro',
	'iPhone 15 Pro Max',
] as const

export type Device = (typeof devices)[number]

export const deviceViewPort: {
	[key in Device]: { width: number; height: number }
} = {
	desktop: { width: 1920, height: 1080 },
	'iPhone 15': { width: 393, height: 852 },
	'iPhone 15 Pro': { width: 393, height: 852 },
	'iPhone 15 Pro Max': { width: 430, height: 932 },
} as const
