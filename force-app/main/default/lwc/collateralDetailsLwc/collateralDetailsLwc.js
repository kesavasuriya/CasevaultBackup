import { LightningElement, api, track  } from 'lwc';
import UtilityBaseElement from 'c/utilityBaseLwc';
import getCollateral from '@salesforce/apex/CollateralController.getCollateral';

export default class CollateralDetailsLwc extends UtilityBaseElement {

    @api recordId;
    @api objectApiName;
    @track collateralRecord = {};
    @track collateralId='';
    @track personsPicklist =[];
    @track relationshipRecords = [];
    @track personsValue =[];
    @track copyofRelationship =[];
    @track deleteRecords = [];
    @track createRecords = [];

    connectedCallback() {

            if(this.objectApiName == 'Collateral__c') {

                this.collateralId = this.recordId;

            }
            
            getCollateral({collateralId : this.recordId, objectName : this.objectApiName})
            .then(result =>{

                let res = JSON.parse(result);
                this.collateralRecord = res.collateral;

                if(res.persons) {

                    let obj = {};
                    for(let i=0;i<res.persons.length;i++) {

                        obj = {};
                        obj.label = res.persons[i].Name;
                        obj.value = res.persons[i].Id;
                        this.personsPicklist.push(obj);


                    }
                }

                if(res.relationshipRecords) {

                    this.relationshipRecords = res.relationshipRecords;
                    this.copyofRelationship = res.relationshipRecords;
                    for(let r=0;r<res.relationshipRecords.length;r++) {
                        this.personsValue.push(res.relationshipRecords[r].Person__c);
                    }

                }
            })
    }

    handleCancel() {

        const closeModal = new CustomEvent('close', { detail: 'None' });
        this.dispatchEvent(closeModal);
    }

    handleSubmit(event) {

        event.preventDefault();

        if (!this.onValidate()) {

            let fields = event.detail.fields;
            fields.Service_Case__c = this.recordId;
            fields.Date_of_Birth__c = this.collateralRecord.Date_of_Birth__c;
            fields.Start_Date__c = this.collateralRecord.Start_Date__c;
            fields.End_Date__c = this.collateralRecord.End_Date__c;
            this.template.querySelector('lightning-record-edit-form').submit(fields);

        } else {

            this.title = "Error!";
            this.type = "error";
            this.message = "Please complete the required fields!";
            this.fireToastMsg();

        }



    }

    handleChange(event) {

        this.collateralRecord[event.target.name] = event.target.value;

    }

    handleSuccess(event) {

        this.title = "Success!";
        this.type = 'success';
       

        if (this.objectApiName == 'Collateral__c') {

            this.message = 'Record Updated Successfully!';

        } else {

            this.message = 'Record Created Successfully!';
            
        }
        this.fireToastMsg();

        const closeModal = new CustomEvent('close', { detail: 'None' });
        this.dispatchEvent(closeModal);

    }

    handlePersonsChange(event) {

        let changedPersons = event.target.value;
        console.log('onchange',event.target.value);
        const[createRecords, deleteRecords] = this.getuniqueValues(changedPersons,this.copyofRelationship,'Person__c');
        
       
        // const uniqueDeleteRecords = new Set([...this.deleteRecords, ...deleteRecords]);
        // this.deleteRecords = Array.from(uniqueDeleteRecords);

        // this.deleteRecords.forEach(ele=>{

        //     const index = this.copyofRelationship.findIndex(obj => obj.Person__c === ele.Person__c);
        //     this.copyofRelationship.splice(index,1);

        // })
        



    }

    getuniqueValues(list1, list2, property) {
       
        //const propertyValues = list1.map(obj => obj[property]);
        let lst1 = list1;
        const createRecords = list2.filter(obj => !lst1.includes(obj[property]));
        const deleteRecords = list2.filter(obj => lst1.includes(obj[property]));
      
        return createRecords, deleteRecords;
      }

}