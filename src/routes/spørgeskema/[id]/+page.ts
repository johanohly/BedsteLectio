import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    // Basic validation
    if (!params.id) {
        throw redirect(307, '/spørgeskemaer')
    }
    if (isNaN(+params.id)) {
        throw redirect(307, '/spørgeskemaer')
    }
    if (params.id.length != 11) {
        throw redirect(307, '/spørgeskemaer')
    }

    return {
        id: +params.id
    }
};
