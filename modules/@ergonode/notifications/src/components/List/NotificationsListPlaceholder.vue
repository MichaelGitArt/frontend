/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <Placeholder
        :layout-orientation="layoutOrientation"
        :title="title"
        :subtitle="subtitle"
        :bg-url="bgUrl"
        :color="color">
        <template #action>
            <slot name="action" />
        </template>
    </Placeholder>
</template>

<script>
import {
    LAYOUT_ORIENTATION,
} from '@Core/defaults/layout';
import {
    WHITE,
} from '@UI/assets/scss/_js-variables/colors.scss';
import Placeholder from '@UI/components/Placeholder/Placeholder';

export default {
    name: 'NotificationsListPlaceholder',
    components: {
        Placeholder,
    },
    props: {
        /**
         * Determines position of body components; vertical / horizontal
         */
        layoutOrientation: {
            type: String,
            default: LAYOUT_ORIENTATION.VERTICAL,
            validator: value => Object.values(LAYOUT_ORIENTATION).indexOf(value) !== -1,
        },
        /**
         * The title of the component
         */
        title: {
            type: String,
            default: '',
        },
        /**
         * The subtitle of the component
         */
        subtitle: {
            type: String,
            default: '',
        },
        /**
         * The url to background image of placeholder
         */
        bgUrl: {
            type: String,
            required: true,
        },
        color: {
            type: String,
            default: WHITE,
            validator: value => /^#([A-Fa-f0-9]{6})$/.test(value),
        },
    },
};
</script>
