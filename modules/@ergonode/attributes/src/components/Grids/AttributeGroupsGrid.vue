/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <Grid
        :columns="columns"
        :data-count="filtered"
        :rows="rows"
        :sort-order="sortOrder"
        :filters="filterValues"
        :pagination="pagination"
        :extended-components="extendedGridComponents"
        :is-editable="isAllowedToUpdate"
        :is-prefetching-data="isPrefetchingData"
        :is-basic-filter="true"
        :is-border="true"
        @edit-row="onEditRow"
        @preview-row="onEditRow"
        @delete-row="onRemoveRow"
        @pagination="onPaginationChange"
        @sort-column="onColumnSortChange"
        @filter="onFilterChange"
        @remove-all-filters="onRemoveAllFilters" />
</template>

<script>
import PRIVILEGES from '@Attributes/config/privileges';
import {
    ROUTE_NAME,
} from '@Attributes/config/routes';
import {
    ATTRIBUTE_GROUP_CREATED_EVENT_NAME,
} from '@Attributes/defaults/attributes';
import {
    ALERT_TYPE,
} from '@Core/defaults/alerts';
import {
    DEFAULT_PAGE,
} from '@Core/defaults/grid';
import extendedGridComponentsMixin from '@Core/mixins/grid/extendedGridComponentsMixin';
import {
    getDefaultDataFromQueryParams,
    getParams,
    getParsedFilters,
} from '@Core/models/mappers/gridDataMapper';
import {
    getGridData,
} from '@Core/services/grid/getGridData.service';
import Grid from '@UI/components/Grid/Grid';

export default {
    name: 'AttributeGroupsGrid',
    components: {
        Grid,
    },
    mixins: [
        extendedGridComponentsMixin,
    ],
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
                PRIVILEGES.ATTRIBUTE_GROUP.update,
            ]);
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
    mounted() {
        document.documentElement.addEventListener(
            ATTRIBUTE_GROUP_CREATED_EVENT_NAME,
            this.onAttributeGroupCreated,
        );
    },
    beforeDestroy() {
        document.documentElement.removeEventListener(
            ATTRIBUTE_GROUP_CREATED_EVENT_NAME,
            this.onAttributeGroupCreated,
        );
    },
    methods: {
        onAttributeGroupCreated() {
            this.onFetchData();
        },
        onRemoveRow() {
            this.onFetchData();
        },
        onEditRow(args) {
            const lastIndex = args.length - 1;

            this.$router.push({
                name: ROUTE_NAME.ATTRIBUTE_GROUPS_EDIT_GENERAL,
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
                path: 'attributes/groups',
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
                message: 'Attribute groups haven’t been fetched properly',
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
