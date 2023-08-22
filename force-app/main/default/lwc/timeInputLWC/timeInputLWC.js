import { LightningElement, api } from 'lwc';

export default class TimeInputLWC extends LightningElement {

    @api label;
    @api inputValue;
    @api isRequired;
    @api isDisabled;
    @api outputValue;

    handleChange(event) {
        this.outputValue = String(event.target.value);
    }
}