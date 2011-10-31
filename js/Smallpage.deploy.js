smalltalk.addPackage('Smallpage', []);
smalltalk.addClass('SPCouchConnector', smalltalk.Object, ['couchUrl', 'database'], 'Smallpage');
smalltalk.addMethod(
'_couchUrl',
smalltalk.method({
selector: 'couchUrl',
fn: function (){
var self=this;
return self['@couchUrl'];
return self;}
}),
smalltalk.SPCouchConnector);

smalltalk.addMethod(
'_couchUrl_',
smalltalk.method({
selector: 'couchUrl:',
fn: function (aCouchUrl){
var self=this;
self['@couchUrl']=aCouchUrl;
return self;}
}),
smalltalk.SPCouchConnector);

smalltalk.addMethod(
'_database',
smalltalk.method({
selector: 'database',
fn: function (){
var self=this;
return self['@database'];
return self;}
}),
smalltalk.SPCouchConnector);

smalltalk.addMethod(
'_database_',
smalltalk.method({
selector: 'database:',
fn: function (aDatabaseName){
var self=this;
self['@database']=aDatabaseName;
return self;}
}),
smalltalk.SPCouchConnector);

smalltalk.addMethod(
'_initialize',
smalltalk.method({
selector: 'initialize',
fn: function (){
var self=this;
smalltalk.send(self, "_initialize", [], smalltalk.Object);
self['@couchUrl']=unescape("https%3A//semka.cloudant.com/");
return self;}
}),
smalltalk.SPCouchConnector);

smalltalk.addMethod(
'_request_callback_',
smalltalk.method({
selector: 'request:callback:',
fn: function (document, aBlock){
var self=this;
var result=nil;
var data=nil;
result=smalltalk.send((typeof jQuery == 'undefined' ? nil : jQuery), "_ajax_options_", [smalltalk.send(smalltalk.send(smalltalk.send(self['@couchUrl'], "__comma", [self['@database']]), "__comma", [unescape("/")]), "__comma", [document]), smalltalk.Dictionary._fromPairs_([smalltalk.send("type", "__minus_gt", ["GET"]),smalltalk.send("success", "__minus_gt", [(function(response){return smalltalk.send(aBlock, "_value_", [response]);})]),smalltalk.send("error", "__minus_gt", [(function(error){return smalltalk.send((smalltalk.Transcript || Transcript), "_show_", ["error"]);})]),smalltalk.send("dataType", "__minus_gt", ["jsonp"])])]);
return data;
return self;}
}),
smalltalk.SPCouchConnector);



smalltalk.addClass('SPProfiles', smalltalk.Widget, ['profiles'], 'Smallpage');
smalltalk.addMethod(
'_documentReceived_',
smalltalk.method({
selector: 'documentReceived:',
fn: function (aDocument){
var self=this;
self['@profiles']=smalltalk.send(aDocument, "_rows", []);
smalltalk.send(self, "_appendToJQuery_", [smalltalk.send(unescape("%23profiles"), "_asJQuery", [])]);
smalltalk.send(smalltalk.send(unescape("%23profiles"), "_asJQuery", []), "_fadeIn", []);
return self;}
}),
smalltalk.SPProfiles);

smalltalk.addMethod(
'_initialize',
smalltalk.method({
selector: 'initialize',
fn: function (){
var self=this;
var connector=nil;
smalltalk.send(self, "_initialize", [], smalltalk.Widget);
connector=smalltalk.send(smalltalk.send((smalltalk.SPCouchConnector || SPCouchConnector), "_new", []), "_database_", ["profiles"]);
smalltalk.send(connector, "_request_callback_", [unescape("_design/profiles/_view/all"), (function(result){return smalltalk.send(self, "_documentReceived_", [result]);})]);
return self;}
}),
smalltalk.SPProfiles);

