/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <GridEditNavigationCell
        :edit-key-code="27"
        @edit="onEditCell">
        <GridTextEditContentCell :style="positionStyle">
            <TextArea
                height="134px"
                v-model="localValue"
                :autofocus="true"
                :disabled="disabled"
                :type="underlineInputType"
                :error-messages="errorMessages"
                resize="none" />
        </GridTextEditContentCell>
    </GridEditNavigationCell>
</template>

<script>
import {
    INPUT_TYPE,
} from '@Core/defaults/theme';
import GridTextEditContentCell from '@UI/components/Grid/Layout/Table/Cells/Edit/Content/GridTextEditContentCell';
import TextArea from '@UI/components/TextArea/TextArea';
import gridEditCellMixin from '@UI/mixins/grid/gridEditCellMixin';

export default {
    name: 'GridTextAreaEditCell',
    components: {
        GridTextEditContentCell,
        TextArea,
    },
    mixins: [
        gridEditCellMixin,
    ],
    computed: {
        positionStyle() {
            const {
                x,
                y,
            } = this.bounds;

            return {
                top: `${y}px`,
                left: `${x}px`,
                width: '320px',
            };
        },
        underlineInputType() {
            return INPUT_TYPE.UNDERLINE;
        },
    },
    beforeDestroy() {
        if (this.localValue !== this.value) {
            this.$emit('cell-value', [
                {
                    value: this.localValue,
                    rowId: this.rowId,
                    columnId: this.columnId,
                    row: this.row,
                    column: this.column,
                },
            ]);
        }
    },
};
</script>
