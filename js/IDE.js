smalltalk.addClass('TabManager', smalltalk.Widget, ['selectedTab', 'tabs', 'opened'], 'IDE');
smalltalk.addMethod(
'_initialize',
smalltalk.method({
selector: 'initialize',
category: 'initialization',
fn: function (){
var self=this;
self.klass.superclass.fn.prototype['_initialize'].apply(self, []);
self['@opened']=true;
(function($rec){smalltalk.send($rec, "_append_", [self]);smalltalk.send($rec, "_append_", [(function(html){return smalltalk.send(smalltalk.send(html, "_div", []), "_id_", ["jtalk"]);})]);return smalltalk.send($rec, "_addClass_", ["jtalkBody"]);})(smalltalk.send("body", "_asJQuery", []));
(function($rec){smalltalk.send($rec, "_addTab_", [smalltalk.send(smalltalk.Transcript, "_current", [])]);return smalltalk.send($rec, "_addTab_", [smalltalk.send(smalltalk.Workspace, "_new", [])]);})(self);
smalltalk.send(self, "_selectTab_", [smalltalk.send(smalltalk.send(self, "_tabs", []), "_last", [])]);
(function($rec){smalltalk.send($rec, "_onResize_", [(function(){return (function($rec){smalltalk.send($rec, "_updateBodyMargin", []);return smalltalk.send($rec, "_updatePosition", []);})(self);})]);return smalltalk.send($rec, "_onWindowResize_", [(function(){return smalltalk.send(self, "_updatePosition", []);})]);})(self);
return self;},
source: unescape('initialize%0A%20%20%20%20super%20initialize.%0A%20%20%20%20opened%20%3A%3D%20true.%0A%20%20%20%20%27body%27%20asJQuery%20%0A%09append%3A%20self%3B%0A%09append%3A%20%5B%3Ahtml%20%7C%20html%20div%20id%3A%20%27jtalk%27%5D%3B%0A%09addClass%3A%20%27jtalkBody%27.%0A%20%20%20%20self%20%0A%09addTab%3A%20Transcript%20current%3B%0A%09addTab%3A%20Workspace%20new.%0A%20%20%20%20self%20selectTab%3A%20self%20tabs%20last.%0A%20%20%20%20self%20%0A%09onResize%3A%20%5Bself%20updateBodyMargin%3B%20updatePosition%5D%3B%0A%09onWindowResize%3A%20%5Bself%20updatePosition%5D%0A')}),
smalltalk.TabManager);

smalltalk.addMethod(
'_tabs',
smalltalk.method({
selector: 'tabs',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@tabs'], "_ifNil_", [(function(){return self['@tabs']=smalltalk.send(smalltalk.Array, "_new", []);})]);
return self;},
source: unescape('tabs%0A%20%20%20%20%5Etabs%20ifNil%3A%20%5Btabs%20%3A%3D%20Array%20new%5D%0A')}),
smalltalk.TabManager);

smalltalk.addMethod(
'_addTab_',
smalltalk.method({
selector: 'addTab:',
category: 'adding/Removing',
fn: function (aWidget){
var self=this;
smalltalk.send(smalltalk.send(self, "_tabs", []), "_add_", [aWidget]);
smalltalk.send(smalltalk.send(unescape("%23jtalk"), "_asJQuery", []), "_append_", [aWidget]);
smalltalk.send(smalltalk.send(smalltalk.send(aWidget, "_root", []), "_asJQuery", []), "_hide", []);
return self;},
source: unescape('addTab%3A%20aWidget%0A%20%20%20%20self%20tabs%20add%3A%20aWidget.%0A%20%20%20%20%27%23jtalk%27%20asJQuery%20append%3A%20aWidget.%0A%20%20%20%20aWidget%20root%20asJQuery%20hide%0A')}),
smalltalk.TabManager);

smalltalk.addMethod(
'_removeTab_',
smalltalk.method({
selector: 'removeTab:',
category: 'adding/Removing',
fn: function (aWidget){
var self=this;
smalltalk.send(smalltalk.send(self, "_tabs", []), "_remove_", [aWidget]);
smalltalk.send(self, "_update", []);
return self;},
source: unescape('removeTab%3A%20aWidget%0A%20%20%20%20self%20tabs%20remove%3A%20aWidget.%0A%20%20%20%20self%20update%0A')}),
smalltalk.TabManager);

smalltalk.addMethod(
'_updateBodyMargin',
smalltalk.method({
selector: 'updateBodyMargin',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(self, "_setBodyMargin_", [smalltalk.send(smalltalk.send(smalltalk.send(unescape("%23jtalk"), "_asJQuery", []), "_height", []), "__plus", [(27)])]);
return self;},
source: unescape('updateBodyMargin%0A%20%20%20%20self%20setBodyMargin%3A%20%27%23jtalk%27%20asJQuery%20height%20+%2027%0A')}),
smalltalk.TabManager);

smalltalk.addMethod(
'_updatePosition',
smalltalk.method({
selector: 'updatePosition',
category: 'actions',
fn: function (){
var self=this;
jQuery('#jtalk').css('top', '').css('bottom', '27px');;
return self;},
source: unescape('updatePosition%0A%20%20%20%20%7B%27jQuery%28%27%27%23jtalk%27%27%29.css%28%27%27top%27%27%2C%20%27%27%27%27%27%27%29.css%28%27%27bottom%27%27%2C%20%27%2727px%27%27%29%3B%27%7D%0A')}),
smalltalk.TabManager);

smalltalk.addMethod(
'_removeBodyMargin',
smalltalk.method({
selector: 'removeBodyMargin',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(self, "_setBodyMargin_", [(0)]);
return self;},
source: unescape('removeBodyMargin%0A%20%20%20%20self%20setBodyMargin%3A%200%0A')}),
smalltalk.TabManager);

smalltalk.addMethod(
'_setBodyMargin_',
smalltalk.method({
selector: 'setBodyMargin:',
category: 'actions',
fn: function (anInteger){
var self=this;
smalltalk.send(smalltalk.send(".jtalkBody", "_asJQuery", []), "_cssAt_put_", [unescape("margin-bottom"), smalltalk.send(smalltalk.send(anInteger, "_asString", []), "__comma", ["px"])]);
return self;},
source: unescape('setBodyMargin%3A%20anInteger%0A%20%20%20%20%27.jtalkBody%27%20asJQuery%20cssAt%3A%20%27margin-bottom%27%20put%3A%20anInteger%20asString%2C%20%27px%27%0A')}),
smalltalk.TabManager);

smalltalk.addMethod(
'_onResize_',
smalltalk.method({
selector: 'onResize:',
category: 'actions',
fn: function (aBlock){
var self=this;
jQuery('#jtalk').resizable({
	handles: 'n', 
	resize: aBlock,
	minHeight: 230
});;
return self;},
source: unescape('onResize%3A%20aBlock%0A%20%20%20%20%7B%27jQuery%28%27%27%23jtalk%27%27%29.resizable%28%7B%0A%09handles%3A%20%27%27n%27%27%2C%20%0A%09resize%3A%20aBlock%2C%0A%09minHeight%3A%20230%0A%7D%29%3B%27%7D%0A')}),
smalltalk.TabManager);

smalltalk.addMethod(
'_onWindowResize_',
smalltalk.method({
selector: 'onWindowResize:',
category: 'actions',
fn: function (aBlock){
var self=this;
jQuery(window).resize(aBlock);
return self;},
source: unescape('onWindowResize%3A%20aBlock%0A%20%20%20%20%7B%27jQuery%28window%29.resize%28aBlock%29%27%7D%0A')}),
smalltalk.TabManager);

smalltalk.addMethod(
'_open',
smalltalk.method({
selector: 'open',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(self['@opened'], "_ifFalse_", [(function(){smalltalk.send(smalltalk.send(smalltalk.send(self, "_root", []), "_asJQuery", []), "_show", []);smalltalk.send(smalltalk.send("body", "_asJQuery", []), "_addClass_", ["jtalkBody"]);smalltalk.send(smalltalk.send(unescape("%23jtalk"), "_asJQuery", []), "_show", []);smalltalk.send(self, "_updateBodyMargin", []);smalltalk.send(smalltalk.send(smalltalk.send(self['@selectedTab'], "_root", []), "_asJQuery", []), "_show", []);return self['@opened']=true;})]);
return self;},
source: unescape('open%0A%20%20%20%20opened%20ifFalse%3A%20%5B%0A%09self%20root%20asJQuery%20show.%0A%09%27body%27%20asJQuery%20addClass%3A%20%27jtalkBody%27.%0A%09%27%23jtalk%27%20asJQuery%20show.%0A%09self%20updateBodyMargin.%0A%09selectedTab%20root%20asJQuery%20show.%0A%09opened%20%3A%3D%20true%5D%0A')}),
smalltalk.TabManager);

smalltalk.addMethod(
'_close',
smalltalk.method({
selector: 'close',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(self['@opened'], "_ifTrue_", [(function(){smalltalk.send(smalltalk.send(smalltalk.send(self, "_root", []), "_asJQuery", []), "_hide", []);smalltalk.send(smalltalk.send(unescape("%23jtalk"), "_asJQuery", []), "_hide", []);smalltalk.send(self, "_removeBodyMargin", []);smalltalk.send(smalltalk.send("body", "_asJQuery", []), "_removeClass_", ["jtalkBody"]);return self['@opened']=false;})]);
return self;},
source: unescape('close%0A%20%20%20%20opened%20ifTrue%3A%20%5B%0A%09self%20root%20asJQuery%20hide.%0A%09%27%23jtalk%27%20asJQuery%20hide.%0A%09self%20removeBodyMargin.%0A%09%27body%27%20asJQuery%20removeClass%3A%20%27jtalkBody%27.%0A%09opened%20%3A%3D%20false%5D%0A')}),
smalltalk.TabManager);

smalltalk.addMethod(
'_newBrowserTab',
smalltalk.method({
selector: 'newBrowserTab',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(smalltalk.Browser, "_open", []);
return self;},
source: unescape('newBrowserTab%0A%20%20%20%20Browser%20open%0A')}),
smalltalk.TabManager);

smalltalk.addMethod(
'_selectTab_',
smalltalk.method({
selector: 'selectTab:',
category: 'actions',
fn: function (aWidget){
var self=this;
smalltalk.send(self, "_open", []);
self['@selectedTab']=aWidget;
smalltalk.send(smalltalk.send(self, "_tabs", []), "_do_", [(function(each){return smalltalk.send(smalltalk.send(smalltalk.send(each, "_root", []), "_asJQuery", []), "_hide", []);})]);
smalltalk.send(smalltalk.send(smalltalk.send(aWidget, "_root", []), "_asJQuery", []), "_show", []);
smalltalk.send(self, "_update", []);
return self;},
source: unescape('selectTab%3A%20aWidget%0A%20%20%20%20self%20open.%0A%20%20%20%20selectedTab%20%3A%3D%20aWidget.%0A%20%20%20%20self%20tabs%20do%3A%20%5B%3Aeach%20%7C%0A%09each%20root%20asJQuery%20hide%5D.%0A%20%20%20%20aWidget%20root%20asJQuery%20show.%0A%20%20%20%20self%20update%0A')}),
smalltalk.TabManager);

smalltalk.addMethod(
'_closeTab_',
smalltalk.method({
selector: 'closeTab:',
category: 'actions',
fn: function (aWidget){
var self=this;
smalltalk.send(self, "_removeTab_", [aWidget]);
smalltalk.send(self, "_selectTab_", [smalltalk.send(smalltalk.send(self, "_tabs", []), "_last", [])]);
smalltalk.send(smalltalk.send(smalltalk.send(aWidget, "_root", []), "_asJQuery", []), "_remove", []);
smalltalk.send(self, "_update", []);
return self;},
source: unescape('closeTab%3A%20aWidget%0A%20%20%20%20self%20removeTab%3A%20aWidget.%0A%20%20%20%20self%20selectTab%3A%20self%20tabs%20last.%0A%20%20%20%20aWidget%20root%20asJQuery%20remove.%0A%20%20%20%20self%20update%0A')}),
smalltalk.TabManager);

smalltalk.addMethod(
'_renderOn_',
smalltalk.method({
selector: 'renderOn:',
category: 'rendering',
fn: function (html){
var self=this;
(function($rec){smalltalk.send($rec, "_id_", ["jtalkTabs"]);return smalltalk.send($rec, "_with_", [(function(){(function($rec){smalltalk.send($rec, "_class_", ["closeAll"]);smalltalk.send($rec, "_with_", ["x"]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_close", []);})]);})(smalltalk.send(html, "_li", []));smalltalk.send(smalltalk.send(self, "_tabs", []), "_do_", [(function(each){return smalltalk.send(self, "_renderTabFor_on_", [each, html]);})]);return (function($rec){smalltalk.send($rec, "_class_", ["newtab"]);smalltalk.send($rec, "_with_", [unescape("%20+%20")]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_newBrowserTab", []);})]);})(smalltalk.send(html, "_li", []));})]);})(smalltalk.send(html, "_ul", []));
return self;},
source: unescape('renderOn%3A%20html%0A%20%20%20%20html%20ul%0A%09id%3A%20%27jtalkTabs%27%3B%0A%09with%3A%20%5B%0A%09%20%20%20%20html%20li%20%0A%09%09class%3A%20%27closeAll%27%3B%0A%09%09with%3A%20%27x%27%3B%0A%09%09onClick%3A%20%5Bself%20close%5D.%0A%09%20%20%20%20self%20tabs%20do%3A%20%5B%3Aeach%20%7C%0A%09%09self%20renderTabFor%3A%20each%20on%3A%20html%5D.%0A%09%20%20%20%20html%20li%0A%09%09class%3A%20%27newtab%27%3B%0A%09%09with%3A%20%27%20+%20%27%3B%0A%09%09onClick%3A%20%5Bself%20newBrowserTab%5D%5D%0A')}),
smalltalk.TabManager);

smalltalk.addMethod(
'_renderTabFor_on_',
smalltalk.method({
selector: 'renderTabFor:on:',
category: 'rendering',
fn: function (aWidget, html){
var self=this;
var li=nil;
li=smalltalk.send(html, "_li", []);
smalltalk.send(smalltalk.send(self['@selectedTab'], "__eq", [aWidget]), "_ifTrue_", [(function(){return smalltalk.send(li, "_class_", ["selected"]);})]);
smalltalk.send(li, "_with_", [(function(){(function($rec){smalltalk.send($rec, "_with_", [smalltalk.send(aWidget, "_label", [])]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_selectTab_", [aWidget]);})]);})(smalltalk.send(html, "_span", []));return smalltalk.send(smalltalk.send(aWidget, "_canBeClosed", []), "_ifTrue_", [(function(){return (function($rec){smalltalk.send($rec, "_class_", ["close"]);smalltalk.send($rec, "_with_", ["x"]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_closeTab_", [aWidget]);})]);})(smalltalk.send(html, "_span", []));})]);})]);
return self;},
source: unescape('renderTabFor%3A%20aWidget%20on%3A%20html%0A%20%20%20%20%7C%20li%20%7C%0A%20%20%20%20li%20%3A%3D%20html%20li.%0A%20%20%20%20selectedTab%20%3D%20aWidget%20ifTrue%3A%20%5B%0A%09li%20class%3A%20%27selected%27%5D.%0A%20%20%20%20li%20with%3A%20%5B%0A%09html%20span%0A%09%20%20%20%20with%3A%20aWidget%20label%3B%0A%09%20%20%20%20onClick%3A%20%5Bself%20selectTab%3A%20aWidget%5D.%0A%09aWidget%20canBeClosed%20ifTrue%3A%20%5B%0A%09%20%20%20%20html%20span%20%0A%09%09class%3A%20%27close%27%3B%0A%09%09with%3A%20%27x%27%3B%0A%09%09onClick%3A%20%5Bself%20closeTab%3A%20aWidget%5D%5D%5D%0A')}),
smalltalk.TabManager);


