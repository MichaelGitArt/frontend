/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <Grid
        :columns="columns"
        :data-count="filtered"
        :rows="rows"
        :drafts="drafts"
        :errors="errors"
        :sort-order="sortOrder"
        :filters="filterValues"
        :pagination="pagination"
        :extended-components="extendedGridComponents"
        :is-editable="isAllowedToUpdate"
        :is-prefetching-data="isPrefetchingData"
        :is-basic-filter="true"
        :is-border="true"
        :is-header-visible="true"
        @edit-row="onEditRow"
        @preview-row="onEditRow"
        @delete-row="onRemoveRow"
        @cell-value="onCellValueChange"
        @pagination="onPaginationChange"
        @sort-column="onColumnSortChange"
        @filter="onFilterChange"
        @remove-all-filters="onRemoveAllFilters">
        <template #actionsHeader>
            <AddProductsToCollectionButton @added="onAddedProducts" />
        </template>
        <template #appendFooter>
            <UpdateCollectionProductsVisibilityButton
                :scope="scope"
                :drafts="drafts"
                @updated="onCollectionProductsVisibilityUpdated" />
        </template>
    </Grid>
</template>

<script>
import AddProductsToCollectionButton from '@Collections/components/Buttons/AddProductsToCollectionButton';
import UpdateCollectionProductsVisibilityButton
    from '@Collections/components/Buttons/UpdateCollectionProductsVisibilityButton';
import PRIVILEGES from '@Collections/config/privileges';
import {
    ALERT_TYPE,
} from '@Core/defaults/alerts';
import {
    DEFAULT_PAGE,
} from '@Core/defaults/grid';
import extendedGridComponentsMixin from '@Core/mixins/grid/extendedGridComponentsMixin';
import gridDraftMixin from '@Core/mixins/grid/gridDraftMixin';
import {
    getDefaultDataFromQueryParams,
    getDraftsBasedOnCellValues,
    getParams,
    getParsedFilters,
} from '@Core/models/mappers/gridDataMapper';
import {
    getGridData,
} from '@Core/services/grid/getGridData.service';
import {
    ROUTE_NAME,
} from '@Products/config/routes';
import Grid from '@UI/components/Grid/Grid';
import {
    mapActions,
} from 'vuex';

export default {
    name: 'CollectionProductsGrid',
    components: {
        Grid,
        AddProductsToCollectionButton,
        UpdateCollectionProductsVisibilityButton,
    },
    mixins: [
        gridDraftMixin,
        extendedGridComponentsMixin,
    ],
    props: {
        scope: {
            type: String,
            default: '',
        },
        errors: {
            type: Object,
            default: () => ({}),
        },
    },
    async fetch() {
        await this.onFetchData();

        this.isPrefetchingData = false;
    },
    data() {
        const {
            filterValues,
            pagination,
            sortOrder,
        } = getDefaultDataFromQueryParams(this.$route);

        return {
            filterValues,
            pagination,
            sortOrder,
            rows: [],
            columns: [],
            filtered: 0,
            isPrefetchingData: true,
        };
    },
    computed: {
        isAllowedToUpdate() {
            return this.$hasAccess([
                PRIVILEGES.PRODUCT_COLLECTION.update,
            ]);
        },
        collectionCellBinding() {
            return {
                imageColumn: 'default_image',
                descriptionColumn: 'default_label',
            };
        },
    },
    watch: {
        $route(from, to) {
            if (from.name !== to.name) {
                return;
            }

            const {
                filterValues,
                pagination,
                sortOrder,
            } = getDefaultDataFromQueryParams(this.$route);

            this.filterValues = filterValues;
            this.pagination = pagination;
            this.sortOrder = sortOrder;

            this.onFetchData();
        },
    },
    methods: {
        ...mapActions('feedback', [
            'onScopeValueChange',
        ]),
        onCollectionProductsVisibilityUpdated() {
            Object.keys(this.drafts).forEach((key) => {
                const [
                    rowId,
                ] = key.split('/');

                const row = this.rows.find(({
                    id,
                }) => id.value === rowId);

                if (row) {
                    row.visible.value = this.drafts[key];
                }
            });

            this.setDrafts();
        },
        onCellValueChange(cellValues) {
            this.setDrafts({
                ...this.drafts,
                ...getDraftsBasedOnCellValues(cellValues),
            });

            this.onScopeValueChange({
                scope: this.scope,
                fieldKey: 'collectionProducts',
                value: this.drafts,
            });
        },
        onAddedProducts() {
            this.onFetchData();
        },
        onRemoveRow() {
            this.onFetchData();
        },
        onEditRow(args) {
            const lastIndex = args.length - 1;

            this.$router.push({
                name: ROUTE_NAME.PRODUCT_EDIT_GENERAL,
                params: {
                    id: args[lastIndex],
                },
            });
        },
        async onFetchData() {
            await getGridData({
                $route: this.$route,
                $cookies: this.$cookies,
                $axios: this.$axios,
                path: `collections/${this.$route.params.id}/elements`,
                params: getParams({
                    $route: this.$route,
                    $cookies: this.$cookies,
                }),
                onSuccess: this.onFetchDataSuccess,
                onError: this.onFetchDataError,
            });
        },
        onFetchDataSuccess({
            columns,
            rows,
            filtered,
        }) {
            this.columns = columns;
            this.rows = rows;
            this.filtered = filtered;
        },
        onFetchDataError() {
            this.$addAlert({
                type: ALERT_TYPE.ERROR,
                message: 'Collection products haven’t been fetched properly',
            });
        },
        onRemoveAllFilters() {
            this.$router.replace({
                query: {
                    ...this.$route.query,
                    filter: '',
                    page: DEFAULT_PAGE,
                },
            });
        },
        onFilterChange(filters) {
            this.$router.replace({
                query: {
                    ...this.$route.query,
                    page: DEFAULT_PAGE,
                    filter: getParsedFilters(filters),
                },
            });
        },
        onColumnSortChange(sortOrder) {
            this.$router.replace({
                query: {
                    ...this.$route.query,
                    ...sortOrder,
                },
            });
        },
        onPaginationChange(pagination) {
            this.$router.replace({
                query: {
                    ...this.$route.query,
                    ...pagination,
                },
            });
        },
    },
};
</script>
