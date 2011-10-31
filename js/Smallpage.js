smalltalk.addPackage('Smallpage', []);
smalltalk.addClass('SPCouchConnector', smalltalk.Object, ['couchUrl', 'database'], 'Smallpage');
smalltalk.SPCouchConnector.comment=unescape('%22CouchDB%20connector%20for%20Smallpage%20app.%22')
smalltalk.addMethod(
unescape('_couchUrl'),
smalltalk.method({
selector: unescape('couchUrl'),
category: 'accessing',
fn: function (){
var self=this;
return self['@couchUrl'];
return self;},
args: [],
source: unescape('couchUrl%0A%09%5EcouchUrl'),
messageSends: [],
referencedClasses: []
}),
smalltalk.SPCouchConnector);

smalltalk.addMethod(
unescape('_couchUrl_'),
smalltalk.method({
selector: unescape('couchUrl%3A'),
category: 'accessing',
fn: function (aCouchUrl){
var self=this;
self['@couchUrl']=aCouchUrl;
return self;},
args: ["aCouchUrl"],
source: unescape('couchUrl%3A%20aCouchUrl%0A%09couchUrl%20%3A%3D%20aCouchUrl.'),
messageSends: [],
referencedClasses: []
}),
smalltalk.SPCouchConnector);

smalltalk.addMethod(
unescape('_database'),
smalltalk.method({
selector: unescape('database'),
category: 'accessing',
fn: function (){
var self=this;
return self['@database'];
return self;},
args: [],
source: unescape('database%0A%09%5Edatabase.'),
messageSends: [],
referencedClasses: []
}),
smalltalk.SPCouchConnector);

smalltalk.addMethod(
unescape('_database_'),
smalltalk.method({
selector: unescape('database%3A'),
category: 'accessing',
fn: function (aDatabaseName){
var self=this;
self['@database']=aDatabaseName;
return self;},
args: ["aDatabaseName"],
source: unescape('database%3A%20aDatabaseName%0A%09database%20%3A%3D%20aDatabaseName.'),
messageSends: [],
referencedClasses: []
}),
smalltalk.SPCouchConnector);

smalltalk.addMethod(
unescape('_initialize'),
smalltalk.method({
selector: unescape('initialize'),
category: 'initialization',
fn: function (){
var self=this;
smalltalk.send(self, "_initialize", [], smalltalk.Object);
self['@couchUrl']=unescape("https%3A//semka.cloudant.com/");
return self;},
args: [],
source: unescape('initialize%0A%09super%20initialize.%0A%09%22This%20is%20debug%20url%22%0A%09couchUrl%20%3A%3D%20%27https%3A//semka.cloudant.com/%27.'),
messageSends: ["initialize"],
referencedClasses: []
}),
smalltalk.SPCouchConnector);

smalltalk.addMethod(
unescape('_request_callback_'),
smalltalk.method({
selector: unescape('request%3Acallback%3A'),
category: 'requesting',
fn: function (document, aBlock){
var self=this;
var result=nil;
var data=nil;
result=smalltalk.send((typeof jQuery == 'undefined' ? nil : jQuery), "_ajax_options_", [smalltalk.send(smalltalk.send(smalltalk.send(self['@couchUrl'], "__comma", [self['@database']]), "__comma", [unescape("/")]), "__comma", [document]), smalltalk.Dictionary._fromPairs_([smalltalk.send("type", "__minus_gt", ["GET"]),smalltalk.send("success", "__minus_gt", [(function(response){return smalltalk.send(aBlock, "_value_", [response]);})]),smalltalk.send("error", "__minus_gt", [(function(error){return smalltalk.send((smalltalk.Transcript || Transcript), "_show_", ["error"]);})]),smalltalk.send("dataType", "__minus_gt", ["jsonp"])])]);
return data;
return self;},
args: ["document", "aBlock"],
source: unescape('request%3A%20document%20callback%3A%20aBlock%0A%09%7Cresult%20data%7C%0A%09result%20%3A%3D%20jQuery%20ajax%3A%20%28couchUrl%2C%20database%2C%20%27/%27%20%2C%20document%29%0A%09%09%09%09%20%20options%3A%20%23%7B%0A%09%09%09%09%09%27type%27%20-%3E%20%27GET%27.%0A%09%09%09%09%09%27success%27%20-%3E%20%5B%3Aresponse%20%7C%20aBlock%20value%3A%20response%5D.%0A%09%09%09%09%09%27error%27%20-%3E%20%5B%3Aerror%20%7C%20Transcript%20show%3A%20%27error%27%5D.%0A%09%09%09%09%09%27dataType%27%20-%3E%20%27jsonp%27%7D.%0A%09%5Edata'),
messageSends: ["ajax:options:", unescape("%2C"), unescape("-%3E"), "value:", "show:"],
referencedClasses: ["Transcript"]
}),
smalltalk.SPCouchConnector);



