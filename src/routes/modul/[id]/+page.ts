import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    // Basic validation
    if (!params.id) {
        throw redirect(307, '/skema')
    }
    if (isNaN(+params.id)) {
        throw redirect(307, '/skema')
    }
    if (params.id.length != 11) {
        throw redirect(307, '/skema')
    }

    return {
        id: +params.id
    }
};

export const ssr = false;