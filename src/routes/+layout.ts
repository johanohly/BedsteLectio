import { browser, dev } from '$app/environment';
import { inject } from '@vercel/analytics';
import posthog from 'posthog-js';

inject({ mode: dev ? 'development' : 'production' });

export const ssr = false;
export const load = async () => {
    if (browser) {
        posthog.init(
            'phc_794iCsKPStebX7N1YWzWKDgDE3ZCDYbikdpeGCdZVLh',
            {
                api_host: 'https://bedstelectio.dk/ingest',
                ui_host: 'https://eu.posthog.com',
                capture_pageview: false,
                capture_pageleave: false,
            }
        )
    }
    return;
}