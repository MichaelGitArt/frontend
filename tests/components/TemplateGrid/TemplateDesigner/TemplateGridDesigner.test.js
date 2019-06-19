/*
 * Copyright © Bold Brand Commerce Sp. z o.o. All rights reserved.
 * See LICENSE for license details.
 */
import { mount } from "@vue/test-utils"
import TemplateGridDesigner from '~/components/TemplateGrid/TemplateDesigner/TemplateGridDesigner';
import TemplateGridPresentationLayer from '~/components/TemplateGrid/TemplateGridPresentationLayer';

const columnsNumber = 4;
const maxRows = 0;
const rowHeight = 50;
const gridStyle = {
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridAutoRows: `${rowHeight}px`,
};

describe('TemplateGrid/TemplateDesigner/TemplateGridDesigner', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(TemplateGridDesigner, {
            attachToDocument: true,
            propsData: {
                maxRow: maxRows,
            },
            slots: {
                default: {
                    render(h) {
                        return h(TemplateGridPresentationLayer, {
                            props: {
                                gridStyles: gridStyle,
                                columns: columnsNumber,
                                rows: maxRows,
                                isHeader: false,
                            }
                        });
                    },
                },
            },
            data() {
                return {
                    rowHeight: rowHeight,
                };
            },
        });
    });

    it("Component rendered correctly", () => {
        expect(wrapper.is(TemplateGridDesigner)).toBe(true);
    });

    it('Check if component is named correctly', () => {
        expect(typeof TemplateGridDesigner.name).toBe('string');
        expect(TemplateGridDesigner.name).toEqual('TemplateGridDesigner');
    });

    it('Check if resizing event was called', () => {
        const resizeEvent = jest.fn();
        window.addEventListener('resize', resizeEvent);
        window.dispatchEvent(new Event('resize'));

        expect(resizeEvent).toHaveBeenCalled();
    });

    it('Template designer has correct number of rows', () => {
        const totalRows1 = wrapper.vm.getTotalRowsInTemplate();
        expect(totalRows1).toBe(1);

        wrapper.setProps({
            maxRow: 10,
        });

        const totalRows2 = wrapper.vm.getTotalRowsInTemplate();
        expect(totalRows2).toBe(11);
    });

    it('Template designer has presentation layer as a child', () => {
        const presentationLayer = wrapper.find(TemplateGridPresentationLayer);

        expect(presentationLayer.isVueInstance()).toBe(true);
    });

    it('Check if number of max rows number was emitted', () => {
        wrapper.vm.$emit('rowsCount');

        expect(wrapper.emitted().rowsCount).toBeTruthy();
    });
});
