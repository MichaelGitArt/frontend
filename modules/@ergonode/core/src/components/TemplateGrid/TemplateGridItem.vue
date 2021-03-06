/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <div
        class="grid-item"
        @mouseover="onMouseOver"
        @mouseout="onMouseOut">
        <IconArrowDouble
            v-if="hasChildren"
            class="grid-item__icon"
            :state="buttonExpanderIconState"
            @click.native="toggleItemExpand" />
        <div
            class="grid-item__title"
            :title="item.name ? `#${item.code}`: ''">
            <span
                class="grid-item__name"
                v-text="item.name || `#${item.code}`" />
            <span
                v-if="hasChildren"
                class="grid-item__code"
                v-text="`Inherited ${contextName.toLowerCase()}: ${numberOfChildren}`" />
        </div>
        <div
            :class="['grid-item__contextual-menu', contextualMenuHoveStateClasses]">
            <ActionIconButton
                v-if="isDraggingEnabled"
                :theme="secondaryTheme"
                :size="tinySize"
                :options="contextualMenuItems"
                @input="onSelectValue"
                @focus="onSelectFocus">
                <template #icon="{ color }">
                    <IconDots :fill-color="color" />
                </template>
            </ActionIconButton>
        </div>
    </div>
</template>
<script>
import {
    ARROW,
} from '@Core/defaults/icons';
import {
    SIZE,
    THEME,
} from '@Core/defaults/theme';
import ActionIconButton from '@UI/components/ActionIconButton/ActionIconButton';
import IconArrowDouble from '@UI/components/Icons/Arrows/IconArrowDouble';
import IconDots from '@UI/components/Icons/Others/IconDots';

export default {
    name: 'TemplateGridItem',
    components: {
        IconDots,
        IconArrowDouble,
        ActionIconButton,
    },
    props: {
        /**
         * Determines state of expanded component
         */
        isExpanded: {
            type: Boolean,
            default: false,
        },
        /**
         * Determines state of draggable attribute
         */
        isDraggingEnabled: {
            type: Boolean,
            default: false,
        },
        /**
         * Item data model
         */
        item: {
            type: Object,
            required: true,
        },
        contextName: {
            type: String,
            default: '',
        },
        /**
         * Number of children elements
         */
        numberOfChildren: {
            type: Number,
            default: 0,
        },
    },
    data() {
        return {
            contextualMenuItems: [
                'Remove',
            ],
            isHovered: false,
        };
    },
    computed: {
        tinySize() {
            return SIZE.TINY;
        },
        secondaryTheme() {
            return THEME.SECONDARY;
        },
        hasChildren() {
            return this.numberOfChildren > 0;
        },
        buttonExpanderIconState() {
            return this.isExpanded ? ARROW.DOWN : ARROW.UP;
        },
        contextualMenuHoveStateClasses() {
            return {
                'grid-item__contextual-menu--hovered': this.isHovered,
            };
        },
    },
    methods: {
        toggleItemExpand() {
            this.$emit('toggle-item');
        },
        onSelectFocus(isFocused) {
            if (!isFocused) this.isHovered = false;

            this.isContextualMenuActive = isFocused;
        },
        onSelectValue(option) {
            switch (option) {
            case 'Remove':
                this.$emit('remove-item');
                break;
            default: break;
            }
        },
        onMouseOver() {
            if (!this.isHovered) this.isHovered = true;
        },
        onMouseOut() {
            if (!this.isContextualMenuActive) this.isHovered = false;
        },
    },
};
</script>

<style lang="scss" scoped>
    .grid-item {
        position: relative;
        z-index: $Z_INDEX_LVL_1;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        grid-column: 1 / 3;
        height: 100%;
        border: 1px solid $GREY;
        padding: 0 12px 0 10px;
        box-sizing: border-box;
        background-color: $WHITESMOKE;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
        cursor: grab;

        &--menu-active {
            z-index: $Z_INDEX_LVL_3;
        }

        &:hover {
            z-index: $Z_INDEX_LVL_2;
            border-color: $WHITESMOKE;
            box-shadow: $ELEVATOR_2_DP;
        }

        &__icon {
            margin-right: 8px;
            cursor: pointer;
        }

        &__title {
            display: flex;
            flex: 1;
            flex-direction: column;
            color: $GRAPHITE_DARK;
            text-overflow: ellipsis;
            overflow: hidden;
            white-space: nowrap;
        }

        &__name {
            font: $FONT_MEDIUM_14_20;
        }

        &__code {
            color: $GRAPHITE;
            font: $FONT_SEMI_BOLD_10_12;
        }

        &__contextual-menu {
            flex: 0 1 auto;
            align-items: flex-start;
            opacity: 0;

            &--hovered {
                opacity: 1;
            }
        }

        &::before {
            position: absolute;
            left: -8px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: $GREEN;
            content: "";
        }
    }
</style>
