/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
<template>
    <ModalForm
        title="Create product"
        @close="onClose">
        <template #body>
            <ProductForm
                :submit-title="$t('product.buttons.create')"
                :proceed-title="$t('product.buttons.proceed')"
                :is-submitting="isSubmitting"
                :is-proceeding="isProceeding"
                :errors="scopeErrors"
                @submit="onSubmit"
                @proceed="onProceed" />
        </template>
    </ModalForm>
</template>

<script>
import {
    ALERT_TYPE,
} from '@Core/defaults/alerts';
import {
    THEME,
} from '@Core/defaults/theme';
import scopeErrorsMixin from '@Core/mixins/feedback/scopeErrorsMixin';
import ProductForm from '@Products/components/Forms/ProductForm';
import {
    ROUTE_NAME,
} from '@Products/config/routes';
import ModalForm from '@UI/components/Modal/ModalForm';
import {
    mapActions,
} from 'vuex';

export default {
    name: 'CreateProductModalForm',
    components: {
        ModalForm,
        ProductForm,
    },
    mixins: [
        scopeErrorsMixin,
    ],
    async fetch() {
        await this.getInitialDictionaries({
            keys: [
                'productTypes',
            ],
        });
    },
    data() {
        return {
            isSubmitting: false,
            isProceeding: false,
        };
    },
    computed: {
        secondaryTheme() {
            return THEME.SECONDARY;
        },
    },
    methods: {
        ...mapActions('product', [
            'createProduct',
            '__clearStorage',
        ]),
        ...mapActions('dictionaries', [
            'getInitialDictionaries',
        ]),
        onClose() {
            this.__clearStorage();
            this.removeScopeErrors(this.scope);

            this.$emit('close');
        },
        onSubmit() {
            if (this.isSubmitting || this.isProceeding) {
                return;
            }
            this.isSubmitting = true;

            this.removeScopeErrors(this.scope);
            this.createProduct({
                scope: this.scope,
                onSuccess: this.onCreateSuccess,
                onError: this.onCreateError,
            });
        },
        onProceed() {
            if (this.isSubmitting || this.isProceeding) {
                return;
            }

            this.isProceeding = true;

            this.removeScopeErrors(this.scope);
            this.createProduct({
                scope: this.scope,
                onSuccess: this.onProceedSuccess,
                onError: this.onCreateError,
            });
        },
        onCreateSuccess() {
            this.$addAlert({
                type: ALERT_TYPE.SUCCESS,
                message: 'Product created',
            });

            this.isSubmitting = false;

            this.$emit('created');
            this.onClose();
        },
        onProceedSuccess(id) {
            this.isProceeding = false;

            this.$router.push({
                name: ROUTE_NAME.PRODUCT_EDIT_GENERAL,
                params: {
                    id,
                },
            });
        },
        onCreateError(errors) {
            this.onError(errors);

            this.isSubmitting = false;
            this.isProceeding = false;
        },
    },
};
</script>
