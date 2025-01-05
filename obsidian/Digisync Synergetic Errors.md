INVALID_JSON: Invalid JSON. Please check the format and try again  
REQUIRED_FIELD: Application UUID is mandatory  
APPLICATION_ALREADY_PROCESSED: Application 'sadasdas' was already processed on 11/11/2012  
EMPTY_ARRAY: No Application Data Found  
EMPTY_ARRAY:No Student Data Found  
EMPTY_ARRAY:No Student Data Found  
INVALID_FIELD: Column xyz expecting int

REQUIRED_FIELD
- Parent error it seems, if there's no application ID this gets thrown 
  - What about if a different required field is missing? Or is this only for application id?
	  - Seems to only be for Application id, none of the other required fields throw an error
INVALID_JSON
- Appears when there is an application id but nothing else or if there's an app id and junk data



ISSUES:
If there's no "Contacts" array it throws the error that there's no STUDENT data found.
```
const mappedEntryMissingRequiredField = {

	Application: {
	
		ApplicationID: 'missing-required-field-test-2',
		
		Applications: restOfEntry.Application.Applications,
		
		Students: restOfEntry.Application.Students,
		
		// Contacts: restOfEntry.Application.Contacts,
		
		Attachments: [],
	
	},

};
```
Will give the error saying no student data

It says 'empty array' in the error message of fields that are objects

`Unidentified error! ARRAY_CHECK:Application check Passed. Starting Student Check Conversion failed when converting the nvarchar value 'aaaa' to data type int.`
This error needs to be squashed


Need to implement an 'Unknown Error'

Authentication errors come in the <ErrorMessage> tag, not the error details like the others. Would like to get all the possible options here too.

How to handle Unidentified Errors? Done

Is ApplicationID even used anymore in the respons eform synergetic or does it go by uuid?

Hold onto this

```
const mappedEntryDummy = {

Application: {

ApplicationID: 'missing-required-field-test-4',

Applications: {

// ApplicationStatus: 'success',

// ...restOfEntry.Application.Applications,

// AgentID: 'this is the string assigned to Applications.AgentID',

},

Students: {

// ...restOfEntry.Application.Students,

// ID: 'aaaa',

// ContactEnquiryID: 'this is the string assigned to Students.ContactEnquiryID',

// FutureID: 'asd',

// DepositSeq: 'jijh',

// DebtorID: 'wieoru',

// YearOfEntry: 'iuy',

},

Contacts: [

{

// ...restOfEntry.Application.Contacts[0],

// CommunityID: 'this is the string assigned to Contacts.CommunityID',

},

],

Attachments: [],

},

};
```