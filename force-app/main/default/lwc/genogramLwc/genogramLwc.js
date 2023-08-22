import { LightningElement, api, track } from 'lwc';
import getAllPersons from '@salesforce/apex/RelationshipController.getAllPersons';
import getRelationRecord from '@salesforce/apex/RelationshipController.getRelationRecord';

export default class GenogramLwc extends LightningElement {

  @track personRecordList = [];
  @api recordId;
  @api objectApiName;
  @track parentRec = {};
  @track circleRecords = [];
  @track allRelationship = [];


  connectedCallback() {

    this.doInit();

  }

  doInit() {

    this.loading = true;
    getAllPersons({ recordId: this.recordId })
      .then(result => {
        this.loading = false;
        let res = JSON.parse(result);
        console.log('rers', res);
        if (res.contactList) {

          this.personRecordList = res.contactList;
          //this.parentRec = this.personRecordList[0];
          this.circleRecords = this.personRecordList;
          this.parentRec.position = this.calculateCenterPosition();
          this.allRelationship = res.allRelationshipRecords;
          //this.deleteRecord(0);

          this.startIteration();

        }

      })
  }


  deleteRecord(index) {
    this.circleRecords.splice(index, 1);
    this.circleRecords = [...this.circleRecords]; // Trigger reactivity

  }


  calculatePersonPosition(index) {

    const totalCircles = this.circleRecords.length;
    const angle = (index / totalCircles) * 2 * Math.PI;
    const radius = (totalCircles * 30) + 100; // Adjust the radius of the circle
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    return `transform: translate(${x}px, ${y}px);`;

  }

  calculateCenterPosition() {

    const centerX = 50; // Adjust center person's X position
    const centerY = 50; // Adjust center person's Y position
    return `top: calc(50% - 50px + ${centerY}px); left: calc(50% - 50px + ${centerX}px);`

  }

  handlePersonChange(event) {

    console.log('personchange**********');
    const personElement = this.template.querySelector('.getId');
    console.log('1', personElement);
    let id = personElement.getAttribute('data-id');
    // Use the personId value as needed
    console.log('personchange', id);
    this.circleRecords = [];
    this.circleRecords = [...this.personRecordList];
    let index = this.getIndexById(id);
    this.parentRec = this.personRecordList[index];
    this.deleteRecord(index);
    this.parentRec.position = this.calculateCenterPosition();
    for (let i = 0; i < this.circleRecords.length; i++) {

      this.circleRecords[i].position = this.calculatePersonPosition(i);

    }


  }

  getIndexById(id) {
    return this.circleRecords.findIndex(person => person.Id === id);
  }

  startIteration() {

    const canvas = this.template.querySelector('canvas');
    const context = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;


    context.clearRect(0, 0, canvas.width, canvas.height);

    const totalCircles = this.personRecordList.length;

    const radius = (totalCircles * 30) + 200;

    for (let i = 0; i < this.personRecordList.length; i++) {
      const angle = (i / totalCircles) * 2 * Math.PI;
      let aboveHalf = totalCircles/2;
      console.log('a', angle);
      console.log('og',360-angle);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      let relationships = [];
      relationships = this.allRelationship.filter(ele => ele.Person__c == this.personRecordList[i].Id);


      // context.beginPath();
      // context.moveTo(centerX, centerY);
      // context.lineTo(x, y);
      // context.stroke();



      context.beginPath();

      context.strokeStyle = "gray";
      context.fillStyle = 'Purple'; // Adjust the fill color of the circle as needed
      context.font = "20px Georgia";
      context.arc(x, y, 90, 0, 2 * Math.PI);
      context.fill();
      // Draw the arrowhead
      const arrowSize = 2; // Adjust the size of the arrowhead as needed


      /*context.beginPath();
      context.moveTo(x, y);
      context.lineTo(
        x - arrowSize * Math.cos(angle - Math.PI / 6),
        y - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      context.lineTo(
        x - arrowSize * Math.cos(angle + Math.PI / 6),
        y - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      context.closePath();
      context.fill();*/

      console.log('xy', x, ' ', y);
      context.beginPath();
      context.fillStyle = "Orange";
      context.fillText(this.personRecordList[i].Name, x - 60, y, 90, Math.PI, Math.PI * 2);

      context.closePath();

      if (relationships) {

        for (let i = 0; i < relationships.length; i++) {


          const radius1 = (relationships.length * 30) + 200;
          let angleRelationship = (i / relationships.length) * 2 * Math.PI;
          if(angle > aboveHalf) {
            angleRelationship = angleRelationship+(relationships.length/2) + 8;
          } 
          if (i == 0) {
            angleRelationship = angleRelationship;
          } else {
            angleRelationship = angleRelationship + 3.4;
          }
          console.log('angle', angleRelationship);
          const x1 = x + radius1 * Math.cos(angleRelationship) * 3;
          const y1 = y + radius1 * Math.sin(angleRelationship) * 3;


          context.beginPath();

          context.strokeStyle = "gray";
          context.fillStyle = 'Purple'; // Adjust the fill color of the circle as needed
          context.font = "20px Georgia";
          context.arc(x1, y1, 90, 0, 2 * Math.PI);
          context.fill();

          context.beginPath();
          context.fillStyle = "Orange";
          context.fillText(relationships[i].Person_Related_To__r.Name, x1 - 60, y1, 90, Math.PI, Math.PI * 2);
          context.closePath();

          context.beginPath();
          context.moveTo(x + 90 * Math.cos(angleRelationship), y + 90 * Math.sin(angleRelationship));

          let endX = x1 - 90 * Math.cos(angleRelationship);
          let endY = y1 - 90 * Math.sin(angleRelationship);


          context.lineTo(x1 - 90 * Math.cos(angleRelationship), y1 - 90 * Math.sin(angleRelationship));
          context.stroke();

         

          const arrowheadLength = 30; // Length of the arrowhead
          const arrowheadX = endX - arrowheadLength * Math.cos(angleRelationship);
          const arrowheadY = endY - arrowheadLength * Math.sin(angleRelationship);

          // Step 3: Draw the arrowhead
          context.beginPath();
          context.moveTo(arrowheadX, arrowheadY);
          context.lineTo(
            arrowheadX + arrowheadLength * Math.cos(angleRelationship + Math.PI / 6),
            arrowheadY + arrowheadLength * Math.sin(angleRelationship + Math.PI / 6)
          );
          context.lineTo(
            arrowheadX + arrowheadLength * Math.cos(angleRelationship - Math.PI / 6),
            arrowheadY + arrowheadLength * Math.sin(angleRelationship - Math.PI / 6)

          );

          context.fill();
        }

      }

    }



  }

}