smalltalk.TabManager.klass.iVarNames = ['current'];
smalltalk.addMethod(
'_current',
smalltalk.method({
selector: 'current',
category: 'instance creation',
fn: function (){
var self=this;
return smalltalk.send(self['@current'], "_ifNil_", [(function(){return self['@current']=self.klass.superclass.fn.prototype['_new'].apply(self, []);})]);
return self;},
source: unescape('current%0A%20%20%20%20%5Ecurrent%20ifNil%3A%20%5Bcurrent%20%3A%3D%20super%20new%5D%0A')}),
smalltalk.TabManager.klass);

smalltalk.addMethod(
'_new',
smalltalk.method({
selector: 'new',
category: 'instance creation',
fn: function (){
var self=this;
smalltalk.send(self, "_shouldNotImplement", []);
return self;},
source: unescape('new%0A%20%20%20%20self%20shouldNotImplement%0A')}),
smalltalk.TabManager.klass);


smalltalk.addClass('TabWidget', smalltalk.Widget, [], 'IDE');
smalltalk.addMethod(
'_label',
smalltalk.method({
selector: 'label',
category: 'accessing',
fn: function (){
var self=this;
smalltalk.send(self, "_subclassResponsibility", []);
return self;},
source: unescape('label%0A%20%20%20%20self%20subclassResponsibility%0A')}),
smalltalk.TabWidget);

smalltalk.addMethod(
'_open',
smalltalk.method({
selector: 'open',
category: 'actions',
fn: function (){
var self=this;
(function($rec){smalltalk.send($rec, "_addTab_", [self]);return smalltalk.send($rec, "_selectTab_", [self]);})(smalltalk.send(smalltalk.TabManager, "_current", []));
return self;},
source: unescape('open%0A%20%20%20%20TabManager%20current%0A%09addTab%3A%20self%3B%0A%09selectTab%3A%20self%0A')}),
smalltalk.TabWidget);

smalltalk.addMethod(
'_canBeClosed',
smalltalk.method({
selector: 'canBeClosed',
category: 'testing',
fn: function (){
var self=this;
return false;
return self;},
source: unescape('canBeClosed%0A%20%20%20%20%5Efalse%0A')}),
smalltalk.TabWidget);

smalltalk.addMethod(
'_renderOn_',
smalltalk.method({
selector: 'renderOn:',
category: 'rendering',
fn: function (html){
var self=this;
(function($rec){smalltalk.send($rec, "_class_", ["jtalkTool"]);return smalltalk.send($rec, "_with_", [(function(){(function($rec){smalltalk.send($rec, "_class_", ["jt_box"]);return smalltalk.send($rec, "_with_", [(function(){return smalltalk.send(self, "_renderBoxOn_", [html]);})]);})(smalltalk.send(html, "_div", []));return (function($rec){smalltalk.send($rec, "_class_", ["jt_buttons"]);return smalltalk.send($rec, "_with_", [(function(){return smalltalk.send(self, "_renderButtonsOn_", [html]);})]);})(smalltalk.send(html, "_div", []));})]);})(smalltalk.send(html, "_root", []));
return self;},
source: unescape('renderOn%3A%20html%0A%20%20%20%20html%20root%0A%09class%3A%20%27jtalkTool%27%3B%0A%09with%3A%20%5B%0A%09%20%20%20%20html%20div%0A%09%09class%3A%20%27jt_box%27%3B%0A%09%09with%3A%20%5Bself%20renderBoxOn%3A%20html%5D.%0A%09%20%20%20%20html%20div%0A%09%09class%3A%20%27jt_buttons%27%3B%0A%09%09with%3A%20%5Bself%20renderButtonsOn%3A%20html%5D%5D%0A')}),
smalltalk.TabWidget);

smalltalk.addMethod(
'_renderBoxOn_',
smalltalk.method({
selector: 'renderBoxOn:',
category: 'rendering',
fn: function (html){
var self=this;

return self;},
source: unescape('renderBoxOn%3A%20html%0A')}),
smalltalk.TabWidget);

smalltalk.addMethod(
'_renderButtonsOn_',
smalltalk.method({
selector: 'renderButtonsOn:',
category: 'rendering',
fn: function (html){
var self=this;

return self;},
source: unescape('renderButtonsOn%3A%20html%0A')}),
smalltalk.TabWidget);


smalltalk.addMethod(
'_open',
smalltalk.method({
selector: 'open',
category: 'instance creation',
fn: function (){
var self=this;
return smalltalk.send(smalltalk.send(self, "_new", []), "_open", []);
return self;},
source: unescape('open%0A%20%20%20%20%5Eself%20new%20open%0A')}),
smalltalk.TabWidget.klass);


smalltalk.addClass('Workspace', smalltalk.TabWidget, ['textarea'], 'IDE');
smalltalk.addMethod(
'_label',
smalltalk.method({
selector: 'label',
category: 'accessing',
fn: function (){
var self=this;
return unescape("%5BWorkspace%5D");
return self;},
source: unescape('label%0A%20%20%20%20%5E%27%5BWorkspace%5D%27%0A')}),
smalltalk.Workspace);

smalltalk.addMethod(
'_selection',
smalltalk.method({
selector: 'selection',
category: 'accessing',
fn: function (){
var self=this;
return document.selection;
return self;},
source: unescape('selection%0A%20%20%20%20%7B%27return%20document.selection%27%7D%0A')}),
smalltalk.Workspace);

smalltalk.addMethod(
'_selectionStart',
smalltalk.method({
selector: 'selectionStart',
category: 'accessing',
fn: function (){
var self=this;
return jQuery('.jt_workspace')[0].selectionStart;
return self;},
source: unescape('selectionStart%0A%20%20%20%20%7B%27return%20jQuery%28%27%27.jt_workspace%27%27%29%5B0%5D.selectionStart%27%7D%0A')}),
smalltalk.Workspace);

smalltalk.addMethod(
'_selectionEnd',
smalltalk.method({
selector: 'selectionEnd',
category: 'accessing',
fn: function (){
var self=this;
return jQuery('.jt_workspace')[0].selectionEnd;
return self;},
source: unescape('selectionEnd%0A%20%20%20%20%7B%27return%20jQuery%28%27%27.jt_workspace%27%27%29%5B0%5D.selectionEnd%27%7D%0A')}),
smalltalk.Workspace);

smalltalk.addMethod(
'_selectionStart_',
smalltalk.method({
selector: 'selectionStart:',
category: 'accessing',
fn: function (anInteger){
var self=this;
jQuery('.jt_workspace')[0].selectionStart = anInteger;
return self;},
source: unescape('selectionStart%3A%20anInteger%0A%20%20%20%20%7B%27jQuery%28%27%27.jt_workspace%27%27%29%5B0%5D.selectionStart%20%3D%20anInteger%27%7D%0A')}),
smalltalk.Workspace);

smalltalk.addMethod(
'_selectionEnd_',
smalltalk.method({
selector: 'selectionEnd:',
category: 'accessing',
fn: function (anInteger){
var self=this;
jQuery('.jt_workspace')[0].selectionEnd = anInteger;
return self;},
source: unescape('selectionEnd%3A%20anInteger%0A%20%20%20%20%7B%27jQuery%28%27%27.jt_workspace%27%27%29%5B0%5D.selectionEnd%20%3D%20anInteger%27%7D%0A')}),
smalltalk.Workspace);

smalltalk.addMethod(
'_currentLine',
smalltalk.method({
selector: 'currentLine',
category: 'accessing',
fn: function (){
var self=this;
try{var lines=nil;
var startLine=nil;
var endLine=nil;
lines=smalltalk.send(smalltalk.send(smalltalk.send(self['@textarea'], "_asJQuery", []), "_val", []), "_tokenize_", [smalltalk.send(smalltalk.String, "_cr", [])]);
startLine=endLine=(0);
smalltalk.send(lines, "_do_", [(function(each){endLine=smalltalk.send(startLine, "__plus", [smalltalk.send(each, "_size", [])]);startLine=smalltalk.send(endLine, "__plus", [(1)]);return smalltalk.send(smalltalk.send(endLine, "__gt_eq", [smalltalk.send(self, "_selectionStart", [])]), "_ifTrue_", [(function(){smalltalk.send(self, "_selectionEnd_", [endLine]);return (function(){throw({name: 'stReturn', selector: '_currentLine', fn: function(){return each}})})();})]);})]);
return self;
} catch(e) {if(e.name === 'stReturn' && e.selector === '_currentLine'){return e.fn()} throw(e)}},
source: unescape('currentLine%0A%20%20%20%20%7C%20lines%20startLine%20endLine%7C%0A%20%20%20%20lines%20%3A%3D%20textarea%20asJQuery%20val%20tokenize%3A%20String%20cr.%0A%20%20%20%20startLine%20%3A%3D%20endLine%20%3A%3D%200.%0A%20%20%20%20lines%20do%3A%20%5B%3Aeach%20%7C%0A%09endLine%20%3A%3D%20startLine%20+%20each%20size.%0A%09startLine%20%3A%3D%20endLine%20+%201.%0A%09endLine%20%3E%3D%20self%20selectionStart%20ifTrue%3A%20%5B%0A%09%20%20%20%20self%20selectionEnd%3A%20endLine.%0A%09%20%20%20%20%5Eeach%5D%5D%0A')}),
smalltalk.Workspace);

smalltalk.addMethod(
'_handleKeyDown_',
smalltalk.method({
selector: 'handleKeyDown:',
category: 'actions',
fn: function (anEvent){
var self=this;
if(anEvent.ctrlKey) {
		if(anEvent.keyCode === 80) { //ctrl+p
			self._printIt();
			anEvent.preventDefault();
			return false;
		}
		if(anEvent.keyCode === 68) { //ctrl+d
			self._doIt();
			anEvent.preventDefault();
			return false;
		}
		if(anEvent.keyCode === 73) { //ctrl+i
			self._inspectIt();
			anEvent.preventDefault();
			return false;
		}
	};
return self;},
source: unescape('handleKeyDown%3A%20anEvent%0A%20%20%20%20%7B%27if%28anEvent.ctrlKey%29%20%7B%0A%09%09if%28anEvent.keyCode%20%3D%3D%3D%2080%29%20%7B%20//ctrl+p%0A%09%09%09self._printIt%28%29%3B%0A%09%09%09anEvent.preventDefault%28%29%3B%0A%09%09%09return%20false%3B%0A%09%09%7D%0A%09%09if%28anEvent.keyCode%20%3D%3D%3D%2068%29%20%7B%20//ctrl+d%0A%09%09%09self._doIt%28%29%3B%0A%09%09%09anEvent.preventDefault%28%29%3B%0A%09%09%09return%20false%3B%0A%09%09%7D%0A%09%09if%28anEvent.keyCode%20%3D%3D%3D%2073%29%20%7B%20//ctrl+i%0A%09%09%09self._inspectIt%28%29%3B%0A%09%09%09anEvent.preventDefault%28%29%3B%0A%09%09%09return%20false%3B%0A%09%09%7D%0A%09%7D%27%7D%0A')}),
smalltalk.Workspace);

smalltalk.addMethod(
'_clearWorkspace',
smalltalk.method({
selector: 'clearWorkspace',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(self['@textarea'], "_asJQuery", []), "_val_", [""]);
return self;},
source: unescape('clearWorkspace%0A%20%20%20%20textarea%20asJQuery%20val%3A%20%27%27%0A')}),
smalltalk.Workspace);

smalltalk.addMethod(
'_doIt',
smalltalk.method({
selector: 'doIt',
category: 'actions',
fn: function (){
var self=this;
var selection=nil;
smalltalk.send(smalltalk.send(self['@textarea'], "_asJQuery", []), "_focus", []);
smalltalk.send(smalltalk.send(smalltalk.send(self, "_selectionStart", []), "__eq", [smalltalk.send(self, "_selectionEnd", [])]), "_ifTrue_ifFalse_", [(function(){return selection=smalltalk.send(self, "_currentLine", []);}), (function(){return selection=smalltalk.send(smalltalk.send(smalltalk.send(self['@textarea'], "_asJQuery", []), "_val", []), "_copyFrom_to_", [smalltalk.send(smalltalk.send(self, "_selectionStart", []), "__plus", [(1)]), smalltalk.send(smalltalk.send(self, "_selectionEnd", []), "__plus", [(1)])]);})]);
return smalltalk.send(self, "_eval_", [selection]);
return self;},
source: unescape('doIt%0A%20%20%20%20%7C%20selection%20%7C%0A%20%20%20%20textarea%20asJQuery%20focus.%0A%20%20%20%20self%20selectionStart%20%3D%20self%20selectionEnd%0A%09ifTrue%3A%20%5Bselection%20%3A%3D%20self%20currentLine%5D%0A%09ifFalse%3A%20%5B%0A%09%20%20%20%20selection%20%3A%3D%20textarea%20asJQuery%20val%20copyFrom%3A%20self%20selectionStart%20+%201%20to%3A%20self%20selectionEnd%20+%201%5D.%0A%20%20%20%20%5Eself%20eval%3A%20selection')}),
smalltalk.Workspace);

smalltalk.addMethod(
'_printIt',
smalltalk.method({
selector: 'printIt',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(self, "_print_", [smalltalk.send(smalltalk.send(self, "_doIt", []), "_printString", [])]);
return self;},
source: unescape('printIt%0A%20%20%20%20self%20print%3A%20self%20doIt%20printString%0A')}),
smalltalk.Workspace);

