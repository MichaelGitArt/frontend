/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */

export default function ({
    $axios, $store,
}) {
    const {
        code,
    } = $store.state.categoryTree;

    return $axios.$post('trees', {
        code,
    });
}
