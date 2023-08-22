import { LightningElement, api, track } from 'lwc';
export default class ChildTableLwc extends LightningElement {

    @api childList;
    @track removedChildRec =[];


    handleRemoveChild(event) {

        let row = event.target.name;
        
        let rows = [...this.childList];
        this.removedChildRec.push(this.childList[row]);
        rows.splice(row, 1);
        this.childList = [...rows];
        
        console.log('onchange',this.removedChildRec);
        const persons = new CustomEvent('involvedchild', {detail : {addedChild : this.childList,
        removedchild : this.removedChildRec}
        });
        this.dispatchEvent(persons);

    }
}