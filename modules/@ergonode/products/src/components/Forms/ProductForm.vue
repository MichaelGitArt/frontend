/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <Form
        title="Options"
        :submit-title="submitTitle"
        :proceed-title="proceedTitle"
        :is-submitting="isSubmitting"
        :is-proceeding="isProceeding"
        :errors="errors"
        @proceed="onProceed"
        @submit="onSubmit">
        <template #body>
            <FormSection>
                <Select
                    :value="type"
                    required
                    :disabled="isDisabled || !isAllowedToUpdate"
                    label="Product type"
                    :error-messages="errors[typeFieldKey]"
                    :options="productTypesValues"
                    @input="setTypeValue" />
            </FormSection>
            <FormSection v-if="type">
                <TextField
                    :value="sku"
                    hint="Products SKU must be unique"
                    label="SKU"
                    required
                    :error-messages="errors[skuFieldKey]"
                    :disabled="isDisabled || !isAllowedToUpdate"
                    @input="setSkuValue" />
                <Autocomplete
                    :value="template"
                    :required="true"
                    :searchable="true"
                    :clearable="true"
                    label="Product template"
                    :error-messages="errors[templateIdFieldKey]"
                    :disabled="!isAllowedToUpdate"
                    href="templates/autocomplete"
                    @input="setTemplateValue">
                    <template #placeholder="{ isVisible }">
                        <DropdownPlaceholder
                            v-if="isVisible"
                            :title="placeholder.title"
                            :subtitle="placeholder.subtitle">
                            <template #action>
                                <Button
                                    title="GO TO PRODUCT TEMPLATES"
                                    :size="smallSize"
                                    :disabled="!isAllowedToUpdate"
                                    @click.native="onNavigateToProductTemplates" />
                            </template>
                        </DropdownPlaceholder>
                    </template>
                </Autocomplete>
                <Divider v-if="extendedForm.length" />
                <template
                    v-for="(formComponent, index) in extendedForm">
                    <Component
                        :is="formComponent.component"
                        :key="index"
                        v-bind="bindingProps(formComponent)" />
                </template>
            </FormSection>
        </template>
    </Form>
</template>

<script>
import {
    SIZE,
} from '@Core/defaults/theme';
import formActionsMixin from '@Core/mixins/form/formActionsMixin';
import formFeedbackMixin from '@Core/mixins/form/formFeedbackMixin';
import {
    getKeyByValue,
} from '@Core/models/objectWrapper';
import PRIVILEGES from '@Products/config/privileges';
import {
    ROUTE_NAME,
} from '@Templates/config/routes';
import Autocomplete from '@UI/components/Autocomplete/Autocomplete';
import Button from '@UI/components/Button/Button';
import Divider from '@UI/components/Dividers/Divider';
import Form from '@UI/components/Form/Form';
import FormSection from '@UI/components/Form/Section/FormSection';
import DropdownPlaceholder from '@UI/components/Select/Dropdown/Placeholder/DropdownPlaceholder';
import Select from '@UI/components/Select/Select';
import TextField from '@UI/components/TextField/TextField';
import {
    mapActions,
    mapState,
} from 'vuex';

export default {
    name: 'ProductForm',
    components: {
        Button,
        Divider,
        DropdownPlaceholder,
        Form,
        FormSection,
        Select,
        TextField,
        Autocomplete,
    },
    mixins: [
        formActionsMixin,
        formFeedbackMixin,
    ],
    computed: {
        ...mapState('dictionaries', [
            'productTypes',
        ]),
        ...mapState('product', [
            'id',
            'sku',
            'type',
            'template',
        ]),
        smallSize() {
            return SIZE.SMALL;
        },
        placeholder() {
            return {
                title: 'No product templates',
                subtitle: 'There are no product templates in the system, so you can create the first one.',
            };
        },
        extendedForm() {
            return this.$extendedForm({
                key: '@Products/components/Forms/ProductForm',
                type: this.productTypeKey,
            });
        },
        productTypeKey() {
            return getKeyByValue(this.productTypes, this.type);
        },
        productTypesValues() {
            return Object.values(this.productTypes);
        },
        isDisabled() {
            return Boolean(this.id);
        },
        isAllowedToUpdate() {
            return this.$hasAccess([
                PRIVILEGES.PRODUCT.update,
            ]);
        },
        templateIdFieldKey() {
            return 'templateId';
        },
        skuFieldKey() {
            return 'sku';
        },
        typeFieldKey() {
            return 'type';
        },
    },
    methods: {
        ...mapActions('product', [
            '__setState',
        ]),
        onNavigateToProductTemplates() {
            this.$router.push({
                name: ROUTE_NAME.PRODUCT_TEMPLATES,
            });
        },
        setTypeValue(value) {
            this.__setState({
                key: this.typeFieldKey,
                value,
            });
            this.onScopeValueChange({
                scope: this.scope,
                fieldKey: this.typeFieldKey,
                value,
            });
        },
        setSkuValue(value) {
            this.__setState({
                key: this.skuFieldKey,
                value,
            });
            this.onScopeValueChange({
                scope: this.scope,
                fieldKey: this.skuFieldKey,
                value,
            });
        },
        setTemplateValue(value) {
            this.__setState({
                key: 'template',
                value,
            });
            this.onScopeValueChange({
                scope: this.scope,
                fieldKey: 'template',
                value,
            });
        },
        bindingProps({
            props = {},
        }) {
            return {
                disabled: !this.isAllowedToUpdate,
                changeValues: this.changeValues,
                scope: this.scope,
                errors: this.errors,
                ...props,
            };
        },
    },
};
</script>
