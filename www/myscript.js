var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
		var osName = device.platform,	// Store Operating System name
			osVersion = device.version, // Store OS version (String)
			osVersionInteger = parseInt(osVersion, 10); // Convert OS Version into an Integer
			
		switch(osName) {
			case "Android":
				if(osVersionInteger >= 4) {
					console.log("Android OS is greater than or equal to 4: " + osVersion);
				} else {
					$("#btnClasses").hide(); // OS too low, hide the button for PouchDB
				}
				break;
			case "iOS":
				if(osVersionInteger >= 7) {
					console.log("iOS is greater than or equal to 7: " + osVersion);
				} else {
					$("#btnClasses").hide(); // OS too low, hide the button for PouchDB
				}
				break;
			case "Windows":
				if(osVersionInteger >= 8) {
					console.log("Windows OS is greater than or equal to 8: " + osVersion);
				} else {
					$("#btnClasses").hide(); // OS too low, hide the button for PouchDB
				}
				break;
			default:
				console.log("Non-standard OS: " + osName);
				break;
		}
		
		navigator.splashscreen.hide();
        console.log('Received Event: ' + id);
		
		// If we need to pass data into a Function, wrap it in an
		// Anonymous function first!
		$(".btnURL").on("click", function(){loadURL($(this))});
		
		function loadURL(theObj) {
			cordova.InAppBrowser.open(theObj.data("url"), "_blank", "location=yes");
		}
	
		// If we don't need to pass data to a Function,
		// just call it, WITHOUT parenthesis.	
		$("#btnName").on("click", getName);
		
		function getName() {
			navigator.notification.prompt(
				"Enter your name: ",
				gotNameOK,
				"Customize",
				["Go", "No"]
			);
			
			function gotNameOK(results) {
				
				localStorage.userName = results.input1;
				
				if(results.buttonIndex === 2) {
					console.log("User canceled!");
				} else if((localStorage.userName === undefined) || (localStorage.userName === "null") || (localStorage.userName === "")) {
					switch(localStorage.userName) {
						case "":
							alert("Please enter a valid name!");
							break;
						case "null":
							alert("No name saved!");
							break;
						case undefined:
							alert("No name saved!");
							break;
						default:
							console.log(localStorage.userName);
							break;
					}
				} else {
					$(".userName").html(", <em>" + localStorage.userName.replace(/[^a-zA-Z0-9\s\-]/g,"") + "</em>!");
				}
				return localStorage.userName;
			} // END of gotNameOK()
		} // END of getName() Function
		
		function showName() {
			if((localStorage.userName === undefined) || (localStorage.userName === "null") || (localStorage.userName === "")) {
				console.log("No name was saved, yet!");
			} else {
				$(".userName").html(", <em>" + localStorage.userName.replace(/[^a-zA-Z0-9\s\-]/g,"") + "</em>!");
			}
		} // END showName()
		
		showName();
		
			/* Our PouchDB Code: */
			// Create an Object to store a DB
			var db;

			// Function to initialize Database
			function initDB() {
				db = new PouchDB("mysdce");	// Instantiates a new PouchDB
				
				// Check if there's data in DB before showing the Show Class Button
				db.allDocs({"include_docs" : true}, function(failure, success){
					if(failure) {
						console.log(failure);
					} else {
						if(success.rows.length > 0) {
							console.log(success.rows.length);
							$elBtnShow.show();
						} else {
							console.log("length is not > 0");
							console.log(success.rows.length);
						}
					}
				});
				
				return db;					// Returns the Object back to the main app
			}
			
			initDB();	// Create the DB for the first time.
			
			var $elBtnSave 		= $("#btnGo"),		// Created various jQuery-based Objects
				$elBtnCancel 	= $("#btnCancel"),	// $ is commonly used to denote a jQ
				$elBtnShow 		= $("#btnShow"),	// When creating a jQ variable, we should
				$elFormClass 	= $("#formClass"),  // only use jQ Methods on them.
				$elDivResults	= $("#divResults"),	// Vice-verse doesn't work.
				$elDivEdit		= $("#divEdit"),
				$elBtnNuke		= $("#btnNuke");

			// Hide Show Class Button until needed
			$elBtnShow.hide();
			
			// Use the jQ Method of .on() to wait for a Click on the button
			$elBtnSave.on("click", fnSaveClass);
			$elBtnShow.on("click", fnShowClass);
			// First target he element that DOES ($elDivResults) exist; after click, target
			//  the Dynamic element (#btnDeleteClass); then run fnDeleteClass()
			$elDivResults.on("click", "#btnDeleteClass", fnDeleteClass);
			$elDivEdit.on("click", "#btnEditClass", fnEditClass);
			// Passing an arguemnt (data) into a Function needs an Anonymous Function, first
			// $(this) is the currently-clicked Object (in jQ notation)
			$elDivResults.on("click", ".btnPencil", function(){fnEditPrepClass($(this).parent())});
			$elBtnNuke.on("click", fnNuke);
			
			// Process the user Input to save data to PouchDB
			function fnSaveClass() {
				var $valCRN 	= $("#inCRN").val(),	// Using jQ .val() Method to check
					$valClass 	= $("#inClass").val(),  // what was typed into the Inputs,
					$valInst 	= $("#inInst").val();   // then storing as jQ Variables.
				
				$valCRN = $valCRN.toUpperCase(); // Force letters to Uppercase via jQ
				
				// Bundle the data together in JSON format
				// Use Curly Braces around sets of Key and Value pairs
				// Use Double-Quotes for each K/V (unless it's a Variable or Number)
				// Separate each one with a Comma, until final pair with nothing.
				var aClass = {
					"_id" : $valCRN,
					"cClass" : $valClass,
					"cInst" : $valInst
				};
				// A PouchDB Record (Object/Document) MUST HAVE an "_id"
				//console.log("The Object: " + aClass);  // Retrieve whole object
				//console.log("The CRN: " + aClass._id); // Or individual elements
				//console.log("The Class Name: " + aClass.cClass);
				//console.log("The Instructor's Name: " + aClass.cInst);
				
				// PouchDB Method to Put data into the Database
				// Most PouchDB methods need 1 Parameter and can have optional Options
				// And usually a result Callback (Function)
				db.put(aClass, function(failure, success){
					// Check which happened, Failure or Success, via If...Else
					if(failure) {
						//console.log("Something went wrong: " + failure);
						// Check possible Error Codes and give feedback to the User
						switch(failure.status) {
							case 409:	// CRN already exists
								alert("CRN already already exists! Type another.");
								break;
							case 412:	// CRN is empty
								alert("CRN cannot be empty!");
								break;
							default:
								console.log(failure.status);
								alert("Error - Contact the developer: help@trashcan.xyz");
								break;
						}
					} else {
						//console.log("Nothing went wrong: " + success);
						fnClearForm();
						fnShowClass();
					}
				});
			} // END fnSaveClass()
			
			// A function to clear the Form, clean up others things, & give feedback
			function fnClearForm() {
				$elFormClass[0].reset();
			} // END fnClearForm()
			
			function fnShowClass() {
				// PouchDB Method to retrieve ALL the data (Documents) at once
				db.allDocs({"include_docs" : true, "ascending" : true}, function(failure, success){
					if(failure) {
						console.log(failure);
					} else {
						console.log(success.rows);
						// success is ALL the data retrieved
						// .rows[0] is the FIRST bundle of data (Document)
						// .doc the "actual" data in JSON format
						// console.log(success.rows[0].doc);
						// Function to process the JSON data from PouchDB:
						// First check if there's data to show
						if(success.rows.length > 0) {
							fnShowClassTable(success.rows);
							console.log("there is data");
						} else {
							console.log("there is no data");
						}
					}
				});
			} // END fnShowClass()
			
			// Processes the raw data from fnShowClass() & displays as a Table on-screen
			function fnShowClassTable(data) {
				console.log(data);
				// Reactivate the Class Button (deactivated on Line 56)
				$elBtnShow.show();
				var str = "<p><table border='1' id='tableCSS'>";
					// We build a Row in the table for the Headings:
					str += "<tr><th>CRN</th><th>Class Name</th><th>Instructor</th><th>&nbsp;</th></tr>";
					
					for(var i = 0; i < data.length; i++) {
						str += "<tr><td>" + data[i].doc._id + "</td><td>" + data[i].doc.cClass + "</td><td>" + data[i].doc.cInst + "</td><td class='btnPencil'>&#x270e;</td></tr>";
					}
					// Continuation of the string started before. NOTE +=
					str += "</table></p>";
					str += "<hr>";
					str += "<input type='text' placeholder='8782X' id='inDeleteClass'><input type='button' value='Delete Class' id='btnDeleteClass'>";
				// Use .html() jQ Method to write HTML into the div
				$elDivResults.html(str);
				$elDivResults.hide().fadeIn(250);
			} // END fnShowClassTable(data)
			
			function fnDeleteClass() {
				// Retrieve value of Input Field (to delete)
				//  then convert to Uppercase letters.
				var $valDeleteClass = $("#inDeleteClass").val();
				$valDeleteClass = $valDeleteClass.toUpperCase();
				console.log($valDeleteClass);
				
				db.get($valDeleteClass, function(failure, success){
					if(failure) {
						console.log(failure);
						alert("Error! The class " + $valDeleteClass + " doesn't exist!");
					} else {
						console.log("About to delete class " + $valDeleteClass);
						db.remove(success, function(failure, success){
							if(failure) {
								console.log(failure);
								alert("Error! The class " + $valDeleteClass + " doesn't exist!");
							} else {
								fnShowClass();
							} // END if() from .remove()
						}); // END .remove()
					} // END if() from .get()
				}); // END .get()
			} // END fnDeleteClass()
			
			function fnEditClass() {
				var $valTmpCRN 		= $("#inEditCRN").val(),
					$valTmpClass 	= $("#inEditClass").val(),
					$valTmpInst 	= $("#inEditInst").val();
					
				db.get($valTmpCRN, function(failure, success){
					if(failure) {
						alert("Warning! \nThe CRN: " + $valTmpCRN + " does not exist!");
					} else {
						// We use .put() to add data for the 1st time, and for UPDATING data
						// But we must specifiy a _rev (Revision) for subsequent changes
						// Passing in the new version of the data,
						// in a 'raw' JSON format. With _rev (from Success Object)
						db.put({
							"_id" 		: success._id,
							"cClass" 	: $valTmpClass,
							"cInst" 	: $valTmpInst,
							"_rev" 		: success._rev
						}, function(failure, success){
							if(failure) {
								console.log(failure);
								alert("ERROR!");
							} else {
								console.log("Data updated: " + success);
								fnShowClass();
							} // END If...Else of .put()
						}); // END .put() (for revised data)
					} // END If...Else of .get()
				}); // END .get()
			} // END fnEditClass()
			
			// Function to prepare to edit the row of data,
			// needs a $(this) Argument
			function fnEditPrepClass(thisObj) {
				console.log(thisObj);
				// Get the Text of the Cell (TD) equal to the 0th position of the row (thisObj)
				var $valTmpCRN = thisObj.find("td:eq(0)").text(),
					$valTmpClass = thisObj.find("td:eq(1)").text(),
					$valTmpInst = thisObj.find("td:eq(2)").text(),
					$elDivEdit = $("#divEdit"),
					$elH1Update = $("#h1Update");
				
				var str = "";
				str += "<input type='button' value='Update Class' id='btnEditClass'><input type='text' placeholder='7877J' disabled id='inEditCRN'><input type='text' placeholder='Math I' id='inEditClass'><input type='text' placeholder='Jones' id='inEditInst'>";                          
				$elDivEdit.html(str);
				$elH1Update.html("Updating " + $valTmpCRN);
				
				$("#inEditCRN").val($valTmpCRN);
				$("#inEditClass").val($valTmpClass);
				$("#inEditInst").val($valTmpInst);
				
				$("#popClassUpdate").popup(); // Have the Div behave like a Popup
				$("#popClassUpdate").popup("open", {"position" : "window", "transition" : "flip"});
			} // END fnEditPrepClass()
			
			function fnNuke() {
				// Confirmation before deleting the database
				// #ProTip: Add the most likely Case first,
				// it will process, Break, and continue, freeing up resources
				// confirm() asks for user to agree or not
				switch(confirm("You are about to delete all your data. \nConfirm?")) {
					case true:
						console.log("User is trying to NUKE!");
						if(confirm("Are you sure?")) {
							console.log("They REALLY want to delete!");
							db.destroy(function(failure, success){
								if(failure) {
									console.log(failure);
									alert("ERROR \nContact the developer!");
								} else {
									console.log(success);
									// Database is gone; Fade out the empty Table
									$elDivResults.show().fadeOut(2000);
									initDB(); // Reinitialize the PouchDB database anew
								} // END If..Else for .destroy()
							}); // END .destroy()
						} else {
							console.log("They changed their mind.");
						}
						break;
					case false:
						console.log("User canceled");
						break;
					default:
						console.log("Third choice was made");
						break;
				} // END switch()
			} // END fnNuke()
		
		// -- Social Sharing Section --
		$("#btnContactUs").on("click", fnContactUs);
		function fnContactUs() {
			// Set up "sharing" directly to email
			// Requires a lot of Arguments 
			window.plugins.socialsharing.shareViaEmail(
				"Regarding your app<br>", // Message Body as a String
				"mySDCE Feedback", // Subject as a String
				["vmc@vmcink.com"], // To: field in an Array of Strings
				null, // CC: field in an Array of Strings
				null, // BCC: field in an Array of Strings
				"www/images/ce_doseal_horizontal_bw.png", // Attachments, relative to the root of the project, requires www/
				function(success){console.log("Success: " + success);}, // Success callback
				function(failure){console.log("Failed: " + failure);}  // Failure callback, LAST ONE, NO COMMA
			);
		} // END fnContactUs()
		
		$("#btnShareIt").on("click", fnShareIt);
		function fnShareIt() {
			window.plugins.socialsharing.share(
			"Check out the mySDCE app!", // Message
			"Download the mySDCE app", // Subject
			["www/icon.png"], // Attachments in an Array
			"http://a.co/1bf9IPb", // URL
			function(success){console.log("Success: " + success);}, // Success Callback
			function(failure){console.log("Failed: " + failure);}  // Failure Callback (no comma)
			);
		} // END fnShareIt()
		
    } // END of receivedEvent()
}; // END of the app

app.initialize();


/*
	Developer: 	Victor Campos <vcampos@victor.biz>
	App:		mySDCE
	Date:		2017-04-27
	Description:The Unofficial mySDCE App. For non-commerical use, only!
*/