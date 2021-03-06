/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <InputSolidStyle class="category-select">
        <template #activator>
            <InputController>
                <InputLabel
                    :style="{ top: 0 }"
                    :floating="true"
                    :disabled="!isAllowedToCreateCategory"
                    :label="label" />
                <div class="category-select__header">
                    <div class="horizontal-container">
                        <ExpandNumericButton
                            :title="$t('category.form.expandFilterButton')"
                            :number="isCategoryTreeSelected ? 1 : 0"
                            :is-expanded="isFiltersExpanded"
                            @click.native="onFiltersExpand" />
                        <Toggler
                            v-model="isSelectedOnlyVisibleCategories"
                            :label="$t('category.form.toggleVisibleToggler')"
                            :disabled="isSelectedCategoriesTogglerDisabled"
                            reversed
                            @input="onToggleBetweenCategoriesVisibility" />
                    </div>
                    <div
                        v-show="isFiltersExpanded"
                        class="category-select__filters">
                        <AdvancedFilters
                            :value="advancedFilterValues"
                            :filters="advancedFilters"
                            :extended-filters="extendedFilterComponents"
                            :draggable="false"
                            @input="onAdvancedFilterChange">
                            <template #removeAllButton>
                                <AdvancedFiltersRemoveAllButton
                                    v-if="isCategoryTreeSelected"
                                    :title="$t('core.buttons.clear')"
                                    @click.native="onClearAdvancedFilters" />
                                <div v-else />
                            </template>
                        </AdvancedFilters>
                    </div>
                </div>
            </InputController>
        </template>
        <template #details>
            <div :class="categorySelectItemsClasses">
                <Preloader v-if="isFetchingData" />
                <template v-else>
                    <TreeAccordion
                        v-if="isCategoryTreeSelected"
                        :search-placeholder="$t('category.form.searchPlaceholder')"
                        :value="selectedOptions"
                        :search-value="searchValue"
                        :items="categoryTreeItems"
                        :size="smallSize"
                        :expanded="isSelectedOnlyVisibleCategories || isAnySearchPhrase"
                        :searchable="true"
                        :selectable="true"
                        :multiselect="true"
                        @input="onValueChange"
                        @search="onSearch">
                        <template #appendSearchHeader>
                            <CheckBox
                                class="select-list-header-select-all"
                                :value="treeCategoriesSelectionState"
                                :label="$t('category.form.selectVisibleCheckBox')"
                                :disabled="!isAnyCategoryInTreeAfterFiltering"
                                reversed
                                @input="onSelectAllVisible" />
                        </template>
                        <template #body>
                            <DropdownPlaceholder
                                v-if="!isAnyCategoryInTree"
                                :title="categoryTreePlaceholder.title"
                                :subtitle="categoryTreePlaceholder.subtitle">
                                <template #action>
                                    <Button
                                        :title="$t('categoryTree.form.noCategoryTreeButton')"
                                        :size="smallSize"
                                        :disabled="!isAllowedToUpdateTree"
                                        @click.native="onNavigateToCategoryTree" />
                                </template>
                            </DropdownPlaceholder>
                            <DropdownPlaceholder
                                v-else-if="isVisibleSelectedAnyCategoryInTree"
                                :title="categoryTreeNonVisiblePlaceholder.title"
                                :subtitle="categoryTreeNonVisiblePlaceholder.subtitle">
                                <template #action>
                                    <ClearSearchButton
                                        :title="$t('category.form.clearSearchButtonLabel')"
                                        @click.native="onClearVisibilitySelection" />
                                </template>
                            </DropdownPlaceholder>
                        </template>
                    </TreeAccordion>
                    <SelectList
                        v-else
                        :value="selectedOptions"
                        :search-value="searchValue"
                        :items="categoryItems"
                        :size="smallSize"
                        :search-placeholder="$t('category.form.searchPlaceholder')"
                        :searchable="true"
                        :selectable="true"
                        :multiselect="true"
                        @input="onValueChange"
                        @search="onSearch">
                        <template #appendSearchHeader>
                            <CheckBox
                                class="select-list-header-select-all"
                                :value="categoriesSelectionState"
                                :label="$t('category.form.selectVisibleCheckBox')"
                                :disabled="!isAnyCategoryAfterFiltering"
                                reversed
                                @input="onSelectAllVisible" />
                        </template>
                        <template #body>
                            <DropdownPlaceholder
                                v-if="!isAnyCategory"
                                :title="categoriesPlaceholder.title"
                                :subtitle="categoriesPlaceholder.subtitle">
                                <template #action>
                                    <Button
                                        :title="$t('category.form.noCategoryButton')"
                                        :size="smallSize"
                                        :disabled="!isAllowedToCreateCategory"
                                        @click.native="onNavigateToCategories" />
                                </template>
                            </DropdownPlaceholder>
                            <DropdownPlaceholder
                                v-else-if="isVisibleSelectedAnyCategory"
                                :title="categoriesNonVisiblePlaceholder.title"
                                :subtitle="categoriesNonVisiblePlaceholder.subtitle">
                                <template #action>
                                    <ClearSearchButton
                                        :title="$t('category.form.clearSearchButtonLabel')"
                                        @click.native="onClearVisibilitySelection" />
                                </template>
                            </DropdownPlaceholder>
                        </template>
                        <template #item="{ item, isSelected }">
                            <ListElementAction :size="smallSize">
                                <CheckBox :value="isSelected" />
                            </ListElementAction>
                            <ListElementDescription>
                                <ListElementTitle
                                    :size="smallSize"
                                    :title="item.label || `#${item.code}`" />
                            </ListElementDescription>
                        </template>
                    </SelectList>
                    <div
                        v-show="isAnyCategoryAfterFiltering && !isCategoryTreeSelected"
                        class="category-select__expand-more">
                        <ExpandNumericButton
                            :title="$t('category.form.showAllExpandNumericButton')"
                            :size="tinySize"
                            :number="categoryItems.length"
                            :is-expanded="isCategoriesExpanded"
                            @click.native="onItemsExpand" />
                    </div>
                </template>
            </div>
        </template>
    </InputSolidStyle>