smalltalk.addClass('SPProfiles', smalltalk.Widget, ['profiles'], 'Smallpage');
smalltalk.addMethod(
unescape('_documentReceived_'),
smalltalk.method({
selector: unescape('documentReceived%3A'),
category: 'connection',
fn: function (aDocument){
var self=this;
self['@profiles']=smalltalk.send(aDocument, "_rows", []);
smalltalk.send(self, "_appendToJQuery_", [smalltalk.send(unescape("%23profiles"), "_asJQuery", [])]);
smalltalk.send(smalltalk.send(unescape("%23profiles"), "_asJQuery", []), "_fadeIn", []);
return self;},
args: ["aDocument"],
source: unescape('documentReceived%3A%20aDocument%0A%09%22Handle%20async%20documents%20collection%20loading%22%0A%09profiles%20%3A%3D%20aDocument%20rows.%0A%09self%20appendToJQuery%3A%20%28%27%23profiles%27%20asJQuery%29.%0A%09%28%27%23profiles%27%20asJQuery%29%20fadeIn.'),
messageSends: ["rows", "appendToJQuery:", "asJQuery", "fadeIn"],
referencedClasses: []
}),
smalltalk.SPProfiles);

smalltalk.addMethod(
unescape('_initialize'),
smalltalk.method({
selector: unescape('initialize'),
category: 'initialization',
fn: function (){
var self=this;
var connector=nil;
smalltalk.send(self, "_initialize", [], smalltalk.Widget);
connector=smalltalk.send(smalltalk.send((smalltalk.SPCouchConnector || SPCouchConnector), "_new", []), "_database_", ["profiles"]);
smalltalk.send(connector, "_request_callback_", [unescape("_design/profiles/_view/all"), (function(result){return smalltalk.send(self, "_documentReceived_", [result]);})]);
return self;},
args: [],
source: unescape('initialize%0A%09%7Cconnector%7C%0A%09super%20initialize.%0A%09connector%20%3A%3D%20SPCouchConnector%20new%20database%3A%20%27profiles%27.%0A%09connector%20request%3A%20%27_design/profiles/_view/all%27%0A%09%09%09%20callback%3A%20%5B%3Aresult%20%7C%20self%20documentReceived%3A%20result%5D.'),
messageSends: ["initialize", "database:", "new", "request:callback:", "documentReceived:"],
referencedClasses: ["SPCouchConnector"]
}),
smalltalk.SPProfiles);