smalltalk.addMethod(
'_print_',
smalltalk.method({
selector: 'print:',
category: 'actions',
fn: function (aString){
var self=this;
var start=nil;
start=smalltalk.send(self, "_selectionEnd", []);
smalltalk.send(smalltalk.send(self['@textarea'], "_asJQuery", []), "_val_", [smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(self['@textarea'], "_asJQuery", []), "_val", []), "_copyFrom_to_", [(1), start]), "__comma", [" "]), "__comma", [aString]), "__comma", [" "]), "__comma", [smalltalk.send(smalltalk.send(smalltalk.send(self['@textarea'], "_asJQuery", []), "_val", []), "_copyFrom_to_", [smalltalk.send(start, "__plus", [(1)]), smalltalk.send(smalltalk.send(smalltalk.send(self['@textarea'], "_asJQuery", []), "_val", []), "_size", [])])])]);
smalltalk.send(self, "_selectionStart_", [start]);
smalltalk.send(self, "_selectionEnd_", [smalltalk.send(smalltalk.send(start, "__plus", [smalltalk.send(aString, "_size", [])]), "__plus", [(2)])]);
return self;},
source: unescape('print%3A%20aString%0A%20%20%20%20%7C%20start%20%7C%0A%20%20%20%20start%20%3A%3D%20self%20selectionEnd.%0A%20%20%20%20textarea%20asJQuery%20val%3A%20%28%0A%09%28textarea%20asJQuery%20val%20copyFrom%3A%201%20to%3A%20start%29%2C%0A%09%27%20%27%2C%20aString%2C%20%27%20%27%2C%0A%09%28textarea%20asJQuery%20val%20copyFrom%3A%20start%20+%201%20to%3A%20textarea%20asJQuery%20val%20size%29%29.%0A%20%20%20%20self%20selectionStart%3A%20start.%0A%20%20%20%20self%20selectionEnd%3A%20start%20+%20aString%20size%20+%202%0A')}),
smalltalk.Workspace);

smalltalk.addMethod(
'_eval_',
smalltalk.method({
selector: 'eval:',
category: 'actions',
fn: function (aString){
var self=this;
try{var compiler=nil;
var node=nil;
compiler=smalltalk.send(smalltalk.Compiler, "_new", []);
node=smalltalk.send(compiler, "_parseExpression_", [aString]);
smalltalk.send(smalltalk.send(node, "_isParseFailure", []), "_ifTrue_", [(function(){return (function(){throw({name: 'stReturn', selector: '_eval_', fn: function(){return smalltalk.send(self, "_alert_", [smalltalk.send(smalltalk.send(smalltalk.send(node, "_reason", []), "__comma", [unescape("%2C%20position%3A%20")]), "__comma", [smalltalk.send(node, "_position", [])])])}})})();})]);
(function(){throw({name: 'stReturn', selector: '_eval_', fn: function(){return smalltalk.send(compiler, "_loadExpression_", [aString])}})})();
return self;
} catch(e) {if(e.name === 'stReturn' && e.selector === '_eval_'){return e.fn()} throw(e)}},
source: unescape('eval%3A%20aString%0A%20%20%20%20%7C%20compiler%20node%20%7C%0A%20%20%20%20compiler%20%3A%3D%20Compiler%20new.%0A%20%20%20%20node%20%3A%3D%20compiler%20parseExpression%3A%20aString.%0A%20%20%20%20node%20isParseFailure%20ifTrue%3A%20%5B%0A%09%5Eself%20alert%3A%20node%20reason%2C%20%27%2C%20position%3A%20%27%2C%20node%20position%5D.%0A%20%20%20%20%5Ecompiler%20loadExpression%3A%20aString%0A')}),
smalltalk.Workspace);

smalltalk.addMethod(
'_renderBoxOn_',
smalltalk.method({
selector: 'renderBoxOn:',
category: 'rendering',
fn: function (html){
var self=this;
self['@textarea']=smalltalk.send(html, "_textarea", []);
smalltalk.send(smalltalk.send(self['@textarea'], "_asJQuery", []), "_call_", ["tabby"]);
smalltalk.send(self['@textarea'], "_onKeyDown_", [(function(e){return smalltalk.send(self, "_handleKeyDown_", [e]);})]);
(function($rec){smalltalk.send($rec, "_class_", ["jt_workspace"]);return smalltalk.send($rec, "_at_put_", ["spellcheck", "false"]);})(self['@textarea']);
return self;},
source: unescape('renderBoxOn%3A%20html%0A%20%20%20%20textarea%20%3A%3D%20html%20textarea.%0A%20%20%20%20textarea%20asJQuery%20call%3A%20%27tabby%27.%0A%20%20%20%20textarea%20onKeyDown%3A%20%5B%3Ae%20%7C%20self%20handleKeyDown%3A%20e%5D.%0A%20%20%20%20textarea%20%0A%09class%3A%20%27jt_workspace%27%3B%0A%09at%3A%20%27spellcheck%27%20put%3A%20%27false%27%0A')}),
smalltalk.Workspace);

smalltalk.addMethod(
'_renderButtonsOn_',
smalltalk.method({
selector: 'renderButtonsOn:',
category: 'rendering',
fn: function (html){
var self=this;
(function($rec){smalltalk.send($rec, "_with_", ["DoIt"]);smalltalk.send($rec, "_title_", [unescape("ctrl+d")]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_doIt", []);})]);})(smalltalk.send(html, "_button", []));
(function($rec){smalltalk.send($rec, "_with_", ["PrintIt"]);smalltalk.send($rec, "_title_", [unescape("ctrl+p")]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_printIt", []);})]);})(smalltalk.send(html, "_button", []));
(function($rec){smalltalk.send($rec, "_with_", ["InspectIt"]);smalltalk.send($rec, "_title_", [unescape("ctrl+i")]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_inspectIt", []);})]);})(smalltalk.send(html, "_button", []));
(function($rec){smalltalk.send($rec, "_with_", ["Clear workspace"]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_clearWorkspace", []);})]);})(smalltalk.send(html, "_button", []));
return self;},
source: unescape('renderButtonsOn%3A%20html%0A%20%20%20%20html%20button%0A%09with%3A%20%27DoIt%27%3B%0A%09title%3A%20%27ctrl+d%27%3B%0A%09onClick%3A%20%5Bself%20doIt%5D.%0A%20%20%20%20html%20button%0A%09with%3A%20%27PrintIt%27%3B%0A%09title%3A%20%27ctrl+p%27%3B%0A%09onClick%3A%20%5Bself%20printIt%5D.%0A%20%20%20%20html%20button%0A%09with%3A%20%27InspectIt%27%3B%0A%09title%3A%20%27ctrl+i%27%3B%0A%09onClick%3A%20%5Bself%20inspectIt%5D.%0A%20%20%20%20html%20button%0A%09with%3A%20%27Clear%20workspace%27%3B%0A%09onClick%3A%20%5Bself%20clearWorkspace%5D%0A')}),
smalltalk.Workspace);

smalltalk.addMethod(
'_inspectIt',
smalltalk.method({
selector: 'inspectIt',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(self, "_doIt", []), "_inspect", []);
return self;},
source: unescape('inspectIt%0A%20%20%20%20self%20doIt%20inspect%0A')}),
smalltalk.Workspace);



smalltalk.addClass('Transcript', smalltalk.TabWidget, ['textarea'], 'IDE');
smalltalk.addMethod(
'_label',
smalltalk.method({
selector: 'label',
category: 'accessing',
fn: function (){
var self=this;
return unescape("%5BTranscript%5D");
return self;},
source: unescape('label%0A%20%20%20%20%5E%27%5BTranscript%5D%27%0A')}),
smalltalk.Transcript);

smalltalk.addMethod(
'_show_',
smalltalk.method({
selector: 'show:',
category: 'actions',
fn: function (anObject){
var self=this;
smalltalk.send(smalltalk.send(self['@textarea'], "_asJQuery", []), "_val_", [smalltalk.send(smalltalk.send(smalltalk.send(self['@textarea'], "_asJQuery", []), "_val", []), "__comma", [smalltalk.send(anObject, "_asString", [])])]);
return self;},
source: unescape('show%3A%20anObject%0A%20%20%20%20textarea%20asJQuery%20val%3A%20textarea%20asJQuery%20val%2C%20anObject%20asString.%0A%0A')}),
smalltalk.Transcript);

smalltalk.addMethod(
'_cr',
smalltalk.method({
selector: 'cr',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(self['@textarea'], "_asJQuery", []), "_val_", [smalltalk.send(smalltalk.send(smalltalk.send(self['@textarea'], "_asJQuery", []), "_val", []), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])])]);
return self;},
source: unescape('cr%0A%20%20%20%20textarea%20asJQuery%20val%3A%20textarea%20asJQuery%20val%2C%20String%20cr.%0A')}),
smalltalk.Transcript);

smalltalk.addMethod(
'_clear',
smalltalk.method({
selector: 'clear',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(self['@textarea'], "_asJQuery", []), "_val_", [""]);
return self;},
source: unescape('clear%0A%20%20%20%20textarea%20asJQuery%20val%3A%20%27%27%0A')}),
smalltalk.Transcript);

smalltalk.addMethod(
'_renderBoxOn_',
smalltalk.method({
selector: 'renderBoxOn:',
category: 'rendering',
fn: function (html){
var self=this;
self['@textarea']=smalltalk.send(html, "_textarea", []);
smalltalk.send(smalltalk.send(self['@textarea'], "_asJQuery", []), "_call_", ["tabby"]);
(function($rec){smalltalk.send($rec, "_class_", ["jt_transcript"]);return smalltalk.send($rec, "_at_put_", ["spellcheck", "false"]);})(self['@textarea']);
return self;},
source: unescape('renderBoxOn%3A%20html%0A%20%20%20%20textarea%20%3A%3D%20html%20textarea.%0A%20%20%20%20textarea%20asJQuery%20call%3A%20%27tabby%27.%0A%20%20%20%20textarea%20%0A%09class%3A%20%27jt_transcript%27%3B%0A%09at%3A%20%27spellcheck%27%20put%3A%20%27false%27%0A')}),
smalltalk.Transcript);

smalltalk.addMethod(
'_renderButtonsOn_',
smalltalk.method({
selector: 'renderButtonsOn:',
category: 'rendering',
fn: function (html){
var self=this;
(function($rec){smalltalk.send($rec, "_with_", ["Clear transcript"]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_clear", []);})]);})(smalltalk.send(html, "_button", []));
return self;},
source: unescape('renderButtonsOn%3A%20html%0A%20%20%20%20html%20button%0A%09with%3A%20%27Clear%20transcript%27%3B%0A%09onClick%3A%20%5Bself%20clear%5D%0A')}),
smalltalk.Transcript);


smalltalk.Transcript.klass.iVarNames = ['current'];
smalltalk.addMethod(
'_open',
smalltalk.method({
selector: 'open',
category: 'instance creation',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(self, "_current", []), "_open", []);
return self;},
source: unescape('open%0A%20%20%20%20self%20current%20open%0A')}),
smalltalk.Transcript.klass);

smalltalk.addMethod(
'_new',
smalltalk.method({
selector: 'new',
category: 'instance creation',
fn: function (){
var self=this;
smalltalk.send(self, "_shouldNotImplement", []);
return self;},
source: unescape('new%0A%20%20%20%20self%20shouldNotImplement%0A')}),
smalltalk.Transcript.klass);

smalltalk.addMethod(
'_current',
smalltalk.method({
selector: 'current',
category: 'instance creation',
fn: function (){
var self=this;
return smalltalk.send(self['@current'], "_ifNil_", [(function(){return self['@current']=self.klass.superclass.fn.prototype['_new'].apply(self, []);})]);
return self;},
source: unescape('current%0A%20%20%20%20%5Ecurrent%20ifNil%3A%20%5Bcurrent%20%3A%3D%20super%20new%5D%0A')}),
smalltalk.Transcript.klass);

smalltalk.addMethod(
'_show_',
smalltalk.method({
selector: 'show:',
category: 'printing',
fn: function (anObject){
var self=this;
smalltalk.send(smalltalk.send(self, "_current", []), "_show_", [anObject]);
return self;},
source: unescape('show%3A%20anObject%0A%20%20%20%20self%20current%20show%3A%20anObject%0A')}),
smalltalk.Transcript.klass);

smalltalk.addMethod(
'_cr',
smalltalk.method({
selector: 'cr',
category: 'printing',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(self, "_current", []), "_show_", [smalltalk.send(smalltalk.String, "_cr", [])]);
return self;},
source: unescape('cr%0A%20%20%20%20self%20current%20show%3A%20String%20cr%0A')}),
smalltalk.Transcript.klass);

smalltalk.addMethod(
'_clear',
smalltalk.method({
selector: 'clear',
category: 'printing',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(self, "_current", []), "_clear", []);
return self;},
source: unescape('clear%0A%20%20%20%20self%20current%20clear%0A')}),
smalltalk.Transcript.klass);


