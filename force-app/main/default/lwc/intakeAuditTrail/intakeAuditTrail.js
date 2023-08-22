import { LightningElement } from 'lwc';

const columns = [{ label: 'Worker Name', fieldName: 'workerName', type: 'string', wrapText: true },
{ label: 'Worker Role', fieldName: 'workerRole', type: 'string', wrapText: true },
{ label: 'Local Department', fieldName: 'LocalDepartment', type: 'string', wrapText: true },
{ label: 'Screen Accessed', fieldName: 'screenAccessed', type: 'string', wrapText: true },
{ label: 'Action', fieldName: 'action', type: 'string', wrapText: true },
   
];

export default class IntakeAuditTrail extends LightningElement {

    showModal = false;
    columns = columns;
    handleClick() {

        this.showModal = true;
    }

    closeModal() {

        this.showModal = false;
    }
}