smalltalk.addMethod(
unescape('_renderOn_'),
smalltalk.method({
selector: unescape('renderOn%3A'),
category: 'rendering',
fn: function (html){
var self=this;
smalltalk.send(smalltalk.send(html, "_div", []), "_with_", [(function(){smalltalk.send(smalltalk.send(html, "_h1", []), "_with_", [unescape("%u041F%u0440%u0438%u0432%u0435%u0442")]);smalltalk.send(smalltalk.send(html, "_p", []), "_with_", [unescape("%u041C%u0435%u043D%u044F%20%u0437%u043E%u0432%u0443%u0442%20%u0421%u0435%u043C%u0451%u043D%20%u041D%u043E%u0432%u0438%u043A%u043E%u0432.")]);smalltalk.send(smalltalk.send(html, "_p", []), "_with_", [unescape("%u0412%u043E%u0442%20%u043F%u0440%u0438%u043C%u0435%u0440%u043D%u044B%u0439%20%u0441%u043F%u0438%u0441%u043E%u043A%20%u0441%u043F%u043E%u0441%u043E%u0431%u043E%u0432%20%u0441%u043E%20%u043C%u043D%u043E%u0439%20%u0441%u0432%u044F%u0437%u0430%u0442%u044C%u0441%u044F%3A")]);smalltalk.send(self['@profiles'], "_do_", [(function(each){return (function($rec){smalltalk.send($rec, "_href_", [smalltalk.send(smalltalk.send(each, "_value", []), "_url", [])]);return smalltalk.send($rec, "_with_", [smalltalk.send(smalltalk.send(html, "_img", []), "_src_", [smalltalk.send(smalltalk.send(each, "_value", []), "_icon", [])])]);})(smalltalk.send(html, "_a", []));})]);smalltalk.send(smalltalk.send(html, "_p", []), "_with_", [(function(){smalltalk.send(html, "_with_", [unescape("%u0415%u0441%u043B%u0438%20%u0412%u044B%20%u043F%u043E%20%u0434%u0435%u043B%u0443%2C%20%u0442%u043E%2C%20%u043C%u043E%u0436%u0435%u0442%20%u0431%u044B%u0442%u044C%2C%20%u0432%u0430%u043C%20%u043D%u0443%u0436%u043D%u043E%20%u043F%u043E%u0441%u043C%u043E%u0442%u0440%u0435%u0442%u044C%20%u043C%u043E%u0451%20")]);(function($rec){smalltalk.send($rec, "_href_", [unescape("http%3A//sdfgh153.moikrug.ru")]);return smalltalk.send($rec, "_with_", [unescape("%u0440%u0435%u0437%u044E%u043C%u0435%20")]);})(smalltalk.send(html, "_a", []));smalltalk.send(html, "_with_", [unescape("%u0438%u043B%u0438%20")]);return (function($rec){smalltalk.send($rec, "_href_", [unescape("http%3A//github.com/semka/")]);return smalltalk.send($rec, "_with_", [unescape("%u043A%u043E%u0434.")]);})(smalltalk.send(html, "_a", []));})]);return smalltalk.send(smalltalk.send(html, "_p", []), "_with_", [(function(){smalltalk.send(html, "_with_", [unescape("%u042F%20%u0440%u0430%u0431%u043E%u0442%u0430%u044E%20%u0432%20%u043F%u0440%u0435%u043A%u0440%u0430%u0441%u043D%u043E%u0439%20%u043A%u043E%u043D%u0442%u043E%u0440%u0435%20")]);(function($rec){smalltalk.send($rec, "_href_", [unescape("http%3A//gipis.ru")]);return smalltalk.send($rec, "_with_", ["Gipis"]);})(smalltalk.send(html, "_a", []));smalltalk.send(html, "_with_", [unescape("%2C%20%u0433%u0434%u0435%20%u043F%u0438%u0448%u0443%20%u0441%u043E%u0444%u0442%20%u0434%u043B%u044F%20iOS.%20")]);return smalltalk.send(html, "_with_", [unescape("%u041B%u044E%u0431%u043B%u044E%20%u043C%u0430%u0442%u0435%u043C%u0430%u0442%u0438%u043A%u0443%2C%20%u0436%u0435%u043D%u0443%20%u0438%20%u0430%u043A%u0430%u0434%u0435%u043C%u0438%u0447%u0435%u0441%u043A%u0443%u044E%20%u043C%u0443%u0437%u044B%u043A%u0443.%20%u041E%u0447%u0435%u043D%u044C%20%u043C%u0435%u0434%u043B%u0435%u043D%u043D%u043E%20%u0434%u0443%u043C%u0430%u044E%20%u0438%20%u043F%u0440%u0430%u0432%u0434%u0430%20%u043D%u0435%20%u0437%u043D%u0430%u044E%2C%20%u0447%u0442%u043E%20%u0437%u043D%u0430%u0447%u0438%u0442%20%u043C%u043E%u0439%20%u043D%u0438%u043A.")]);})]);})]);
return self;},
args: ["html"],
source: unescape('renderOn%3A%20html%0A%09html%20div%20with%3A%20%5B%0A%09%09html%20h1%20with%3A%20%27%u041F%u0440%u0438%u0432%u0435%u0442%27.%0A%20%20%20%20%20%20%20%20%20%20%09html%20p%20with%3A%20%27%u041C%u0435%u043D%u044F%20%u0437%u043E%u0432%u0443%u0442%20%u0421%u0435%u043C%u0451%u043D%20%u041D%u043E%u0432%u0438%u043A%u043E%u0432.%27.%0A%20%20%20%20%20%20%20%20%20%20%09html%20p%20with%3A%20%27%u0412%u043E%u0442%20%u043F%u0440%u0438%u043C%u0435%u0440%u043D%u044B%u0439%20%u0441%u043F%u0438%u0441%u043E%u043A%20%u0441%u043F%u043E%u0441%u043E%u0431%u043E%u0432%20%u0441%u043E%20%u043C%u043D%u043E%u0439%20%u0441%u0432%u044F%u0437%u0430%u0442%u044C%u0441%u044F%3A%27.%0A%20%20%20%20%20%20%20%20%20%20%09profiles%20do%3A%20%5B%3Aeach%20%7C%0A%09%09%09html%20a%20href%3A%20%28each%20value%20url%29%3B%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20with%3A%20%28html%20img%20src%3A%20%28each%20value%20icon%29%29%5D.%0A%20%20%20%20%20%20%20%20%20%20%09html%20p%20with%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20html%20with%3A%20%27%u0415%u0441%u043B%u0438%20%u0412%u044B%20%u043F%u043E%20%u0434%u0435%u043B%u0443%2C%20%u0442%u043E%2C%20%u043C%u043E%u0436%u0435%u0442%20%u0431%u044B%u0442%u044C%2C%20%u0432%u0430%u043C%20%u043D%u0443%u0436%u043D%u043E%20%u043F%u043E%u0441%u043C%u043E%u0442%u0440%u0435%u0442%u044C%20%u043C%u043E%u0451%20%27.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20html%20a%20href%3A%20%27http%3A//sdfgh153.moikrug.ru%27%3B%20with%3A%20%27%u0440%u0435%u0437%u044E%u043C%u0435%20%27.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20html%20with%3A%20%27%u0438%u043B%u0438%20%27.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20html%20a%20href%3A%20%27http%3A//github.com/semka/%27%3B%20with%3A%20%27%u043A%u043E%u0434.%27%5D.%0A%20%20%20%20%20%20%20%20%09html%09p%20with%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%09html%20with%3A%20%27%u042F%20%u0440%u0430%u0431%u043E%u0442%u0430%u044E%20%u0432%20%u043F%u0440%u0435%u043A%u0440%u0430%u0441%u043D%u043E%u0439%20%u043A%u043E%u043D%u0442%u043E%u0440%u0435%20%27.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%09html%20a%20href%3A%20%27http%3A//gipis.ru%27%3B%20with%3A%20%27Gipis%27.%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%09html%20with%3A%20%27%2C%20%u0433%u0434%u0435%20%u043F%u0438%u0448%u0443%20%u0441%u043E%u0444%u0442%20%u0434%u043B%u044F%20iOS.%20%27.%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%09html%20with%3A%20%27%u041B%u044E%u0431%u043B%u044E%20%u043C%u0430%u0442%u0435%u043C%u0430%u0442%u0438%u043A%u0443%2C%20%u0436%u0435%u043D%u0443%20%u0438%20%u0430%u043A%u0430%u0434%u0435%u043C%u0438%u0447%u0435%u0441%u043A%u0443%u044E%20%u043C%u0443%u0437%u044B%u043A%u0443.%20%u041E%u0447%u0435%u043D%u044C%20%u043C%u0435%u0434%u043B%u0435%u043D%u043D%u043E%20%u0434%u0443%u043C%u0430%u044E%20%u0438%20%u043F%u0440%u0430%u0432%u0434%u0430%20%u043D%u0435%20%u0437%u043D%u0430%u044E%2C%20%u0447%u0442%u043E%20%u0437%u043D%u0430%u0447%u0438%u0442%20%u043C%u043E%u0439%20%u043D%u0438%u043A.%27%5D%5D.'),
messageSends: ["with:", "div", "h1", "p", "do:", "href:", "url", "value", "src:", "img", "icon", "a"],
referencedClasses: []
}),
smalltalk.SPProfiles);