smalltalk.addMethod(
'_renderOn_',
smalltalk.method({
selector: 'renderOn:',
fn: function (html){
var self=this;
smalltalk.send(smalltalk.send(html, "_div", []), "_with_", [(function(){smalltalk.send(smalltalk.send(html, "_h1", []), "_with_", [unescape("%u041F%u0440%u0438%u0432%u0435%u0442")]);smalltalk.send(smalltalk.send(html, "_p", []), "_with_", [unescape("%u041C%u0435%u043D%u044F%20%u0437%u043E%u0432%u0443%u0442%20%u0421%u0435%u043C%u0451%u043D%20%u041D%u043E%u0432%u0438%u043A%u043E%u0432.")]);smalltalk.send(smalltalk.send(html, "_p", []), "_with_", [unescape("%u0412%u043E%u0442%20%u043F%u0440%u0438%u043C%u0435%u0440%u043D%u044B%u0439%20%u0441%u043F%u0438%u0441%u043E%u043A%20%u0441%u043F%u043E%u0441%u043E%u0431%u043E%u0432%20%u0441%u043E%20%u043C%u043D%u043E%u0439%20%u0441%u0432%u044F%u0437%u0430%u0442%u044C%u0441%u044F%3A")]);smalltalk.send(self['@profiles'], "_do_", [(function(each){return (function($rec){smalltalk.send($rec, "_href_", [smalltalk.send(smalltalk.send(each, "_value", []), "_url", [])]);return smalltalk.send($rec, "_with_", [smalltalk.send(smalltalk.send(html, "_img", []), "_src_", [smalltalk.send(smalltalk.send(each, "_value", []), "_icon", [])])]);})(smalltalk.send(html, "_a", []));})]);smalltalk.send(smalltalk.send(html, "_p", []), "_with_", [(function(){smalltalk.send(html, "_with_", [unescape("%u0415%u0441%u043B%u0438%20%u0412%u044B%20%u043F%u043E%20%u0434%u0435%u043B%u0443%2C%20%u0442%u043E%2C%20%u043C%u043E%u0436%u0435%u0442%20%u0431%u044B%u0442%u044C%2C%20%u0432%u0430%u043C%20%u043D%u0443%u0436%u043D%u043E%20%u043F%u043E%u0441%u043C%u043E%u0442%u0440%u0435%u0442%u044C%20%u043C%u043E%u0451%20")]);(function($rec){smalltalk.send($rec, "_href_", [unescape("http%3A//sdfgh153.moikrug.ru")]);return smalltalk.send($rec, "_with_", [unescape("%u0440%u0435%u0437%u044E%u043C%u0435%20")]);})(smalltalk.send(html, "_a", []));smalltalk.send(html, "_with_", [unescape("%u0438%u043B%u0438%20")]);return (function($rec){smalltalk.send($rec, "_href_", [unescape("http%3A//github.com/semka/")]);return smalltalk.send($rec, "_with_", [unescape("%u043A%u043E%u0434.")]);})(smalltalk.send(html, "_a", []));})]);return smalltalk.send(smalltalk.send(html, "_p", []), "_with_", [(function(){smalltalk.send(html, "_with_", [unescape("%u042F%20%u0440%u0430%u0431%u043E%u0442%u0430%u044E%20%u0432%20%u043F%u0440%u0435%u043A%u0440%u0430%u0441%u043D%u043E%u0439%20%u043A%u043E%u043D%u0442%u043E%u0440%u0435%20")]);(function($rec){smalltalk.send($rec, "_href_", [unescape("http%3A//gipis.ru")]);return smalltalk.send($rec, "_with_", ["Gipis"]);})(smalltalk.send(html, "_a", []));smalltalk.send(html, "_with_", [unescape("%2C%20%u0433%u0434%u0435%20%u043F%u0438%u0448%u0443%20%u0441%u043E%u0444%u0442%20%u0434%u043B%u044F%20iOS.%20")]);return smalltalk.send(html, "_with_", [unescape("%u041B%u044E%u0431%u043B%u044E%20%u043C%u0430%u0442%u0435%u043C%u0430%u0442%u0438%u043A%u0443%2C%20%u0436%u0435%u043D%u0443%20%u0438%20%u0430%u043A%u0430%u0434%u0435%u043C%u0438%u0447%u0435%u0441%u043A%u0443%u044E%20%u043C%u0443%u0437%u044B%u043A%u0443.%20%u041E%u0447%u0435%u043D%u044C%20%u043C%u0435%u0434%u043B%u0435%u043D%u043D%u043E%20%u0434%u0443%u043C%u0430%u044E%20%u0438%20%u043F%u0440%u0430%u0432%u0434%u0430%20%u043D%u0435%20%u0437%u043D%u0430%u044E%2C%20%u0447%u0442%u043E%20%u0437%u043D%u0430%u0447%u0438%u0442%20%u043C%u043E%u0439%20%u043D%u0438%u043A.")]);})]);})]);
return self;}
}),
smalltalk.SPProfiles);



