/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <Page>
        <TitleBar
            :title="name"
            :is-read-only="isReadOnly">
            <template #prependHeader>
                <NavigateBackFab :previous-route="previousRoute" />
            </template>
            <template #mainAction>
                <RemoveImportButton />
                <CreateImportButton />
            </template>
        </TitleBar>
        <HorizontalRoutingTabBar
            v-if="asyncTabs"
            :items="asyncTabs"
            :change-values="changeValues"
            :errors="errors" />
    </Page>
</template>

<script>
import {
    ALERT_TYPE,
} from '@Core/defaults/alerts';
import beforeRouteEnterMixin from '@Core/mixins/route/beforeRouteEnterMixin';
import beforeRouteLeaveMixin from '@Core/mixins/route/beforeRouteLeaveMixin';
import asyncTabsMixin from '@Core/mixins/tab/asyncTabsMixin';
import CreateImportButton from '@Import/components/Buttons/CreateImportButton';
import RemoveImportButton from '@Import/components/Buttons/RemoveImportButton';
import PRIVILEGES from '@Import/config/privileges';
import Page from '@UI/components/Layout/Page';
import HorizontalRoutingTabBar from '@UI/components/TabBar/Routing/HorizontalRoutingTabBar';
import TitleBar from '@UI/components/TitleBar/TitleBar';
import {
    mapActions,
    mapState,
} from 'vuex';

export default {
    name: 'EditImportProfile',
    components: {
        Page,
        TitleBar,
        HorizontalRoutingTabBar,
        CreateImportButton,
        RemoveImportButton,
    },
    mixins: [
        asyncTabsMixin,
        beforeRouteEnterMixin,
        beforeRouteLeaveMixin,
    ],
    validate({
        params,
    }) {
        return /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/.test(params.id);
    },
    async fetch({
        app,
        store,
        params,
    }) {
        await store.dispatch('import/getImportProfile', {
            id: params.id,
            onError: () => {
                app.$addAlert({
                    type: ALERT_TYPE.ERROR,
                    message: 'Import profile hasn`t been fetched properly',
                });
            },
        });
    },
    computed: {
        ...mapState('import', [
            'configuration',
        ]),
        name() {
            const {
                name,
            } = JSON.parse(this.configuration);

            return name;
        },
        isReadOnly() {
            return this.$isReadOnly(PRIVILEGES.IMPORT.namespace);
        },
    },
    beforeDestroy() {
        this.__clearStorage();
        this.__clearFeedbackStorage();
    },
    methods: {
        ...mapActions('import', [
            '__clearStorage',
        ]),
        ...mapActions('feedback', {
            __clearFeedbackStorage: '__clearStorage',
        }),
    },
    head() {
        return {
            title: `${this.name} - Import profiles - Ergonode`,
        };
    },
};
</script>
