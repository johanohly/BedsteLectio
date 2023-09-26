import { redirect } from '@sveltejs/kit';

import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
    // Basic validation
    if (!params.id) {
        throw redirect(307, '/opgaver')
    }
    if (isNaN(+params.id)) {
        throw redirect(307, '/opgaver')
    }
    if (params.id.length != 11) {
        throw redirect(307, '/opgaver')
    }

    return {
        id: +params.id
    }
};