smalltalk.addClass('SPContent', smalltalk.Widget, ['content'], 'Smallpage');
smalltalk.addMethod(
unescape('_renderOn_'),
smalltalk.method({
selector: unescape('renderOn%3A'),
category: 'rendering',
fn: function (html){
var self=this;
smalltalk.send(smalltalk.send(unescape("%23about_me"), "_asJQuery", []), "_html_", [smalltalk.send(self['@content'], "_text", [])]);
return self;},
args: ["html"],
source: unescape('renderOn%3A%20html%0A%09%27%23about_me%27%20asJQuery%20html%3A%20%28content%20text%29.'),
messageSends: ["html:", "asJQuery", "text"],
referencedClasses: []
}),
smalltalk.SPContent);

smalltalk.addMethod(
unescape('_documentReceived_'),
smalltalk.method({
selector: unescape('documentReceived%3A'),
category: 'connection',
fn: function (document){
var self=this;
self['@content']=document;
smalltalk.send(self, "_clean", []);
smalltalk.send(self, "_appendToJQuery_", [smalltalk.send(unescape("%23about_me"), "_asJQuery", [])]);
smalltalk.send(smalltalk.send(unescape("%23content"), "_asJQuery", []), "_fadeIn", []);
smalltalk.send(smalltalk.send(unescape("%23about_me"), "_asJQuery", []), "_fadeIn", []);
return self;},
args: ["document"],
source: unescape('documentReceived%3A%20document%0A%09content%20%3A%3D%20document.%0A%09self%20clean.%0A%09self%20appendToJQuery%3A%20%28%27%23about_me%27%20asJQuery%29.%0A%09%28%27%23content%27%20asJQuery%29%20fadeIn.%0A%09%28%27%23about_me%27%20asJQuery%29%20fadeIn.'),
messageSends: ["clean", "appendToJQuery:", "asJQuery", "fadeIn"],
referencedClasses: []
}),
smalltalk.SPContent);

