import { LightningElement, api } from 'lwc';

export default class ModalComponent extends LightningElement {
    @api header;
    @api modalClass;

    get modalLabel() {

        if(this.header) return this.header;
        else 'Modal';
    }
}