</template>

<script>
import CATEGORY_PRIVILEGES from '@Categories/config/privileges';
import {
    ROUTE_NAME as CATEGORIES_ROUTE_NAME,
} from '@Categories/config/routes';
import {
    getAutocomplete,
} from '@Categories/services';
import ExpandNumericButton from '@Core/components/Buttons/ExpandNumericButton';
import {
    SIZE,
} from '@Core/defaults/theme';
import {
    dfsSearch,
    simpleSearch,
} from '@Core/models/arrayWrapper';
import TREE_PRIVILEGES from '@Trees/config/privileges';
import {
    ROUTE_NAME as CATEGORY_TREES_ROUTE_NAME,
} from '@Trees/config/routes';
import {
    get,
} from '@Trees/services';
import AdvancedFilters from '@UI/components/AdvancedFilters/AdvancedFilters';
import AdvancedFiltersRemoveAllButton from '@UI/components/AdvancedFilters/AdvancedFiltersRemoveAllButton';
import Button from '@UI/components/Button/Button';
import CheckBox from '@UI/components/CheckBox/CheckBox';
import InputController from '@UI/components/Input/InputController';
import InputLabel from '@UI/components/Input/InputLabel';
import InputSolidStyle from '@UI/components/Input/InputSolidStyle';
import ListElementAction from '@UI/components/List/ListElementAction';
import ListElementDescription from '@UI/components/List/ListElementDescription';
import ListElementTitle from '@UI/components/List/ListElementTitle';
import Preloader from '@UI/components/Preloader/Preloader';
import ClearSearchButton from '@UI/components/Select/Dropdown/Buttons/ClearSearchButton';
import DropdownPlaceholder from '@UI/components/Select/Dropdown/Placeholder/DropdownPlaceholder';
import SelectList from '@UI/components/SelectList/SelectList';
import Toggler from '@UI/components/Toggler/Toggler';
import TreeAccordion from '@UI/components/TreeAccordion/TreeAccordion';

