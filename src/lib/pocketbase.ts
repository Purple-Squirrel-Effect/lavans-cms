import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';
import type { TypedPocketBase } from '../../pocketbase-types';

// Normalize the PocketBase URL to ensure it's always absolute
function normalizePocketBaseUrl(url: string | undefined): string {
	const defaultUrl = 'http://127.0.0.1:8090';

	if (!url) {
		return defaultUrl;
	}

	// If URL already has protocol, return as-is
	if (url.startsWith('http://') || url.startsWith('https://')) {
		return url;
	}

	// If URL starts with //, prepend http:
	if (url.startsWith('//')) {
		return `http:${url}`;
	}

	// Otherwise, prepend http://
	return `http://${url}`;
}

export const pb = new PocketBase(normalizePocketBaseUrl(PUBLIC_POCKETBASE_URL)) as TypedPocketBase;