smalltalk.addClass('Browser', smalltalk.TabWidget, ['selectedCategory', 'selectedClass', 'selectedProtocol', 'selectedMethod', 'commitButton', 'categoriesList', 'classesList', 'protocolsList', 'methodsList', 'sourceTextarea', 'tabsList', 'selectedTab', 'saveButton', 'classButtons', 'methodButtons', 'unsavedChanges'], 'IDE');
smalltalk.addMethod(
'_initialize',
smalltalk.method({
selector: 'initialize',
category: 'initialization',
fn: function (){
var self=this;
self.klass.superclass.fn.prototype['_initialize'].apply(self, []);
self['@selectedTab']="instance";
self['@unsavedChanges']=false;
return self;},
source: unescape('initialize%0A%20%20%20%20super%20initialize.%0A%20%20%20%20selectedTab%20%3A%3D%20%23instance.%0A%20%20%20%20unsavedChanges%20%3A%3D%20false%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_label',
smalltalk.method({
selector: 'label',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@selectedClass'], "_ifNil_ifNotNil_", [(function(){return unescape("Browser%20%28nil%29");}), (function(){return smalltalk.send(self['@selectedClass'], "_name", []);})]);
return self;},
source: unescape('label%0A%20%20%20%20%5EselectedClass%20%0A%09ifNil%3A%20%5B%27Browser%20%28nil%29%27%5D%0A%09ifNotNil%3A%20%5BselectedClass%20name%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_categories',
smalltalk.method({
selector: 'categories',
category: 'accessing',
fn: function (){
var self=this;
var categories=nil;
categories=smalltalk.send(smalltalk.Array, "_new", []);
smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.Smalltalk, "_current", []), "_classes", []), "_do_", [(function(each){return smalltalk.send(smalltalk.send(categories, "_includes_", [smalltalk.send(each, "_category", [])]), "_ifFalse_", [(function(){return smalltalk.send(categories, "_add_", [smalltalk.send(each, "_category", [])]);})]);})]);
return smalltalk.send(categories, "_sort", []);
return self;},
source: unescape('categories%0A%20%20%20%20%7C%20categories%20%7C%0A%20%20%20%20categories%20%3A%3D%20Array%20new.%0A%20%20%20%20Smalltalk%20current%20classes%20do%3A%20%5B%3Aeach%20%7C%0A%09%28categories%20includes%3A%20each%20category%29%20ifFalse%3A%20%5B%0A%09%20%20%20%20categories%20add%3A%20each%20category%5D%5D.%0A%20%20%20%20%5Ecategories%20sort%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_classes',
smalltalk.method({
selector: 'classes',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.Smalltalk, "_current", []), "_classes", []), "_select_", [(function(each){return smalltalk.send(smalltalk.send(each, "_category", []), "__eq", [self['@selectedCategory']]);})]), "_sort_", [(function(a, b){return smalltalk.send(smalltalk.send(a, "_name", []), "__gt", [smalltalk.send(b, "_name", [])]);})]);
return self;},
source: unescape('classes%0A%20%20%20%20%5E%28Smalltalk%20current%20classes%20%0A%09select%3A%20%5B%3Aeach%20%7C%20each%20category%20%3D%20selectedCategory%5D%29%0A%09sort%3A%20%5B%3Aa%20%3Ab%20%7C%20a%20name%20%3E%20b%20name%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_protocols',
smalltalk.method({
selector: 'protocols',
category: 'accessing',
fn: function (){
var self=this;
try{var klass=nil;
var protocols=nil;
protocols=smalltalk.send(smalltalk.Array, "_new", []);
smalltalk.send(self['@selectedClass'], "_ifNotNil_", [(function(){smalltalk.send(smalltalk.send(self['@selectedTab'], "__eq", ["comment"]), "_ifTrue_", [(function(){return (function(){throw({name: 'stReturn', selector: '_protocols', fn: function(){return []}})})();})]);klass=smalltalk.send(smalltalk.send(self['@selectedTab'], "__eq", ["instance"]), "_ifTrue_ifFalse_", [(function(){return self['@selectedClass'];}), (function(){return smalltalk.send(self['@selectedClass'], "_class", []);})]);smalltalk.send(smalltalk.send(smalltalk.send(klass, "_methodDictionary", []), "_isEmpty", []), "_ifTrue_", [(function(){return smalltalk.send(protocols, "_add_", ["not yet classified"]);})]);return smalltalk.send(smalltalk.send(klass, "_methodDictionary", []), "_do_", [(function(each){return smalltalk.send(smalltalk.send(protocols, "_includes_", [smalltalk.send(each, "_category", [])]), "_ifFalse_", [(function(){return smalltalk.send(protocols, "_add_", [smalltalk.send(each, "_category", [])]);})]);})]);})]);
(function(){throw({name: 'stReturn', selector: '_protocols', fn: function(){return smalltalk.send(protocols, "_sort", [])}})})();
return self;
} catch(e) {if(e.name === 'stReturn' && e.selector === '_protocols'){return e.fn()} throw(e)}},
source: unescape('protocols%0A%20%20%20%20%7C%20klass%20protocols%20%7C%0A%20%20%20%20protocols%20%3A%3D%20Array%20new.%0A%20%20%20%20selectedClass%20ifNotNil%3A%20%5B%0A%09selectedTab%20%3D%20%23comment%20ifTrue%3A%20%5B%5E%23%28%29%5D.%0A%09klass%20%3A%3D%20selectedTab%20%3D%20%23instance%0A%09%20%20%20%20ifTrue%3A%20%5BselectedClass%5D%0A%09%20%20%20%20ifFalse%3A%20%5BselectedClass%20class%5D.%0A%09klass%20methodDictionary%20isEmpty%20ifTrue%3A%20%5B%0A%09%20%20%20%20protocols%20add%3A%20%27not%20yet%20classified%27%5D.%0A%09klass%20methodDictionary%20do%3A%20%5B%3Aeach%20%7C%0A%09%20%20%20%20%28protocols%20includes%3A%20each%20category%29%20ifFalse%3A%20%5B%0A%09%09protocols%20add%3A%20each%20category%5D%5D%5D.%0A%20%20%20%20%5Eprotocols%20sort%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_methods',
smalltalk.method({
selector: 'methods',
category: 'accessing',
fn: function (){
var self=this;
try{var klass=nil;
smalltalk.send(smalltalk.send(self['@selectedTab'], "__eq", ["comment"]), "_ifTrue_", [(function(){return (function(){throw({name: 'stReturn', selector: '_methods', fn: function(){return []}})})();})]);
smalltalk.send(self['@selectedClass'], "_ifNotNil_", [(function(){return klass=smalltalk.send(smalltalk.send(self['@selectedTab'], "__eq", ["instance"]), "_ifTrue_ifFalse_", [(function(){return self['@selectedClass'];}), (function(){return smalltalk.send(self['@selectedClass'], "_class", []);})]);})]);
(function(){throw({name: 'stReturn', selector: '_methods', fn: function(){return smalltalk.send(smalltalk.send(self['@selectedProtocol'], "_ifNil_ifNotNil_", [(function(){return smalltalk.send(klass, "_ifNil_ifNotNil_", [(function(){return [];}), (function(){return smalltalk.send(smalltalk.send(klass, "_methodDictionary", []), "_values", []);})]);}), (function(){return smalltalk.send(smalltalk.send(smalltalk.send(klass, "_methodDictionary", []), "_values", []), "_select_", [(function(each){return smalltalk.send(smalltalk.send(each, "_category", []), "__eq", [self['@selectedProtocol']]);})]);})]), "_sort_", [(function(a, b){return smalltalk.send(smalltalk.send(a, "_selector", []), "__gt", [smalltalk.send(b, "_selector", [])]);})])}})})();
return self;
} catch(e) {if(e.name === 'stReturn' && e.selector === '_methods'){return e.fn()} throw(e)}},
source: unescape('methods%0A%20%20%20%20%7C%20klass%20%7C%0A%20%20%20%20selectedTab%20%3D%20%23comment%20ifTrue%3A%20%5B%5E%23%28%29%5D.%0A%20%20%20%20selectedClass%20ifNotNil%3A%20%5B%0A%09klass%20%3A%3D%20selectedTab%20%3D%20%23instance%0A%09%20%20%20%20ifTrue%3A%20%5BselectedClass%5D%0A%09%20%20%20%20ifFalse%3A%20%5BselectedClass%20class%5D%5D.%0A%20%20%20%20%5E%28selectedProtocol%20%0A%09ifNil%3A%20%5B%0A%09%20%20%20%20klass%20%0A%09%09ifNil%3A%20%5B%23%28%29%5D%20%0A%09%09ifNotNil%3A%20%5Bklass%20methodDictionary%20values%5D%5D%0A%09ifNotNil%3A%20%5B%0A%09%20%20%20%20klass%20methodDictionary%20values%20select%3A%20%5B%3Aeach%20%7C%0A%09%09each%20category%20%3D%20selectedProtocol%5D%5D%29%20sort%3A%20%5B%3Aa%20%3Ab%20%7C%20a%20selector%20%3E%20b%20selector%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_source',
smalltalk.method({
selector: 'source',
category: 'accessing',
fn: function (){
var self=this;
try{smalltalk.send(smalltalk.send(self['@selectedTab'], "__eq", ["comment"]), "_ifFalse_", [(function(){return (function(){throw({name: 'stReturn', selector: '_source', fn: function(){return smalltalk.send(smalltalk.send(smalltalk.send(self['@selectedProtocol'], "_notNil", []), "_or_", [(function(){return smalltalk.send(self['@selectedMethod'], "_notNil", []);})]), "_ifFalse_ifTrue_", [(function(){return smalltalk.send(self, "_declarationSource", []);}), (function(){return smalltalk.send(self, "_methodSource", []);})])}})})();})]);
(function(){throw({name: 'stReturn', selector: '_source', fn: function(){return smalltalk.send(self['@selectedClass'], "_ifNil_ifNotNil_", [(function(){return "";}), (function(){return smalltalk.send(self, "_classCommentSource", []);})])}})})();
return self;
} catch(e) {if(e.name === 'stReturn' && e.selector === '_source'){return e.fn()} throw(e)}},
source: unescape('source%0A%20%20%20%20selectedTab%20%3D%20%23comment%20ifFalse%3A%20%5B%0A%09%5E%28selectedProtocol%20notNil%20or%3A%20%5BselectedMethod%20notNil%5D%29%0A%09%20%20%20%20ifFalse%3A%20%5Bself%20declarationSource%5D%0A%09%20%20%20%20ifTrue%3A%20%5Bself%20methodSource%5D%5D.%0A%20%20%20%20%5EselectedClass%0A%09ifNil%3A%20%5B%27%27%5D%0A%09ifNotNil%3A%20%5Bself%20classCommentSource%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_methodSource',
smalltalk.method({
selector: 'methodSource',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@selectedMethod'], "_ifNil_ifNotNil_", [(function(){return smalltalk.send(self, "_dummyMethodSource", []);}), (function(){return smalltalk.send(self['@selectedMethod'], "_source", []);})]);
return self;},
source: unescape('methodSource%0A%20%20%20%20%5EselectedMethod%0A%09ifNil%3A%20%5Bself%20dummyMethodSource%5D%0A%09ifNotNil%3A%20%5BselectedMethod%20source%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_dummyMethodSource',
smalltalk.method({
selector: 'dummyMethodSource',
category: 'accessing',
fn: function (){
var self=this;
return unescape("messageSelectorAndArgumentNames%0A%09%22comment%20stating%20purpose%20of%20message%22%0A%0A%09%7C%20temporary%20variable%20names%20%7C%0A%09statements");
return self;},
source: unescape('dummyMethodSource%0A%20%20%20%20%5E%27messageSelectorAndArgumentNames%0A%09%22comment%20stating%20purpose%20of%20message%22%0A%0A%09%7C%20temporary%20variable%20names%20%7C%0A%09statements%27%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_declarationSource',
smalltalk.method({
selector: 'declarationSource',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(smalltalk.send(self['@selectedTab'], "__eq", ["instance"]), "_ifTrue_ifFalse_", [(function(){return smalltalk.send(self, "_classDeclarationSource", []);}), (function(){return smalltalk.send(self, "_metaclassDeclarationSource", []);})]);
return self;},
source: unescape('declarationSource%0A%20%20%20%20%5EselectedTab%20%3D%20%23instance%0A%09ifTrue%3A%20%5Bself%20classDeclarationSource%5D%0A%09ifFalse%3A%20%5Bself%20metaclassDeclarationSource%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_classDeclarationSource',
smalltalk.method({
selector: 'classDeclarationSource',
category: 'accessing',
fn: function (){
var self=this;
var stream=nil;
stream=smalltalk.send("", "_writeStream", []);
smalltalk.send(self['@selectedClass'], "_ifNotNil_", [(function(){(function($rec){smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(smalltalk.send(self['@selectedClass'], "_superclass", []), "_asString", [])]);smalltalk.send($rec, "_nextPutAll_", [unescape("%20subclass%3A%20%23")]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(self['@selectedClass'], "_name", [])]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(smalltalk.send(smalltalk.String, "_cr", []), "__comma", [smalltalk.send(smalltalk.String, "_tab", [])])]);return smalltalk.send($rec, "_nextPutAll_", [unescape("instanceVariableNames%3A%20%27")]);})(stream);smalltalk.send(smalltalk.send(self['@selectedClass'], "_instanceVariableNames", []), "_do_separatedBy_", [(function(each){return smalltalk.send(stream, "_nextPutAll_", [each]);}), (function(){return smalltalk.send(stream, "_nextPutAll_", [" "]);})]);return (function($rec){smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(smalltalk.send(unescape("%27"), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])]), "__comma", [smalltalk.send(smalltalk.String, "_tab", [])])]);smalltalk.send($rec, "_nextPutAll_", [unescape("category%3A%20%27")]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(self['@selectedClass'], "_category", [])]);return smalltalk.send($rec, "_nextPutAll_", [unescape("%27")]);})(stream);})]);
return smalltalk.send(stream, "_contents", []);
return self;},
source: unescape('classDeclarationSource%0A%20%20%20%20%7C%20stream%20%7C%0A%20%20%20%20stream%20%3A%3D%20%27%27%20writeStream.%0A%20%20%20%20selectedClass%20ifNotNil%3A%20%5B%0A%09stream%20%0A%09%20%20%20%20nextPutAll%3A%20selectedClass%20superclass%20asString%3B%0A%09%20%20%20%20nextPutAll%3A%20%27%20subclass%3A%20%23%27%3B%0A%09%20%20%20%20nextPutAll%3A%20selectedClass%20name%3B%0A%09%20%20%20%20nextPutAll%3A%20String%20cr%2C%20String%20tab%3B%0A%09%20%20%20%20nextPutAll%3A%20%27instanceVariableNames%3A%20%27%27%27.%0A%09selectedClass%20instanceVariableNames%20%0A%09%20%20%20%20do%3A%20%5B%3Aeach%20%7C%20stream%20nextPutAll%3A%20each%5D%20%0A%09%20%20%20%20separatedBy%3A%20%5Bstream%20nextPutAll%3A%20%27%20%27%5D.%0A%09stream%0A%09%20%20%20%20nextPutAll%3A%20%27%27%27%27%2C%20String%20cr%2C%20String%20tab%3B%0A%09%20%20%20%20nextPutAll%3A%20%27category%3A%20%27%27%27%3B%0A%09%20%20%20%20nextPutAll%3A%20selectedClass%20category%3B%0A%09%20%20%20%20nextPutAll%3A%20%27%27%27%27%5D.%0A%20%20%20%20%5Estream%20contents%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_metaclassDeclarationSource',
smalltalk.method({
selector: 'metaclassDeclarationSource',
category: 'accessing',
fn: function (){
var self=this;
var stream=nil;
stream=smalltalk.send("", "_writeStream", []);
smalltalk.send(self['@selectedClass'], "_ifNotNil_", [(function(){(function($rec){smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(self['@selectedClass'], "_asString", [])]);smalltalk.send($rec, "_nextPutAll_", [" class "]);return smalltalk.send($rec, "_nextPutAll_", [unescape("instanceVariableNames%3A%20%27")]);})(stream);smalltalk.send(smalltalk.send(smalltalk.send(self['@selectedClass'], "_class", []), "_instanceVariableNames", []), "_do_separatedBy_", [(function(each){return smalltalk.send(stream, "_nextPutAll_", [each]);}), (function(){return smalltalk.send(stream, "_nextPutAll_", [" "]);})]);return smalltalk.send(stream, "_nextPutAll_", [unescape("%27")]);})]);
return smalltalk.send(stream, "_contents", []);
return self;},
source: unescape('metaclassDeclarationSource%0A%20%20%20%20%7C%20stream%20%7C%0A%20%20%20%20stream%20%3A%3D%20%27%27%20writeStream.%0A%20%20%20%20selectedClass%20ifNotNil%3A%20%5B%0A%09stream%20%0A%09%20%20%20%20nextPutAll%3A%20selectedClass%20asString%3B%0A%09%20%20%20%20nextPutAll%3A%20%27%20class%20%27%3B%0A%09%20%20%20%20nextPutAll%3A%20%27instanceVariableNames%3A%20%27%27%27.%0A%09selectedClass%20class%20instanceVariableNames%0A%09%20%20%20%20do%3A%20%5B%3Aeach%20%7C%20stream%20nextPutAll%3A%20each%5D%0A%09%20%20%20%20separatedBy%3A%20%5Bstream%20nextPutAll%3A%20%27%20%27%5D.%0A%09stream%20nextPutAll%3A%20%27%27%27%27%5D.%0A%20%20%20%20%5Estream%20contents%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_classCommentSource',
smalltalk.method({
selector: 'classCommentSource',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@selectedClass'], "_comment", []);
return self;},
source: unescape('classCommentSource%0A%20%20%20%20%5EselectedClass%20comment%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_enableSaveButton',
smalltalk.method({
selector: 'enableSaveButton',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(self['@saveButton'], "_removeAt_", ["disabled"]);
self['@unsavedChanges']=true;
return self;},
source: unescape('enableSaveButton%0A%20%20%20%20saveButton%20removeAt%3A%20%27disabled%27.%0A%20%20%20%20unsavedChanges%20%3A%3D%20true%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_disableSaveButton',
smalltalk.method({
selector: 'disableSaveButton',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(self['@saveButton'], "_ifNotNil_", [(function(){return smalltalk.send(self['@saveButton'], "_at_put_", ["disabled", true]);})]);
self['@unsavedChanges']=false;
return self;},
source: unescape('disableSaveButton%0A%20%20%20%20saveButton%20ifNotNil%3A%20%5B%0A%09saveButton%20at%3A%20%27disabled%27%20put%3A%20true%5D.%0A%20%20%20%20unsavedChanges%20%3A%3D%20false%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_hideClassButtons',
smalltalk.method({
selector: 'hideClassButtons',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(self['@classButtons'], "_asJQuery", []), "_hide", []);
return self;},
source: unescape('hideClassButtons%0A%20%20%20%20classButtons%20asJQuery%20hide%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_showClassButtons',
smalltalk.method({
selector: 'showClassButtons',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(self['@classButtons'], "_asJQuery", []), "_show", []);
return self;},
source: unescape('showClassButtons%0A%20%20%20%20classButtons%20asJQuery%20show%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_hideMethodButtons',
smalltalk.method({
selector: 'hideMethodButtons',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(self['@methodButtons'], "_asJQuery", []), "_hide", []);
return self;},
source: unescape('hideMethodButtons%0A%20%20%20%20methodButtons%20asJQuery%20hide%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_showMethodButtons',
smalltalk.method({
selector: 'showMethodButtons',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(self['@methodButtons'], "_asJQuery", []), "_show", []);
return self;},
source: unescape('showMethodButtons%0A%20%20%20%20methodButtons%20asJQuery%20show%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_compile',
smalltalk.method({
selector: 'compile',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(self, "_disableSaveButton", []);
smalltalk.send(smalltalk.send(self['@selectedTab'], "__eq", ["comment"]), "_ifTrue_", [(function(){return smalltalk.send(self['@selectedClass'], "_ifNotNil_", [(function(){return smalltalk.send(self, "_compileClassComment", []);})]);})]);
smalltalk.send(smalltalk.send(smalltalk.send(self['@selectedProtocol'], "_notNil", []), "_or_", [(function(){return smalltalk.send(self['@selectedMethod'], "_notNil", []);})]), "_ifFalse_ifTrue_", [(function(){return smalltalk.send(self, "_compileDefinition", []);}), (function(){return smalltalk.send(self, "_compileMethodDefinition", []);})]);
return self;},
source: unescape('compile%0A%20%20%20%20self%20disableSaveButton.%0A%20%20%20%20selectedTab%20%3D%20%23comment%20ifTrue%3A%20%5B%0A%09selectedClass%20ifNotNil%3A%20%5B%0A%09%20%20%20%20self%20compileClassComment%5D%5D.%0A%20%20%20%20%28selectedProtocol%20notNil%20or%3A%20%5BselectedMethod%20notNil%5D%29%0A%09ifFalse%3A%20%5Bself%20compileDefinition%5D%0A%09ifTrue%3A%20%5Bself%20compileMethodDefinition%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_compileClassComment',
smalltalk.method({
selector: 'compileClassComment',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(self['@selectedClass'], "_comment_", [smalltalk.send(smalltalk.send(self['@sourceTextarea'], "_asJQuery", []), "_val", [])]);
return self;},
source: unescape('compileClassComment%0A%20%20%20%20selectedClass%20comment%3A%20sourceTextarea%20asJQuery%20val%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_compileMethodDefinition',
smalltalk.method({
selector: 'compileMethodDefinition',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(self['@selectedTab'], "__eq", ["instance"]), "_ifTrue_ifFalse_", [(function(){return smalltalk.send(self, "_compileMethodDefinitionFor_", [self['@selectedClass']]);}), (function(){return smalltalk.send(self, "_compileMethodDefinitionFor_", [smalltalk.send(self['@selectedClass'], "_class", [])]);})]);
return self;},
source: unescape('compileMethodDefinition%0A%20%20%20%20selectedTab%20%3D%20%23instance%0A%09ifTrue%3A%20%5Bself%20compileMethodDefinitionFor%3A%20selectedClass%5D%0A%09ifFalse%3A%20%5Bself%20compileMethodDefinitionFor%3A%20selectedClass%20class%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_compileMethodDefinitionFor_',
smalltalk.method({
selector: 'compileMethodDefinitionFor:',
category: 'actions',
fn: function (aClass){
var self=this;
try{var compiler=nil;
var method=nil;
var source=nil;
var node=nil;
source=smalltalk.send(smalltalk.send(self['@sourceTextarea'], "_asJQuery", []), "_val", []);
smalltalk.send(self['@selectedProtocol'], "_ifNil_", [(function(){return self['@selectedProtocol']=smalltalk.send(self['@selectedMethod'], "_category", []);})]);
compiler=smalltalk.send(smalltalk.Compiler, "_new", []);
node=smalltalk.send(compiler, "_parse_", [source]);
smalltalk.send(smalltalk.send(node, "_isParseFailure", []), "_ifTrue_", [(function(){return (function(){throw({name: 'stReturn', selector: '_compileMethodDefinitionFor_', fn: function(){return smalltalk.send(self, "_alert_", [smalltalk.send(smalltalk.send(smalltalk.send("PARSE ERROR: ", "__comma", [smalltalk.send(node, "_reason", [])]), "__comma", [unescape("%2C%20position%3A%20")]), "__comma", [smalltalk.send(smalltalk.send(node, "_position", []), "_asString", [])])])}})})();})]);
smalltalk.send(compiler, "_currentClass_", [self['@selectedClass']]);
method=smalltalk.send(compiler, "_eval_", [smalltalk.send(compiler, "_compileNode_", [node])]);
smalltalk.send(method, "_category_", [self['@selectedProtocol']]);
smalltalk.send(smalltalk.send(compiler, "_unknownVariables", []), "_do_", [(function(each){return smalltalk.send(smalltalk.send(self, "_confirm_", [smalltalk.send(smalltalk.send(unescape("Declare%20%27"), "__comma", [each]), "__comma", [unescape("%27%20as%20instance%20variable%3F")])]), "_ifTrue_", [(function(){smalltalk.send(self, "_addInstanceVariableNamed_toClass_", [each, aClass]);return (function(){throw({name: 'stReturn', selector: '_compileMethodDefinitionFor_', fn: function(){return smalltalk.send(self, "_compileMethodDefinitionFor_", [aClass])}})})();})]);})]);
smalltalk.send(aClass, "_addCompiledMethod_", [method]);
smalltalk.send(self, "_updateMethodsList", []);
smalltalk.send(self, "_selectMethod_", [method]);
return self;
} catch(e) {if(e.name === 'stReturn' && e.selector === '_compileMethodDefinitionFor_'){return e.fn()} throw(e)}},
source: unescape('compileMethodDefinitionFor%3A%20aClass%0A%20%20%20%20%7C%20compiler%20method%20source%20node%20%7C%0A%20%20%20%20source%20%3A%3D%20sourceTextarea%20asJQuery%20val.%0A%20%20%20%20selectedProtocol%20ifNil%3A%20%5BselectedProtocol%20%3A%3D%20selectedMethod%20category%5D.%0A%20%20%20%20compiler%20%3A%3D%20Compiler%20new.%0A%20%20%20%20node%20%3A%3D%20compiler%20parse%3A%20source.%0A%20%20%20%20node%20isParseFailure%20ifTrue%3A%20%5B%0A%09%5Eself%20alert%3A%20%27PARSE%20ERROR%3A%20%27%2C%20node%20reason%2C%20%27%2C%20position%3A%20%27%2C%20node%20position%20asString%5D.%0A%20%20%20%20compiler%20currentClass%3A%20selectedClass.%0A%20%20%20%20method%20%3A%3D%20compiler%20eval%3A%20%28compiler%20compileNode%3A%20node%29.%0A%20%20%20%20method%20category%3A%20selectedProtocol.%0A%20%20%20%20compiler%20unknownVariables%20do%3A%20%5B%3Aeach%20%7C%0A%09%28self%20confirm%3A%20%27Declare%20%27%27%27%2C%20each%2C%20%27%27%27%20as%20instance%20variable%3F%27%29%20ifTrue%3A%20%5B%0A%09%09self%20addInstanceVariableNamed%3A%20each%20toClass%3A%20aClass.%0A%09%09%5Eself%20compileMethodDefinitionFor%3A%20aClass%5D%5D.%0A%20%20%20%20aClass%20addCompiledMethod%3A%20method.%0A%20%20%20%20self%20updateMethodsList.%0A%20%20%20%20self%20selectMethod%3A%20method%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_compileDefinition',
smalltalk.method({
selector: 'compileDefinition',
category: 'actions',
fn: function (){
var self=this;
var newClass=nil;
newClass=smalltalk.send(smalltalk.send(smalltalk.Compiler, "_new", []), "_loadExpression_", [smalltalk.send(smalltalk.send(self['@sourceTextarea'], "_asJQuery", []), "_val", [])]);
(function($rec){smalltalk.send($rec, "_updateCategoriesList", []);return smalltalk.send($rec, "_updateClassesList", []);})(self);
return self;},
source: unescape('compileDefinition%0A%20%20%20%20%7C%20newClass%20%7C%0A%20%20%20%20newClass%20%3A%3D%20Compiler%20new%20loadExpression%3A%20sourceTextarea%20asJQuery%20val.%0A%20%20%20%20self%20%0A%09updateCategoriesList%3B%0A%09updateClassesList%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_commitCategory',
smalltalk.method({
selector: 'commitCategory',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(self['@selectedCategory'], "_ifNotNil_", [(function(){return (function($rec){smalltalk.send($rec, "_at_put_", ["type", "PUT"]);smalltalk.send($rec, "_at_put_", ["data", smalltalk.send(smalltalk.send(smalltalk.Exporter, "_new", []), "_exportCategory_", [self['@selectedCategory']])]);smalltalk.send($rec, "_at_put_", ["error", (function(){return smalltalk.send(self, "_alert_", [unescape("Commit%20failed%21")]);})]);return smalltalk.send($rec, "_send", []);})(smalltalk.send(smalltalk.Ajax, "_url_", [smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(self, "_class", []), "_commitPath", []), "__comma", [unescape("/")]), "__comma", [self['@selectedCategory']]), "__comma", [".js"])]));})]);
return self;},
source: unescape('commitCategory%0A%20%20%20%20selectedCategory%20ifNotNil%3A%20%5B%0A%09%28Ajax%20url%3A%20self%20class%20commitPath%2C%20%27/%27%2C%20selectedCategory%2C%20%27.js%27%29%0A%09%20%20%20%20at%3A%20%27type%27%20put%3A%20%27PUT%27%3B%0A%09%20%20%20%20at%3A%20%27data%27%20put%3A%20%28Exporter%20new%20exportCategory%3A%20selectedCategory%29%3B%0A%09%20%20%20%20at%3A%20%27error%27%20put%3A%20%5Bself%20alert%3A%20%27Commit%20failed%21%27%5D%3B%0A%09%20%20%20%20send%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_cancelChanges',
smalltalk.method({
selector: 'cancelChanges',
category: 'actions',
fn: function (){
var self=this;
return smalltalk.send(self['@unsavedChanges'], "_ifTrue_ifFalse_", [(function(){return smalltalk.send(self, "_confirm_", [unescape("Cancel%20changes%3F")]);}), (function(){return true;})]);
return self;},
source: unescape('cancelChanges%0A%20%20%20%20%5EunsavedChanges%20%0A%09ifTrue%3A%20%5Bself%20confirm%3A%20%27Cancel%20changes%3F%27%5D%0A%09ifFalse%3A%20%5Btrue%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_removeClass',
smalltalk.method({
selector: 'removeClass',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(self, "_confirm_", [smalltalk.send(smalltalk.send("Do you really want to remove ", "__comma", [smalltalk.send(self['@selectedClass'], "_name", [])]), "__comma", [unescape("%3F")])]), "_ifTrue_", [(function(){smalltalk.send(smalltalk.send(smalltalk.Smalltalk, "_current", []), "_basicDelete_", [smalltalk.send(self['@selectedClass'], "_name", [])]);return smalltalk.send(self, "_selectClass_", [nil]);})]);
return self;},
source: unescape('removeClass%0A%20%20%20%20%28self%20confirm%3A%20%27Do%20you%20really%20want%20to%20remove%20%27%2C%20selectedClass%20name%2C%20%27%3F%27%29%0A%09ifTrue%3A%20%5B%0A%09%20%20%20%20Smalltalk%20current%20basicDelete%3A%20selectedClass%20name.%0A%09%20%20%20%20self%20selectClass%3A%20nil%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_removeMethod',
smalltalk.method({
selector: 'removeMethod',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(self, "_cancelChanges", []), "_ifTrue_", [(function(){return smalltalk.send(smalltalk.send(self, "_confirm_", [smalltalk.send(smalltalk.send(unescape("Do%20you%20really%20want%20to%20remove%20%23"), "__comma", [smalltalk.send(self['@selectedMethod'], "_selector", [])]), "__comma", [unescape("%3F")])]), "_ifTrue_", [(function(){smalltalk.send(smalltalk.send(self['@selectedTab'], "__eq", ["instance"]), "_ifTrue_ifFalse_", [(function(){return smalltalk.send(self['@selectedClass'], "_removeCompiledMethod_", [self['@selectedMethod']]);}), (function(){return smalltalk.send(smalltalk.send(self['@selectedClass'], "_class", []), "_removeCompiledMethod_", [self['@selectedMethod']]);})]);return smalltalk.send(self, "_selectMethod_", [nil]);})]);})]);
return self;},
source: unescape('removeMethod%0A%20%20%20%20self%20cancelChanges%20ifTrue%3A%20%5B%0A%09%28self%20confirm%3A%20%27Do%20you%20really%20want%20to%20remove%20%23%27%2C%20selectedMethod%20selector%2C%20%27%3F%27%29%0A%09%20%20%20%20ifTrue%3A%20%5B%0A%09%09selectedTab%20%3D%20%23instance%20%0A%09%09%09ifTrue%3A%20%5BselectedClass%20removeCompiledMethod%3A%20selectedMethod%5D%0A%09%09%09ifFalse%3A%20%5BselectedClass%20class%20removeCompiledMethod%3A%20selectedMethod%5D.%0A%09%09self%20selectMethod%3A%20nil%5D%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_setMethodProtocol_',
smalltalk.method({
selector: 'setMethodProtocol:',
category: 'actions',
fn: function (aString){
var self=this;
smalltalk.send(smalltalk.send(self, "_cancelChanges", []), "_ifTrue_", [(function(){return smalltalk.send(smalltalk.send(smalltalk.send(self, "_protocols", []), "_includes_", [aString]), "_ifFalse_ifTrue_", [(function(){return smalltalk.send(self, "_addNewProtocol", []);}), (function(){smalltalk.send(self['@selectedMethod'], "_category_", [aString]);self['@selectedProtocol']=aString;self['@selectedMethod']=self['@selectedMethod'];return (function($rec){smalltalk.send($rec, "_updateProtocolsList", []);smalltalk.send($rec, "_updateMethodsList", []);return smalltalk.send($rec, "_updateSourceAndButtons", []);})(self);})]);})]);
return self;},
source: unescape('setMethodProtocol%3A%20aString%0A%20%20%20%20self%20cancelChanges%20ifTrue%3A%20%5B%0A%09%28self%20protocols%20includes%3A%20aString%29%0A%09%20%20%20%20ifFalse%3A%20%5Bself%20addNewProtocol%5D%0A%09%20%20%20%20ifTrue%3A%20%5B%0A%09%09selectedMethod%20category%3A%20aString.%0A%09%09selectedProtocol%20%3A%3D%20aString.%0A%09%09selectedMethod%20%3A%3D%20selectedMethod.%0A%09%09self%20%0A%09%09%20%20%20%20updateProtocolsList%3B%0A%09%09%20%20%20%20updateMethodsList%3B%0A%09%09%20%20%20%20updateSourceAndButtons%5D%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_addNewProtocol',
smalltalk.method({
selector: 'addNewProtocol',
category: 'actions',
fn: function (){
var self=this;
var newProtocol=nil;
newProtocol=smalltalk.send(self, "_prompt_", ["New method protocol"]);
smalltalk.send(smalltalk.send(newProtocol, "_notEmpty", []), "_ifTrue_", [(function(){smalltalk.send(self['@selectedMethod'], "_category_", [newProtocol]);return smalltalk.send(self, "_setMethodProtocol_", [newProtocol]);})]);
return self;},
source: unescape('addNewProtocol%0A%20%20%20%20%7C%20newProtocol%20%7C%0A%20%20%20%20newProtocol%20%3A%3D%20self%20prompt%3A%20%27New%20method%20protocol%27.%0A%20%20%20%20newProtocol%20notEmpty%20ifTrue%3A%20%5B%0A%09selectedMethod%20category%3A%20newProtocol.%0A%09self%20setMethodProtocol%3A%20newProtocol%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_selectCategory_',
smalltalk.method({
selector: 'selectCategory:',
category: 'actions',
fn: function (aCategory){
var self=this;
smalltalk.send(smalltalk.send(self, "_cancelChanges", []), "_ifTrue_", [(function(){self['@selectedCategory']=aCategory;self['@selectedClass']=self['@selectedProtocol']=self['@selectedMethod']=nil;return (function($rec){smalltalk.send($rec, "_updateCategoriesList", []);smalltalk.send($rec, "_updateClassesList", []);smalltalk.send($rec, "_updateProtocolsList", []);smalltalk.send($rec, "_updateMethodsList", []);return smalltalk.send($rec, "_updateSourceAndButtons", []);})(self);})]);
return self;},
source: unescape('selectCategory%3A%20aCategory%0A%20%20%20%20self%20cancelChanges%20ifTrue%3A%20%5B%0A%09selectedCategory%20%3A%3D%20aCategory.%0A%09selectedClass%20%3A%3D%20selectedProtocol%20%3A%3D%20selectedMethod%20%3A%3D%20%20nil.%0A%09self%20%0A%09%20%20%20%20updateCategoriesList%3B%0A%09%20%20%20%20updateClassesList%3B%0A%09%20%20%20%20updateProtocolsList%3B%0A%09%20%20%20%20updateMethodsList%3B%0A%09%20%20%20%20updateSourceAndButtons%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_selectClass_',
smalltalk.method({
selector: 'selectClass:',
category: 'actions',
fn: function (aClass){
var self=this;
smalltalk.send(smalltalk.send(self, "_cancelChanges", []), "_ifTrue_", [(function(){self['@selectedClass']=aClass;self['@selectedProtocol']=self['@selectedMethod']=nil;return (function($rec){smalltalk.send($rec, "_updateClassesList", []);smalltalk.send($rec, "_updateProtocolsList", []);smalltalk.send($rec, "_updateMethodsList", []);return smalltalk.send($rec, "_updateSourceAndButtons", []);})(self);})]);
return self;},
source: unescape('selectClass%3A%20aClass%0A%20%20%20%20self%20cancelChanges%20ifTrue%3A%20%5B%0A%09selectedClass%20%3A%3D%20aClass.%0A%09selectedProtocol%20%3A%3D%20selectedMethod%20%3A%3D%20nil.%0A%09self%20%0A%09%20%20%20%20updateClassesList%3B%0A%09%20%20%20%20updateProtocolsList%3B%0A%09%20%20%20%20updateMethodsList%3B%0A%09%20%20%20%20updateSourceAndButtons%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_selectProtocol_',
smalltalk.method({
selector: 'selectProtocol:',
category: 'actions',
fn: function (aString){
var self=this;
smalltalk.send(smalltalk.send(self, "_cancelChanges", []), "_ifTrue_", [(function(){self['@selectedProtocol']=aString;self['@selectedMethod']=nil;return (function($rec){smalltalk.send($rec, "_updateProtocolsList", []);smalltalk.send($rec, "_updateMethodsList", []);return smalltalk.send($rec, "_updateSourceAndButtons", []);})(self);})]);
return self;},
source: unescape('selectProtocol%3A%20aString%0A%20%20%20%20self%20cancelChanges%20ifTrue%3A%20%5B%0A%09selectedProtocol%20%3A%3D%20aString.%0A%09selectedMethod%20%3A%3D%20nil.%0A%09self%20%0A%09%20%20%20%20updateProtocolsList%3B%0A%09%20%20%20%20updateMethodsList%3B%0A%09%20%20%20%20updateSourceAndButtons%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_selectMethod_',
smalltalk.method({
selector: 'selectMethod:',
category: 'actions',
fn: function (aMethod){
var self=this;
smalltalk.send(smalltalk.send(self, "_cancelChanges", []), "_ifTrue_", [(function(){self['@selectedMethod']=aMethod;return (function($rec){smalltalk.send($rec, "_updateProtocolsList", []);smalltalk.send($rec, "_updateMethodsList", []);return smalltalk.send($rec, "_updateSourceAndButtons", []);})(self);})]);
return self;},
source: unescape('selectMethod%3A%20aMethod%0A%20%20%20%20self%20cancelChanges%20ifTrue%3A%20%5B%0A%09selectedMethod%20%3A%3D%20aMethod.%0A%09self%20%0A%09%20%20%20%20updateProtocolsList%3B%0A%09%20%20%20%20updateMethodsList%3B%0A%09%20%20%20%20updateSourceAndButtons%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_selectTab_',
smalltalk.method({
selector: 'selectTab:',
category: 'actions',
fn: function (aString){
var self=this;
smalltalk.send(smalltalk.send(self, "_cancelChanges", []), "_ifTrue_", [(function(){self['@selectedTab']=aString;smalltalk.send(self, "_selectProtocol_", [nil]);return smalltalk.send(self, "_updateTabsList", []);})]);
return self;},
source: unescape('selectTab%3A%20aString%0A%20%20%20%20self%20cancelChanges%20ifTrue%3A%20%5B%0A%09selectedTab%20%3A%3D%20aString.%0A%09self%20selectProtocol%3A%20nil.%0A%09self%20updateTabsList%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_renderBoxOn_',
smalltalk.method({
selector: 'renderBoxOn:',
category: 'rendering',
fn: function (html){
var self=this;
(function($rec){smalltalk.send($rec, "_renderTopPanelOn_", [html]);smalltalk.send($rec, "_renderTabsOn_", [html]);return smalltalk.send($rec, "_renderBottomPanelOn_", [html]);})(self);
return self;},
source: unescape('renderBoxOn%3A%20html%0A%20%20%20%20self%20%0A%09renderTopPanelOn%3A%20html%3B%0A%09renderTabsOn%3A%20html%3B%0A%09renderBottomPanelOn%3A%20html%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_renderTopPanelOn_',
smalltalk.method({
selector: 'renderTopPanelOn:',
category: 'rendering',
fn: function (html){
var self=this;
(function($rec){smalltalk.send($rec, "_class_", ["top"]);return smalltalk.send($rec, "_with_", [(function(){self['@categoriesList']=smalltalk.send(smalltalk.send(html, "_ul", []), "_class_", ["jt_column categories"]);self['@commitButton']=(function($rec){smalltalk.send($rec, "_class_", ["jt_commit"]);smalltalk.send($rec, "_title_", ["Commit classes in this category to disk"]);smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_commitCategory", []);})]);return smalltalk.send($rec, "_with_", ["Commit category"]);})(smalltalk.send(html, "_button", []));self['@classesList']=smalltalk.send(smalltalk.send(html, "_ul", []), "_class_", ["jt_column classes"]);self['@protocolsList']=smalltalk.send(smalltalk.send(html, "_ul", []), "_class_", ["jt_column protocols"]);self['@methodsList']=smalltalk.send(smalltalk.send(html, "_ul", []), "_class_", ["jt_column methods"]);(function($rec){smalltalk.send($rec, "_updateCategoriesList", []);smalltalk.send($rec, "_updateClassesList", []);smalltalk.send($rec, "_updateProtocolsList", []);return smalltalk.send($rec, "_updateMethodsList", []);})(self);return smalltalk.send(smalltalk.send(html, "_div", []), "_class_", ["jt_clear"]);})]);})(smalltalk.send(html, "_div", []));
return self;},
source: unescape('renderTopPanelOn%3A%20html%0A%20%20%20%20html%20div%20%0A%09class%3A%20%27top%27%3B%20%0A%09with%3A%20%5B%0A%09%20%20%20%20categoriesList%20%3A%3D%20html%20ul%20class%3A%20%27jt_column%20categories%27.%0A%09%20%20%20%20commitButton%20%3A%3D%20html%20button%20%0A%09%09class%3A%20%27jt_commit%27%3B%0A%09%09title%3A%20%27Commit%20classes%20in%20this%20category%20to%20disk%27%3B%0A%09%09onClick%3A%20%5Bself%20commitCategory%5D%3B%0A%09%09with%3A%20%27Commit%20category%27.%0A%09%20%20%20%20classesList%20%3A%3D%20html%20ul%20class%3A%20%27jt_column%20classes%27.%0A%09%20%20%20%20protocolsList%20%3A%3D%20html%20ul%20class%3A%20%27jt_column%20protocols%27.%0A%09%20%20%20%20methodsList%20%3A%3D%20html%20ul%20class%3A%20%27jt_column%20methods%27.%0A%09%20%20%20%20self%0A%09%09updateCategoriesList%3B%0A%09%09updateClassesList%3B%0A%09%09updateProtocolsList%3B%0A%09%09updateMethodsList.%0A%09%20%20%20%20html%20div%20class%3A%20%27jt_clear%27%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_renderTabsOn_',
smalltalk.method({
selector: 'renderTabsOn:',
category: 'rendering',
fn: function (html){
var self=this;
self['@tabsList']=smalltalk.send(smalltalk.send(html, "_ul", []), "_class_", ["jt_tabs"]);
smalltalk.send(self, "_updateTabsList", []);
return self;},
source: unescape('renderTabsOn%3A%20html%0A%20%20%20%20tabsList%20%3A%3D%20html%20ul%20class%3A%20%27jt_tabs%27.%0A%20%20%20%20self%20updateTabsList.%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_renderBottomPanelOn_',
smalltalk.method({
selector: 'renderBottomPanelOn:',
category: 'rendering',
fn: function (html){
var self=this;
(function($rec){smalltalk.send($rec, "_class_", ["jt_sourceCode"]);return smalltalk.send($rec, "_with_", [(function(){self['@sourceTextarea']=(function($rec){smalltalk.send($rec, "_onKeyPress_", [(function(){return smalltalk.send(self, "_enableSaveButton", []);})]);smalltalk.send($rec, "_class_", ["source"]);return smalltalk.send($rec, "_at_put_", ["spellcheck", "false"]);})(smalltalk.send(html, "_textarea", []));return smalltalk.send(smalltalk.send(self['@sourceTextarea'], "_asJQuery", []), "_call_", ["tabby"]);})]);})(smalltalk.send(html, "_div", []));
return self;},
source: unescape('renderBottomPanelOn%3A%20html%0A%20%20%20%20html%20div%0A%09class%3A%20%27jt_sourceCode%27%3B%0A%09with%3A%20%5B%0A%09%20%20%20%20sourceTextarea%20%3A%3D%20html%20textarea%20%0A%09%09onKeyPress%3A%20%5Bself%20enableSaveButton%5D%3B%0A%09%09class%3A%20%27source%27%3B%0A%09%09at%3A%20%27spellcheck%27%20put%3A%20%27false%27.%0A%09%20%20%20%20sourceTextarea%20asJQuery%20call%3A%20%27tabby%27%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_renderButtonsOn_',
smalltalk.method({
selector: 'renderButtonsOn:',
category: 'rendering',
fn: function (html){
var self=this;
self['@saveButton']=smalltalk.send(html, "_button", []);
(function($rec){smalltalk.send($rec, "_with_", ["Save"]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_compile", []);})]);})(self['@saveButton']);
self['@methodButtons']=smalltalk.send(html, "_span", []);
self['@classButtons']=smalltalk.send(html, "_span", []);
smalltalk.send(self, "_updateSourceAndButtons", []);
return self;},
source: unescape('renderButtonsOn%3A%20html%0A%20%20%20%20saveButton%20%3A%3D%20html%20button.%0A%20%20%20%20saveButton%20%0A%09with%3A%20%27Save%27%3B%0A%09onClick%3A%20%5Bself%20compile%5D.%0A%20%20%20%20methodButtons%20%3A%3D%20html%20span.%0A%20%20%20%20classButtons%20%3A%3D%20html%20span.%0A%20%20%20%20self%20updateSourceAndButtons%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_updateCategoriesList',
smalltalk.method({
selector: 'updateCategoriesList',
category: 'updating',
fn: function (){
var self=this;
smalltalk.send(self['@categoriesList'], "_contents_", [(function(html){return smalltalk.send(smalltalk.send(self, "_categories", []), "_do_", [(function(each){var li=nil;
var label=nil;
smalltalk.send(smalltalk.send(each, "_isEmpty", []), "_ifTrue_ifFalse_", [(function(){return label="Unclassified";}), (function(){return label=each;})]);li=smalltalk.send(html, "_li", []);smalltalk.send(smalltalk.send(self['@selectedCategory'], "__eq", [each]), "_ifTrue_", [(function(){return smalltalk.send(li, "_class_", ["selected"]);})]);return (function($rec){smalltalk.send($rec, "_with_", [label]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_selectCategory_", [each]);})]);})(li);})]);})]);
return self;},
source: unescape('updateCategoriesList%0A%20%20%20%20categoriesList%20contents%3A%20%5B%3Ahtml%20%7C%0A%09self%20categories%20do%3A%20%5B%3Aeach%20%7C%7C%20li%20label%20%7C%0A%09%20%20%20%20each%20isEmpty%20%0A%09%09ifTrue%3A%20%5Blabel%20%3A%3D%20%27Unclassified%27%5D%0A%09%09ifFalse%3A%20%5Blabel%20%3A%3D%20each%5D.%0A%09%20%20%20%20li%20%3A%3D%20html%20li.%0A%09%20%20%20%20selectedCategory%20%3D%20each%20ifTrue%3A%20%5B%0A%09%09li%20class%3A%20%27selected%27%5D.%0A%09%20%20%20%20li%0A%09%09with%3A%20label%3B%0A%09%09onClick%3A%20%5Bself%20selectCategory%3A%20each%5D%5D%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_updateClassesList',
smalltalk.method({
selector: 'updateClassesList',
category: 'updating',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(smalltalk.TabManager, "_current", []), "_update", []);
smalltalk.send(self['@classesList'], "_contents_", [(function(html){return smalltalk.send(smalltalk.send(self, "_classes", []), "_do_", [(function(each){var li=nil;
li=smalltalk.send(html, "_li", []);smalltalk.send(smalltalk.send(self['@selectedClass'], "__eq", [each]), "_ifTrue_", [(function(){return smalltalk.send(li, "_class_", ["selected"]);})]);return (function($rec){smalltalk.send($rec, "_with_", [smalltalk.send(each, "_name", [])]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_selectClass_", [each]);})]);})(li);})]);})]);
return self;},
source: unescape('updateClassesList%0A%20%20%20%20TabManager%20current%20update.%0A%20%20%20%20classesList%20contents%3A%20%5B%3Ahtml%20%7C%0A%09self%20classes%20do%3A%20%5B%3Aeach%20%7C%7C%20li%20%7C%0A%09%20%20%20%20li%20%3A%3D%20html%20li.%0A%09%20%20%20%20selectedClass%20%3D%20each%20ifTrue%3A%20%5B%0A%09%09li%20class%3A%20%27selected%27%5D.%0A%09%20%20%20%20li%0A%09%09with%3A%20each%20name%3B%0A%09%09onClick%3A%20%5Bself%20selectClass%3A%20each%5D%5D%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_updateProtocolsList',
smalltalk.method({
selector: 'updateProtocolsList',
category: 'updating',
fn: function (){
var self=this;
smalltalk.send(self['@protocolsList'], "_contents_", [(function(html){return smalltalk.send(smalltalk.send(self, "_protocols", []), "_do_", [(function(each){var li=nil;
li=smalltalk.send(html, "_li", []);smalltalk.send(smalltalk.send(self['@selectedProtocol'], "__eq", [each]), "_ifTrue_", [(function(){return smalltalk.send(li, "_class_", ["selected"]);})]);return (function($rec){smalltalk.send($rec, "_with_", [each]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_selectProtocol_", [each]);})]);})(li);})]);})]);
return self;},
source: unescape('updateProtocolsList%0A%20%20%20%20protocolsList%20contents%3A%20%5B%3Ahtml%20%7C%0A%09self%20protocols%20do%3A%20%5B%3Aeach%20%7C%7C%20li%20%7C%0A%09%20%20%20%20li%20%3A%3D%20html%20li.%0A%09%20%20%20%20selectedProtocol%20%3D%20each%20ifTrue%3A%20%5B%0A%09%09li%20class%3A%20%27selected%27%5D.%0A%09%20%20%20%20li%20%0A%09%09with%3A%20each%3B%0A%09%09onClick%3A%20%5Bself%20selectProtocol%3A%20each%5D%5D%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_updateMethodsList',
smalltalk.method({
selector: 'updateMethodsList',
category: 'updating',
fn: function (){
var self=this;
smalltalk.send(self['@methodsList'], "_contents_", [(function(html){return smalltalk.send(smalltalk.send(self, "_methods", []), "_do_", [(function(each){var li=nil;
li=smalltalk.send(html, "_li", []);smalltalk.send(smalltalk.send(self['@selectedMethod'], "__eq", [each]), "_ifTrue_", [(function(){return smalltalk.send(li, "_class_", ["selected"]);})]);return (function($rec){smalltalk.send($rec, "_with_", [smalltalk.send(each, "_selector", [])]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_selectMethod_", [each]);})]);})(li);})]);})]);
return self;},
source: unescape('updateMethodsList%0A%20%20%20%20methodsList%20contents%3A%20%5B%3Ahtml%20%7C%0A%09self%20methods%20do%3A%20%5B%3Aeach%20%7C%7C%20li%20%7C%0A%09%20%20%20%20li%20%3A%3D%20html%20li.%0A%09%20%20%20%20selectedMethod%20%3D%20each%20ifTrue%3A%20%5B%0A%09%09li%20class%3A%20%27selected%27%5D.%0A%09%20%20%20%20li%0A%09%09with%3A%20each%20selector%3B%0A%09%09onClick%3A%20%5Bself%20selectMethod%3A%20each%5D%5D%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_updateTabsList',
smalltalk.method({
selector: 'updateTabsList',
category: 'updating',
fn: function (){
var self=this;
smalltalk.send(self['@tabsList'], "_contents_", [(function(html){var li=nil;
li=smalltalk.send(html, "_li", []);smalltalk.send(smalltalk.send(self['@selectedTab'], "__eq", ["instance"]), "_ifTrue_", [(function(){return smalltalk.send(li, "_class_", ["selected"]);})]);(function($rec){smalltalk.send($rec, "_with_", ["Instance"]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_selectTab_", ["instance"]);})]);})(li);li=smalltalk.send(html, "_li", []);smalltalk.send(smalltalk.send(self['@selectedTab'], "__eq", ["class"]), "_ifTrue_", [(function(){return smalltalk.send(li, "_class_", ["selected"]);})]);(function($rec){smalltalk.send($rec, "_with_", ["Class"]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_selectTab_", ["class"]);})]);})(li);li=smalltalk.send(html, "_li", []);smalltalk.send(smalltalk.send(self['@selectedTab'], "__eq", ["comment"]), "_ifTrue_", [(function(){return smalltalk.send(li, "_class_", ["selected"]);})]);return (function($rec){smalltalk.send($rec, "_with_", ["Comment"]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_selectTab_", ["comment"]);})]);})(li);})]);
return self;},
source: unescape('updateTabsList%0A%20%20%20%20tabsList%20contents%3A%20%5B%3Ahtml%20%7C%7C%20li%20%7C%0A%09li%20%3A%3D%20html%20li.%0A%09selectedTab%20%3D%20%23instance%20ifTrue%3A%20%5Bli%20class%3A%20%27selected%27%5D.%0A%09li%0A%09%20%20%20%20with%3A%20%27Instance%27%3B%0A%09%20%20%20%20onClick%3A%20%5Bself%20selectTab%3A%20%23instance%5D.%0A%09li%20%3A%3D%20html%20li.%0A%09selectedTab%20%3D%20%23class%20ifTrue%3A%20%5Bli%20class%3A%20%27selected%27%5D.%0A%09li%0A%09%20%20%20%20with%3A%20%27Class%27%3B%0A%09%20%20%20%20onClick%3A%20%5Bself%20selectTab%3A%20%23class%5D.%0A%09li%20%3A%3D%20html%20li.%0A%09selectedTab%20%3D%20%23comment%20ifTrue%3A%20%5Bli%20class%3A%20%27selected%27%5D.%0A%09li%0A%09%20%20%20%20with%3A%20%27Comment%27%3B%0A%09%20%20%20%20onClick%3A%20%5Bself%20selectTab%3A%20%23comment%5D%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_updateSourceAndButtons',
smalltalk.method({
selector: 'updateSourceAndButtons',
category: 'updating',
fn: function (){
var self=this;
smalltalk.send(self, "_disableSaveButton", []);
smalltalk.send(self['@classButtons'], "_contents_", [(function(html){(function($rec){smalltalk.send($rec, "_with_", ["Rename class"]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_renameClass", []);})]);})(smalltalk.send(html, "_button", []));return (function($rec){smalltalk.send($rec, "_with_", ["Remove class"]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_removeClass", []);})]);})(smalltalk.send(html, "_button", []));})]);
smalltalk.send(self['@methodButtons'], "_contents_", [(function(html){(function($rec){smalltalk.send($rec, "_with_", ["Remove method"]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_removeMethod", []);})]);})(smalltalk.send(html, "_button", []));return (function($rec){smalltalk.send($rec, "_onChange_", [(function(e, select){return smalltalk.send(self, "_setMethodProtocol_", [smalltalk.send(select, "_val", [])]);})]);return smalltalk.send($rec, "_with_", [(function(){(function($rec){smalltalk.send($rec, "_with_", ["Method protocol"]);return smalltalk.send($rec, "_at_put_", ["disabled", "disabled"]);})(smalltalk.send(html, "_option", []));(function($rec){smalltalk.send($rec, "_class_", ["important"]);return smalltalk.send($rec, "_with_", ["New..."]);})(smalltalk.send(html, "_option", []));return smalltalk.send(smalltalk.send(self, "_protocols", []), "_do_", [(function(each){return smalltalk.send(smalltalk.send(html, "_option", []), "_with_", [each]);})]);})]);})(smalltalk.send(html, "_select", []));})]);
smalltalk.send(smalltalk.send(self['@selectedMethod'], "_isNil", []), "_ifTrue_ifFalse_", [(function(){smalltalk.send(self, "_hideMethodButtons", []);return smalltalk.send(smalltalk.send(smalltalk.send(self['@selectedClass'], "_isNil", []), "_or_", [(function(){return smalltalk.send(self['@selectedProtocol'], "_notNil", []);})]), "_ifTrue_ifFalse_", [(function(){return smalltalk.send(self, "_hideClassButtons", []);}), (function(){return smalltalk.send(self, "_showClassButtons", []);})]);}), (function(){smalltalk.send(self, "_hideClassButtons", []);return smalltalk.send(self, "_showMethodButtons", []);})]);
smalltalk.send(smalltalk.send(self['@sourceTextarea'], "_asJQuery", []), "_val_", [smalltalk.send(self, "_source", [])]);
return self;},
source: unescape('updateSourceAndButtons%0A%09self%20disableSaveButton.%0A%09classButtons%20contents%3A%20%5B%3Ahtml%20%7C%0A%09%09html%20button%0A%09%09%09with%3A%20%27Rename%20class%27%3B%0A%09%09%09onClick%3A%20%5Bself%20renameClass%5D.%0A%09%09html%20button%0A%09%09%09with%3A%20%27Remove%20class%27%3B%0A%09%09%09onClick%3A%20%5Bself%20removeClass%5D%5D.%0A%09methodButtons%20contents%3A%20%5B%3Ahtml%20%7C%0A%09%09html%20button%0A%09%09%09with%3A%20%27Remove%20method%27%3B%0A%09%09%09onClick%3A%20%5Bself%20removeMethod%5D.%0A%09%09html%20select%20%0A%09%20%20%20%20%09%09onChange%3A%20%5B%3Ae%20%3Aselect%20%7C%20self%20setMethodProtocol%3A%20select%20val%5D%3B%0A%09%20%20%20%20%09%09with%3A%20%5B%0A%09%09%09%09html%20option%0A%09%09%20%20%20%20%09%09%09with%3A%20%27Method%20protocol%27%3B%0A%09%09%20%20%20%20%09%09%09at%3A%20%27disabled%27%20put%3A%20%27disabled%27.%0A%09%09%09%09html%20option%0A%09%09%20%20%20%20%09%09%09class%3A%20%27important%27%3B%0A%09%09%20%20%20%20%09%09%09with%3A%20%27New...%27.%0A%09%09%09%09self%20protocols%20do%3A%20%5B%3Aeach%20%7C%0A%09%09%20%20%20%20%09%09%09html%20option%20with%3A%20each%5D%5D%5D.%0A%20%20%20%20%09selectedMethod%20isNil%0A%09%09ifTrue%3A%20%5B%0A%09%20%20%20%20%09%09self%20hideMethodButtons.%0A%09%20%20%20%20%09%09%09%28selectedClass%20isNil%20or%3A%20%5BselectedProtocol%20notNil%5D%29%0A%09%09%09%09%09ifTrue%3A%20%5Bself%20hideClassButtons%5D%0A%09%20%20%20%20%09%09%09%09ifFalse%3A%20%5Bself%20showClassButtons%5D%5D%0A%09%09ifFalse%3A%20%5B%0A%09%20%20%20%20%09%09self%20hideClassButtons.%0A%09%20%20%20%20%09%09self%20showMethodButtons%5D.%0A%20%20%20%20%09sourceTextarea%20asJQuery%20val%3A%20self%20source%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_canBeClosed',
smalltalk.method({
selector: 'canBeClosed',
category: 'testing',
fn: function (){
var self=this;
return true;
return self;},
source: unescape('canBeClosed%0A%20%20%20%20%5Etrue%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_renameClass',
smalltalk.method({
selector: 'renameClass',
category: 'actions',
fn: function (){
var self=this;
var newName=nil;
newName=smalltalk.send(self, "_prompt_", [smalltalk.send("Rename class ", "__comma", [smalltalk.send(self['@selectedClass'], "_name", [])])]);
smalltalk.send(smalltalk.send(newName, "_notEmpty", []), "_ifTrue_", [(function(){smalltalk.send(self['@selectedClass'], "_rename_", [newName]);return (function($rec){smalltalk.send($rec, "_updateClassesList", []);return smalltalk.send($rec, "_updateSourceAndButtons", []);})(self);})]);
return self;},
source: unescape('renameClass%0A%20%20%20%20%7C%20newName%20%7C%0A%20%20%20%20newName%20%3A%3D%20self%20prompt%3A%20%27Rename%20class%20%27%2C%20selectedClass%20name.%0A%20%20%20%20newName%20notEmpty%20ifTrue%3A%20%5B%0A%09selectedClass%20rename%3A%20newName.%0A%09self%20%0A%09%09updateClassesList%3B%0A%09%09updateSourceAndButtons%5D%0A')}),
smalltalk.Browser);

smalltalk.addMethod(
'_addInstanceVariableNamed_toClass_',
smalltalk.method({
selector: 'addInstanceVariableNamed:toClass:',
category: 'actions',
fn: function (aString, aClass){
var self=this;
smalltalk.send(smalltalk.send(smalltalk.ClassBuilder, "_new", []), "_addSubclassOf_named_instanceVariableNames_", [smalltalk.send(aClass, "_superclass", []), smalltalk.send(aClass, "_name", []), (function($rec){smalltalk.send($rec, "_add_", [aString]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(smalltalk.send(aClass, "_instanceVariableNames", []), "_copy", []))]);
return self;},
source: unescape('addInstanceVariableNamed%3A%20aString%20toClass%3A%20aClass%0A%09ClassBuilder%20new%0A%09%09addSubclassOf%3A%20aClass%20superclass%20named%3A%20aClass%20name%20instanceVariableNames%3A%20%28aClass%20instanceVariableNames%20copy%20add%3A%20aString%3B%20yourself%29')}),
smalltalk.Browser);


smalltalk.addMethod(
'_openOn_',
smalltalk.method({
selector: 'openOn:',
category: 'convenience',
fn: function (aClass){
var self=this;
(function($rec){smalltalk.send($rec, "_open", []);smalltalk.send($rec, "_selectCategory_", [smalltalk.send(aClass, "_category", [])]);return smalltalk.send($rec, "_selectClass_", [aClass]);})(smalltalk.send(self, "_new", []));
return self;},
source: unescape('openOn%3A%20aClass%0A%20%20%20%20self%20new%0A%09open%3B%0A%09selectCategory%3A%20aClass%20category%3B%0A%09selectClass%3A%20aClass%0A')}),
smalltalk.Browser.klass);

smalltalk.addMethod(
'_open',
smalltalk.method({
selector: 'open',
category: 'convenience',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(self, "_new", []), "_open", []);
return self;},
source: unescape('open%0A%20%20%20%20self%20new%20open%0A')}),
smalltalk.Browser.klass);

smalltalk.addMethod(
'_commitPath',
smalltalk.method({
selector: 'commitPath',
category: 'accessing',
fn: function (){
var self=this;
return "js";
return self;},
source: unescape('commitPath%0A%09%5E%27js%27')}),
smalltalk.Browser.klass);


smalltalk.addClass('Inspector', smalltalk.TabWidget, ['label', 'variables', 'object', 'selectedVariable', 'variablesList', 'valueTextarea', 'workspaceTextarea', 'diveButton'], 'IDE');
smalltalk.addMethod(
'_label',
smalltalk.method({
selector: 'label',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@label'], "_ifNil_", [(function(){return unescape("Inspector%20%28nil%29");})]);
return self;},
source: unescape('label%0A%09%5Elabel%20ifNil%3A%20%5B%27Inspector%20%28nil%29%27%5D')}),
smalltalk.Inspector);

smalltalk.addMethod(
'_canBeClosed',
smalltalk.method({
selector: 'canBeClosed',
category: 'testing',
fn: function (){
var self=this;
return true;
return self;},
source: unescape('canBeClosed%0A%09%5Etrue')}),
smalltalk.Inspector);

smalltalk.addMethod(
'_inspect_',
smalltalk.method({
selector: 'inspect:',
category: 'actions',
fn: function (anObject){
var self=this;
self['@object']=anObject;
self['@variables']=[];
smalltalk.send(self['@object'], "_inspectOn_", [self]);
return self;},
source: unescape('inspect%3A%20anObject%0A%09object%20%3A%3D%20anObject.%0A%09variables%20%3A%3D%20%23%28%29.%0A%09object%20inspectOn%3A%20self')}),
smalltalk.Inspector);

smalltalk.addMethod(
'_variables',
smalltalk.method({
selector: 'variables',
category: 'accessing',
fn: function (){
var self=this;
return self['@variables'];
return self;},
source: unescape('variables%0A%09%5Evariables')}),
smalltalk.Inspector);

smalltalk.addMethod(
'_setVariables_',
smalltalk.method({
selector: 'setVariables:',
category: 'accessing',
fn: function (aCollection){
var self=this;
self['@variables']=aCollection;
return self;},
source: unescape('setVariables%3A%20aCollection%0A%09variables%20%3A%3D%20aCollection')}),
smalltalk.Inspector);

smalltalk.addMethod(
'_setLabel_',
smalltalk.method({
selector: 'setLabel:',
category: 'accessing',
fn: function (aString){
var self=this;
self['@label']=aString;
return self;},
source: unescape('setLabel%3A%20aString%0A%09label%20%3A%3D%20aString')}),
smalltalk.Inspector);

smalltalk.addMethod(
'_renderBoxOn_',
smalltalk.method({
selector: 'renderBoxOn:',
category: 'rendering',
fn: function (html){
var self=this;
(function($rec){smalltalk.send($rec, "_renderTopPanelOn_", [html]);return smalltalk.send($rec, "_renderBottomPanelOn_", [html]);})(self);
return self;},
source: unescape('renderBoxOn%3A%20html%0A%09self%20%0A%09%09renderTopPanelOn%3A%20html%3B%0A%09%09renderBottomPanelOn%3A%20html')}),
smalltalk.Inspector);

smalltalk.addMethod(
'_renderTopPanelOn_',
smalltalk.method({
selector: 'renderTopPanelOn:',
category: 'rendering',
fn: function (html){
var self=this;
(function($rec){smalltalk.send($rec, "_class_", ["top"]);return smalltalk.send($rec, "_with_", [(function(){self['@variablesList']=smalltalk.send(smalltalk.send(html, "_ul", []), "_class_", ["jt_column variables"]);self['@valueTextarea']=(function($rec){smalltalk.send($rec, "_class_", ["jt_column value"]);return smalltalk.send($rec, "_at_put_", ["readonly", "readonly"]);})(smalltalk.send(html, "_textarea", []));(function($rec){smalltalk.send($rec, "_updateVariablesList", []);return smalltalk.send($rec, "_updateValueTextarea", []);})(self);return smalltalk.send(smalltalk.send(html, "_div", []), "_class_", ["jt_clear"]);})]);})(smalltalk.send(html, "_div", []));
return self;},
source: unescape('renderTopPanelOn%3A%20html%0A%20%20%20%20html%20div%20%0A%09class%3A%20%27top%27%3B%20%0A%09with%3A%20%5B%0A%09%20%20%20%20variablesList%20%3A%3D%20html%20ul%20class%3A%20%27jt_column%20variables%27.%0A%09%20%20%20%20valueTextarea%20%3A%3D%20html%20textarea%20class%3A%20%27jt_column%20value%27%3B%20at%3A%20%27readonly%27%20put%3A%20%27readonly%27.%0A%09%20%20%20%20self%0A%09%09updateVariablesList%3B%0A%09%09updateValueTextarea.%0A%09%20%20%20%20html%20div%20class%3A%20%27jt_clear%27%5D%0A')}),
smalltalk.Inspector);

smalltalk.addMethod(
'_renderBottomPanelOn_',
smalltalk.method({
selector: 'renderBottomPanelOn:',
category: 'rendering',
fn: function (html){
var self=this;
(function($rec){smalltalk.send($rec, "_class_", ["jt_sourceCode"]);return smalltalk.send($rec, "_with_", [(function(){self['@workspaceTextarea']=(function($rec){smalltalk.send($rec, "_class_", ["source"]);return smalltalk.send($rec, "_at_put_", ["spellcheck", "false"]);})(smalltalk.send(html, "_textarea", []));return smalltalk.send(smalltalk.send(self['@workspaceTextarea'], "_asJQuery", []), "_call_", ["tabby"]);})]);})(smalltalk.send(html, "_div", []));
return self;},
source: unescape('renderBottomPanelOn%3A%20html%0A%20%20%20%20html%20div%0A%09class%3A%20%27jt_sourceCode%27%3B%0A%09with%3A%20%5B%0A%09%20%20%20%20workspaceTextarea%20%3A%3D%20html%20textarea%20%0A%09%09class%3A%20%27source%27%3B%0A%09%09at%3A%20%27spellcheck%27%20put%3A%20%27false%27.%0A%09%20%20%20%20workspaceTextarea%20asJQuery%20call%3A%20%27tabby%27%5D%0A')}),
smalltalk.Inspector);

smalltalk.addMethod(
'_updateVariablesList',
smalltalk.method({
selector: 'updateVariablesList',
category: 'updating',
fn: function (){
var self=this;
smalltalk.send(self['@variablesList'], "_contents_", [(function(html){return smalltalk.send(smalltalk.send(smalltalk.send(self, "_variables", []), "_keys", []), "_do_", [(function(each){var li=nil;
li=smalltalk.send(html, "_li", []);(function($rec){smalltalk.send($rec, "_with_", [each]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_selectVariable_", [each]);})]);})(li);return smalltalk.send(smalltalk.send(smalltalk.send(self, "_selectedVariable", []), "__eq", [each]), "_ifTrue_", [(function(){return smalltalk.send(li, "_class_", ["selected"]);})]);})]);})]);
return self;},
source: unescape('updateVariablesList%0A%09variablesList%20contents%3A%20%5B%3Ahtml%20%7C%0A%09%09self%20variables%20keys%20do%3A%20%5B%3Aeach%20%7C%7C%20li%20%7C%0A%09%09%09li%20%3A%3D%20html%20li.%0A%09%09%09li%0A%09%09%09%09with%3A%20each%3B%0A%09%09%09%09onClick%3A%20%5Bself%20selectVariable%3A%20each%5D.%0A%09%09%09self%20selectedVariable%20%3D%20each%20ifTrue%3A%20%5B%0A%09%09%09%09li%20class%3A%20%27selected%27%5D%5D%5D')}),
smalltalk.Inspector);

smalltalk.addMethod(
'_selectedVariable',
smalltalk.method({
selector: 'selectedVariable',
category: 'accessing',
fn: function (){
var self=this;
return self['@selectedVariable'];
return self;},
source: unescape('selectedVariable%0A%09%5EselectedVariable')}),
smalltalk.Inspector);

smalltalk.addMethod(
'_selectedVariable_',
smalltalk.method({
selector: 'selectedVariable:',
category: 'accessing',
fn: function (aString){
var self=this;
self['@selectedVariable']=aString;
return self;},
source: unescape('selectedVariable%3A%20aString%0A%09selectedVariable%20%3A%3D%20aString')}),
smalltalk.Inspector);

smalltalk.addMethod(
'_selectVariable_',
smalltalk.method({
selector: 'selectVariable:',
category: 'updating',
fn: function (aString){
var self=this;
smalltalk.send(self, "_selectedVariable_", [aString]);
(function($rec){smalltalk.send($rec, "_updateVariablesList", []);smalltalk.send($rec, "_updateValueTextarea", []);return smalltalk.send($rec, "_updateButtons", []);})(self);
return self;},
source: unescape('selectVariable%3A%20aString%0A%09self%20selectedVariable%3A%20aString.%0A%09self%20%0A%09%09updateVariablesList%3B%0A%09%09updateValueTextarea%3B%0A%09%09updateButtons')}),
smalltalk.Inspector);

smalltalk.addMethod(
'_updateValueTextarea',
smalltalk.method({
selector: 'updateValueTextarea',
category: 'updating',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(self['@valueTextarea'], "_asJQuery", []), "_val_", [smalltalk.send(smalltalk.send(smalltalk.send(self, "_selectedVariable", []), "_isNil", []), "_ifTrue_ifFalse_", [(function(){return "";}), (function(){return smalltalk.send(smalltalk.send(smalltalk.send(self, "_variables", []), "_at_", [smalltalk.send(self, "_selectedVariable", [])]), "_printString", []);})])]);
return self;},
source: unescape('updateValueTextarea%0A%09valueTextarea%20asJQuery%20val%3A%20%28self%20selectedVariable%20isNil%0A%09%09ifTrue%3A%20%5B%27%27%5D%0A%09%09ifFalse%3A%20%5B%28self%20variables%20at%3A%20self%20selectedVariable%29%20printString%5D%29')}),
smalltalk.Inspector);

smalltalk.addMethod(
'_renderButtonsOn_',
smalltalk.method({
selector: 'renderButtonsOn:',
category: 'rendering',
fn: function (html){
var self=this;
(function($rec){smalltalk.send($rec, "_with_", ["Refresh"]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_refresh", []);})]);})(smalltalk.send(html, "_button", []));
self['@diveButton']=(function($rec){smalltalk.send($rec, "_with_", ["Dive"]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_dive", []);})]);})(smalltalk.send(html, "_button", []));
smalltalk.send(self, "_updateButtons", []);
return self;},
source: unescape('renderButtonsOn%3A%20html%0A%09html%20button%0A%09%09with%3A%20%27Refresh%27%3B%0A%09%09onClick%3A%20%5Bself%20refresh%5D.%0A%09diveButton%20%3A%3D%20html%20button%20%0A%09%09with%3A%20%27Dive%27%3B%20%0A%09%09onClick%3A%20%5Bself%20dive%5D.%0A%09self%20updateButtons%0A%09')}),
smalltalk.Inspector);

smalltalk.addMethod(
'_dive',
smalltalk.method({
selector: 'dive',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(smalltalk.send(self, "_variables", []), "_at_", [smalltalk.send(self, "_selectedVariable", [])]), "_inspect", []);
return self;},
source: unescape('dive%0A%09%28self%20variables%20at%3A%20self%20selectedVariable%29%20inspect')}),
smalltalk.Inspector);

smalltalk.addMethod(
'_updateButtons',
smalltalk.method({
selector: 'updateButtons',
category: 'updating',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(self, "_selectedVariable", []), "_notNil", []), "_and_", [(function(){return smalltalk.send(smalltalk.send(smalltalk.send(self, "_variables", []), "_at_", [smalltalk.send(self, "_selectedVariable", [])]), "_notNil", []);})]), "_ifFalse_ifTrue_", [(function(){return smalltalk.send(self['@diveButton'], "_at_put_", ["disabled", true]);}), (function(){return smalltalk.send(self['@diveButton'], "_removeAt_", ["disabled"]);})]);
return self;},
source: unescape('updateButtons%0A%09%28self%20selectedVariable%20notNil%20and%3A%20%5B%28self%20variables%20at%3A%20self%20selectedVariable%29%20notNil%5D%29%0A%09%09ifFalse%3A%20%5BdiveButton%20at%3A%20%27disabled%27%20put%3A%20true%5D%20%0A%09%09ifTrue%3A%20%5BdiveButton%20removeAt%3A%20%27disabled%27%5D%0A%09%09')}),
smalltalk.Inspector);

smalltalk.addMethod(
'_refresh',
smalltalk.method({
selector: 'refresh',
category: 'actions',
fn: function (){
var self=this;
(function($rec){smalltalk.send($rec, "_inspect_", [self['@object']]);smalltalk.send($rec, "_updateVariablesList", []);return smalltalk.send($rec, "_updateValueTextarea", []);})(self);
return self;},
source: unescape('refresh%0A%09self%20%0A%09%09inspect%3A%20object%3B%20%0A%09%09updateVariablesList%3B%0A%09%09updateValueTextarea')}),
smalltalk.Inspector);


smalltalk.addMethod(
'_on_',
smalltalk.method({
selector: 'on:',
category: 'instance creation',
fn: function (anObject){
var self=this;
return (function($rec){smalltalk.send($rec, "_inspect_", [anObject]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(self, "_new", []));
return self;},
source: unescape('on%3A%20anObject%0A%09%5Eself%20new%0A%09%09inspect%3A%20anObject%3B%0A%09%09yourself')}),
smalltalk.Inspector.klass);