smalltalk.addMethod(
unescape('_requestAboutMe'),
smalltalk.method({
selector: unescape('requestAboutMe'),
category: 'connection',
fn: function (){
var self=this;
var connector=nil;
connector=smalltalk.send(smalltalk.send((smalltalk.SPCouchConnector || SPCouchConnector), "_new", []), "_database_", ["texts"]);
smalltalk.send(connector, "_request_callback_", ["about_me", (function(result){return smalltalk.send(self, "_documentReceived_", [result]);})]);
return self;},
args: [],
source: unescape('requestAboutMe%0A%09%7Cconnector%7C%0A%09connector%20%3A%3D%20SPCouchConnector%20new%20database%3A%20%27texts%27.%0A%09connector%20request%3A%20%27about_me%27%0A%09%09%09%20callback%3A%20%5B%3Aresult%20%7C%20self%20documentReceived%3A%20result%5D.'),
messageSends: ["database:", "new", "request:callback:", "documentReceived:"],
referencedClasses: ["SPCouchConnector"]
}),
smalltalk.SPContent);

smalltalk.addMethod(
unescape('_clean'),
smalltalk.method({
selector: unescape('clean'),
category: 'rendering',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(unescape("%23about_me"), "_asJQuery", []), "_html_", [""]);
return self;},
args: [],
source: unescape('clean%0A%09%22Clean%20up%20html%20widget%22%0A%09%28%27%23about_me%27%20asJQuery%29%20html%3A%20%27%27.'),
messageSends: ["html:", "asJQuery"],
referencedClasses: []
}),
smalltalk.SPContent);



