# Master Measure Wizard
Author:Ivan Felipe ivan.felipe@qlik.com
QlikTech Iberia,s.l.

Qlik Sense Extension for creating/updating a master measure

This extension helps users to build their first measure through a userfriendly interface.
Taking profit of the Associate Logic to create expressions in a based on Qlik filters environment.

It does not contain all the Set Analysis capabilities but nevertheless can be very useful for workshops (where there are users with still low Qlik Sense knowledge) and help to set filters in your expressions without syntax errors.

This extension is provided 'as is' and may stop working at any time (i.e. when changes are made to the Qlik Sense APIs).

Bootstrap.js and sweetalert was used for styling

Other present Features:
<UL>
  <li>Ability to work with basic fields or dimensions</li>
  <li>Select which fields should be the only ones available for certain mathematical operations</li>
  <li>Apply variables</li>
  <li>Some extra Set Analysis functions as previous year, match by start, ends...</li>
  <li>Possibility of creating formulas with several terms ((x-y) / x) * z ...</li>
</UL>

![alt tag](https://github.com/iviasensio/Guides/blob/master/MMW/10.png)

How to:
Start chosing Create a new measure or just update an old one
![alt tag](https://github.com/iviasensio/Guides/blob/master/MMW/1.png)

Chose a basic mathematical function: sum, count... check distinct values if needed
![alt tag](https://github.com/iviasensio/Guides/blob/master/MMW/2.png)

Then select the fields you want to count or sum
![alt tag](https://github.com/iviasensio/Guides/blob/master/MMW/3.png)

You can set all fields or working with dimensions, and also you can select which fields may appear when Sum, Avg, Min and Max
![alt tag](https://github.com/iviasensio/Guides/blob/master/MMW/4.png)

Click on Filter it to access to a new filter window
![alt tag](https://github.com/iviasensio/Guides/blob/master/MMW/5.png)

Select the fields where you want to apply some filters, then click + (for add the values to the filters), * (for ignore the selections for that field), - (to exclude the values of this field) or the magic wand ·/· (to work with previosu year, variables and others)
![alt tag](https://github.com/iviasensio/Guides/blob/master/MMW/6.png)

Click on Add it to add your expresssion to the text box without syntax errors, you can manipualte the content of the formula text box, i.e. you can add a expression and then include + and add an other expression
![alt tag](https://github.com/iviasensio/Guides/blob/master/MMW/7.png)

Click on Check it if you want to test the result, this will check the content of the text box, including the manual additions
![alt tag](https://github.com/iviasensio/Guides/blob/master/MMW/8.png)

Click on Create (or Update) to create a new Master Measure
![alt tag](https://github.com/iviasensio/Guides/blob/master/MMW/9.png)
