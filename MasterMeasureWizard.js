/*global define */
var vArrayFilterFields = new Array();
var vArrayFilterValues = new Array();
var vArrayFilterAction = new Array();

var vArrayFilterDolarFreeFunc = new Array();
var vArrayFilterDolarFreeContent = new Array();

var vFormula = '';
var vAccessAdd = 0;
var vFirstFilter = true;
var vNumChecks = 0;

var myAppsName = new Array();
var myAppsId = new Array();
var vCreateUpdate = 'Create';
var vCheckButtonBool = true;

var vFilterOp = 1;

define(["jquery",
	"qlik",
	"text!./style.css",
	"text!./css/scoped-twbs.min.css",
	"./js/bootstrap.min",
	'./lib/external/sense-extension-utils/extUtils',
	"./lib/external/sweetalert/sweetalert.min",
	'ng!$q'
	], //
	function ($, qlik,cssContent, bsCssContent, wizardList, extUtils, sweetalert, $q) {
		
		extUtils.addStyleToHeader( cssContent );
		var faUrl = extUtils.getBasePath() + '/extensions/MasterMeasureWizard/lib/external/sweetalert/sweetalert.css';
		extUtils.addStyleLinkToHeader( faUrl, 'MasterMeasureWizard__sweetalert' );

		var app = qlik.currApp();
		var sumFieldsArray = new Array();		
	
		var vEM = app.model.enigmaModel.engineApp;		
		var vEU = app.model.enigmaModel.engineApp;
		
		var strangechar = String.fromCharCode(92);
		var vAppIdSplit = app.id.split(strangechar);
		var vAppId = vAppIdSplit[(vAppIdSplit.length - 1)];	
		
		var fieldArray 			= [];
		var fieldArrayChecked 	= [];
		var fieldArrayUnchecked = [];
		var varsArray 			= [];
		var measArray 			= [];
		var measIdArray 		= [];
		var fieldTimeArray 		= [];		
		var valuesArray 		= [];
		var dimsArray 	  		= [];
		var dimsArrayName 		= [];
				
		function getFieldsList( $element, layout){
			vFilterOp = layout.buttons.dimfields;
			var defer = $q.defer();
			
			app.getList( 'DimensionList', function ( data ) {					

				data.qDimensionList.qItems.forEach( function ( item ) {
					if(vFilterOp == 2){
						var vTestDimName = item.qData.info[0].qName;
						if(vTestDimName.indexOf('(')<0){
							dimsArray.push(item.qData.info[0].qName);
							dimsArrayName.push(item.qData);
						}
					}
				})
				return defer.resolve( _.sortBy( dimsArray, function ( item ) {
					return item.label;
				}));
			}).then( function ( items ) {
				app.getList( 'FieldList', function ( data ) {
					var arlengthcheck = fieldArray.length;				
					data.qFieldList.qItems.forEach( function ( item ) {
						if(arlengthcheck == 0){
							fieldArray.push(item.qName);
							if(vFilterOp == 1){
								dimsArray.push(item.qName);
							}
							for (var gt = 0;gt < item.qTags.length;gt++){
								if(item.qTags[gt] == '$integer'){
									fieldTimeArray.push(item.qName);
								}
							}
						}
					})

					return defer.resolve( _.sortBy( fieldArray, function ( item ) {
						return item.label;
					}));
				}).then( function ( items ) {
					app.getList( 'VariableList', function ( data ) {
						data.qVariableList.qItems.forEach( function ( item ) {
							varsArray.push(item.qName);
						})
						return defer.resolve( _.sortBy( varsArray, function ( item ) {
							return item.label;
						}));
					}).then( function ( items ) {
						app.getList( 'MeasureList', function ( data ) {						
							data.qMeasureList.qItems.forEach( function ( item ) {
								measArray.push(item.qData.title);
								measIdArray.push(item.qData.title + '#-*-#' + item.qInfo.qId);

							})
							return defer.resolve( _.sortBy( measArray, function ( item ) {
								return item.label;
							}));
						}).then( function ( items ) {
							fieldArray = fieldArray.filter(onlyUnique).sort();
							dimsArray = dimsArray.filter(onlyUnique).sort();
							varsArray = varsArray.filter(onlyUnique).sort();
							measArray = measArray.filter(onlyUnique).sort();
							render( $element, layout);
						})
					})
				})	
			})		
		};

		function onlyUnique(value, index, self)
		{ 
		    return self.indexOf(value) === index;
		};			
		function resetWizard(){
			$( "#myModalBase" ).remove();
			document.getElementById('CreateButton').disabled = false;;
			document.getElementById('UpdateButton').disabled = false;;
			vFirstFilter = false;
			vFormula = '';
			vArrayFilterFields = [];
			vArrayFilterValues = [];
			vArrayFilterAction = [];
			
			fieldArrayChecked = [];

			vArrayFilterDolarFreeFunc = [];
			vArrayFilterDolarFreeContent = [];
		}
				
		$( "<style>" ).html( cssContent ).appendTo( "head" );
		$( "<style>" ).html( bsCssContent ).appendTo( "head" );

		function render ( $elem, layout) {			
			
			vCheckButtonBool = true;

			var html = ''; 
			
		    var width = $elem.width();

		    var height = $elem.height();

		    var id = "container_" + layout.qInfo.qId;
		    
			var vModalBase = '<div id="myModalBase" class="modalBase navbar-collapse collapse twbs ' + id + '">' +
						'<div class="base-content">' +
						  '<div class="modal-header">' +
						    '<span>Master Measure Wizard</span>'+
						    '<span id = "baseModalClose" class="close"> x </span>' +						    
						  '</div>' +
						  '<div class="modal-body">' +
						    '<div class="box" style="height: 600px">' +
			
				      	'<h2>What do you want to calculate?</h2>' +				

						// functions						
						'<h4>Chose a calculation function</h4>' +
					    '<div class="form-group" style="width:200px">' +
	                        '<select class="form-control" id="function"' +	                            
	                            'required="required">' +

	                            '<option value="Sum">Sum</option>' +
	                            '<option value="Count">Count</option>' +
	                            '<option value="Min">Min</option>' +
	                            '<option value="Max">Max</option>' +
	                            '<option value="Only">Only</option>' +
	                            '<option value="Avg">Avg</option>' +
	                        '</select>' +
                    	'</div>' +

                    	// fields                    	
                    	'<h4>Chose a field to measure</h4>' +
                    	
                    	'<div class="form-group" style="width:200px">' +
	                        '<select class="form-control" id="functionfield"' +
                                'required="required">' +     
                                '<option value=""></option>';
                                if(vSpecificSum){                                	
                                	for (var it = 0;it < sumFieldsArray.length; it++){
				  						vModalBase += '<option value=' + it + '>' + sumFieldsArray[it] + '</option>';
				  					}
                                }else{
	                                for (var it = 0;it < fieldArray.length; it++){
					  					vModalBase += '<option value=' + it + '>' + fieldArray[it] + '</option>';
					  				}
					  			}
							vModalBase += '</select>' +
                    	'</div>' +
                    	'<input id = "checkDistinct" type = "checkbox"> Only distinct values' +
						'<br><br>' +
                    	
                    	'<button id = "filterButton" type="button" class="btn btn-success" style="width: 80px;margin-left: 10px">Filter it</button>' +
                    	'<button id = "addFilButton" type="button" class="btn btn-default" style="width: 80px;margin-left: 10px">Add it</button>' +
                    	'<button id = "checkButton"  type="button" class="btn btn-primary" style="width: 80px;margin-left: 10px">Check it</button>' +

                    	'<br>' + 
                    	//'<h3 id="CheckFormula"></h3>' +
                    	'<textarea rows="4" cols="70" wrap="soft" id="CheckFormula" value="" style = "font-size:20px;margin-top: 20px;margin-bottom: 10px;font-family: Arial;resize:none">' +
                    	'</textarea>' +
                    	'<h2 id="formulanumbers" style ="color:rgb(66, 133, 244)"></h2>';
                    	if(vCreateUpdate == 'Create'){
                    		vModalBase += 
                    		'<button id = "createupdateButton" type="button" class="btn btn-basic" style="width: 170px;margin-left: 10px">Create</button><br><br>' +                    		
                    		'<h4 style = "padding-left:10px"><input id = "formulaName" type="text" name="fname" style = "width:170px;font-size:17px" placeholder="Measure name"></h4>';
                    	}else{
                    		vModalBase += 
                    		'<button id = "createupdateButton" type="button" class="btn btn-default" style="width: 170px;margin-left: 10px">Update</button>' +
	                    	'<br><br>' +          	
	                    	'<div class="form-group" style="width:170px;margin-left:10px">' +
		                        '<select class="form-control" id="measuresold"' +                               
	                                'required="required">' +                              
	                                '<option value=""></option>';
	                                for (var it = 0;it < measArray.length; it++){
					  					vModalBase += '<option value=' + it + '>' + measArray[it] + '</option>';											
					  				}					  			    
								vModalBase += '</select>' +
	                    	'</div>';
                    	}
                    	
					vModalBase += '</div></div></div></div>';                    

					$( document.body ).append( vModalBase );		
						$('#myModalBase').modal({backdrop: 'static', keyboard: false})  										
						var modalBase = document.getElementById('myModalBase');												
						var spanBase  = document.getElementById("baseModalClose");
				
						modalBase.style.display = "block";
						
						spanBase.onclick = function() {							
							resetWizard();
						}
                    			
                var vFunction     = document.getElementById('function');				
				var vCheckButton  = document.getElementById('checkButton');
				var vAddFilButton = document.getElementById('addFilButton');
				var vFilterButton = document.getElementById('filterButton');
				var vCreateUpdateButton = document.getElementById('createupdateButton');
				
				
				$('#function').change(function () {
				    var selection = this.value;
				    var vfieldList = document.getElementById("functionfield");
				    vfieldList.options.length=0;	
				    if(selection == 'Count' || selection == 'Only'){
				    	for (var it = 0;it < fieldArray.length; it++){
				    		var option = document.createElement("option");
				    		option.value = it;
							option.text = fieldArray[it];
							vfieldList.add(option);
						}
				    }else{
				    	for (var it = 0;it < sumFieldsArray.length; it++){
				    		var option = document.createElement("option");
				    		option.value = it;
							option.text = sumFieldsArray[it];
							vfieldList.add(option);
						}
				    }				    				    
				    
				});
				vAddFilButton.onclick = function() {
					
					var vDistinctChecked = document.getElementById('checkDistinct').checked;
					var qLength = vArrayFilterFields.length;
					var fun = document.getElementById("function");
					var af = fun.options[fun.selectedIndex].text;

					var fld = document.getElementById("functionfield");					
					var afl = fld.options[fld.selectedIndex].text;

					vFormula = af;					
					vFormula += '(';

					if(qLength>0){
						vFormula += '{<';
						var vComa = '';
						for (var i = 0; i < qLength; i++){
							var distinctvalues = '';							
							var distincts = vArrayFilterValues[i];
							
							var add_del = '';
							if(vArrayFilterAction[i] == 'del'){
								add_del = '-';
							}
							var a = distincts.toString().split(",");
							var obj = new Object();
							var dcomas = '';
							for (var ids = 0; ids < a.length; ids++) {
							    obj[a[ids]] = a[ids];
							}
							for (var key in obj) {
							  distinctvalues += dcomas + key;
							  dcomas = ',';
							}

						   	vFormula += vComa + '[' + vArrayFilterFields[i] + '] = ' + add_del + '{' + distinctvalues + '}';
						   	vComa = ',';						
						}
						vFormula += '>}';
					}
					if(vDistinctChecked){
						vFormula += 'distinct ';
					}
					vFormula += '[' + afl + ']';
					vFormula += ')';

					vFormula = vFormula.replace(/{,/g, "{");

					$("#CheckFormula").html("");
					var auxValue = document.getElementById("CheckFormula").value;
					var theDiv = document.getElementById("CheckFormula");
					
					


					var start = theDiv.selectionStart;
	                var end = theDiv.selectionEnd;
	                var sel = theDiv.value.substring(start, end);
	                var foc = (theDiv.value.substring(0, start)).length + (vFormula).length;
	                var finText = theDiv.value.substring(0, start) + vFormula + theDiv.value.substring(end);
	                theDiv.value = finText;
	                theDiv.focus()
					//var content = document.createTextNode(vFormula);
					//var contentM = '';
					//theDiv.appendChild(content);
					
					/*app.model.enigmaModel.evaluate(vFormula).then(function(reply){  
						var theDivM = document.getElementById("formulanumbers");						
						contentM = reply;
						theDivM.innerHTML = contentM;						
     				});   */  				
				};

				vCheckButton.onclick = function() {					
					vCheckButtonBool = true;
					
					var theDiv = document.getElementById("CheckFormula").value;					
					
					app.model.enigmaModel.evaluate(theDiv).then(function(reply){  
						var theDivM = document.getElementById("formulanumbers");						
						contentM = reply;
						theDivM.innerHTML = contentM;						
     				});
     				
				};

				vFilterButton.onclick = function() {
					filtering()
				}								

				function filtering () {						
						var currentSel = app.selectionState();
						var vModalFil = '<div id="myModalFil" class="modalFil">' +
						'<div class="base-content">' +						  

						  '<div class="modal-header">' +
						    '<span>Filter zone</span>'+
						    '<span id = "filterModalClose" class="close"> x </span>' +						    
						  '</div>' +

						  '<div class="modal-body">' +
						    '<div class="box" style="height: 600px">' + 
						   			
									'<div class="text-basic">' +
									'<i id = "deletefilters" class="lui-icon lui-icon--clear-selections" style = "float:right;margin-right:100px;cursor:pointer"></i>';
									if(vArrayFilterFields.length > 0){
										if (vArrayFilterFields.toString().length < 80){
											vModalFil += '<h3 id = "text-basic">Currently applied: ' + vArrayFilterFields.toString() + '</h3>';
										}else{
											vModalFil += '<h3 id = "text-basic">Currently applied: ' + vArrayFilterFields.toString().substring(0,70) + ' (' + vArrayFilterFields.length + ' fields)</h3>';
										}
									}else{
										vModalFil += '<h3 id = "text-basic">Check the filters to apply</h3>';	
									}
									vModalFil += '</div><br><br>' + 

									 '<div class="row">' +
							      	 '<div class="col-md-2" style = "overflow:overlay;height:550px;width:200px;position:relative;float:left">';
							      	
							      	for (var it = 0;it < dimsArray.length; it++){
							      		if(vArrayFilterFields.indexOf(dimsArray[it]) >= 0){
							      			fieldArrayChecked.push(dimsArray[it]);							      		
							      		}else{
							      			fieldArrayUnchecked.push(dimsArray[it]);
							      		}
								  	}
								  	fieldArrayChecked = fieldArrayChecked.filter(onlyUnique).sort();
								  	fieldArrayUnchecked = fieldArrayUnchecked.filter(onlyUnique).sort();
								  	for (var iCh = 0;iCh < fieldArrayChecked.length; iCh++){
								  		var containerName = fieldArrayChecked[iCh];
								  		if (vFilterOp == 2){
								  			for (var av = 0; av < dimsArrayName.length; av++){
								  				if (fieldArrayChecked[iCh] == dimsArrayName[av].info[0].qName){
								  					containerName = dimsArrayName[av].title;
								  				}
								  			}
								  		}
								  		vModalFil += 
								  			'<label class = "containerf">' + containerName +
							  					'<input class = "inputf" id = "check' + fieldArrayChecked[iCh] + '"type = "checkbox" checked>' +
							  					'<span class = "checkmarkf"></span>' +
											'</label>';
									}
									for (var iUch = 0;iUch < fieldArrayUnchecked.length; iUch++){
										var containerName = fieldArrayUnchecked[iUch];
								  		if (vFilterOp == 2){
								  			for (var av = 0; av < dimsArrayName.length; av++){
								  				if (fieldArrayUnchecked[iUch] == dimsArrayName[av].info[0].qName){
								  					containerName = dimsArrayName[av].title;
								  				}
								  			}
								  		}
								  		vModalFil += 
								  			'<label class = "containerf">' + containerName +
							  					'<input class = "inputf" id = "check' + fieldArrayUnchecked[iUch] + '"type = "checkbox">' +
							  					'<span class = "checkmarkf"></span>' +
											'</label>';
									}							      	

								  	vModalFil += '</div>';
								  	
								  	vModalFil += '<div id = "boxright" class="col-md-8" style = "overflow:overlay;height:590px;width:80%">' +
								    '<div class="box-set-list">'+
								    '<div class="list">' +
								    '<div id = "list-rowDiv" class="list-row">';
								    

								    for (var tt = 0;tt < vArrayFilterFields.length;tt++){
										var vPad = ' style = "margin-top:10px"';										
																				
										var addClass = '';
										var delClass = '';
										var allClass = '';
										var varClass = '';
										switch (vArrayFilterAction[tt]) {
											case "add":
											addClass = ' lui-active';
											break;

											case "del":
											delClass = ' lui-active';
											break;

											case "all":
											allClass = ' lui-active';
											break;																					

											case "pre":
											varClass = ' lui-active';
											break;

											case "fre":
											varClass = ' lui-active';
											break;

											case "dol":
											varClass = ' lui-active';
											break;
										}
										var containerName = vArrayFilterFields[tt];
								  		if (vFilterOp == 2){
								  			for (var av = 0; av < dimsArrayName.length; av++){
								  				if (vArrayFilterFields[tt] == dimsArrayName[av].info[0].qName){
								  					containerName = dimsArrayName[av].title;
								  				}
								  			}
								  		}
								  		vModalFil += 
											'<div id = "' + vArrayFilterFields[tt] + '" class="chart-list" ' + vPad + '>' +
			   									'<b>' + containerName + '</b><br><br>' +			   									
			   									'<div class="lui-buttongroup">' +
			   										'<button id = "iconadd' + vArrayFilterFields[tt] + '" class="iconadd button-stretch lui-button lui-buttongroup__button lui-button--rounded ng-scope' + addClass + '">' +
			   											'<span class = "lui-icon lui-icon--plus" title="Include filters"></span>' +
			   										'</button>' +
			   										'<button id = "iconall' + vArrayFilterFields[tt] + '" class="iconall button-stretch lui-button lui-buttongroup__button ng-scope' + allClass + '">' +
												    	'<span class = "lui-icon lui-icon--star" title="Get all values">' +
												    '</button>' +
												    '<button id = "iconexc' + vArrayFilterFields[tt] + '" class="iconexc button-stretch lui-button lui-buttongroup__button ng-scope' + delClass + '">' +
												    	'<span class = "lui-icon lui-icon--minus" title="Exclude filters">' +	
												    '</button>' +
												    '<button id = "icondol' + vArrayFilterFields[tt] + '" class="icondol button-stretch lui-button lui-buttongroup__button lui-button--rounded ng-scope' + varClass + '">' +
												    	'<span class = "lui-icon lui-icon--effects" title="Dynamic values">' +
												    '</button>' +
												'</div>' +
												'<div style="height:200px">'+
												'<qlik-visual class = "emptyChart" appid = ' + vAppId + ' type="listbox" cols=' + "'[" + '"' + vArrayFilterFields[tt] + '"' + "]'" +   ' ></qlik-visual>' +
												'</div>'+
											'</div>';									    
							    	}
									
								    vModalFil += '</div></div></div></div></div></div></div></div></div>';
						
						$( document.body ).append( vModalFil );						
							
						var modalFil = document.getElementById('myModalFil');												
						var spanFil  = document.getElementById("filterModalClose");
						var deleteFil  = document.getElementById("deletefilters");
				
						modalFil.style.display = "block";
						
						spanFil.onclick = function() {							
							$( "#myModalFil" ).remove();		
							vFirstFilter = false;
						}
						deleteFil.onclick = function(){
							app.clearAll();
							
							vNumChecks = 0;
							fieldArrayChecked  = [];
							vArrayFilterFields = [];
							vArrayFilterValues = [];
							vArrayFilterAction = [];
							vArrayFilterDolarFreeFunc = [];
							vArrayFilterDolarFreeContent = [];														
							
							document.getElementById("text-basic").innerHTML = 'Check the filters to apply';							
							$(".lui-active").removeClass("lui-active");
						}
						$('.inputf').click(function() {
							var vName = this.id.substring(5);							
							var ev = document.createElement('div');					
							var vPad = ' style = "margin-top:10px"';
							var containerName = vName;
					  		if (vFilterOp == 2){
					  			for (var av = 0; av < dimsArrayName.length; av++){
					  				if (vName == dimsArrayName[av].info[0].qName){
					  					containerName = dimsArrayName[av].title;					  					
					  				}
					  			}
					  		}
					  		
			   				ev.innerHTML = '<div id = "' + vName + '" class="chart-list" ' + vPad + '>' +
			   									'<b>' + containerName + '</b><br><br>' +
			   									'<div class="lui-buttongroup">' +
			   										'<button id = "iconadd' + vName + '" class="iconadd button-stretch lui-button lui-buttongroup__button lui-button--rounded ng-scope">' +
			   											'<span class = "lui-icon lui-icon--plus" title="Include filters"></span>' +
			   										'</button>' +
			   										'<button id = "iconall' + vName + '" class="iconall button-stretch lui-button lui-buttongroup__button ng-scope">' +
												    	'<span class = "lui-icon lui-icon--star" title="Get all values">' +
												    '</button>' +
												    '<button id = "iconexc' + vName + '" class="iconexc button-stretch lui-button lui-buttongroup__button ng-scope">' +
												    	'<span class = "lui-icon lui-icon--minus" title="Exclude filters">' +	
												    '</button>' +
												    '<button id = "icondol' + vName + '" class="icondol button-stretch lui-button lui-buttongroup__button lui-button--rounded ng-scope">' +
												    	'<span class = "lui-icon lui-icon--effects" title="Dynamic values">' +
												    '</button>' +
												'</div>' +
												'<div style="height:200px">'+
												'<qlik-visual class = "emptyChart" appid = ' + vAppId + ' type="listbox" cols=' + "'[" + '"' + vName + '"' + "]'" +   ' ></qlik-visual>' +
												'</div>' +	
											'</div>';
							if(this.checked){
								document.getElementById('list-rowDiv').appendChild(ev.children[0]);
								
								/*vNumChecks++;
								var vIndexChecked = fieldArrayUnchecked.indexOf(vName);
								fieldArrayChecked.push(vName);
								fieldArrayUnchecked.splice(vIndexChecked,1);*/
							}else{
								vNumChecks--;
								var vIndex = vArrayFilterFields.indexOf(vName);
								var vIndexChecked = fieldArrayChecked.indexOf(vName);
								
								fieldArrayChecked.splice(vIndexChecked,1);
								vArrayFilterFields.splice(vIndex, 1);
								vArrayFilterValues.splice(vIndex, 1);
								vArrayFilterAction.splice(vIndex, 1);
								vArrayFilterDolarFreeFunc.splice(vIndex, 1);
								vArrayFilterDolarFreeContent.splice(vIndex, 1);
								fieldArrayUnchecked.push(vName);
								var vChild = document.getElementById(vName);
								document.getElementById('list-rowDiv').removeChild(vChild);

								if (vArrayFilterFields.toString().length < 80){
									document.getElementById("text-basic").innerHTML = 'Currently applied: ' + vArrayFilterFields.toString();
								}else{
									document.getElementById("text-basic").innerHTML = 'Currently applied: ' + vArrayFilterFields.toString().substring(0,70) + '... (' + vArrayFilterFields.length + ' fields)';									
								}																								
							}
							$('.iconadd').click(function() {							
							  	var myfield = this.id;
							  	var myid = myfield;							  	
								myfield = myfield.substring(7);

								var selChecked = false;
							  	app.getObject('CurrentSelections').then(function(model){
							  		var selLength = model.layout.qSelectionObject.qSelections.length;							  		
							  		for (var it = 0;it<selLength;it++){
							  			if(myfield == model.layout.qSelectionObject.qSelections[it].qField){
							  				selChecked = true;							  				
							  			}
							  		}
							  		if(selChecked){									  	
									  	var vdel = "iconexc" + myfield;
									  	var vall = "iconall" + myfield;
									  	var vdol = "icondol" + myfield;
									  	
									  	document.getElementById(myid).classList.add("lui-active");
									  	document.getElementById(vdel).classList.remove("lui-active");
									  	document.getElementById(vall).classList.remove("lui-active");
									  	document.getElementById(vdol).classList.remove("lui-active");									  	
								
										addFilters(myfield);
										
									}else{									
										addAlert(myfield);
									}	
							  	})					  						
							});
							$('.iconexc').click(function() {
								var myfield = this.id;
								var myid = myfield;									
								myfield = myfield.substring(7);
								var selChecked = false;
								app.getObject('CurrentSelections').then(function(model){
							  		var selLength = model.layout.qSelectionObject.qSelections.length;							  		
							  		for (var it = 0;it<selLength;it++){
							  			if(myfield == model.layout.qSelectionObject.qSelections[it].qField){
							  				selChecked = true;
							  			}
							  		}
							  		if(selChecked){	
										var vadd = "iconadd" + myfield;
									  	var vall = "iconall" + myfield;
									  	var vdol = "icondol" + myfield;
									  	document.getElementById(myid).classList.add("lui-active");
									  	document.getElementById(vadd).classList.remove("lui-active");
									  	document.getElementById(vall).classList.remove("lui-active");
									  	document.getElementById(vdol).classList.remove("lui-active");
									  	
										delFilters(myfield);
									}else{										
										addAlert(myfield);
									}
								})							
							});
							$('.iconall').click(function() {						
								myfield = this.id;
								var myid = myfield;
								document.getElementById(myfield).src = "/Extensions/MasterMeasureWizard/img/allBlue.png";
								myfield = myfield.substring(7)
								var vadd = "iconadd" + myfield;
							  	var vdel = "iconexc" + myfield;
							  	var vdol = "icondol" + myfield;
							  	document.getElementById(myid).classList.add("lui-active");
							  	document.getElementById(vadd).classList.remove("lui-active");
							  	document.getElementById(vdel).classList.remove("lui-active");
							  	document.getElementById(vdol).classList.remove("lui-active");
								allFilters(myfield);							
							});
							$('.icondol').click(function() {										
								var myfield = this.id;
								var myid = myfield;
								var myfieldname = myfield.substring(7);
								var vModalVar = document.createElement('div');
								var vModalText = '';			
								vModalText = '<div id="myModalVar" class="modalVar">' +
									'<div class="modal-content" style = "height:250px">' +
							  			'<div class="modalVar-header">' +
							    			'<span id = "filterModalClose" class="close"> x </span>' +
							    			'<h4> Filter zone </h4>' +		
							  			'</div>' +
							  		'<div class="modal-body" style="overflow:hidden;height:160px">' +
							    		'<div id = "boxVar' + myfieldname + '"class="box" style="width:200;height: 100px">' + 
										 	'<form action="" id = "formVar' + myfieldname + '">' +
											  	'<input type="radio" name="dolarType' + myfieldname + '" value="1" checked> Previous ' + myfieldname + '<br>' +
											  	'<input type="radio" name="dolarType' + myfieldname + '" value="3" style = "margin-top:5px"> Free type <br>' +

											  	'<div class="form-group" style="width:200px">' +
							                    	'<select class="form-control" id="freefilter' + myfieldname + '" required="required">' +						                    	
														'<option value=1> =  </option>' +
														'<option value=2> >  </option>' +
														'<option value=3> >= </option>' +
														'<option value=4> <  </option>' +
														'<option value=5> <= </option>' +
														'<option value=6> starts with </option>' +
														'<option value=7> contains </option>' +
														'<option value=8> ends with </option>' +										  			
													'</select>' +
													'<input id = "freedesc' + myfieldname + '" type="text" name="freedesc" style = "width:86px;font-size:13px" placeholder="Type text">' + 
												'</div>' +
											  	'<input type="radio" name="dolarType' + myfieldname + '" value="2" style = "margin-top:5px"> Assign variable<br>' +											  	
											'</form>' +
											'<div class="form-group" style="width:200px">' +
						                    	'<select class="form-control" id="varfilter' + myfieldname + '" required="required">' +						                    	
												'<option value=""></option>';
						                            for (var itx = 0;itx < varsArray.length; itx++){
										  				vModalText += '<option value=' + itx + '>' + varsArray[itx] + '</option>';											
										  			}					  			    
												vModalText += '</select></div><br>' +
										 	'<button id = "okvButton" type="button" class="btnStd btnStd-success" style="width: 68px;top:10%;position:relative;left:10px">OK</button>' +
										 	'<button id = "escvButton" type="button" class="btnStd btnStd-danger" style="width: 68px;top:10%;position:relative;left:30px">Cancel</button>' +
								 		'</div>' +
								 	'</div>' +	
								'</div></div>';
								vModalVar.innerHTML = vModalText;
								document.getElementById(myfieldname).appendChild(vModalVar.children[0]);
								
								var modalVar = document.getElementById('myModalVar');												
								var vOKVar  = document.getElementById("okvButton");
								var vEscVar  = document.getElementById("escvButton");
								modalVar.style.display = "block";

								vOKVar.onclick = function() {
									var myfield = this.id;
									var mydiv = document.getElementById(myfield)									
									var ParentID = mydiv.offsetParent;
									var ParentDiv = ParentID.childNodes[1].childNodes[0];
																
									myfield = ParentDiv.id.substring(6);
									
								  	var vFormVarID = 'formVar' + myfield;
								  	var vFormFreeFilterID = 'freefilter' + myfield;
								  	var vFormFreeDescID = 'freedesc' + myfield;
								  	var vFormVarsID = 'varfilter' + myfield;
								  	
								  	var vVarOption = document.getElementById(vFormVarID);								  	
								  	var vFreeFilter = document.getElementById(vFormFreeFilterID);
								  	var vFreeDesc = document.getElementById(vFormFreeDescID);								
								  	var vVarDrop = document.getElementById(vFormVarsID);
									if(vVarOption.elements[0].checked){
									addDolar(myfield,'pre','$(=Max([' + myfield + '])-1)',0,0);
								}else{
									if(vVarOption.elements[1].checked){
										var vfilfill = '';											
										var vfilfunc = vFreeFilter.options[vFreeFilter.selectedIndex].text;
										var vfilcont = vFreeDesc.value;
										switch (vfilfunc){
											case "=":
											vfilfill = '"' + vfilcont + '"';
											break;
											case ">":
											vfilfill = '">' + vfilcont + '"';
											break;
											case ">=":
											vfilfill = '">=' + vfilcont + '"';
											break;
											case "<":
											vfilfill = '"<' + vfilcont + '"';
											break;
											case "<=":
											vfilfill = '"<=' + vfilcont + '"';
											break;
											case "starts with":
											vfilfill = '"*' + vfilcont + '"';
											break;
											case "contains":
											vfilfill = '"*' + vfilcont + '*"';
											break;
											case "ends with":
											vfilfill = '"' + vfilcont + '*"';
											break;
										}
										addDolar(myfield,'fre',vfilfill,vfilfunc,vfilcont);
									}else{
										addDolar(myfield,'dol','$(' + vVarDrop.options[vVarDrop.selectedIndex].text + ')',0,vVarDrop.options[vVarDrop.selectedIndex].text);
									}
								}
									var vdol = "icondol" + myfield;
									var vall = "iconall" + myfield;
									var vadd = "iconadd" + myfield;
								  	var vdel = "iconexc" + myfield;
								  	document.getElementById(vdol).classList.add("lui-active");
								  	document.getElementById(vadd).classList.remove("lui-active");
								  	document.getElementById(vall).classList.remove("lui-active");
								  	document.getElementById(vdel).classList.remove("lui-active");

									$( "#myModalVar" ).remove();									
								}
								vEscVar.onclick = function() {
									$( "#myModalVar" ).remove();	
								}
								$("#myModalVar").draggable({
								    handle: ".modalVar-header"
								});
							});									
						});
						//2nd time
						$('.iconadd').click(function() {
							
						  	var myfield = this.id;
						  	var myid = myfield;						  	
							myfield = myfield.substring(7);
							var selChecked = false;
						  	app.getObject('CurrentSelections').then(function(model){
						  		var selLength = model.layout.qSelectionObject.qSelections.length;
						  		for (var it = 0;it<selLength;it++){
						  			if(myfield == model.layout.qSelectionObject.qSelections[it].qField){
						  				selChecked = true;
						  			}
						  		}
						  		if(selChecked){									  	
								  	var vdel = "iconexc" + myfield;
								  	var vall = "iconall" + myfield;
								  	var vdol = "icondol" + myfield;
								  	document.getElementById(myid).classList.add("lui-active");
								  	document.getElementById(vdel).classList.remove("lui-active");
								  	document.getElementById(vall).classList.remove("lui-active");
								  	document.getElementById(vdol).classList.remove("lui-active");
								
									addFilters(myfield);
								}else{								
									addAlert(myfield);
								}	
						  	});																	
						});
						$('.iconexc').click(function() {
							var myfield = this.id;
							var myid = myfield;	
							myfield = myfield.substring(7);
							var selChecked = false;
							app.getObject('CurrentSelections').then(function(model){
						  		var selLength = model.layout.qSelectionObject.qSelections.length;						  		
						  		for (var it = 0;it<selLength;it++){
						  			if(myfield == model.layout.qSelectionObject.qSelections[it].qField){
						  				selChecked = true;
						  			}
						  		}
						  		if(selChecked){	
									var vadd = "iconadd" + myfield;
								  	var vall = "iconall" + myfield;
								  	var vdol = "icondol" + myfield;
								  	document.getElementById(myid).classList.add("lui-active");
								  	document.getElementById(vadd).classList.remove("lui-active");
								  	document.getElementById(vall).classList.remove("lui-active");
								  	document.getElementById(vdol).classList.remove("lui-active");
								  	
									delFilters(myfield);
								}else{
									addAlert(myfield);
								}
							})							
						});
						$('.iconall').click(function() {						
							myfield = this.id;
							var myid = myfield;
							document.getElementById(myfield).src = "/Extensions/MasterMeasureWizard/img/allBlue.png";
							myfield = myfield.substring(7)
							var vadd = "iconadd" + myfield;
						  	var vdel = "iconexc" + myfield;
						  	var vdol = "icondol" + myfield;
						  	document.getElementById(myid).classList.add("lui-active");
						  	document.getElementById(vadd).classList.remove("lui-active");
						  	document.getElementById(vdel).classList.remove("lui-active");
						  	document.getElementById(vdol).classList.remove("lui-active");
							allFilters(myfield);								
						});
						$('.icondol').click(function() {										
							var myfield = this.id;
							var myfieldname = myfield.substring(7);
							var vModalVar = document.createElement('div');
							var vModalText = '';			
							vModalText = '<div id="myModalVar" class="modalVar">' +
								'<div class="modal-content" style = "height:250px">' +
						  			'<div class="modalVar-header">' +
						    			'<span id = "filterModalClose" class="close"> x </span>' +
						    			'<h4> Filter zone </h4>' +		
						  			'</div>' +
						  		'<div class="modal-body" style="overflow:hidden;height:160px">' +
						    		'<div id = "boxVar' + myfieldname + '"class="box" style="width:200;height: 100px">' + 
									 	'<form action="" id = "formVar' + myfieldname + '">' +
										  	'<input type="radio" name="dolarType' + myfieldname + '" value="1" checked> Previous ' + myfieldname + '<br>' +
										  	'<input type="radio" name="dolarType' + myfieldname + '" value="3" style = "margin-top:5px"> Free type <br>' +

										  	'<div class="form-group" style="width:200px">' +
						                    	'<select class="form-control" id="freefilter' + myfieldname + '" required="required">' +						                    	
													'<option value=1> =  </option>' +
													'<option value=2> >  </option>' +
													'<option value=3> >= </option>' +
													'<option value=4> <  </option>' +
													'<option value=5> <= </option>' +
													'<option value=6> starts with </option>' +
													'<option value=7> contains </option>' +
													'<option value=8> ends with </option>' +										  			
												'</select>' +
												'<input id = "freedesc' + myfieldname + '" type="text" name="freedesc" style = "width:86px;font-size:13px" placeholder="Type text">' + 
											'</div>' +
										  	'<input type="radio" name="dolarType' + myfieldname + '" value="2" style = "margin-top:5px"> Assign variable<br>' +											  	
										'</form>' +
										'<div class="form-group" style="width:200px">' +
					                    	'<select class="form-control" id="varfilter' + myfieldname + '" required="required">' +						                    	
											'<option value=""></option>';
					                            for (var itx = 0;itx < varsArray.length; itx++){
									  				vModalText += '<option value=' + itx + '>' + varsArray[itx] + '</option>';											
									  			}					  			    
											vModalText += '</select></div><br>' +
									 	'<button id = "okvButton" type="button" class="btnStd btnStd-success" style="width: 68px;top:10%;position:relative;left:10px">OK</button>' +
									 	'<button id = "escvButton" type="button" class="btnStd btnStd-danger" style="width: 68px;top:10%;position:relative;left:30px">Cancel</button>' +
							 		'</div>' +
							 	'</div>' +	
							'</div></div>';
							vModalVar.innerHTML = vModalText;
							document.getElementById(myfieldname).appendChild(vModalVar.children[0]);
							
							var modalVar = document.getElementById('myModalVar');												
							var vOKVar   = document.getElementById("okvButton");
							var vEscVar  = document.getElementById("escvButton");
							modalVar.style.display = "block";

							vOKVar.onclick = function() {
								var myfield = this.id;
								var mydiv = document.getElementById(myfield)									
								var ParentID = mydiv.offsetParent;
								var ParentDiv = ParentID.childNodes[1].childNodes[0];
															
								myfield = ParentDiv.id.substring(6);
								
							  	var vFormVarID = 'formVar' + myfield;
							  	var vFormFreeFilterID = 'freefilter' + myfield;
							  	var vFormFreeDescID = 'freedesc' + myfield;
							  	var vFormVarsID = 'varfilter' + myfield;
							  	
							  	var vVarOption = document.getElementById(vFormVarID);								  	
							  	var vFreeFilter = document.getElementById(vFormFreeFilterID);
							  	var vFreeDesc = document.getElementById(vFormFreeDescID);								
							  	var vVarDrop = document.getElementById(vFormVarsID);
								if(vVarOption.elements[0].checked){
									addDolar(myfield,'pre','$(=Max([' + myfield + '])-1)',0,0);
								}else{
									if(vVarOption.elements[1].checked){
										var vfilfill = '';											
										var vfilfunc = vFreeFilter.options[vFreeFilter.selectedIndex].text;
										var vfilcont = vFreeDesc.value;
										switch (vfilfunc){
											case "=":
											vfilfill = '"' + vfilcont + '"';
											break;
											case ">":
											vfilfill = '">' + vfilcont + '"';
											break;
											case ">=":
											vfilfill = '">=' + vfilcont + '"';
											break;
											case "<":
											vfilfill = '"<' + vfilcont + '"';
											break;
											case "<=":
											vfilfill = '"<=' + vfilcont + '"';
											break;
											case "starts with":
											vfilfill = '"*' + vfilcont + '"';
											break;
											case "contains":
											vfilfill = '"*' + vfilcont + '*"';
											break;
											case "ends with":
											vfilfill = '"' + vfilcont + '*"';
											break;
										}
										addDolar(myfield,'fre',vfilfill,vfilfunc,vfilcont);
									}else{
										addDolar(myfield,'dol','$(' + vVarDrop.options[vVarDrop.selectedIndex].text + ')',0,vVarDrop.options[vVarDrop.selectedIndex].text);
									}
								}
								var vdol = "icondol" + myfield;
								var vall = "iconall" + myfield;
								var vadd = "iconadd" + myfield;
							  	var vdel = "iconexc" + myfield;
							  	document.getElementById(vdol).classList.add("lui-active");
						  		document.getElementById(vadd).classList.remove("lui-active");
						  		document.getElementById(vdel).classList.remove("lui-active");
						  		document.getElementById(vall).classList.remove("lui-active");

								$( "#myModalVar" ).remove();									
							}
							vEscVar.onclick = function() {
								$( "#myModalVar" ).remove();	
							}
							$("#myModalVar").draggable({
							    handle: ".modalVar-header"
							});
						});									
					
						$("#myModalFil").draggable({
						    handle: ".modal-header"
						});

						function addFilters(myfield){
							vNumChecks++;
							var vIndexChecked = fieldArrayUnchecked.indexOf(myfield);
							fieldArrayChecked.push(myfield);
							fieldArrayUnchecked.splice(vIndexChecked,1);

							//vCheckButtonBool = false;
							vAccessAdd = 1;							
							var vFiltroTest = '';														
							var myField = app.field(myfield).getData();													

							var vComaValues = '';
							myField.OnData.bind( function(){
								
								for (var ii = 0; ii < myField.rowCount; ii++){			
									
									if(ii == 0){
										vFiltroTest = '';
									}
									
									if(myField.rows[ii]){
										if(myField.rows[ii].qState == 'S'){
						   					vFiltroTest += vComaValues + "'" + myField.rows[ii].qText + "'";
						   					vComaValues = ',';					   					
						   				}
						   			}
					   			}
					   			if(vAccessAdd == 1){
					   				var vIndex = vArrayFilterFields.indexOf(myfield);
					   				var vIndexCh = fieldArrayChecked.indexOf(myfield);
					   				var vIndexUc = fieldArrayUnchecked.indexOf(myfield);
						   			if (vIndex < 0){
										vArrayFilterFields.push(myfield);
										vArrayFilterValues.push(vFiltroTest);
										vArrayFilterAction.push('add');										
									}else{
										vArrayFilterValues[vIndex] = vFiltroTest;
										vArrayFilterAction[vIndex] = 'add';
									}
									if(vIndexCh < 0){
										fieldArrayChecked.push(myfield);
									}
									if(vIndexUc >= 0){
										fieldArrayUnchecked.splice(vIndexUc,1);
									}
									vAccessAdd = 0;
									//document.getElementById("text-basic").innerHTML = 'Currently applied: ' + vArrayFilterFields.toString();
									if (vArrayFilterFields.toString().length < 80){
										document.getElementById("text-basic").innerHTML = 'Currently applied: ' + vArrayFilterFields.toString();
									}else{
										document.getElementById("text-basic").innerHTML = 'Currently applied: ' + vArrayFilterFields.toString().substring(0,70) + '... (' + vArrayFilterFields.length + ' fields)';									
									}
								}
							})							
						}

						function addAlert(myfield){
							swal("Warning!", "Please, select almost one", "warning");
						}

						function delFilters(myfield){		
							vNumChecks++;
							var vIndexChecked = fieldArrayUnchecked.indexOf(myfield);
							fieldArrayChecked.push(myfield);
							fieldArrayUnchecked.splice(vIndexChecked,1);

							//vCheckButtonBool = false;
							vAccessAdd = 1;							
							var vFiltroTest = '';														
							var myField = app.field(myfield).getData();							
							var vComaValues = '';
							myField.OnData.bind( function(){
								for (var ii = 0; ii < myField.rowCount; ii++){			
									
									if(ii == 0){
										vFiltroTest = '';
									}
									if(myField.rows[ii]){
										if(myField.rows[ii].qState == 'S'){
						   					vFiltroTest += vComaValues + "'" + myField.rows[ii].qText + "'";
						   					vComaValues = ',';					   					
						   				}
						   			}
					   			}
					   			if(vAccessAdd == 1){
					   				var vIndex = vArrayFilterFields.indexOf(myfield);
					   				var vIndexCh = fieldArrayChecked.indexOf(myfield);
					   				var vIndexUc = fieldArrayUnchecked.indexOf(myfield);
						   			if (vIndex < 0){
										vArrayFilterFields.push(myfield);
										vArrayFilterValues.push(vFiltroTest);
										vArrayFilterAction.push('del');								
									}else{
										vArrayFilterValues[vIndex] = vFiltroTest;
										vArrayFilterAction[vIndex] = 'Del';
									}
									if(vIndexCh < 0){
										fieldArrayChecked.push(myfield);
									}
									if(vIndexUc >= 0){
										fieldArrayUnchecked.splice(vIndexUc,1);
									}
									vAccessAdd = 0;
									app.field(myfield).selectAlternative();
									if (vArrayFilterFields.toString().length < 80){
										document.getElementById("text-basic").innerHTML = 'Currently applied: ' + vArrayFilterFields.toString();
									}else{
										document.getElementById("text-basic").innerHTML = 'Currently applied: ' + vArrayFilterFields.toString().substring(0,70) + '... (' + vArrayFilterFields.length + ' fields)';									
									}
									//document.getElementById("text-basic").innerHTML = 'Currently applied: ' + vArrayFilterFields.toString();	
								}
							})													
						}
						function allFilters(myfield){
							vNumChecks++;
							var vIndexChecked = fieldArrayUnchecked.indexOf(myfield);
							fieldArrayChecked.push(myfield);
							fieldArrayUnchecked.splice(vIndexChecked,1);

							//vCheckButtonBool = false;
							app.field(myfield).selectAll();
							var vIndex = vArrayFilterFields.indexOf(myfield);
							var vIndexCh = fieldArrayChecked.indexOf(myfield);
					   		var vIndexUc = fieldArrayUnchecked.indexOf(myfield);					
							if (vIndex < 0){
								vArrayFilterFields.push(myfield);
								vArrayFilterValues.push('*');
								vArrayFilterAction.push('all');								
							}else{
								vArrayFilterValues[vIndex] = '*';
								vArrayFilterAction[vIndex] = 'all';								
							}
							if(vIndexCh < 0){
								fieldArrayChecked.push(myfield);
							}
							if(vIndexUc >= 0){
								fieldArrayUnchecked.splice(vIndexUc,1);
							}
							//document.getElementById("text-basic").innerHTML = 'Currently applied: ' + vArrayFilterFields.toString();	
							if (vArrayFilterFields.toString().length < 80){
								document.getElementById("text-basic").innerHTML = 'Currently applied: ' + vArrayFilterFields.toString();
							}else{
								document.getElementById("text-basic").innerHTML = 'Currently applied: ' + vArrayFilterFields.toString().substring(0,70) + '... (' + vArrayFilterFields.length + ' fields)';									
							}
						}
						function addDolar(myfield,type,value,func,content){	
							vNumChecks++;
							var vIndexChecked = fieldArrayUnchecked.indexOf(myfield);
							fieldArrayChecked.push(myfield);
							fieldArrayUnchecked.splice(vIndexChecked,1);

							//vCheckButtonBool = false;						
							var vIndex = vArrayFilterFields.indexOf(myfield);
							var vIndexCh = fieldArrayChecked.indexOf(myfield);
					   		var vIndexUc = fieldArrayUnchecked.indexOf(myfield);
							var vFiltroTest = '';
							if (vIndex < 0){
								vArrayFilterFields.push(myfield);
								vArrayFilterValues.push(value);
								vArrayFilterAction.push(type);
								vArrayFilterDolarFreeFunc.push(func);
								vArrayFilterDolarFreeContent.push(content);
							}else{
								vArrayFilterFields[vIndex] = myfield;
								vArrayFilterValues[vIndex] = value;
								vArrayFilterAction[vIndex] = type;
								vArrayFilterDolarFreeFunc[vIndex] = func;
								vArrayFilterDolarFreeContent[vIndex] = content;
							}
							if(vIndexCh < 0){
								fieldArrayChecked.push(myfield);
							}
							if(vIndexUc >= 0){
								fieldArrayUnchecked.splice(vIndexUc,1);
							}
							//document.getElementById("text-basic").innerHTML = 'Currently applied: ' + vArrayFilterFields.toString();
							if (vArrayFilterFields.toString().length < 80){
								document.getElementById("text-basic").innerHTML = 'Currently applied: ' + vArrayFilterFields.toString();
							}else{
								document.getElementById("text-basic").innerHTML = 'Currently applied: ' + vArrayFilterFields.toString().substring(0,70) + '... (' + vArrayFilterFields.length + ' fields)';									
							}
						}
				}		
				
				vCreateUpdateButton.onclick = function() {
					var checkContent = document.getElementById('CheckFormula').value;
					if (checkContent.length > 0) {
						if (vCreateUpdate == 'Create') {
							var fNam = document.getElementById('formulaName').value;
							var expression = document.getElementById('CheckFormula').value;					
							if (fNam.length > 0) {
								if (measArray.indexOf(fNam) < 0) {
									swal({
									  title: "Are you sure?",
									  text: "The master measure " + fNam + " will be created",
									  type: "warning",
									  showCancelButton: true,
									  confirmButtonColor: "#5cb85c",
									  confirmButtonText: "Yes, proceed!",
									  cancelButtonText: "No, cancel plx!",
									  closeOnConfirm: false,
									  closeOnCancel: false
									},
									function(isConfirm) {
									  if (isConfirm) {
									  	var mesJSON =
										{
											qInfo: {
												qType: "measure"
											},
											qMeasure: {
												qLabel:fNam,
												qGrouping: "N",
												qDef: expression,
												qExpressions:[],
												qActiveExpression: 0
											},
											qMetaDef: {
												title:fNam,
												description:"",
												tags:[]
											}
										};
										vEM.createMeasure(mesJSON);
									    swal("Created!", "Your new measure " + fNam + " has been created", "success");
									    resetWizard();
									  } else {
									    swal("Cancelled", "Your request has been canceled", "error");
									  }
									});
									
								} else {
									swal("Warning!", "The measure name is already in use!", "warning");
								}
							} else {
								swal("Warning!", "Introduce a name for that measure", "warning");
							}			
						} else {
							var mObj = document.getElementById("measuresold");					
							var mNam = mObj.options[mObj.selectedIndex].text;
							var expression = document.getElementById('CheckFormula').value;
							var vIndexOfmId = 0;
							var mId = '';
							if(mNam.length == 0){
								swal("Warning!", "You must select a measure", "warning");
							}else{
								swal({
								  title: "Are you sure?",
								  text: "The master measure " + mNam + " will be updated",
								  type: "warning",
								  showCancelButton: true,
								  confirmButtonColor: "#5cb85c",
								  confirmButtonText: "Yes, proceed!",
								  cancelButtonText: "No, cancel plx!",
								  closeOnConfirm: false,
								  closeOnCancel: false
								},
								function(isConfirm){
									if (isConfirm) {			
									    for(var vWhere = 0;vWhere < measArray.length;vWhere++){
											vIndexOfmId = measIdArray[vWhere].indexOf('#-*-#');
											var vMeasLabel = measIdArray[vWhere].substring(0,vIndexOfmId);
											if(vMeasLabel == mNam){
												mId = measIdArray[vWhere].substring(5 + vIndexOfmId);											
												vWhere = 99999999;
											}									
										}
										var measJSON = [];
										vEU.getMeasure(mId).then(function(reply){
											reply.getProperties().then(function(values){
												values.qMeasure.qDef = expression;											
												reply.setProperties(values);											
											})
										});
									    swal("Updated!", "Your previous measure " + mNam + " has been updated", "success");
									    resetWizard();
									} else {
									    swal("Cancelled", "Your request has been canceled", "error");
									}
								});								
							}
						}
					}else{
						swal("Warning!", "Please add content to your formula, clicking 'Add it' or manually", "warning");
					}					
				}	
		}

		return {
			initialProperties : {
				version : 1.0,
				qBookmarkListDef : {
					qType : "bookmark",
					qData : {
						title : "/title",
						description : "/description"
					}
				},
				qFieldListDef : {
				}
			},

		definition : {
			type : "items",
			component : "accordion",
			items : {
				buttons : {
					type : "items",
					label : "Filter Options",
					items : {
					//create boolean buttons for justification and color theme						
						DimensionFields:{
							ref: "buttons.dimfields",
							translation: "Filter Options",
							type: "number",
							component: "buttongroup",
							options: [ {
								value: 1,
								label: "Fields"
							}, {
								value: 2,
								label: "Dimensions"
							}],
							defaultValue: 1
						},
						SumFieldsBool : {
							ref : "buttons.sumFieldsBool",
							type : "boolean",
							component : "switch",
							label : "Only specific sum fields",
							options: [{
								value: true,
								label: "On"
							}, {
								value: false,
								label: "Off"
							}],
							defaultValue: false
						},
						SumField1 : {
							ref : "buttons.sumField1",
							label : "Valid field 1",
							expression : "optional",
							type : "string",
							defaultValue : ''
						},
						SumField2 : {
							ref : "buttons.sumField2",
							label : "Valid field 2",
							expression : "optional",
							type : "string",
							defaultValue : ''
						},
						SumField3 : {
							ref : "buttons.sumField3",
							label : "Valid field 3",
							expression : "optional",
							type : "string",
							defaultValue : ''
						},
						SumField4 : {
							ref : "buttons.sumField4",
							label : "Valid field 4",
							expression : "optional",
							type : "string",
							defaultValue : ''
						},
						SumField5 : {
							ref : "buttons.sumField5",
							label : "Valid field 5",
							expression : "optional",
							type : "string",
							defaultValue : ''
						},
						SumField6 : {
							ref : "buttons.sumField6",
							label : "Valid field 6",
							expression : "optional",
							type : "string",
							defaultValue : ''
						},
						SumField7 : {
							ref : "buttons.sumField7",
							label : "Valid field 7",
							expression : "optional",
							type : "string",
							defaultValue : ''
						},
						SumField8 : {
							ref : "buttons.sumField8",
							label : "Valid field 8",
							expression : "optional",
							type : "string",
							defaultValue : ''
						},
						SumField9 : {
							ref : "buttons.sumField9",
							label : "Valid field 9",
							expression : "optional",
							type : "string",
							defaultValue : ''
						},
						SumField10 : {
							ref : "buttons.sumField10",
							label : "Valid field 10",
							expression : "optional",
							type : "string",
							defaultValue : ''
						}
					}
				},
				settings : {
					uses : "settings"
				}
			}
		},		
		
		paint: function ( $element, layout) {
	
			vFilterOp = layout.buttons.dimfields;
			
			vSpecificSum = layout.buttons.sumFieldsBool;
			

			sumFieldsArray[0] = layout.buttons.sumField1;
			sumFieldsArray[1] = layout.buttons.sumField2;
			sumFieldsArray[2] = layout.buttons.sumField3;
			sumFieldsArray[3] = layout.buttons.sumField4;
			sumFieldsArray[4] = layout.buttons.sumField5;
			sumFieldsArray[5] = layout.buttons.sumField6;
			sumFieldsArray[6] = layout.buttons.sumField7;
			sumFieldsArray[7] = layout.buttons.sumField8;
			if(layout.buttons.sumField9){
				sumFieldsArray[8] = layout.buttons.sumField9;
			}
			if(layout.buttons.sumField10){
				sumFieldsArray[9] = layout.buttons.sumField10;
			}

			var htmlIni = '';
			htmlIni += 
			'<div id="wizdial" class = "wizarddialogMM">' +
				'<span class="lui-icon  placeholderIconSheet  lui-icon--link"></span>' +
				'<br><p style="padding-left:10px">Master Measure Wizard</p>' +					
				'<button  id = "UpdateButton" class="lui-button" style = "margin-top:5px;width:70px">Update</button>' +					
				'<button  id = "CreateButton" class="lui-button" style = "margin-top:5px;width:70px;left:10px">Create</button>' +
			'</div>';
			$element.html(htmlIni);
			var vCreateButton = document.getElementById('CreateButton');
			var vUpdateButton = document.getElementById('UpdateButton');
			vCreateButton.onclick = function() {
				vCreateUpdate = 'Create';
				vCreateButton.disabled = true;
				vUpdateButton.disabled = true;
				getFieldsList($element, layout);		
			}
			vUpdateButton.onclick = function() {
				vCreateUpdate = 'Update';
				vCreateButton.disabled = true;
				vUpdateButton.disabled = true;
				getFieldsList($element, layout);		
			}							
		}
	};
});