export default {
    name: 'CategorySelect',
    components: {
        ClearSearchButton,
        TreeAccordion,
        InputSolidStyle,
        InputController,
        InputLabel,
        ListElementTitle,
        ListElementAction,
        ListElementDescription,
        DropdownPlaceholder,
        Toggler,
        CheckBox,
        ExpandNumericButton,
        AdvancedFilters,
        Preloader,
        SelectList,
        AdvancedFiltersRemoveAllButton,
        Button,
    },
    props: {
        /**
         * Component value
         */
        value: {
            type: Array,
            default: () => [],
        },
    },
    async fetch() {
        this.allCategories = await getAutocomplete({
            $axios: this.$axios,
        });

        this.isFetchingData = false;
    },
    data() {
        return {
            advancedFilterValues: {},
            isFiltersExpanded: false,
            isSelectedOnlyVisibleCategories: false,
            isCategoriesExpanded: false,
            isFetchingData: true,
            searchValue: '',
            allCategories: [],
            allCategoryTrees: {},
        };
    },
    computed: {
        categorySelectItemsClasses() {
            return [
                'category-select__items',
                {
                    'category-select__items--expanded': this.isCategoriesExpanded,
                    'category-select__items--has-any-items': (this.isCategoryTreeSelected && this.isAnyCategoryInTreeAfterFiltering) || (!this.isCategoryTreeSelected && this.isAnyCategoryAfterFiltering),
                    'category-select__items--visible-expander': !this.isCategoryTreeSelected && this.isAnyCategoryAfterFiltering,
                },
            ];
        },
        categoriesSelectionState() {
            const value = this.categoryItems.filter(
                category => this.value.some(
                    id => id === category.id,
                ),
            );

            if (value.length === 0) {
                return 0;
            }

            if (value.length === this.categoryItems.length) {
                return 1;
            }

            return 2;
        },
        treeCategoriesSelectionState() {
            const categoriesIdsInTree = this.selectedTreeCategoryIds.filter(
                categoryId => this.value.some(
                    id => id === categoryId,
                ),
            );

            if (categoriesIdsInTree.length === 0) {
                return 0;
            }

            if (categoriesIdsInTree.length === this.categoryTreeItems.length) {
                return 1;
            }

            return 2;
        },
        label() {
            return this.$t('category.form.selectLabel');
        },
        categoriesPlaceholder() {
            return {
                title: this.$t('category.grid.placeholderTitle'),
                subtitle: this.$t('category.grid.placeholderSubtitle'),
            };
        },
        categoriesNonVisiblePlaceholder() {
            return {
                title: this.$t('category.form.noVisibleCategoriesPlaceholderTitle'),
                subtitle: this.$t('category.form.noVisibleCategoriesPlaceholderSubtitle'),
            };
        },
        categoryTreePlaceholder() {
            return {
                title: this.$t('categoryTree.grid.placeholderTitle'),
                subtitle: this.$t('categoryTree.grid.placeholderSubtitle'),
            };
        },
        categoryTreeNonVisiblePlaceholder() {
            return {
                title: this.$t('categoryTree.form.noVisibleCategoriesInTreePlaceholderTitle'),
                subtitle: this.$t('categoryTree.form.noVisibleCategoriesInTreePlaceholderSubtitle'),
            };
        },
        selectedOptions() {
            return this.allCategories.filter(option => this.value.some(id => option.id === id));
        },
        selectedOptionsLabels() {
            return this.selectedOptions.map(({
                label,
                code,
            }) => label || code);
        },
        smallSize() {
            return SIZE.SMALL;
        },
        tinySize() {
            return SIZE.TINY;
        },
        advancedFilters() {
            return [
                {
                    id: 'categoryTree',
                    type: 'CATEGORY_TREE',
                    label: this.$t('categoryTree.advancedFilter.label'),
                },
            ];
        },
        extendedFilterComponents() {
            return this.$getExtendSlot('@UI/components/AdvancedFilters/Type');
        },
        selectedTreeCategoryIds() {
            if (!this.isCategoryTreeSelected) {
                return [];
            }

            const getMappedCategoriesIds = (treeCategories = [], result = []) => {
                const children = result;

                treeCategories.forEach((treeCategory) => {
                    children.push(treeCategory.id);

                    if (treeCategory.children) {
                        children.push(...getMappedCategoriesIds(treeCategory.children));
                    }
                });

                return children;
            };

            return getMappedCategoriesIds(this.categoryTreeItems);
        },
        categoryTreeItems() {
            if (this.value.length || !this.isSelectedOnlyVisibleCategories) {
                return dfsSearch(
                    this.allCategoryTrees[this.advancedFilterValues.categoryTree],
                    this.getFilterValue(),
                    [
                        'label',
                        'code',
                    ],
                    this.onSearchConditionCallback,
                );
            }

            return [];
        },
        categoryItems() {
            if (this.value.length || !this.isSelectedOnlyVisibleCategories) {
                return simpleSearch(
                    this.allCategories,
                    this.getFilterValue(),
                    [
                        'label',
                        'code',
                    ],
                    this.onSearchConditionCallback,
                );
            }

            return [];
        },
        isSelectedCategoriesTogglerDisabled() {
            if (this.isCategoryTreeSelected) {
                return !this.isAnyCategoryInTree;
            }

            return !this.isAnyCategory;
        },
        isVisibleSelectedAnyCategory() {
            return !this.isAnyCategoryAfterFiltering && this.isSelectedOnlyVisibleCategories;
        },
        isVisibleSelectedAnyCategoryInTree() {
            return !this.isAnyCategoryInTreeAfterFiltering && this.isSelectedOnlyVisibleCategories;
        },
        isAnySearchPhrase() {
            return this.searchValue !== '';
        },
        isCategoryTreeSelected() {
            return Boolean(this.advancedFilterValues.categoryTree);
        },
        isAnyCategoryAfterFiltering() {
            return this.categoryItems.length > 0;
        },
        isAnyCategory() {
            return this.allCategories.length > 0;
        },
        isAnyCategoryInTree() {
            if (!this.allCategoryTrees[this.advancedFilterValues.categoryTree]) {
                return false;
            }

            return this.isCategoryTreeSelected
                && this.allCategoryTrees[this.advancedFilterValues.categoryTree].length > 0;
        },
        isAnyCategoryInTreeAfterFiltering() {
            return this.isCategoryTreeSelected
                && this.categoryTreeItems.length > 0;
        },
        isAllowedToCreateCategory() {
            return this.$hasAccess([
                CATEGORY_PRIVILEGES.CATEGORY.create,
            ]);
        },
        isAllowedToUpdateTree() {
            return this.$hasAccess([
                TREE_PRIVILEGES.CATEGORY_TREE.update,
            ]);
        },
    },
    methods: {
        onSelectAllVisible(value) {
            if (value) {
                if (this.isCategoryTreeSelected) {
                    this.$emit('input', [
                        ...new Set([
                            ...this.selectedTreeCategoryIds,
                            ...this.categoryItems.map(category => category.id),
                        ]),
                    ]);
                } else {
                    this.$emit('input', [
                        ...new Set([
                            ...this.value,
                            ...this.categoryItems.map(category => category.id),
                        ]),
                    ]);
                }
            } else if (this.isCategoryTreeSelected) {
                this.$emit('input', this.value.filter(id => !this.selectedTreeCategoryIds.some(categoryId => categoryId === id)));
            } else {
                this.$emit('input', this.value.filter(id => !this.categoryItems.some(category => category.id === id)));
            }
        },
        onToggleBetweenCategoriesVisibility(value) {
            this.isSelectedOnlyVisibleCategories = value;
        },
        onClearVisibilitySelection() {
            this.isSelectedOnlyVisibleCategories = false;
        },
        async onAdvancedFilterChange(filters) {
            this.advancedFilterValues = filters;

            if (this.isCategoryTreeSelected
                && typeof this.allCategoryTrees[filters.categoryTree] === 'undefined') {
                this.isFetchingData = true;

                const categoryTree = await get({
                    $axios: this.$axios,
                    id: filters.categoryTree,
                });

                const getMappedCategories = (treeCategories = []) => {
                    const children = [];

                    treeCategories.forEach((treeCategory) => {
                        const category = this.allCategories.find(({
                            id,
                        }) => id === treeCategory.category_id);

                        children.push({
                            ...category,
                            children: getMappedCategories(treeCategory.children),
                        });
                    });

                    return children;
                };

                this.allCategoryTrees = {
                    ...this.allCategoryTrees,
                    [filters.categoryTree]: getMappedCategories(categoryTree.categories),
                };

                this.isFetchingData = false;
            }
        },
        onClearAdvancedFilters() {
            this.advancedFilterValues = {};
        },
        onSearch(value) {
            this.searchValue = value;
        },
        onSearchConditionCallback(filterValues, searchValue) {
            if (this.isSelectedOnlyVisibleCategories) {
                return filterValues.some(
                    value => searchValue === value && value.startsWith(this.searchValue),
                );
            }

            return filterValues.some(value => searchValue.startsWith(value));
        },
        onValueChange(value) {
            this.$emit('input', value.map(({
                id,
            }) => id));
        },
        onFiltersExpand() {
            this.isFiltersExpanded = !this.isFiltersExpanded;
        },
        onItemsExpand() {
            this.isCategoriesExpanded = !this.isCategoriesExpanded;
        },
        onNavigateToCategories() {
            this.$router.push({
                name: CATEGORIES_ROUTE_NAME.CATEGORIES_GRID,
            });
        },
        onNavigateToCategoryTree() {
            this.$router.push({
                name: CATEGORY_TREES_ROUTE_NAME.CATEGORY_TREE_EDIT,
                params: {
                    id: this.advancedFilterValues.categoryTree,
                },
            });
        },
        getFilterValue() {
            return this.isSelectedOnlyVisibleCategories
                ? this.selectedOptionsLabels
                : this.searchValue;
        },
    },
};
</script>

<style lang="scss" scoped>
    .category-select {
        $select: &;

        & > fieldset {
            border: unset !important;
        }

        &:hover {
            #{$select}__items {
                border-color: $GREY_DARK;
            }
        }

        &__header {
            display: flex;
            flex-direction: column;
            width: 100%;
            padding: 4px 0 4px 2px;
            box-sizing: border-box;
        }

        &__items {
            position: relative;
            display: flex;
            flex-direction: column;
            border: $BORDER_1_GREY;
            border-top: unset;
            padding-top: 12px;
            box-sizing: border-box;
            transition: border-color 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
            will-change: border-color;

            &:not(&--expanded) {
                max-height: 376px;
            }

            &--has-any-items {
                padding-bottom: 12px;
            }

            &--visible-expander {
                padding-bottom: 48px;
            }
        }

        &__expand-more {
            position: absolute;
            left: 0;
            bottom: 12px;
            right: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: $WHITE;
        }
    }

    .horizontal-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .select-list-header-select-all {
        margin-right: 12px;
    }
</style>
