import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class EducationLWC extends NavigationMixin(LightningElement) {

    @api recordId;
    invokeFlow = false;

    get inputvariable() {

        return[{
            name : 'personId',
            type : 'String',
            value : this.recordId
            }
        ]
    }

    handleClick() {
        this.invokeFlow = true;
    }

    handleCancel() {
        this.invokeFlow = false;
    }

    handleStatusChange(event) {

        if(event.detail.status == 'FINISHED') {

            this.handleCancel();
            let outputVariables = event.detail.outputVariables;
            console.log('outputVariables===',outputVariables);
            // this[NavigationMixin.Navigate]({
            //     type: 'standard__recordPage',
            //     attributes: {
            //         recordId: 'a03B0000002tEurIAE',
            //         objectApiName: 'namespace__ObjectName', // objectApiName is optional
            //         actionName: 'view'
            //     }
            // });
        }
    }
}