smalltalk.addClass('SPArticles', smalltalk.Widget, ['articles'], 'Smallpage');
smalltalk.addMethod(
unescape('_documentReceived_'),
smalltalk.method({
selector: unescape('documentReceived%3A'),
category: 'connection',
fn: function (articlesList){
var self=this;
self['@articles']=smalltalk.send(articlesList, "_rows", []);
smalltalk.send(self, "_appendToJQuery_", [smalltalk.send(unescape("%23articles"), "_asJQuery", [])]);
smalltalk.send(smalltalk.send(unescape("%23articles"), "_asJQuery", []), "_fadeIn", []);
return self;},
args: ["articlesList"],
source: unescape('documentReceived%3A%20articlesList%0A%09articles%20%3A%3D%20articlesList%20rows.%0A%09self%20appendToJQuery%3A%20%28%27%23articles%27%20asJQuery%29.%0A%09%28%27%23articles%27%20asJQuery%29%20fadeIn.'),
messageSends: ["rows", "appendToJQuery:", "asJQuery", "fadeIn"],
referencedClasses: []
}),
smalltalk.SPArticles);

smalltalk.addMethod(
unescape('_clean'),
smalltalk.method({
selector: unescape('clean'),
category: 'rendering',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(unescape("%23articles"), "_asJQuery", []), "_html_", [""]);
return self;},
args: [],
source: unescape('clean%0A%09%22Clean%20up%20html%20widget%22%0A%09%28%27%23articles%27%20asJQuery%29%20html%3A%20%27%27.'),
messageSends: ["html:", "asJQuery"],
referencedClasses: []
}),
smalltalk.SPArticles);

smalltalk.addMethod(
unescape('_requestArticles'),
smalltalk.method({
selector: unescape('requestArticles'),
category: 'connection',
fn: function (){
var self=this;
var connector=nil;
connector=smalltalk.send(smalltalk.send((smalltalk.SPCouchConnector || SPCouchConnector), "_new", []), "_database_", ["articles"]);
smalltalk.send(connector, "_request_callback_", [unescape("_design/all/_view/all_documents"), (function(result){return smalltalk.send(self, "_documentReceived_", [result]);})]);
return self;},
args: [],
source: unescape('requestArticles%0A%09%7Cconnector%7C%0A%09connector%20%3A%3D%20SPCouchConnector%20new%20database%3A%20%27articles%27.%0A%09connector%20request%3A%20%27_design/all/_view/all_documents%27%0A%09%09%09callback%3A%20%5B%3Aresult%20%7C%20self%20documentReceived%3A%20result%5D.'),
messageSends: ["database:", "new", "request:callback:", "documentReceived:"],
referencedClasses: ["SPCouchConnector"]
}),
smalltalk.SPArticles);

smalltalk.addMethod(
unescape('_renderOn_'),
smalltalk.method({
selector: unescape('renderOn%3A'),
category: 'rendering',
fn: function (html){
var self=this;
smalltalk.send(smalltalk.send(html, "_ol", []), "_with_", [(function(){return smalltalk.send(self['@articles'], "_do_", [(function(each){return smalltalk.send(smalltalk.send(html, "_li", []), "_with_", [(function(){return (function($rec){smalltalk.send($rec, "_href_", [smalltalk.send(smalltalk.send(each, "_value", []), "_url", [])]);return smalltalk.send($rec, "_with_", [smalltalk.send(each, "_key", [])]);})(smalltalk.send(html, "_a", []));})]);})]);})]);
return self;},
args: ["html"],
source: unescape('renderOn%3A%20html%0A%09html%20ol%20with%3A%20%5B%0A%09%09articles%20do%3A%20%5B%3Aeach%20%7C%20%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20html%20li%20with%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20%20html%20a%20href%3A%20%28%28each%20value%29%20url%29%3B%20with%3A%20%28each%20key%29%5D%5D%5D.'),
messageSends: ["with:", "ol", "do:", "li", "href:", "url", "value", "key", "a"],
referencedClasses: []
}),
smalltalk.SPArticles);



