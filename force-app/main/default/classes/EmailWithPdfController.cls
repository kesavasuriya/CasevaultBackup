public class EmailWithPdfController {
    
    @InvocableMethod 
    public static void sendEmail(List<flowInputs> userDetails) {
       
        List<String>EmailIds = userDetails.get(0).emailIds;

        PageReference ref = Page.SafetyPlanPdf;
        ref.getParameters().put('id',userDetails.get(0).recordId);
        Blob b = ref.getContentAsPDF();
        Messaging.EmailFileAttachment emailAttachment = new Messaging.EmailFileAttachment();
        emailAttachment.setFileName('Safety Plan.pdf');
        emailAttachment.setBody(b);
        
        List<Messaging.SingleEmailMessage> emailList = new List<Messaging.SingleEmailMessage>();
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
		system.debug('mailid '+EmailIds);
        for(String emailId :  EmailIds) {
			email = new Messaging.SingleEmailMessage();
            email.setSubject('Apporved Safety Plan Details');
            email.setToAddresses(new string[]{emailId});
        	email.setPlainTextBody('Please take look on Safety Plan Details');
        	email.setFileAttachments(new Messaging.EmailFileAttachment[] {emailAttachment});
            emailList.add(email);
            
        }
        
        Messaging.SendEmailResult [] result = Messaging.sendEmail(emailList);
        
    }
    
    public class flowInputs {
    @InvocableVariable
    public String recordId;

    @InvocableVariable
    public List<String> emailIds;
}


}