smalltalk.addClass('SPContent', smalltalk.Widget, ['content'], 'Smallpage');
smalltalk.addMethod(
'_renderOn_',
smalltalk.method({
selector: 'renderOn:',
fn: function (html){
var self=this;
smalltalk.send(smalltalk.send(unescape("%23about_me"), "_asJQuery", []), "_html_", [smalltalk.send(self['@content'], "_text", [])]);
return self;}
}),
smalltalk.SPContent);

smalltalk.addMethod(
'_documentReceived_',
smalltalk.method({
selector: 'documentReceived:',
fn: function (document){
var self=this;
self['@content']=document;
smalltalk.send(self, "_clean", []);
smalltalk.send(self, "_appendToJQuery_", [smalltalk.send(unescape("%23about_me"), "_asJQuery", [])]);
smalltalk.send(smalltalk.send(unescape("%23content"), "_asJQuery", []), "_fadeIn", []);
smalltalk.send(smalltalk.send(unescape("%23about_me"), "_asJQuery", []), "_fadeIn", []);
return self;}
}),
smalltalk.SPContent);

smalltalk.addMethod(
'_requestAboutMe',
smalltalk.method({
selector: 'requestAboutMe',
fn: function (){
var self=this;
var connector=nil;
connector=smalltalk.send(smalltalk.send((smalltalk.SPCouchConnector || SPCouchConnector), "_new", []), "_database_", ["texts"]);
smalltalk.send(connector, "_request_callback_", ["about_me", (function(result){return smalltalk.send(self, "_documentReceived_", [result]);})]);
return self;}
}),
smalltalk.SPContent);

smalltalk.addMethod(
'_clean',
smalltalk.method({
selector: 'clean',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(unescape("%23about_me"), "_asJQuery", []), "_html_", [""]);
return self;}
}),
smalltalk.SPContent);



smalltalk.addClass('SPArticles', smalltalk.Widget, ['articles'], 'Smallpage');
smalltalk.addMethod(
'_documentReceived_',
smalltalk.method({
selector: 'documentReceived:',
fn: function (articlesList){
var self=this;
self['@articles']=smalltalk.send(articlesList, "_rows", []);
smalltalk.send(self, "_appendToJQuery_", [smalltalk.send(unescape("%23articles"), "_asJQuery", [])]);
smalltalk.send(smalltalk.send(unescape("%23articles"), "_asJQuery", []), "_fadeIn", []);
return self;}
}),
smalltalk.SPArticles);

smalltalk.addMethod(
'_clean',
smalltalk.method({
selector: 'clean',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(unescape("%23articles"), "_asJQuery", []), "_html_", [""]);
return self;}
}),
smalltalk.SPArticles);

smalltalk.addMethod(
'_requestArticles',
smalltalk.method({
selector: 'requestArticles',
fn: function (){
var self=this;
var connector=nil;
connector=smalltalk.send(smalltalk.send((smalltalk.SPCouchConnector || SPCouchConnector), "_new", []), "_database_", ["articles"]);
smalltalk.send(connector, "_request_callback_", [unescape("_design/all/_view/all_documents"), (function(result){return smalltalk.send(self, "_documentReceived_", [result]);})]);
return self;}
}),
smalltalk.SPArticles);

smalltalk.addMethod(
'_renderOn_',
smalltalk.method({
selector: 'renderOn:',
fn: function (html){
var self=this;
smalltalk.send(smalltalk.send(html, "_ol", []), "_with_", [(function(){return smalltalk.send(self['@articles'], "_do_", [(function(each){return smalltalk.send(smalltalk.send(html, "_li", []), "_with_", [(function(){return (function($rec){smalltalk.send($rec, "_href_", [smalltalk.send(smalltalk.send(each, "_value", []), "_url", [])]);return smalltalk.send($rec, "_with_", [smalltalk.send(each, "_key", [])]);})(smalltalk.send(html, "_a", []));})]);})]);})]);
return self;}
}),
smalltalk.SPArticles);



