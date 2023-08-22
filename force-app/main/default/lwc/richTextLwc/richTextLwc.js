import { LightningElement, api } from 'lwc';

export default class RichTextLwc extends LightningElement {

    @api inputLabel;
    @api isDisabled;
    @api isRequired;
    @api value;

    handleChange(event) {
        this.value = event.target.value;
    }

    @api
    validate() {

        if(this.value) {
            return { isValid: true }; 
        } else {
            return { 
                isValid: false, 
                errorMessage: 'Please enter some valid input. Input is not optional' 
            }; 
        }
        
    }
}