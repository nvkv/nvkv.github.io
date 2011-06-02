function Smalltalk(){};
function SmalltalkObject(){};
function SmalltalkBehavior(){};
function SmalltalkClass(){};
function SmalltalkMetaclass(){
    this.meta = true;
};
function SmalltalkMethod(){};
function SmalltalkNil(){};

var nil = new SmalltalkNil();
var smalltalk = new Smalltalk();

smalltalk.klass = function(spec) {
    var spec = spec || {};
    var that;
    if(spec.meta) {
	that = new SmalltalkMetaclass();
    } else {
	that = new (smalltalk.klass({meta: true})).fn;
	that.klass.instanceClass = that;
	that.className = spec.className;
	that.klass.className = that.className + ' class';
    }
	
    that.fn = spec.fn || function(){};
    that.superclass = spec.superclass;
    that.iVarNames = spec.iVarNames || [];
    if(that.superclass) {
	that.klass.superclass = that.superclass.klass;
    }
    that.category = spec.category || "";
    that.fn.prototype.methods = {};
    that.fn.prototype.klass = that;

    return that;
};

smalltalk.method = function(spec) {
    var that = new SmalltalkMethod();
    that.selector = spec.selector;
    that.category = spec.category;
    that.source   = spec.source;
    that.fn       = spec.fn;
    return that
};

smalltalk.init = function(klass) {
    var subclasses = smalltalk.subclasses(klass);
    for(var i=0;i<klass.iVarNames.length;i++) {
	klass.fn.prototype["@"+klass.iVarNames[i]] = nil;
    }
    if(klass.superclass && klass.superclass !== nil) {
	klass.fn.prototype.__proto__ = klass.superclass.fn.prototype;
	for(var i=0;i<klass.superclass.iVarNames.length;i++) {
	    if(!klass["@"+klass.superclass.iVarNames[i]]) {
		klass.fn.prototype["@"+klass.superclass.iVarNames[i]] = nil;
	    }
	}
    }
    for(var i=0;i<subclasses.length;i++) {
     	smalltalk.init(subclasses[i]);
    }
    if(klass.klass && !klass.meta) {
	smalltalk.init(klass.klass);
    }
};

smalltalk.classes = function() {
    var classes = [];
    for(var i in smalltalk) {
	if(i.search(/^[A-Z]/g) != -1) {
	    classes.push(smalltalk[i]);
	}

    }
    return classes
};

smalltalk.subclasses = function(klass) {
    var subclasses = [];
    var classes = smalltalk.classes();
    for(var i in classes) {
	if(classes[i].fn) {
	    //Metaclasses
	    if(classes[i].klass && classes[i].klass.superclass === klass) {
		subclasses.push(classes[i].klass);
	    }
	    //Classes
	    if(classes[i].superclass === klass) {
		subclasses.push(classes[i]);
	    }
	}
    }
    return subclasses;
};

smalltalk.mapClassName = function(className, category, fn, superclass) {
    smalltalk[className] = smalltalk.klass({
		className:  className, 
		category:   category, 
		superclass: superclass,
		fn:         fn
	});
};

smalltalk.addClass = function(className, superclass, iVarNames, category) {
    if(smalltalk[className]) {
	smalltalk[className].superclass = superclass;
	smalltalk[className].iVarNames = iVarNames;
    } else {
	smalltalk[className] = smalltalk.klass({
		className: className, 
		iVarNames: iVarNames,
		superclass: superclass
	    });
    }
    smalltalk[className].category = category || '';
};

smalltalk.addMethod = function(jsSelector, method, klass) {
    klass.fn.prototype[jsSelector] = method.fn;
    klass.fn.prototype.methods[method.selector] = method;
};

smalltalk.mapClassName("Object", "Kernel", SmalltalkObject);
smalltalk.mapClassName("Smalltalk", "Kernel", Smalltalk, smalltalk.Object);
smalltalk.mapClassName("Behavior", "Kernel", SmalltalkBehavior, smalltalk.Object);
smalltalk.mapClassName("Class", "Kernel", SmalltalkClass, smalltalk.Behavior);
smalltalk.mapClassName("Metaclass", "Kernel", SmalltalkMetaclass, smalltalk.Behavior);
smalltalk.mapClassName("CompiledMethod", "Kernel", SmalltalkMethod, smalltalk.Object);

smalltalk.Object.klass.superclass = smalltalk.Class

smalltalk.mapClassName("Number", "Kernel", Number, smalltalk.Object);
smalltalk.mapClassName("BlockClosure", "Kernel", Function, smalltalk.Object);
smalltalk.mapClassName("Boolean", "Kernel", Boolean, smalltalk.Object);
smalltalk.mapClassName("UndefinedObject", "Kernel", SmalltalkNil, smalltalk.Object);

smalltalk.mapClassName("Collection", "Kernel", null, smalltalk.Object);
smalltalk.mapClassName("String", "Kernel", String, smalltalk.Collection);
smalltalk.mapClassName("RegularExpression", "Kernel", RegExp, smalltalk.String);
smalltalk.mapClassName("Array", "Kernel", Array, smalltalk.Collection);

if(CanvasRenderingContext2D) {
    smalltalk.mapClassName("CanvasRenderingContext", "Canvas", CanvasRenderingContext2D, smalltalk.Object);
}

smalltalk.addClass('Object', smalltalk.nil, [], 'Kernel');
smalltalk.addMethod(
'__eq',
smalltalk.method({
selector: '=',
category: 'comparing',
fn: function (anObject) {
    var self = this;
    return function () {return self == anObject;}();
    return self;
},
source: unescape('%3D%20anObject%0A%09%5E%7B%27return%20self%20%3D%3D%20anObject%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_~_eq',
smalltalk.method({
selector: '~=',
category: 'comparing',
fn: function (anObject) {
    var self = this;
    return self.__eq(anObject).__eq_eq(false);
    return self;
},
source: unescape('%7E%3D%20anObject%0A%09%5E%28self%20%3D%20anObject%29%20%3D%3D%20false%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_initialize',
smalltalk.method({
selector: 'initialize',
category: 'initialization',
fn: function () {
    var self = this;
    return self;
},
source: unescape('initialize%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_yourself',
smalltalk.method({
selector: 'yourself',
category: 'accessing',
fn: function () {
    var self = this;
    return self;
    return self;
},
source: unescape('yourself%0A%09%5Eself%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_class',
smalltalk.method({
selector: 'class',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return self.klass;}();
    return self;
},
source: unescape('class%0A%09%5E%7B%27return%20self.klass%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_size',
smalltalk.method({
selector: 'size',
category: 'accessing',
fn: function () {
    var self = this;
    self._error_("Object not indexable");
    return self;
},
source: unescape('size%0A%09self%20error%3A%20%27Object%20not%20indexable%27%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_copy',
smalltalk.method({
selector: 'copy',
category: 'copying',
fn: function () {
    var self = this;
    return self._shallowCopy()._postCopy();
    return self;
},
source: unescape('copy%0A%09%5Eself%20shallowCopy%20postCopy%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_shallowCopy',
smalltalk.method({
selector: 'shallowCopy',
category: 'copying',
fn: function () {
    var self = this;
    return function () {var copy = self.klass._new();for (var i in self) {if (/^@.+/.test(i)) {copy[i] = self[i];}}return copy;}();
    return self;
},
source: unescape('shallowCopy%0A%09%5E%7B%27%0A%09%20%20%20%20var%20copy%20%3D%20self.klass._new%28%29%3B%0A%09%20%20%20%20for%28var%20i%20in%20self%29%20%7B%0A%09%09if%28/%5E@.+/.test%28i%29%29%20%7B%0A%09%09%20%20%20%20copy%5Bi%5D%20%3D%20self%5Bi%5D%3B%0A%09%09%7D%0A%09%20%20%20%20%7D%0A%09%20%20%20%20return%20copy%3B%0A%09%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_deepCopy',
smalltalk.method({
selector: 'deepCopy',
category: 'copying',
fn: function () {
    var self = this;
    (function () {var copy = self.klass._new();for (var i in self) {if (/^@.+/.test(i)) {copy[i] = self[i]._deepCopy();}}return copy;}());
    return self;
},
source: unescape('deepCopy%0A%09%7B%27%09%20%20%20%20%0A%09%20%20%20%20var%20copy%20%3D%20self.klass._new%28%29%3B%0A%09%20%20%20%20for%28var%20i%20in%20self%29%20%7B%0A%09%09if%28/%5E@.+/.test%28i%29%29%20%7B%0A%09%09%20%20%20%20copy%5Bi%5D%20%3D%20self%5Bi%5D._deepCopy%28%29%3B%0A%09%09%7D%0A%09%20%20%20%20%7D%0A%09%20%20%20%20return%20copy%3B%0A%09%27%7D.%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_postCopy',
smalltalk.method({
selector: 'postCopy',
category: 'copying',
fn: function () {
    var self = this;
    return self;
},
source: unescape('postCopy%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'__minus_gt',
smalltalk.method({
selector: '->',
category: 'converting',
fn: function (anObject) {
    var self = this;
    return smalltalk.Association._key_value_(self, anObject);
    return self;
},
source: unescape('-%3E%20anObject%0A%09%5EAssociation%20key%3A%20self%20value%3A%20anObject%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_asString',
smalltalk.method({
selector: 'asString',
category: 'converting',
fn: function () {
    var self = this;
    return self._printString();
    return self;
},
source: unescape('asString%0A%09%5Eself%20printString%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_asJavascript',
smalltalk.method({
selector: 'asJavascript',
category: 'converting',
fn: function () {
    var self = this;
    return self._asString();
    return self;
},
source: unescape('asJavascript%0A%09%5Eself%20asString%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_perform_',
smalltalk.method({
selector: 'perform:',
category: 'message handling',
fn: function (aSymbol) {
    var self = this;
    return self._perform_withArguments_(aSymbol, []);
    return self;
},
source: unescape('perform%3A%20aSymbol%0A%09%5Eself%20perform%3A%20aSymbol%20withArguments%3A%20%23%28%29%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_perform_withArguments_',
smalltalk.method({
selector: 'perform:withArguments:',
category: 'error handling',
fn: function (aSymbol, aCollection) {
    var self = this;
    return self._basicPerform_withArguments_(aSymbol._asSelector(), aCollection);
    return self;
},
source: unescape('perform%3A%20aSymbol%20withArguments%3A%20aCollection%0A%09%5Eself%20basicPerform%3A%20aSymbol%20asSelector%20withArguments%3A%20aCollection%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_instVarAt_',
smalltalk.method({
selector: 'instVarAt:',
category: 'accessing',
fn: function (aString) {
    var self = this;
    return function () {var value = self["@" + aString];if (typeof value == "undefined") {return nil;} else {return value;}}();
    return self;
},
source: unescape('instVarAt%3A%20aString%0A%09%5E%7B%27%0A%09%20%20%20%20var%20value%20%3D%20self%5B%27%27@%27%27+aString%5D%3B%0A%09%20%20%20%20if%28typeof%28value%29%20%3D%3D%20%27%27undefined%27%27%29%20%7B%0A%09%09return%20nil%3B%0A%09%20%20%20%20%7D%20else%20%7B%0A%09%09return%20value%3B%0A%09%20%20%20%20%7D%0A%09%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_instVarAt_put_',
smalltalk.method({
selector: 'instVarAt:put:',
category: 'accessing',
fn: function (aString, anObject) {
    var self = this;
    return function () {self["@" + aString] = anObject;}();
    return self;
},
source: unescape('instVarAt%3A%20aString%20put%3A%20anObject%0A%09%5E%7B%27self%5B%27%27@%27%27%20+%20aString%5D%20%3D%20anObject%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_basicAt_',
smalltalk.method({
selector: 'basicAt:',
category: 'accessing',
fn: function (aString) {
    var self = this;
    return function () {var value = self[aString];if (typeof value == "undefined") {return nil;} else {return value;}}();
    return self;
},
source: unescape('basicAt%3A%20aString%0A%09%5E%7B%27%0A%09%20%20%20%20var%20value%20%3D%20self%5BaString%5D%3B%0A%09%20%20%20%20if%28typeof%28value%29%20%3D%3D%20%27%27undefined%27%27%29%20%7B%0A%09%09return%20nil%3B%0A%09%20%20%20%20%7D%20else%20%7B%0A%09%09return%20value%3B%0A%09%20%20%20%20%7D%0A%09%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_basicAt_put_',
smalltalk.method({
selector: 'basicAt:put:',
category: 'accessing',
fn: function (aString, anObject) {
    var self = this;
    return function () {return self[aString] = anObject;}();
    return self;
},
source: unescape('basicAt%3A%20aString%20put%3A%20anObject%0A%09%5E%7B%27return%20self%5BaString%5D%20%3D%20anObject%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_error_',
smalltalk.method({
selector: 'error:',
category: 'error handling',
fn: function (aString) {
    var self = this;
    smalltalk.Error._signal_(aString);
    return self;
},
source: unescape('error%3A%20aString%0A%09Error%20signal%3A%20aString%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_subclassResponsibility',
smalltalk.method({
selector: 'subclassResponsibility',
category: 'error handling',
fn: function () {
    var self = this;
    self._error_("This method is a responsibility of a subclass");
    return self;
},
source: unescape('subclassResponsibility%0A%09self%20error%3A%20%27This%20method%20is%20a%20responsibility%20of%20a%20subclass%27%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_shouldNotImplement',
smalltalk.method({
selector: 'shouldNotImplement',
category: 'error handling',
fn: function () {
    var self = this;
    self._error_("This method should not be implemented in ".__comma(self._class()._name()));
    return self;
},
source: unescape('shouldNotImplement%0A%09self%20error%3A%20%27This%20method%20should%20not%20be%20implemented%20in%20%27%2C%20self%20class%20name%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_try_catch_',
smalltalk.method({
selector: 'try:catch:',
category: 'error handling',
fn: function (aBlock, anotherBlock) {
    var self = this;
    (function () {try {aBlock();} catch (e) {anotherBlock(e);}}());
    return self;
},
source: unescape('try%3A%20aBlock%20catch%3A%20anotherBlock%0A%09%7B%27try%7BaBlock%28%29%7D%20catch%28e%29%20%7BanotherBlock%28e%29%7D%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_printString',
smalltalk.method({
selector: 'printString',
category: 'printing',
fn: function () {
    var self = this;
    return "a ".__comma(self._class()._name());
    return self;
},
source: unescape('printString%0A%09%5E%27a%20%27%2C%20self%20class%20name%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_printNl',
smalltalk.method({
selector: 'printNl',
category: 'printing',
fn: function () {
    var self = this;
    (function () {console.log(self);}());
    return self;
},
source: unescape('printNl%0A%09%7B%27console.log%28self%29%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_isKindOf_',
smalltalk.method({
selector: 'isKindOf:',
category: 'testing',
fn: function (aClass) {
    var self = this;
    return self._isMemberOf_(aClass)._ifTrue_ifFalse_(function () {return true;}, function () {return self._class()._inheritsFrom_(aClass);});
    return self;
},
source: unescape('isKindOf%3A%20aClass%0A%09%5E%28self%20isMemberOf%3A%20aClass%29%0A%09%20%20%20%20ifTrue%3A%20%5Btrue%5D%0A%09%20%20%20%20ifFalse%3A%20%5Bself%20class%20inheritsFrom%3A%20aClass%5D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_isMemberOf_',
smalltalk.method({
selector: 'isMemberOf:',
category: 'testing',
fn: function (aClass) {
    var self = this;
    return self._class().__eq(aClass);
    return self;
},
source: unescape('isMemberOf%3A%20aClass%0A%09%5Eself%20class%20%3D%20aClass%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_ifNil_',
smalltalk.method({
selector: 'ifNil:',
category: 'testing',
fn: function (aBlock) {
    var self = this;
    return self;
    return self;
},
source: unescape('ifNil%3A%20aBlock%0A%09%5Eself%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_ifNil_ifNotNil_',
smalltalk.method({
selector: 'ifNil:ifNotNil:',
category: 'testing',
fn: function (aBlock, anotherBlock) {
    var self = this;
    return anotherBlock._value();
    return self;
},
source: unescape('ifNil%3A%20aBlock%20ifNotNil%3A%20anotherBlock%0A%09%5EanotherBlock%20value%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_ifNotNil_',
smalltalk.method({
selector: 'ifNotNil:',
category: 'testing',
fn: function (aBlock) {
    var self = this;
    return aBlock._value();
    return self;
},
source: unescape('ifNotNil%3A%20aBlock%0A%09%5EaBlock%20value%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_ifNotNil_ifNil_',
smalltalk.method({
selector: 'ifNotNil:ifNil:',
category: 'testing',
fn: function (aBlock, anotherBlock) {
    var self = this;
    return aBlock._value();
    return self;
},
source: unescape('ifNotNil%3A%20aBlock%20ifNil%3A%20anotherBlock%0A%09%5EaBlock%20value%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_isNil',
smalltalk.method({
selector: 'isNil',
category: 'testing',
fn: function () {
    var self = this;
    return false;
    return self;
},
source: unescape('isNil%0A%09%5Efalse%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_notNil',
smalltalk.method({
selector: 'notNil',
category: 'testing',
fn: function () {
    var self = this;
    return self._isNil()._not();
    return self;
},
source: unescape('notNil%0A%09%5Eself%20isNil%20not%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_isClass',
smalltalk.method({
selector: 'isClass',
category: 'testing',
fn: function () {
    var self = this;
    return false;
    return self;
},
source: unescape('isClass%0A%09%5Efalse%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_isMetaclass',
smalltalk.method({
selector: 'isMetaclass',
category: 'testing',
fn: function () {
    var self = this;
    return false;
    return self;
},
source: unescape('isMetaclass%0A%09%5Efalse%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_isNumber',
smalltalk.method({
selector: 'isNumber',
category: 'testing',
fn: function () {
    var self = this;
    return false;
    return self;
},
source: unescape('isNumber%0A%09%5Efalse%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_isString',
smalltalk.method({
selector: 'isString',
category: 'testing',
fn: function () {
    var self = this;
    return false;
    return self;
},
source: unescape('isString%0A%09%5Efalse%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_isParseFailure',
smalltalk.method({
selector: 'isParseFailure',
category: 'testing',
fn: function () {
    var self = this;
    return false;
    return self;
},
source: unescape('isParseFailure%0A%09%5Efalse%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_basicPerform_',
smalltalk.method({
selector: 'basicPerform:',
category: 'error handling',
fn: function (aSymbol) {
    var self = this;
    return self._basicPerform_withArguments_(aSymbol, []);
    return self;
},
source: unescape('basicPerform%3A%20aSymbol%20%0A%20%20%20%20%5Eself%20basicPerform%3A%20aSymbol%20withArguments%3A%20%23%28%29%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_basicPerform_withArguments_',
smalltalk.method({
selector: 'basicPerform:withArguments:',
category: 'error handling',
fn: function (aSymbol, aCollection) {
    var self = this;
    return function () {return self[aSymbol].apply(self, aCollection);}();
    return self;
},
source: unescape('basicPerform%3A%20aSymbol%20withArguments%3A%20aCollection%0A%09%5E%7B%27return%20self%5BaSymbol%5D.apply%28self%2C%20aCollection%29%3B%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_appendToBrush_',
smalltalk.method({
selector: 'appendToBrush:',
category: '*Canvas',
fn: function (aTagBrush) {
    var self = this;
    aTagBrush._append_(self._asString());
    return self;
},
source: unescape('appendToBrush%3A%20aTagBrush%0A%20%20%20%20aTagBrush%20append%3A%20self%20asString%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_basicDelete_',
smalltalk.method({
selector: 'basicDelete:',
category: 'accessing',
fn: function (aString) {
    var self = this;
    (function () {delete self[aString];}());
    return self;
},
source: unescape('basicDelete%3A%20aString%0A%20%20%20%20%7B%27delete%20self%5BaString%5D%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_inspect',
smalltalk.method({
selector: 'inspect',
category: '*IDE',
fn: function () {
    var self = this;
    (function ($rec) {$rec._inspect_(self);return $rec._open();}(smalltalk.Inspector._new()));
    return self;
},
source: unescape('inspect%0A%09Inspector%20new%20%0A%09%09inspect%3A%20self%3B%0A%09%09open')}),
smalltalk.Object);

smalltalk.addMethod(
'_inspectOn_',
smalltalk.method({
selector: 'inspectOn:',
category: '*IDE',
fn: function (anInspector) {
    var self = this;
    var variables = nil;
    variables = smalltalk.Dictionary._new();
    variables._at_put_(unescape("%23self"), self);
    self._class()._instanceVariableNames()._do_(function (each) {return variables._at_put_(each, self._instVarAt_(each));});
    (function ($rec) {$rec._setLabel_(self._printString());return $rec._setVariables_(variables);}(anInspector));
    return self;
},
source: unescape('inspectOn%3A%20anInspector%0A%09%7C%20variables%20%7C%0A%09variables%20%3A%3D%20Dictionary%20new.%0A%09variables%20at%3A%20%27%23self%27%20put%3A%20self.%0A%09self%20class%20instanceVariableNames%20do%3A%20%5B%3Aeach%20%7C%0A%09%09variables%20at%3A%20each%20put%3A%20%28self%20instVarAt%3A%20each%29%5D.%0A%09anInspector%20%0A%09%09setLabel%3A%20self%20printString%3B%0A%09%09setVariables%3A%20variables%0A%09%0A%09')}),
smalltalk.Object);



smalltalk.addClass('Smalltalk', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'_classes',
smalltalk.method({
selector: 'classes',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return self.classes();}();
    return self;
},
source: unescape('classes%0A%09%5E%7B%27return%20self.classes%28%29%27%7D%0A')}),
smalltalk.Smalltalk);


smalltalk.Smalltalk.klass.iVarNames = ['current'];
smalltalk.addMethod(
'_current',
smalltalk.method({
selector: 'current',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return smalltalk;}();
    return self;
},
source: unescape('current%0A%09%20%20%20%20%5E%7B%27return%20smalltalk%27%7D%0A')}),
smalltalk.Smalltalk.klass);


smalltalk.addClass('Behavior', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'_new',
smalltalk.method({
selector: 'new',
category: 'instance creation',
fn: function () {
    var self = this;
    return function ($rec) {$rec._initialize();return $rec._yourself();}(self._basicNew());
    return self;
},
source: unescape('new%0A%09%5Eself%20basicNew%20%0A%09%20%20%20%20initialize%3B%0A%09%20%20%20%20yourself%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_basicNew',
smalltalk.method({
selector: 'basicNew',
category: 'instance creation',
fn: function () {
    var self = this;
    return function () {return new self.fn;}();
    return self;
},
source: unescape('basicNew%0A%09%5E%7B%27return%20new%20self.fn%28%29%3B%27%7D%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_name',
smalltalk.method({
selector: 'name',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return self.className || nil;}();
    return self;
},
source: unescape('name%0A%09%5E%7B%27return%20self.className%20%7C%7C%20nil%27%7D%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_superclass',
smalltalk.method({
selector: 'superclass',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return self.superclass || nil;}();
    return self;
},
source: unescape('superclass%0A%09%5E%7B%27return%20self.superclass%20%7C%7C%20nil%27%7D%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_subclasses',
smalltalk.method({
selector: 'subclasses',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return smalltalk.subclasses(self);}();
    return self;
},
source: unescape('subclasses%0A%09%5E%7B%27return%20smalltalk.subclasses%28self%29%27%7D%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_allSubclasses',
smalltalk.method({
selector: 'allSubclasses',
category: 'accessing',
fn: function () {
    var self = this;
    var result = nil;
    result = self._subclasses();
    self._subclasses()._do_(function (each) {return result._addAll_(each._allSubclasses());});
    return result;
    return self;
},
source: unescape('allSubclasses%0A%09%7C%20result%20%7C%0A%09result%20%3A%3D%20self%20subclasses.%0A%09self%20subclasses%20do%3A%20%5B%3Aeach%20%7C%0A%09%20%20%20%20result%20addAll%3A%20each%20allSubclasses%5D.%0A%09%5Eresult%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_withAllSubclasses',
smalltalk.method({
selector: 'withAllSubclasses',
category: 'accessing',
fn: function () {
    var self = this;
    return function ($rec) {$rec._addAll_(self._allSubclasses());return $rec._yourself();}(smalltalk.Array._with_(self));
    return self;
},
source: unescape('withAllSubclasses%0A%09%5E%28Array%20with%3A%20self%29%20addAll%3A%20self%20allSubclasses%3B%20yourself%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_prototype',
smalltalk.method({
selector: 'prototype',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return self.fn.prototype;}();
    return self;
},
source: unescape('prototype%0A%09%5E%7B%27return%20self.fn.prototype%27%7D%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_methodDictionary',
smalltalk.method({
selector: 'methodDictionary',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {var dict = smalltalk.Dictionary._new();var methods = self.fn.prototype.methods;for (var i in methods) {if (methods[i].selector) {dict._at_put_(methods[i].selector, methods[i]);}}return dict;}();
    return self;
},
source: unescape('methodDictionary%0A%09%5E%7B%27var%20dict%20%3D%20smalltalk.Dictionary._new%28%29%3B%0A%09var%20methods%20%3D%20self.fn.prototype.methods%3B%0A%09for%28var%20i%20in%20methods%29%20%7B%0A%09%09if%28methods%5Bi%5D.selector%29%20%7B%0A%09%09%09dict._at_put_%28methods%5Bi%5D.selector%2C%20methods%5Bi%5D%29%3B%0A%09%09%7D%0A%09%7D%3B%0A%09return%20dict%27%7D%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_instVarNames',
smalltalk.method({
selector: 'instVarNames',
category: '',
fn: function () {
    var self = this;
    return function () {return self.iVarNames;}();
    return self;
},
source: unescape('')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_methodsFor_',
smalltalk.method({
selector: 'methodsFor:',
category: 'accessing',
fn: function (aString) {
    var self = this;
    return function ($rec) {$rec._class_category_(self, aString);return $rec._yourself();}(smalltalk.ClassCategoryReader._new());
    return self;
},
source: unescape('methodsFor%3A%20aString%0A%09%5EClassCategoryReader%20new%0A%09%20%20%20%20class%3A%20self%20category%3A%20aString%3B%0A%09%20%20%20%20yourself%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_addCompiledMethod_',
smalltalk.method({
selector: 'addCompiledMethod:',
category: 'accessing',
fn: function (aMethod) {
    var self = this;
    (function () {self.fn.prototype[aMethod.selector._asSelector()] = aMethod.fn;self.fn.prototype.methods[aMethod.selector] = aMethod;}());
    return self;
},
source: unescape('addCompiledMethod%3A%20aMethod%0A%09%7B%27self.fn.prototype%5BaMethod.selector._asSelector%28%29%5D%20%3D%20aMethod.fn%3B%0A%09self.fn.prototype.methods%5BaMethod.selector%5D%20%3D%20aMethod%27%7D%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_instanceVariableNames',
smalltalk.method({
selector: 'instanceVariableNames',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return self.iVarNames;}();
    return self;
},
source: unescape('instanceVariableNames%0A%09%5E%7B%27return%20self.iVarNames%27%7D%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_comment',
smalltalk.method({
selector: 'comment',
category: 'accessing',
fn: function () {
    var self = this;
    return self._basicAt_("comment")._ifNil_(function () {return "";});
    return self;
},
source: unescape('comment%0A%20%20%20%20%5E%28self%20basicAt%3A%20%27comment%27%29%20ifNil%3A%20%5B%27%27%5D%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_comment_',
smalltalk.method({
selector: 'comment:',
category: 'accessing',
fn: function (aString) {
    var self = this;
    self._basicAt_put_("comment", aString);
    return self;
},
source: unescape('comment%3A%20aString%0A%20%20%20%20self%20basicAt%3A%20%27comment%27%20put%3A%20aString%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_commentStamp',
smalltalk.method({
selector: 'commentStamp',
category: 'accessing',
fn: function () {
    var self = this;
    return function ($rec) {$rec._class_(self);return $rec._yourself();}(smalltalk.ClassCommentReader._new());
    return self;
},
source: unescape('commentStamp%0A%20%20%20%20%5EClassCommentReader%20new%0A%09class%3A%20self%3B%0A%09yourself%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_removeCompiledMethod_',
smalltalk.method({
selector: 'removeCompiledMethod:',
category: 'accessing',
fn: function (aMethod) {
    var self = this;
    (function () {delete self.fn.prototype[aMethod.selector._asSelector()];delete self.fn.prototype.methods[aMethod.selector];}());
    return self;
},
source: unescape('removeCompiledMethod%3A%20aMethod%0A%09%7B%27delete%20self.fn.prototype%5BaMethod.selector._asSelector%28%29%5D%3B%0A%09delete%20self.fn.prototype.methods%5BaMethod.selector%5D%27%7D%0A')}),
smalltalk.Behavior);



smalltalk.addClass('Class', smalltalk.Behavior, [], 'Kernel');
smalltalk.addMethod(
'_category',
smalltalk.method({
selector: 'category',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return self.category;}();
    return self;
},
source: unescape('category%0A%09%5E%7B%27return%20self.category%27%7D%0A')}),
smalltalk.Class);

smalltalk.addMethod(
'_category_',
smalltalk.method({
selector: 'category:',
category: 'accessing',
fn: function (aString) {
    var self = this;
    (function () {self.category = aString;}());
    return self;
},
source: unescape('category%3A%20aString%0A%09%7B%27self.category%20%3D%20aString%27%7D%0A')}),
smalltalk.Class);

smalltalk.addMethod(
'_subclass_instanceVariableNames_',
smalltalk.method({
selector: 'subclass:instanceVariableNames:',
category: 'class creation',
fn: function (aString, anotherString) {
    var self = this;
    return self._subclass_instanceVariableNames_category_(aString, anotherString, nil);
    return self;
},
source: unescape('subclass%3A%20aString%20instanceVariableNames%3A%20anotherString%0A%09%5Eself%20subclass%3A%20aString%20instanceVariableNames%3A%20anotherString%20category%3A%20nil%0A')}),
smalltalk.Class);

smalltalk.addMethod(
'_subclass_instanceVariableNames_category_',
smalltalk.method({
selector: 'subclass:instanceVariableNames:category:',
category: 'class creation',
fn: function (aString, aString2, aString3) {
    var self = this;
    return smalltalk.ClassBuilder._new()._superclass_subclass_instanceVariableNames_category_(self, aString, aString2, aString3);
    return self;
},
source: unescape('subclass%3A%20aString%20instanceVariableNames%3A%20aString2%20category%3A%20aString3%0A%09%5EClassBuilder%20new%0A%09%20%20%20%20superclass%3A%20self%20subclass%3A%20aString%20instanceVariableNames%3A%20aString2%20category%3A%20aString3%0A')}),
smalltalk.Class);

smalltalk.addMethod(
'_isClass',
smalltalk.method({
selector: 'isClass',
category: 'testing',
fn: function () {
    var self = this;
    return true;
    return self;
},
source: unescape('isClass%0A%09%5Etrue%0A')}),
smalltalk.Class);

smalltalk.addMethod(
'_printString',
smalltalk.method({
selector: 'printString',
category: 'printing',
fn: function () {
    var self = this;
    return self._name();
    return self;
},
source: unescape('printString%0A%09%5Eself%20name%0A')}),
smalltalk.Class);

smalltalk.addMethod(
'_rename_',
smalltalk.method({
selector: 'rename:',
category: 'accessing',
fn: function (aString) {
    var self = this;
    (function () {smalltalk[aString] = self;delete smalltalk[self.className];self.className = aString;}());
    return self;
},
source: unescape('rename%3A%20aString%0A%09%7B%27%0A%09%09smalltalk%5BaString%5D%20%3D%20self%3B%0A%09%09delete%20smalltalk%5Bself.className%5D%3B%0A%09%09self.className%20%3D%20aString%3B%0A%09%27%7D')}),
smalltalk.Class);



smalltalk.addClass('Metaclass', smalltalk.Behavior, [], 'Kernel');
smalltalk.addMethod(
'_instanceClass',
smalltalk.method({
selector: 'instanceClass',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return self.instanceClass;}();
    return self;
},
source: unescape('instanceClass%0A%09%5E%7B%27return%20self.instanceClass%27%7D%0A')}),
smalltalk.Metaclass);

smalltalk.addMethod(
'_instanceVariableNames_',
smalltalk.method({
selector: 'instanceVariableNames:',
category: 'accessing',
fn: function (aCollection) {
    var self = this;
    smalltalk.ClassBuilder._new()._class_instanceVariableNames_(self, aCollection);
    return self;
},
source: unescape('instanceVariableNames%3A%20aCollection%0A%09ClassBuilder%20new%0A%09%20%20%20%20class%3A%20self%20instanceVariableNames%3A%20aCollection%0A')}),
smalltalk.Metaclass);

smalltalk.addMethod(
'_isMetaclass',
smalltalk.method({
selector: 'isMetaclass',
category: 'testing',
fn: function () {
    var self = this;
    return true;
    return self;
},
source: unescape('isMetaclass%0A%09%5Etrue%0A')}),
smalltalk.Metaclass);

smalltalk.addMethod(
'_printString',
smalltalk.method({
selector: 'printString',
category: 'printing',
fn: function () {
    var self = this;
    return self._instanceClass()._name().__comma(" class");
    return self;
},
source: unescape('printString%0A%09%5Eself%20instanceClass%20name%2C%20%27%20class%27%0A')}),
smalltalk.Metaclass);



smalltalk.addClass('CompiledMethod', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'_source',
smalltalk.method({
selector: 'source',
category: 'accessing',
fn: function () {
    var self = this;
    return self._basicAt_("source")._ifNil_(function () {return "";});
    return self;
},
source: unescape('source%0A%09%5E%28self%20basicAt%3A%20%27source%27%29%20ifNil%3A%20%5B%27%27%5D%0A')}),
smalltalk.CompiledMethod);

smalltalk.addMethod(
'_source_',
smalltalk.method({
selector: 'source:',
category: 'accessing',
fn: function (aString) {
    var self = this;
    self._basicAt_put_("source", aString);
    return self;
},
source: unescape('source%3A%20aString%0A%09self%20basicAt%3A%20%27source%27%20put%3A%20aString%0A')}),
smalltalk.CompiledMethod);

smalltalk.addMethod(
'_category',
smalltalk.method({
selector: 'category',
category: 'accessing',
fn: function () {
    var self = this;
    return self._basicAt_("category")._ifNil_(function () {return "";});
    return self;
},
source: unescape('category%0A%09%5E%28self%20basicAt%3A%20%27category%27%29%20ifNil%3A%20%5B%27%27%5D%0A')}),
smalltalk.CompiledMethod);

smalltalk.addMethod(
'_category_',
smalltalk.method({
selector: 'category:',
category: 'accessing',
fn: function (aString) {
    var self = this;
    self._basicAt_put_("category", aString);
    return self;
},
source: unescape('category%3A%20aString%0A%09self%20basicAt%3A%20%27category%27%20put%3A%20aString%0A')}),
smalltalk.CompiledMethod);

smalltalk.addMethod(
'_selector',
smalltalk.method({
selector: 'selector',
category: 'accessing',
fn: function () {
    var self = this;
    return self._basicAt_("selector");
    return self;
},
source: unescape('selector%0A%09%5Eself%20basicAt%3A%20%27selector%27%0A')}),
smalltalk.CompiledMethod);

smalltalk.addMethod(
'_selector_',
smalltalk.method({
selector: 'selector:',
category: 'accessing',
fn: function (aString) {
    var self = this;
    self._basicAt_put_("selector", aString);
    return self;
},
source: unescape('selector%3A%20aString%0A%09self%20basicAt%3A%20%27selector%27%20put%3A%20aString%0A')}),
smalltalk.CompiledMethod);

smalltalk.addMethod(
'_fn',
smalltalk.method({
selector: 'fn',
category: 'accessing',
fn: function () {
    var self = this;
    return self._basicAt_("fn");
    return self;
},
source: unescape('fn%0A%09%5Eself%20basicAt%3A%20%27fn%27%0A')}),
smalltalk.CompiledMethod);

smalltalk.addMethod(
'_fn_',
smalltalk.method({
selector: 'fn:',
category: 'accessing',
fn: function (aBlock) {
    var self = this;
    self._basicAt_put_("fn", aBlock);
    return self;
},
source: unescape('fn%3A%20aBlock%0A%09self%20basicAt%3A%20%27fn%27%20put%3A%20aBlock%0A')}),
smalltalk.CompiledMethod);



smalltalk.addClass('Number', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'__eq',
smalltalk.method({
selector: '=',
category: 'comparing',
fn: function (aNumber) {
    var self = this;
    return function () {return Number(self) == aNumber;}();
    return self;
},
source: unescape('%3D%20aNumber%0A%09%5E%7B%27return%20Number%28self%29%20%3D%3D%20aNumber%27%7D%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'__gt',
smalltalk.method({
selector: '>',
category: 'comparing',
fn: function (aNumber) {
    var self = this;
    return function () {return self > aNumber;}();
    return self;
},
source: unescape('%3E%20aNumber%0A%09%5E%7B%27return%20self%20%3E%20aNumber%27%7D%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'__lt',
smalltalk.method({
selector: '<',
category: 'comparing',
fn: function (aNumber) {
    var self = this;
    return function () {return self < aNumber;}();
    return self;
},
source: unescape('%3C%20aNumber%0A%09%5E%7B%27return%20self%20%3C%20aNumber%27%7D%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'__gt_eq',
smalltalk.method({
selector: '>=',
category: 'comparing',
fn: function (aNumber) {
    var self = this;
    return function () {return self >= aNumber;}();
    return self;
},
source: unescape('%3E%3D%20aNumber%0A%09%5E%7B%27return%20self%20%3E%3D%20aNumber%27%7D%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'__lt_eq',
smalltalk.method({
selector: '<=',
category: 'comparing',
fn: function (aNumber) {
    var self = this;
    return function () {return self <= aNumber;}();
    return self;
},
source: unescape('%3C%3D%20aNumber%0A%09%5E%7B%27return%20self%20%3C%3D%20aNumber%27%7D%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'__plus',
smalltalk.method({
selector: '+',
category: 'arithmetic',
fn: function (aNumber) {
    var self = this;
    return function () {return self + aNumber;}();
    return self;
},
source: unescape('+%20aNumber%0A%09%5E%7B%27return%20self%20+%20aNumber%27%7D%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'__minus',
smalltalk.method({
selector: '-',
category: 'arithmetic',
fn: function (aNumber) {
    var self = this;
    return function () {return self - aNumber;}();
    return self;
},
source: unescape('-%20aNumber%0A%09%5E%7B%27return%20self%20-%20aNumber%27%7D%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'__star',
smalltalk.method({
selector: '*',
category: 'arithmetic',
fn: function (aNumber) {
    var self = this;
    return function () {return self * aNumber;}();
    return self;
},
source: unescape('*%20aNumber%0A%09%5E%7B%27return%20self%20*%20aNumber%27%7D%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'__slash',
smalltalk.method({
selector: '/',
category: 'arithmetic',
fn: function (aNumber) {
    var self = this;
    return function () {return self / aNumber;}();
    return self;
},
source: unescape('/%20aNumber%0A%09%5E%7B%27return%20self%20/%20aNumber%27%7D%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'_max_',
smalltalk.method({
selector: 'max:',
category: 'arithmetic',
fn: function (aNumber) {
    var self = this;
    return function () {return Math.max(self, aNumber);}();
    return self;
},
source: unescape('max%3A%20aNumber%0A%09%5E%7B%27return%20Math.max%28self%2C%20aNumber%29%3B%27%7D%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'_min_',
smalltalk.method({
selector: 'min:',
category: 'arithmetic',
fn: function (aNumber) {
    var self = this;
    return function () {return Math.min(self, aNumber);}();
    return self;
},
source: unescape('min%3A%20aNumber%0A%09%5E%7B%27return%20Math.min%28self%2C%20aNumber%29%3B%27%7D%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'_rounded',
smalltalk.method({
selector: 'rounded',
category: 'converting',
fn: function () {
    var self = this;
    return function () {return Math.round(self);}();
    return self;
},
source: unescape('rounded%0A%09%5E%7B%27return%20Math.round%28self%29%3B%27%7D%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'_truncated',
smalltalk.method({
selector: 'truncated',
category: 'converting',
fn: function () {
    var self = this;
    return function () {return Math.floor(self);}();
    return self;
},
source: unescape('truncated%0A%09%5E%7B%27return%20Math.floor%28self%29%3B%27%7D%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'_to_',
smalltalk.method({
selector: 'to:',
category: 'converting',
fn: function (aNumber) {
    var self = this;
    var array = nil;
    var first = nil;
    var last = nil;
    var count = nil;
    first = self._truncated();
    last = aNumber._truncated().__plus(1);
    count = 1;
    first.__lt_eq(last)._ifFalse_(function () {return self._error_("Wrong interval");});
    array = smalltalk.Array._new();
    last.__minus(first)._timesRepeat_(function () {array._at_put_(count, first);count = count.__plus(1);return first = first.__plus(1);});
    return array;
    return self;
},
source: unescape('to%3A%20aNumber%0A%09%7C%20array%20first%20last%20count%20%7C%0A%09first%20%3A%3D%20self%20truncated.%0A%09last%20%3A%3D%20aNumber%20truncated%20+%201.%0A%09count%20%3A%3D%201.%0A%09%28first%20%3C%3D%20last%29%20ifFalse%3A%20%5Bself%20error%3A%20%27Wrong%20interval%27%5D.%0A%09array%20%3A%3D%20Array%20new.%0A%09%28last%20-%20first%29%20timesRepeat%3A%20%5B%0A%09%20%20%20%20array%20at%3A%20count%20put%3A%20first.%0A%09%20%20%20%20count%20%3A%3D%20count%20+%201.%0A%09%20%20%20%20first%20%3A%3D%20first%20+%201%5D.%0A%09%5Earray%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'_timesRepeat_',
smalltalk.method({
selector: 'timesRepeat:',
category: 'enumerating',
fn: function (aBlock) {
    var self = this;
    var integer = nil;
    var count = nil;
    integer = self._truncated();
    count = 1;
    (function () {return count.__gt(self);}._whileFalse_(function () {aBlock._value();return count = count.__plus(1);}));
    return self;
},
source: unescape('timesRepeat%3A%20aBlock%0A%09%7C%20integer%20count%20%7C%0A%09integer%20%3A%3D%20self%20truncated.%0A%09count%20%3A%3D%201.%0A%09%5Bcount%20%3E%20self%5D%20whileFalse%3A%20%5B%0A%09%20%20%20%20aBlock%20value.%0A%09%20%20%20%20count%20%3A%3D%20count%20+%201%5D%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'_to_do_',
smalltalk.method({
selector: 'to:do:',
category: 'enumerating',
fn: function (aNumber, aBlock) {
    var self = this;
    return self._to_(aNumber)._do_(aBlock);
    return self;
},
source: unescape('to%3A%20aNumber%20do%3A%20aBlock%0A%09%5E%28self%20to%3A%20aNumber%29%20do%3A%20aBlock%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'_asString',
smalltalk.method({
selector: 'asString',
category: 'converting',
fn: function () {
    var self = this;
    return self._printString();
    return self;
},
source: unescape('asString%0A%09%5Eself%20printString%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'_asJavascript',
smalltalk.method({
selector: 'asJavascript',
category: 'converting',
fn: function () {
    var self = this;
    return unescape("%28").__comma(self._printString()).__comma(unescape("%29"));
    return self;
},
source: unescape('asJavascript%0A%09%5E%27%28%27%2C%20self%20printString%2C%20%27%29%27%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'_printString',
smalltalk.method({
selector: 'printString',
category: 'printing',
fn: function () {
    var self = this;
    return function () {return String(self);}();
    return self;
},
source: unescape('printString%0A%09%5E%7B%27return%20String%28self%29%27%7D%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'_isNumber',
smalltalk.method({
selector: 'isNumber',
category: 'testing',
fn: function () {
    var self = this;
    return true;
    return self;
},
source: unescape('isNumber%0A%09%5Etrue%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'_atRandom',
smalltalk.method({
selector: 'atRandom',
category: 'converting',
fn: function () {
    var self = this;
    return smalltalk.Random._new()._next().__star(self)._truncated().__plus(1);
    return self;
},
source: unescape('atRandom%0A%20%20%20%20%5E%28Random%20new%20next%20*%20self%29%20truncated%20+%201%0A')}),
smalltalk.Number);

smalltalk.addMethod(
'__at',
smalltalk.method({
selector: '@',
category: 'converting',
fn: function (aNumber) {
    var self = this;
    return smalltalk.Point._x_y_(self, aNumber);
    return self;
},
source: unescape('@%20aNumber%0A%09%5EPoint%20x%3A%20self%20y%3A%20aNumber')}),
smalltalk.Number);

smalltalk.addMethod(
'_asPoint',
smalltalk.method({
selector: 'asPoint',
category: 'converting',
fn: function () {
    var self = this;
    return smalltalk.Point._x_y_(self, self);
    return self;
},
source: unescape('asPoint%0A%09%5EPoint%20x%3A%20self%20y%3A%20self')}),
smalltalk.Number);

smalltalk.addMethod(
'_clearInterval',
smalltalk.method({
selector: 'clearInterval',
category: 'intervals',
fn: function () {
    var self = this;
    (function () {clearInterval(Number(self));}());
    return self;
},
source: unescape('clearInterval%0A%09%7B%27clearInterval%28Number%28self%29%29%27%7D')}),
smalltalk.Number);


smalltalk.addMethod(
'_pi',
smalltalk.method({
selector: 'pi',
category: 'instance creation',
fn: function () {
    var self = this;
    return function () {return Math.PI;}();
    return self;
},
source: unescape('pi%0A%09%5E%7B%27return%20Math.PI%27%7D')}),
smalltalk.Number.klass);


smalltalk.addClass('BlockClosure', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'_compiledSource',
smalltalk.method({
selector: 'compiledSource',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return self.toString();}();
    return self;
},
source: unescape('compiledSource%0A%09%5E%7B%27return%20self.toString%28%29%27%7D%0A')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_whileTrue_',
smalltalk.method({
selector: 'whileTrue:',
category: 'controlling',
fn: function (aBlock) {
    var self = this;
    (function () {while (self()) {aBlock();}}());
    return self;
},
source: unescape('whileTrue%3A%20aBlock%0A%09%7B%27while%28self%28%29%29%20%7BaBlock%28%29%7D%27%7D%0A')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_whileFalse_',
smalltalk.method({
selector: 'whileFalse:',
category: 'controlling',
fn: function (aBlock) {
    var self = this;
    (function () {while (!self()) {aBlock();}}());
    return self;
},
source: unescape('whileFalse%3A%20aBlock%0A%09%7B%27while%28%21self%28%29%29%20%7BaBlock%28%29%7D%27%7D%0A')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_value',
smalltalk.method({
selector: 'value',
category: 'evaluating',
fn: function () {
    var self = this;
    return function () {return self();}();
    return self;
},
source: unescape('value%0A%09%5E%7B%27return%20self%28%29%3B%27%7D%0A')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_value_',
smalltalk.method({
selector: 'value:',
category: 'evaluating',
fn: function (anArg) {
    var self = this;
    return function () {return self(anArg);}();
    return self;
},
source: unescape('value%3A%20anArg%0A%09%5E%7B%27return%20self%28anArg%29%3B%27%7D%0A')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_value_value_',
smalltalk.method({
selector: 'value:value:',
category: 'evaluating',
fn: function (firstArg, secondArg) {
    var self = this;
    return function () {return self(firstArg, secondArg);}();
    return self;
},
source: unescape('value%3A%20firstArg%20value%3A%20secondArg%0A%09%5E%7B%27return%20self%28firstArg%2C%20secondArg%29%3B%27%7D%0A')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_value_value_value_',
smalltalk.method({
selector: 'value:value:value:',
category: 'evaluating',
fn: function (firstArg, secondArg, thirdArg) {
    var self = this;
    return function () {return self(firstArg, secondArg, thirdArg);}();
    return self;
},
source: unescape('value%3A%20firstArg%20value%3A%20secondArg%20value%3A%20thirdArg%0A%09%5E%7B%27return%20self%28firstArg%2C%20secondArg%2C%20thirdArg%29%3B%27%7D%0A')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_valueWithPossibleArguments_',
smalltalk.method({
selector: 'valueWithPossibleArguments:',
category: 'evaluating',
fn: function (aCollection) {
    var self = this;
    return function () {return self.apply(null, aCollection);}();
    return self;
},
source: unescape('valueWithPossibleArguments%3A%20aCollection%0A%09%5E%7B%27return%20self.apply%28null%2C%20aCollection%29%3B%27%7D%0A')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_on_do_',
smalltalk.method({
selector: 'on:do:',
category: 'error handling',
fn: function (anErrorClass, aBlock) {
    var self = this;
    self._try_catch_(self, function (error) {return error._isKindOf_(anErrorClass)._ifTrue_ifFalse_(function () {return aBlock._value();}, function () {return error._signal();});});
    return self;
},
source: unescape('on%3A%20anErrorClass%20do%3A%20aBlock%0A%09self%20try%3A%20self%20catch%3A%20%5B%3Aerror%20%7C%0A%09%20%20%20%20%28error%20isKindOf%3A%20anErrorClass%29%20%0A%09%20%20%20%20%20ifTrue%3A%20%5BaBlock%20value%5D%0A%09%20%20%20%20%20ifFalse%3A%20%5Berror%20signal%5D%5D%0A')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_appendToJQuery_',
smalltalk.method({
selector: 'appendToJQuery:',
category: '*JQuery',
fn: function (aJQuery) {
    var self = this;
    var canvas = nil;
    canvas = smalltalk.HTMLCanvas._new();
    self._value_(canvas);
    aJQuery._append_(canvas);
    return self;
},
source: unescape('appendToJQuery%3A%20aJQuery%0A%09%7C%20canvas%20%7C%0A%09canvas%20%3A%3D%20HTMLCanvas%20new.%0A%09self%20value%3A%20canvas.%0A%09aJQuery%20append%3A%20canvas%0A')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_appendToBrush_',
smalltalk.method({
selector: 'appendToBrush:',
category: '*Canvas',
fn: function (aTagBrush) {
    var self = this;
    aTagBrush._appendBlock_(self);
    return self;
},
source: unescape('appendToBrush%3A%20aTagBrush%0A%20%20%20%20aTagBrush%20appendBlock%3A%20self%0A')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_valueWithTimeout_',
smalltalk.method({
selector: 'valueWithTimeout:',
category: 'timeout/interval',
fn: function (aNumber) {
    var self = this;
    (function () {setTimeout(self, aNumber);}());
    return self;
},
source: unescape('valueWithTimeout%3A%20aNumber%0A%09%7B%27setTimeout%28self%2C%20aNumber%29%27%7D')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_valueWithInterval_',
smalltalk.method({
selector: 'valueWithInterval:',
category: 'timeout/interval',
fn: function (aNumber) {
    var self = this;
    return function () {return setInterval(self, aNumber);}();
    return self;
},
source: unescape('valueWithInterval%3A%20aNumber%0A%09%5E%7B%27return%20setInterval%28self%2C%20aNumber%29%27%7D')}),
smalltalk.BlockClosure);



smalltalk.addClass('Boolean', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'__eq',
smalltalk.method({
selector: '=',
category: 'comparing',
fn: function (aBoolean) {
    var self = this;
    return function () {return Boolean(self == true) == aBoolean;}();
    return self;
},
source: unescape('%3D%20aBoolean%0A%20%20%20%20%09%5E%7B%27return%20Boolean%28self%20%3D%3D%20true%29%20%3D%3D%20aBoolean%27%7D%0A')}),
smalltalk.Boolean);

smalltalk.addMethod(
'_shallowCopy',
smalltalk.method({
selector: 'shallowCopy',
category: 'copying',
fn: function () {
    var self = this;
    return self;
    return self;
},
source: unescape('shallowCopy%0A%09%5Eself%0A')}),
smalltalk.Boolean);

smalltalk.addMethod(
'_deepCopy',
smalltalk.method({
selector: 'deepCopy',
category: 'copying',
fn: function () {
    var self = this;
    return self;
    return self;
},
source: unescape('deepCopy%0A%09%5Eself%0A')}),
smalltalk.Boolean);

smalltalk.addMethod(
'_ifTrue_',
smalltalk.method({
selector: 'ifTrue:',
category: 'controlling',
fn: function (aBlock) {
    var self = this;
    return self._ifTrue_ifFalse_(aBlock, function () {return nil;});
    return self;
},
source: unescape('ifTrue%3A%20aBlock%0A%09%5Eself%20ifTrue%3A%20aBlock%20ifFalse%3A%20%5B%5D%0A')}),
smalltalk.Boolean);

smalltalk.addMethod(
'_ifFalse_',
smalltalk.method({
selector: 'ifFalse:',
category: 'controlling',
fn: function (aBlock) {
    var self = this;
    return self._ifTrue_ifFalse_(function () {return nil;}, aBlock);
    return self;
},
source: unescape('ifFalse%3A%20aBlock%0A%09%5Eself%20ifTrue%3A%20%5B%5D%20ifFalse%3A%20aBlock%0A')}),
smalltalk.Boolean);

smalltalk.addMethod(
'_ifFalse_ifTrue_',
smalltalk.method({
selector: 'ifFalse:ifTrue:',
category: 'controlling',
fn: function (aBlock, anotherBlock) {
    var self = this;
    return self._ifTrue_ifFalse_(anotherBlock, aBlock);
    return self;
},
source: unescape('ifFalse%3A%20aBlock%20ifTrue%3A%20anotherBlock%0A%09%5Eself%20ifTrue%3A%20anotherBlock%20ifFalse%3A%20aBlock%0A')}),
smalltalk.Boolean);

smalltalk.addMethod(
'_ifTrue_ifFalse_',
smalltalk.method({
selector: 'ifTrue:ifFalse:',
category: 'controlling',
fn: function (aBlock, anotherBlock) {
    var self = this;
    return function () {if (self == true) {return aBlock();} else {return anotherBlock();}}();
    return self;
},
source: unescape('ifTrue%3A%20aBlock%20ifFalse%3A%20anotherBlock%0A%09%5E%7B%27%0A%09%20%20%20%20if%28self%20%3D%3D%20true%29%20%7B%0A%09%09return%20aBlock%28%29%3B%0A%09%20%20%20%20%7D%20else%20%7B%0A%09%09return%20anotherBlock%28%29%3B%0A%09%20%20%20%20%7D%0A%09%27%7D%0A')}),
smalltalk.Boolean);

smalltalk.addMethod(
'_and_',
smalltalk.method({
selector: 'and:',
category: 'controlling',
fn: function (aBlock) {
    var self = this;
    return self.__eq(true)._ifTrue_ifFalse_(aBlock, function () {return false;});
    return self;
},
source: unescape('and%3A%20aBlock%0A%09%5Eself%20%3D%20true%0A%09%20%20%20%20ifTrue%3A%20aBlock%0A%09%20%20%20%20ifFalse%3A%20%5Bfalse%5D%0A')}),
smalltalk.Boolean);

smalltalk.addMethod(
'_or_',
smalltalk.method({
selector: 'or:',
category: 'controlling',
fn: function (aBlock) {
    var self = this;
    return self.__eq(true)._ifTrue_ifFalse_(function () {return true;}, aBlock);
    return self;
},
source: unescape('or%3A%20aBlock%0A%09%5Eself%20%3D%20true%0A%09%20%20%20%20ifTrue%3A%20%5Btrue%5D%0A%09%20%20%20%20ifFalse%3A%20aBlock%0A')}),
smalltalk.Boolean);

smalltalk.addMethod(
'_not',
smalltalk.method({
selector: 'not',
category: 'controlling',
fn: function () {
    var self = this;
    return self.__eq(false);
    return self;
},
source: unescape('not%0A%09%5Eself%20%3D%20false%0A')}),
smalltalk.Boolean);

smalltalk.addMethod(
'_printString',
smalltalk.method({
selector: 'printString',
category: 'printing',
fn: function () {
    var self = this;
    return function () {return self.toString();}();
    return self;
},
source: unescape('printString%0A%09%5E%7B%27return%20self.toString%28%29%27%7D%0A')}),
smalltalk.Boolean);



smalltalk.addClass('UndefinedObject', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'_subclass_instanceVariableNames_',
smalltalk.method({
selector: 'subclass:instanceVariableNames:',
category: 'class creation',
fn: function (aString, anotherString) {
    var self = this;
    return self._subclass_instanceVariableNames_category_(aString, anotherString, nil);
    return self;
},
source: unescape('subclass%3A%20aString%20instanceVariableNames%3A%20anotherString%0A%09%5Eself%20subclass%3A%20aString%20instanceVariableNames%3A%20anotherString%20category%3A%20nil%0A')}),
smalltalk.UndefinedObject);

smalltalk.addMethod(
'_subclass_instanceVariableNames_category_',
smalltalk.method({
selector: 'subclass:instanceVariableNames:category:',
category: 'class creation',
fn: function (aString, aString2, aString3) {
    var self = this;
    return smalltalk.ClassBuilder._new()._superclass_subclass_instanceVariableNames_category_(self, aString, aString2, aString3);
    return self;
},
source: unescape('subclass%3A%20aString%20instanceVariableNames%3A%20aString2%20category%3A%20aString3%0A%09%5EClassBuilder%20new%0A%09%20%20%20%20superclass%3A%20self%20subclass%3A%20aString%20instanceVariableNames%3A%20aString2%20category%3A%20aString3%0A')}),
smalltalk.UndefinedObject);

smalltalk.addMethod(
'_shallowCopy',
smalltalk.method({
selector: 'shallowCopy',
category: 'copying',
fn: function () {
    var self = this;
    return self;
    return self;
},
source: unescape('shallowCopy%0A%09%5Eself%0A')}),
smalltalk.UndefinedObject);

smalltalk.addMethod(
'_deepCopy',
smalltalk.method({
selector: 'deepCopy',
category: 'copying',
fn: function () {
    var self = this;
    return self;
    return self;
},
source: unescape('deepCopy%0A%09%5Eself%0A')}),
smalltalk.UndefinedObject);

smalltalk.addMethod(
'_ifNil_',
smalltalk.method({
selector: 'ifNil:',
category: 'testing',
fn: function (aBlock) {
    var self = this;
    return self._ifNil_ifNotNil_(aBlock, function () {return nil;});
    return self;
},
source: unescape('ifNil%3A%20aBlock%0A%09%5Eself%20ifNil%3A%20aBlock%20ifNotNil%3A%20%5B%5D%0A')}),
smalltalk.UndefinedObject);

smalltalk.addMethod(
'_ifNotNil_',
smalltalk.method({
selector: 'ifNotNil:',
category: 'testing',
fn: function (aBlock) {
    var self = this;
    return self;
    return self;
},
source: unescape('ifNotNil%3A%20aBlock%0A%09%5Eself%0A')}),
smalltalk.UndefinedObject);

smalltalk.addMethod(
'_ifNil_ifNotNil_',
smalltalk.method({
selector: 'ifNil:ifNotNil:',
category: 'testing',
fn: function (aBlock, anotherBlock) {
    var self = this;
    return aBlock._value();
    return self;
},
source: unescape('ifNil%3A%20aBlock%20ifNotNil%3A%20anotherBlock%0A%09%5EaBlock%20value%0A')}),
smalltalk.UndefinedObject);

smalltalk.addMethod(
'_ifNotNil_ifNil_',
smalltalk.method({
selector: 'ifNotNil:ifNil:',
category: 'testing',
fn: function (aBlock, anotherBlock) {
    var self = this;
    return anotherBlock._value();
    return self;
},
source: unescape('ifNotNil%3A%20aBlock%20ifNil%3A%20anotherBlock%0A%09%5EanotherBlock%20value%0A')}),
smalltalk.UndefinedObject);

smalltalk.addMethod(
'_isNil',
smalltalk.method({
selector: 'isNil',
category: 'testing',
fn: function () {
    var self = this;
    return true;
    return self;
},
source: unescape('isNil%0A%09%5Etrue%0A')}),
smalltalk.UndefinedObject);

smalltalk.addMethod(
'_notNil',
smalltalk.method({
selector: 'notNil',
category: 'testing',
fn: function () {
    var self = this;
    return false;
    return self;
},
source: unescape('notNil%0A%09%5Efalse%0A')}),
smalltalk.UndefinedObject);

smalltalk.addMethod(
'_printString',
smalltalk.method({
selector: 'printString',
category: 'printing',
fn: function () {
    var self = this;
    return "nil";
    return self;
},
source: unescape('printString%0A%20%20%20%20%5E%27nil%27%0A')}),
smalltalk.UndefinedObject);


smalltalk.addMethod(
'_new',
smalltalk.method({
selector: 'new',
category: 'instance creation',
fn: function () {
    var self = this;
    self._error_("You cannot create new instances of UndefinedObject. Use nil");
    return self;
},
source: unescape('new%0A%09%20%20%20%20self%20error%3A%20%27You%20cannot%20create%20new%20instances%20of%20UndefinedObject.%20Use%20nil%27%0A')}),
smalltalk.UndefinedObject.klass);


smalltalk.addClass('Collection', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'_size',
smalltalk.method({
selector: 'size',
category: 'accessing',
fn: function () {
    var self = this;
    self._subclassResponsibility();
    return self;
},
source: unescape('size%0A%09self%20subclassResponsibility%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_at_',
smalltalk.method({
selector: 'at:',
category: 'accessing',
fn: function (anIndex) {
    var self = this;
    return self._at_ifAbsent_(anIndex, function () {return self._errorNotFound();});
    return self;
},
source: unescape('at%3A%20anIndex%0A%09%5Eself%20at%3A%20anIndex%20ifAbsent%3A%20%5B%0A%09%20%20%20%20self%20errorNotFound%5D%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_at_put_',
smalltalk.method({
selector: 'at:put:',
category: 'accessing',
fn: function (anIndex, anObject) {
    var self = this;
    self._subclassResponsibility();
    return self;
},
source: unescape('at%3A%20anIndex%20put%3A%20anObject%0A%09self%20subclassResponsibility%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_at_ifAbsent_',
smalltalk.method({
selector: 'at:ifAbsent:',
category: 'accessing',
fn: function (anIndex, aBlock) {
    var self = this;
    self._subclassResponsibility();
    return self;
},
source: unescape('at%3A%20anIndex%20ifAbsent%3A%20aBlock%0A%09self%20subclassResponsibility%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_first',
smalltalk.method({
selector: 'first',
category: 'accessing',
fn: function () {
    var self = this;
    return self._at_(1);
    return self;
},
source: unescape('first%0A%09%5Eself%20at%3A%201%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_second',
smalltalk.method({
selector: 'second',
category: 'accessing',
fn: function () {
    var self = this;
    return self._at_(2);
    return self;
},
source: unescape('second%0A%09%5Eself%20at%3A%202%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_third',
smalltalk.method({
selector: 'third',
category: 'accessing',
fn: function () {
    var self = this;
    return self._at_(3);
    return self;
},
source: unescape('third%0A%09%5Eself%20at%3A%203%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_fourth',
smalltalk.method({
selector: 'fourth',
category: 'accessing',
fn: function () {
    var self = this;
    return self._at_(4);
    return self;
},
source: unescape('fourth%0A%09%5Eself%20at%3A%204%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_last',
smalltalk.method({
selector: 'last',
category: 'accessing',
fn: function () {
    var self = this;
    return self._at_(self._size());
    return self;
},
source: unescape('last%0A%09%5Eself%20at%3A%20self%20size%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_readStream',
smalltalk.method({
selector: 'readStream',
category: 'accessing',
fn: function () {
    var self = this;
    return self._stream();
    return self;
},
source: unescape('readStream%0A%09%5Eself%20stream%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_writeStream',
smalltalk.method({
selector: 'writeStream',
category: 'accessing',
fn: function () {
    var self = this;
    return self._stream();
    return self;
},
source: unescape('writeStream%0A%09%5Eself%20stream%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_stream',
smalltalk.method({
selector: 'stream',
category: 'accessing',
fn: function () {
    var self = this;
    return self._streamClass()._on_(self);
    return self;
},
source: unescape('stream%0A%09%5Eself%20streamClass%20on%3A%20self%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_streamClass',
smalltalk.method({
selector: 'streamClass',
category: 'accessing',
fn: function () {
    var self = this;
    return self._class()._streamClass();
    return self;
},
source: unescape('streamClass%0A%09%5Eself%20class%20streamClass%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_add_',
smalltalk.method({
selector: 'add:',
category: 'adding/removing',
fn: function (anObject) {
    var self = this;
    self._subclassResponsibility();
    return self;
},
source: unescape('add%3A%20anObject%0A%09self%20subclassResponsibility%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_addAll_',
smalltalk.method({
selector: 'addAll:',
category: 'adding/removing',
fn: function (aCollection) {
    var self = this;
    aCollection._do_(function (each) {return self._add_(each);});
    return aCollection;
    return self;
},
source: unescape('addAll%3A%20aCollection%0A%09aCollection%20do%3A%20%5B%3Aeach%20%7C%0A%09%20%20%20%20self%20add%3A%20each%5D.%0A%09%5EaCollection%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'__comma',
smalltalk.method({
selector: ',',
category: 'copying',
fn: function (aCollection) {
    var self = this;
    return function ($rec) {$rec._addAll_(aCollection);return $rec._yourself();}(self._copy());
    return self;
},
source: unescape('%2C%20aCollection%0A%09%5Eself%20copy%20%0A%09%20%20%20%20addAll%3A%20aCollection%3B%20%0A%09%20%20%20%20yourself%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_copyFrom_to_',
smalltalk.method({
selector: 'copyFrom:to:',
category: 'copying',
fn: function (anIndex, anotherIndex) {
    var self = this;
    self._subclassResponsibility();
    return self;
},
source: unescape('copyFrom%3A%20anIndex%20to%3A%20anotherIndex%0A%09self%20subclassResponsibility%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_copyWith_',
smalltalk.method({
selector: 'copyWith:',
category: 'copying',
fn: function (anObject) {
    var self = this;
    return function ($rec) {$rec._add_(anObject);return $rec._yourself();}(self._copy());
    return self;
},
source: unescape('copyWith%3A%20anObject%0A%09%5Eself%20copy%20add%3A%20anObject%3B%20yourself%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_copyWithAll_',
smalltalk.method({
selector: 'copyWithAll:',
category: 'copying',
fn: function (aCollection) {
    var self = this;
    return function ($rec) {$rec._addAll_(aCollection);return $rec._yourself();}(self._copy());
    return self;
},
source: unescape('copyWithAll%3A%20aCollection%0A%09%5Eself%20copy%20addAll%3A%20aCollection%3B%20yourself%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_asArray',
smalltalk.method({
selector: 'asArray',
category: 'converting',
fn: function () {
    var self = this;
    var array = nil;
    var index = nil;
    array = smalltalk.Array._new();
    index = 0;
    self._do_(function (each) {index = index.__plus(1);return array._at_put_(index, each);});
    return array;
    return self;
},
source: unescape('asArray%0A%09%7C%20array%20index%20%7C%0A%09array%20%3A%3D%20Array%20new.%0A%09index%20%3A%3D%200.%0A%09self%20do%3A%20%5B%3Aeach%20%7C%0A%09%20%20%20%20index%20%3A%3D%20index%20+%201.%0A%09%20%20%20%20array%20at%3A%20index%20put%3A%20each%5D.%0A%09%5Earray%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_do_',
smalltalk.method({
selector: 'do:',
category: 'enumerating',
fn: function (aBlock) {
    var self = this;
    (function () {for (var i = 0; i < self.length; i++) {aBlock(self[i]);}}());
    return self;
},
source: unescape('do%3A%20aBlock%0A%09%7B%27for%28var%20i%3D0%3Bi%3Cself.length%3Bi++%29%7BaBlock%28self%5Bi%5D%29%3B%7D%27%7D%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_collect_',
smalltalk.method({
selector: 'collect:',
category: 'enumerating',
fn: function (aBlock) {
    var self = this;
    var stream = nil;
    stream = self._class()._new()._writeStream();
    self._do_(function (each) {return stream._nextPut_(aBlock._value_(each));});
    return stream._contents();
    return self;
},
source: unescape('collect%3A%20aBlock%0A%09%7C%20stream%20%7C%0A%09stream%20%3A%3D%20self%20class%20new%20writeStream.%0A%09self%20do%3A%20%5B%3Aeach%20%7C%0A%09%20%20%20%20stream%20nextPut%3A%20%28aBlock%20value%3A%20each%29%5D.%0A%09%5Estream%20contents%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_detect_',
smalltalk.method({
selector: 'detect:',
category: 'enumerating',
fn: function (aBlock) {
    var self = this;
    return self._detect_ifNone_(aBlock, function () {return self._errorNotFound();});
    return self;
},
source: unescape('detect%3A%20aBlock%0A%09%5Eself%20detect%3A%20aBlock%20ifNone%3A%20%5Bself%20errorNotFound%5D%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_detect_ifNone_',
smalltalk.method({
selector: 'detect:ifNone:',
category: 'enumerating',
fn: function (aBlock, anotherBlock) {
    var self = this;
    return function () {for (var i = 0; i < self.length; i++) {if (aBlock(self[i])) {return self[i];}}return anotherBlock();}();
    return self;
},
source: unescape('detect%3A%20aBlock%20ifNone%3A%20anotherBlock%0A%09%5E%7B%27%0A%09for%28var%20i%20%3D%200%3B%20i%20%3C%20self.length%3B%20i++%29%0A%09%09if%28aBlock%28self%5Bi%5D%29%29%0A%09%09%09return%20self%5Bi%5D%3B%0A%09return%20anotherBlock%28%29%3B%0A%09%27%7D%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_do_separatedBy_',
smalltalk.method({
selector: 'do:separatedBy:',
category: 'enumerating',
fn: function (aBlock, anotherBlock) {
    var self = this;
    var first = nil;
    first = true;
    self._do_(function (each) {first._ifTrue_ifFalse_(function () {return first = false;}, function () {return anotherBlock._value();});return aBlock._value_(each);});
    return self;
},
source: unescape('do%3A%20aBlock%20separatedBy%3A%20anotherBlock%0A%20%20%20%20%09%7C%20first%20%7C%0A%20%20%20%20%09first%20%3A%3D%20true.%0A%20%20%20%20%09self%20do%3A%20%5B%3Aeach%20%7C%0A%20%20%20%20%09%20%20%20%20first%0A%20%20%20%20%09%09ifTrue%3A%20%5Bfirst%20%3A%3D%20false%5D%0A%20%20%20%20%09%09ifFalse%3A%20%5BanotherBlock%20value%5D.%0A%20%20%20%20%09%20%20%20%20aBlock%20value%3A%20each%5D%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_inject_into_',
smalltalk.method({
selector: 'inject:into:',
category: 'enumerating',
fn: function (anObject, aBlock) {
    var self = this;
    var result = nil;
    result = anObject;
    self._do_(function (each) {return result = aBlock._value_value_(result, each);});
    return result;
    return self;
},
source: unescape('inject%3A%20anObject%20into%3A%20aBlock%0A%09%7C%20result%20%7C%0A%09result%20%3A%3D%20anObject.%0A%09self%20do%3A%20%5B%3Aeach%20%7C%20%0A%09%20%20%20%20result%20%3A%3D%20aBlock%20value%3A%20result%20value%3A%20each%5D.%0A%09%5Eresult%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_reject_',
smalltalk.method({
selector: 'reject:',
category: 'enumerating',
fn: function (aBlock) {
    var self = this;
    return self._select_(function (each) {return aBlock._value_(each).__eq(false);});
    return self;
},
source: unescape('reject%3A%20aBlock%0A%09%5Eself%20select%3A%20%5B%3Aeach%20%7C%20%28aBlock%20value%3A%20each%29%20%3D%20false%5D%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_select_',
smalltalk.method({
selector: 'select:',
category: 'enumerating',
fn: function (aBlock) {
    var self = this;
    var stream = nil;
    stream = self._class()._new()._writeStream();
    self._do_(function (each) {return aBlock._value_(each)._ifTrue_(function () {return stream._nextPut_(each);});});
    return stream._contents();
    return self;
},
source: unescape('select%3A%20aBlock%0A%09%7C%20stream%20%7C%0A%09stream%20%3A%3D%20self%20class%20new%20writeStream.%0A%09self%20do%3A%20%5B%3Aeach%20%7C%0A%09%20%20%20%20%28aBlock%20value%3A%20each%29%20ifTrue%3A%20%5B%0A%09%09stream%20nextPut%3A%20each%5D%5D.%0A%09%5Estream%20contents%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_errorNotFound',
smalltalk.method({
selector: 'errorNotFound',
category: 'error handling',
fn: function () {
    var self = this;
    self._error_("Object is not in the collection");
    return self;
},
source: unescape('errorNotFound%0A%09self%20error%3A%20%27Object%20is%20not%20in%20the%20collection%27%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_includes_',
smalltalk.method({
selector: 'includes:',
category: 'testing',
fn: function (anObject) {
    var self = this;
    return function () {var i = self.length;while (i--) {if (self[i].__eq(anObject)) {return true;}}return false;}();
    return self;
},
source: unescape('includes%3A%20anObject%0A%09%5E%7B%27%0A%09%09var%20i%20%3D%20self.length%3B%0A%09%09while%20%28i--%29%20%7B%0A%09%09%09if%20%28self%5Bi%5D.__eq%28anObject%29%29%20%7B%0A%09%09%09%09return%20true%3B%0A%09%09%09%7D%09%0A%09%09%7D%0A%09%09return%20false%3B%0A%0A%09%27%7D%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_notEmpty',
smalltalk.method({
selector: 'notEmpty',
category: 'testing',
fn: function () {
    var self = this;
    return self._isEmpty()._not();
    return self;
},
source: unescape('notEmpty%0A%09%5Eself%20isEmpty%20not%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_isEmpty',
smalltalk.method({
selector: 'isEmpty',
category: 'testing',
fn: function () {
    var self = this;
    return self._size().__eq(0);
    return self;
},
source: unescape('isEmpty%0A%09%5Eself%20size%20%3D%200%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_remove_',
smalltalk.method({
selector: 'remove:',
category: 'adding/removing',
fn: function (anObject) {
    var self = this;
    self._subclassResponsibility();
    return self;
},
source: unescape('remove%3A%20anObject%0A%20%20%20%20self%20subclassResponsibility%0A')}),
smalltalk.Collection);


smalltalk.addMethod(
'_streamClass',
smalltalk.method({
selector: 'streamClass',
category: 'accessing',
fn: function () {
    var self = this;
    return smalltalk.Stream;
    return self;
},
source: unescape('streamClass%0A%09%20%20%20%20%5EStream%0A')}),
smalltalk.Collection.klass);

smalltalk.addMethod(
'_with_',
smalltalk.method({
selector: 'with:',
category: 'instance creation',
fn: function (anObject) {
    var self = this;
    return function ($rec) {$rec._add_(anObject);return $rec._yourself();}(self._new());
    return self;
},
source: unescape('with%3A%20anObject%0A%09%20%20%20%20%5Eself%20new%0A%09%09add%3A%20anObject%3B%0A%09%09yourself%0A')}),
smalltalk.Collection.klass);

smalltalk.addMethod(
'_with_with_',
smalltalk.method({
selector: 'with:with:',
category: 'instance creation',
fn: function (anObject, anotherObject) {
    var self = this;
    return function ($rec) {$rec._add_(anObject);$rec._add_(anotherObject);return $rec._yourself();}(self._new());
    return self;
},
source: unescape('with%3A%20anObject%20with%3A%20anotherObject%0A%09%20%20%20%20%5Eself%20new%0A%09%09add%3A%20anObject%3B%0A%09%09add%3A%20anotherObject%3B%0A%09%09yourself%0A')}),
smalltalk.Collection.klass);

smalltalk.addMethod(
'_with_with_with_',
smalltalk.method({
selector: 'with:with:with:',
category: 'instance creation',
fn: function (firstObject, secondObject, thirdObject) {
    var self = this;
    return function ($rec) {$rec._add_(firstObject);$rec._add_(secondObject);$rec._add_(thirdObject);return $rec._yourself();}(self._new());
    return self;
},
source: unescape('with%3A%20firstObject%20with%3A%20secondObject%20with%3A%20thirdObject%0A%09%20%20%20%20%5Eself%20new%0A%09%09add%3A%20firstObject%3B%0A%09%09add%3A%20secondObject%3B%0A%09%09add%3A%20thirdObject%3B%0A%09%09yourself%0A')}),
smalltalk.Collection.klass);

smalltalk.addMethod(
'_withAll_',
smalltalk.method({
selector: 'withAll:',
category: 'instance creation',
fn: function (aCollection) {
    var self = this;
    return function ($rec) {$rec._addAll_(aCollection);return $rec._yourself();}(self._new());
    return self;
},
source: unescape('withAll%3A%20aCollection%0A%09%20%20%20%20%5Eself%20new%0A%09%09addAll%3A%20aCollection%3B%0A%09%09yourself%0A')}),
smalltalk.Collection.klass);


smalltalk.addClass('String', smalltalk.Collection, [], 'Kernel');
smalltalk.addMethod(
'__eq',
smalltalk.method({
selector: '=',
category: 'comparing',
fn: function (aString) {
    var self = this;
    return function () {return String(self) == aString;}();
    return self;
},
source: unescape('%3D%20aString%0A%09%5E%7B%27return%20String%28self%29%20%3D%3D%20aString%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_size',
smalltalk.method({
selector: 'size',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return self.length;}();
    return self;
},
source: unescape('size%0A%09%5E%7B%27return%20self.length%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_at_',
smalltalk.method({
selector: 'at:',
category: 'accessing',
fn: function (anIndex) {
    var self = this;
    return function () {return self[anIndex - 1] || nil;}();
    return self;
},
source: unescape('at%3A%20anIndex%0A%20%20%20%20%09%5E%7B%27return%20self%5BanIndex%20-%201%5D%20%7C%7C%20nil%3B%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_at_put_',
smalltalk.method({
selector: 'at:put:',
category: 'accessing',
fn: function (anIndex, anObject) {
    var self = this;
    self._errorReadOnly();
    return self;
},
source: unescape('at%3A%20anIndex%20put%3A%20anObject%0A%20%20%20%20%09self%20errorReadOnly%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_at_ifAbsent_',
smalltalk.method({
selector: 'at:ifAbsent:',
category: 'accessing',
fn: function (anIndex, aBlock) {
    var self = this;
    self._at_(anIndex)._ifNil_(function () {return aBlock;});
    return self;
},
source: unescape('at%3A%20anIndex%20ifAbsent%3A%20aBlock%0A%20%20%20%20%09%28self%20at%3A%20anIndex%29%20ifNil%3A%20%5BaBlock%5D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_escaped',
smalltalk.method({
selector: 'escaped',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return escape(self);}();
    return self;
},
source: unescape('escaped%0A%09%5E%7B%27return%20escape%28self%29%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_unescaped',
smalltalk.method({
selector: 'unescaped',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return unescape(self);}();
    return self;
},
source: unescape('unescaped%0A%09%5E%7B%27return%20unescape%28self%29%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_add_',
smalltalk.method({
selector: 'add:',
category: 'adding',
fn: function (anObject) {
    var self = this;
    self._errorReadOnly();
    return self;
},
source: unescape('add%3A%20anObject%0A%20%20%20%20%09self%20errorReadOnly%0A')}),
smalltalk.String);

smalltalk.addMethod(
'__comma',
smalltalk.method({
selector: ',',
category: 'copying',
fn: function (aString) {
    var self = this;
    return function () {return self + aString;}();
    return self;
},
source: unescape('%2C%20aString%0A%20%20%20%20%09%5E%7B%27return%20self%20+%20aString%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_copyFrom_to_',
smalltalk.method({
selector: 'copyFrom:to:',
category: 'copying',
fn: function (anIndex, anotherIndex) {
    var self = this;
    return function () {return self.substring(anIndex - 1, anotherIndex);}();
    return self;
},
source: unescape('copyFrom%3A%20anIndex%20to%3A%20anotherIndex%0A%20%20%20%20%09%5E%7B%27return%20self.substring%28anIndex%20-%201%2C%20anotherIndex%29%3B%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_shallowCopy',
smalltalk.method({
selector: 'shallowCopy',
category: 'copying',
fn: function () {
    var self = this;
    return self._class()._fromString_(self);
    return self;
},
source: unescape('shallowCopy%0A%20%20%20%20%09%5Eself%20class%20fromString%3A%20self%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_deepCopy',
smalltalk.method({
selector: 'deepCopy',
category: 'copying',
fn: function () {
    var self = this;
    return self._shallowCopy();
    return self;
},
source: unescape('deepCopy%0A%20%20%20%20%09%5Eself%20shallowCopy%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_asSelector',
smalltalk.method({
selector: 'asSelector',
category: 'converting',
fn: function () {
    var self = this;
    var selector = nil;
    selector = "_".__comma(self);
    selector = selector._replace_with_(":", "_");
    selector = selector._replace_with_(unescape("%5B+%5D"), "_plus");
    selector = selector._replace_with_(unescape("-"), "_minus");
    selector = selector._replace_with_(unescape("%5B*%5D"), "_star");
    selector = selector._replace_with_(unescape("%5B/%5D"), "_slash");
    selector = selector._replace_with_(unescape("%3E"), "_gt");
    selector = selector._replace_with_(unescape("%3C"), "_lt");
    selector = selector._replace_with_(unescape("%3D"), "_eq");
    selector = selector._replace_with_(unescape("%2C"), "_comma");
    selector = selector._replace_with_(unescape("%5B@%5D"), "_at");
    return selector;
    return self;
},
source: unescape('asSelector%0A%09%7C%20selector%20%7C%0A%09selector%20%3A%3D%20%27_%27%2C%20self.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%3A%27%20with%3A%20%27_%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%5B+%5D%27%20with%3A%20%27_plus%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27-%27%20with%3A%20%27_minus%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%5B*%5D%27%20with%3A%20%27_star%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%5B/%5D%27%20with%3A%20%27_slash%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%3E%27%20with%3A%20%27_gt%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%3C%27%20with%3A%20%27_lt%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%3D%27%20with%3A%20%27_eq%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%2C%27%20with%3A%20%27_comma%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%5B@%5D%27%20with%3A%20%27_at%27.%0A%09%5Eselector%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_asJavascript',
smalltalk.method({
selector: 'asJavascript',
category: 'converting',
fn: function () {
    var self = this;
    return function () {if (self.search(/^[a-zA-Z0-9_:.$ ]*$/) == -1) {return "unescape(\"" + escape(self) + "\")";} else {return "\"" + self + "\"";}}();
    return self;
},
source: unescape('asJavascript%0A%09%5E%7B%27%0A%09if%28self.search%28/%5E%5Ba-zA-Z0-9_%3A.%24%20%5D*%24/%29%20%3D%3D%20-1%29%0A%09%09return%20%22unescape%28%5C%22%22%20+%20escape%28self%29%20+%20%22%5C%22%29%22%3B%0A%09else%0A%09%09return%20%22%5C%22%22%20+%20self%20+%20%22%5C%22%22%3B%0A%09%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_replace_with_',
smalltalk.method({
selector: 'replace:with:',
category: 'regular expressions',
fn: function (aString, anotherString) {
    var self = this;
    return self._replaceRegexp_with_(smalltalk.RegularExpression._fromString_flag_(aString, "g"), anotherString);
    return self;
},
source: unescape('replace%3A%20aString%20with%3A%20anotherString%0A%20%20%20%20%09%5Eself%20replaceRegexp%3A%20%28RegularExpression%20fromString%3A%20aString%20flag%3A%20%27g%27%29%20with%3A%20anotherString%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_replaceRegexp_with_',
smalltalk.method({
selector: 'replaceRegexp:with:',
category: 'regular expressions',
fn: function (aRegexp, aString) {
    var self = this;
    return function () {return self.replace(aRegexp, aString);}();
    return self;
},
source: unescape('replaceRegexp%3A%20aRegexp%20with%3A%20aString%0A%20%20%20%20%09%5E%7B%27return%20self.replace%28aRegexp%2C%20aString%29%3B%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_tokenize_',
smalltalk.method({
selector: 'tokenize:',
category: 'converting',
fn: function (aString) {
    var self = this;
    return function () {return self.split(aString);}();
    return self;
},
source: unescape('tokenize%3A%20aString%0A%09%5E%7B%27return%20self.split%28aString%29%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_match_',
smalltalk.method({
selector: 'match:',
category: 'regular expressions',
fn: function (aRegexp) {
    var self = this;
    return function () {return self.search(aRegexp) != -1;}();
    return self;
},
source: unescape('match%3A%20aRegexp%0A%20%20%20%20%09%5E%7B%27return%20self.search%28aRegexp%29%20%21%3D%20-1%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_asString',
smalltalk.method({
selector: 'asString',
category: 'converting',
fn: function () {
    var self = this;
    return self;
    return self;
},
source: unescape('asString%0A%20%20%20%20%09%5Eself%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_asNumber',
smalltalk.method({
selector: 'asNumber',
category: 'converting',
fn: function () {
    var self = this;
    return function () {return Number(self);}();
    return self;
},
source: unescape('asNumber%0A%09%5E%7B%27return%20Number%28self%29%3B%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_asParser',
smalltalk.method({
selector: 'asParser',
category: 'converting',
fn: function () {
    var self = this;
    return smalltalk.PPStringParser._new()._string_(self);
    return self;
},
source: unescape('asParser%0A%20%20%20%20%09%5EPPStringParser%20new%20string%3A%20self%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_asChoiceParser',
smalltalk.method({
selector: 'asChoiceParser',
category: 'converting',
fn: function () {
    var self = this;
    return smalltalk.PPChoiceParser._withAll_(self._asArray()._collect_(function (each) {return each._asParser();}));
    return self;
},
source: unescape('asChoiceParser%0A%20%20%20%20%09%5EPPChoiceParser%20withAll%3A%20%28self%20asArray%20collect%3A%20%5B%3Aeach%20%7C%20each%20asParser%5D%29%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_asCharacterParser',
smalltalk.method({
selector: 'asCharacterParser',
category: 'converting',
fn: function () {
    var self = this;
    return smalltalk.PPCharacterParser._new()._string_(self);
    return self;
},
source: unescape('asCharacterParser%0A%20%20%20%20%09%5EPPCharacterParser%20new%20string%3A%20self%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_errorReadOnly',
smalltalk.method({
selector: 'errorReadOnly',
category: 'error handling',
fn: function () {
    var self = this;
    self._error_(unescape("Object%20is%20read-only"));
    return self;
},
source: unescape('errorReadOnly%0A%20%20%20%20%09self%20error%3A%20%27Object%20is%20read-only%27%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_printString',
smalltalk.method({
selector: 'printString',
category: 'printing',
fn: function () {
    var self = this;
    return unescape("%27").__comma(self).__comma(unescape("%27"));
    return self;
},
source: unescape('printString%0A%20%20%20%20%09%5E%27%27%27%27%2C%20self%2C%20%27%27%27%27%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_printNl',
smalltalk.method({
selector: 'printNl',
category: 'printing',
fn: function () {
    var self = this;
    (function () {console.log(self);}());
    return self;
},
source: unescape('printNl%0A%09%7B%27console.log%28self%29%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_isString',
smalltalk.method({
selector: 'isString',
category: 'testing',
fn: function () {
    var self = this;
    return true;
    return self;
},
source: unescape('isString%0A%20%20%20%20%09%5Etrue%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_asJQuery',
smalltalk.method({
selector: 'asJQuery',
category: '*JQuery',
fn: function () {
    var self = this;
    return smalltalk.JQuery._fromString_(self);
    return self;
},
source: unescape('asJQuery%0A%20%20%20%20%5EJQuery%20fromString%3A%20self%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_appendToJQuery_',
smalltalk.method({
selector: 'appendToJQuery:',
category: '*JQuery',
fn: function (aJQuery) {
    var self = this;
    (function () {aJQuery._appendElement_(String(self));}());
    return self;
},
source: unescape('appendToJQuery%3A%20aJQuery%0A%20%20%20%20%7B%27aJQuery._appendElement_%28String%28self%29%29%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_appendToBrush_',
smalltalk.method({
selector: 'appendToBrush:',
category: '*Canvas',
fn: function (aTagBrush) {
    var self = this;
    aTagBrush._appendString_(self);
    return self;
},
source: unescape('appendToBrush%3A%20aTagBrush%0A%20%20%20%20aTagBrush%20appendString%3A%20self%0A')}),
smalltalk.String);

smalltalk.addMethod(
'__gt',
smalltalk.method({
selector: '>',
category: 'comparing',
fn: function (aString) {
    var self = this;
    return function () {return String(self) > aString;}();
    return self;
},
source: unescape('%3E%20aString%0A%09%5E%7B%27return%20String%28self%29%20%3E%20aString%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'__lt',
smalltalk.method({
selector: '<',
category: 'comparing',
fn: function (aString) {
    var self = this;
    return function () {return String(self) < aString;}();
    return self;
},
source: unescape('%3C%20aString%0A%09%5E%7B%27return%20String%28self%29%20%3C%20aString%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'__gt_eq',
smalltalk.method({
selector: '>=',
category: 'comparing',
fn: function (aString) {
    var self = this;
    return function () {return String(self) >= aString;}();
    return self;
},
source: unescape('%3E%3D%20aString%0A%09%5E%7B%27return%20String%28self%29%20%3E%3D%20aString%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'__lt_eq',
smalltalk.method({
selector: '<=',
category: 'comparing',
fn: function (aString) {
    var self = this;
    return function () {return String(self) <= aString;}();
    return self;
},
source: unescape('%3C%3D%20aString%0A%09%5E%7B%27return%20String%28self%29%20%3C%3D%20aString%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_remove_',
smalltalk.method({
selector: 'remove:',
category: 'adding',
fn: function (anObject) {
    var self = this;
    self._errorReadOnly();
    return self;
},
source: unescape('remove%3A%20anObject%0A%20%20%20%20self%20errorReadOnly%0A')}),
smalltalk.String);


smalltalk.addMethod(
'_streamClass',
smalltalk.method({
selector: 'streamClass',
category: 'accessing',
fn: function () {
    var self = this;
    return smalltalk.StringStream;
    return self;
},
source: unescape('streamClass%0A%09%20%20%20%20%5EStringStream%0A')}),
smalltalk.String.klass);

smalltalk.addMethod(
'_fromString_',
smalltalk.method({
selector: 'fromString:',
category: 'instance creation',
fn: function (aString) {
    var self = this;
    return function () {return new self.fn(aString);}();
    return self;
},
source: unescape('fromString%3A%20aString%0A%09%20%20%20%20%5E%7B%27return%20new%20self.fn%28aString%29%3B%27%7D%0A')}),
smalltalk.String.klass);

smalltalk.addMethod(
'_cr',
smalltalk.method({
selector: 'cr',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return "\n";}();
    return self;
},
source: unescape('cr%0A%09%20%20%20%20%5E%7B%27%7Breturn%20%27%27%5Cn%27%27%7D%3B%27%7D%0A')}),
smalltalk.String.klass);

smalltalk.addMethod(
'_lf',
smalltalk.method({
selector: 'lf',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return "\r";}();
    return self;
},
source: unescape('lf%0A%09%20%20%20%20%5E%7B%27return%20%27%27%5Cr%27%27%3B%27%7D%0A')}),
smalltalk.String.klass);

smalltalk.addMethod(
'_space',
smalltalk.method({
selector: 'space',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return " ";}();
    return self;
},
source: unescape('space%0A%09%20%20%20%20%5E%7B%27return%20%27%27%20%27%27%3B%27%7D%0A')}),
smalltalk.String.klass);

smalltalk.addMethod(
'_tab',
smalltalk.method({
selector: 'tab',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return "\t";}();
    return self;
},
source: unescape('tab%0A%09%20%20%20%20%5E%7B%27return%20%27%27%5Ct%27%27%3B%27%7D%0A')}),
smalltalk.String.klass);


smalltalk.addClass('RegularExpression', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'_compile_',
smalltalk.method({
selector: 'compile:',
category: 'evaluating',
fn: function (aString) {
    var self = this;
    return function () {return self.compile(aString);}();
    return self;
},
source: unescape('compile%3A%20aString%0A%09%5E%7B%27return%20self.compile%28aString%29%3B%27%7D%0A')}),
smalltalk.RegularExpression);

smalltalk.addMethod(
'_exec_',
smalltalk.method({
selector: 'exec:',
category: 'evaluating',
fn: function (aString) {
    var self = this;
    return function () {return self.exec(aString);}();
    return self;
},
source: unescape('exec%3A%20aString%0A%09%5E%7B%27return%20self.exec%28aString%29%3B%27%7D%0A')}),
smalltalk.RegularExpression);

smalltalk.addMethod(
'_test_',
smalltalk.method({
selector: 'test:',
category: 'evaluating',
fn: function (aString) {
    var self = this;
    return function () {return self.test(aString);}();
    return self;
},
source: unescape('test%3A%20aString%0A%09%5E%7B%27return%20self.test%28aString%29%3B%27%7D%0A')}),
smalltalk.RegularExpression);


smalltalk.addMethod(
'_fromString_flag_',
smalltalk.method({
selector: 'fromString:flag:',
category: 'instance creation',
fn: function (aString, anotherString) {
    var self = this;
    return function () {return new RegExp(aString, anotherString);}();
    return self;
},
source: unescape('fromString%3A%20aString%20flag%3A%20anotherString%0A%09%20%20%20%20%5E%7B%27return%20new%20RegExp%28aString%2C%20anotherString%29%3B%27%7D%0A')}),
smalltalk.RegularExpression.klass);

smalltalk.addMethod(
'_fromString_',
smalltalk.method({
selector: 'fromString:',
category: 'instance creation',
fn: function (aString) {
    var self = this;
    return self._fromString_flag_(aString, "");
    return self;
},
source: unescape('fromString%3A%20aString%0A%09%20%20%20%20%5Eself%20fromString%3A%20aString%20flag%3A%20%27%27%0A')}),
smalltalk.RegularExpression.klass);


smalltalk.addClass('Array', smalltalk.Collection, [], 'Kernel');
smalltalk.addMethod(
'_size',
smalltalk.method({
selector: 'size',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return self.length;}();
    return self;
},
source: unescape('size%0A%09%5E%7B%27return%20self.length%27%7D%0A')}),
smalltalk.Array);

smalltalk.addMethod(
'_at_put_',
smalltalk.method({
selector: 'at:put:',
category: 'accessing',
fn: function (anIndex, anObject) {
    var self = this;
    return function () {return self[anIndex - 1] = anObject;}();
    return self;
},
source: unescape('at%3A%20anIndex%20put%3A%20anObject%0A%09%5E%7B%27return%20self%5BanIndex%20-%201%5D%20%3D%20anObject%27%7D%0A')}),
smalltalk.Array);

smalltalk.addMethod(
'_at_ifAbsent_',
smalltalk.method({
selector: 'at:ifAbsent:',
category: 'accessing',
fn: function (anIndex, aBlock) {
    var self = this;
    return function () {var value = self[anIndex - 1];if (value === undefined) {return aBlock();} else {return value;}}();
    return self;
},
source: unescape('at%3A%20anIndex%20ifAbsent%3A%20aBlock%0A%09%5E%7B%27%0A%09%20%20%20%20var%20value%20%3D%20self%5BanIndex%20-%201%5D%3B%0A%09%20%20%20%20if%28value%20%3D%3D%3D%20undefined%29%20%7B%0A%09%09return%20aBlock%28%29%3B%0A%09%20%20%20%20%7D%20else%20%7B%0A%09%09return%20value%3B%0A%09%20%20%20%20%7D%0A%09%27%7D%0A')}),
smalltalk.Array);

smalltalk.addMethod(
'_add_',
smalltalk.method({
selector: 'add:',
category: 'adding',
fn: function (anObject) {
    var self = this;
    return function () {self.push(anObject);return anObject;}();
    return self;
},
source: unescape('add%3A%20anObject%0A%09%5E%7B%27self.push%28anObject%29%3B%20return%20anObject%3B%27%7D%0A')}),
smalltalk.Array);

smalltalk.addMethod(
'_addLast_',
smalltalk.method({
selector: 'addLast:',
category: 'adding',
fn: function (anObject) {
    var self = this;
    return self._add_(anObject);
    return self;
},
source: unescape('addLast%3A%20anObject%0A%09%5Eself%20add%3A%20anObject%0A')}),
smalltalk.Array);

smalltalk.addMethod(
'_shallowCopy',
smalltalk.method({
selector: 'shallowCopy',
category: 'copying',
fn: function () {
    var self = this;
    var newCollection = nil;
    newCollection = self._class()._new();
    self._do_(function (each) {return newCollection._add_(each);});
    return newCollection;
    return self;
},
source: unescape('shallowCopy%0A%09%7C%20newCollection%20%7C%0A%09newCollection%20%3A%3D%20self%20class%20new.%0A%09self%20do%3A%20%5B%3Aeach%20%7C%20newCollection%20add%3A%20each%5D.%0A%09%5EnewCollection%0A')}),
smalltalk.Array);

smalltalk.addMethod(
'_deepCopy',
smalltalk.method({
selector: 'deepCopy',
category: 'copying',
fn: function () {
    var self = this;
    var newCollection = nil;
    newCollection = self._class()._new();
    self._do_(function (each) {return newCollection._add_(each._deepCopy());});
    return newCollection;
    return self;
},
source: unescape('deepCopy%0A%09%7C%20newCollection%20%7C%0A%09newCollection%20%3A%3D%20self%20class%20new.%0A%09self%20do%3A%20%5B%3Aeach%20%7C%20newCollection%20add%3A%20each%20deepCopy%5D.%0A%09%5EnewCollection%0A')}),
smalltalk.Array);

smalltalk.addMethod(
'_copyFrom_to_',
smalltalk.method({
selector: 'copyFrom:to:',
category: 'copying',
fn: function (anIndex, anotherIndex) {
    var self = this;
    var array = nil;
    array = self._class()._new();
    anIndex._to_do_(anotherIndex, function (each) {return array._add_(self._at_(each));});
    return array;
    return self;
},
source: unescape('copyFrom%3A%20anIndex%20to%3A%20anotherIndex%0A%09%7C%20array%20%7C%0A%09array%20%3A%3D%20self%20class%20new.%0A%09anIndex%20to%3A%20anotherIndex%20do%3A%20%5B%3Aeach%20%7C%0A%09%20%20%20%20array%20add%3A%20%28self%20at%3A%20each%29%5D.%0A%09%5Earray%0A')}),
smalltalk.Array);

smalltalk.addMethod(
'_join_',
smalltalk.method({
selector: 'join:',
category: 'enumerating',
fn: function (aString) {
    var self = this;
    return function () {return self.join(aString);}();
    return self;
},
source: unescape('join%3A%20aString%0A%09%5E%7B%27return%20self.join%28aString%29%3B%27%7D%0A')}),
smalltalk.Array);

smalltalk.addMethod(
'_asJavascript',
smalltalk.method({
selector: 'asJavascript',
category: 'converting',
fn: function () {
    var self = this;
    return unescape("%5B").__comma(self._collect_(function (each) {return each._asJavascript();})._join_(unescape("%2C%20"))).__comma(unescape("%5D"));
    return self;
},
source: unescape('asJavascript%0A%09%5E%27%5B%27%2C%20%28%28self%20collect%3A%20%5B%3Aeach%20%7C%20each%20asJavascript%5D%29%20join%3A%20%27%2C%20%27%29%2C%20%20%27%5D%27%0A')}),
smalltalk.Array);

smalltalk.addMethod(
'_sort',
smalltalk.method({
selector: 'sort',
category: 'enumerating',
fn: function () {
    var self = this;
    return self._copy()._basicPerform_("sort");
    return self;
},
source: unescape('sort%0A%20%20%20%20%5Eself%20copy%20basicPerform%3A%20%27sort%27%0A')}),
smalltalk.Array);

smalltalk.addMethod(
'_sort_',
smalltalk.method({
selector: 'sort:',
category: 'enumerating',
fn: function (aBlock) {
    var self = this;
    return self._copy()._basicPerform_withArguments_("sort", smalltalk.Array._with_(aBlock));
    return self;
},
source: unescape('sort%3A%20aBlock%0A%20%20%20%20%5Eself%20copy%20basicPerform%3A%20%27sort%27%20withArguments%3A%20%28Array%20with%3A%20aBlock%29%0A')}),
smalltalk.Array);

smalltalk.addMethod(
'_remove_',
smalltalk.method({
selector: 'remove:',
category: 'adding',
fn: function (anObject) {
    var self = this;
    (function () {for (var i = 0; i < self.length; i++) {if (self[i] == anObject) {self.splice(i, 1);break;}}}());
    return self;
},
source: unescape('remove%3A%20anObject%0A%20%20%20%20%7B%27for%28var%20i%3D0%3Bi%3Cself.length%3Bi++%29%20%7B%0A%09if%28self%5Bi%5D%20%3D%3D%20anObject%29%20%7B%0A%09%09self.splice%28i%2C1%29%3B%0A%09%09break%3B%0A%09%7D%0A%20%20%20%20%7D%27%7D%0A')}),
smalltalk.Array);



smalltalk.addClass('Error', smalltalk.Object, ['messageText'], 'Kernel');
smalltalk.addMethod(
'_messageText',
smalltalk.method({
selector: 'messageText',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@messageText'];
    return self;
},
source: unescape('messageText%0A%09%5EmessageText%0A')}),
smalltalk.Error);

smalltalk.addMethod(
'_messageText_',
smalltalk.method({
selector: 'messageText:',
category: 'accessing',
fn: function (aString) {
    var self = this;
    self['@messageText'] = aString;
    return self;
},
source: unescape('messageText%3A%20aString%0A%09messageText%20%3A%3D%20aString%0A')}),
smalltalk.Error);

smalltalk.addMethod(
'_signal',
smalltalk.method({
selector: 'signal',
category: 'signaling',
fn: function () {
    var self = this;
    return function () {throw {smalltalkError: self};}();
    return self;
},
source: unescape('signal%0A%09%5E%7B%27throw%28%7BsmalltalkError%3A%20self%7D%29%27%7D%0A')}),
smalltalk.Error);


smalltalk.addMethod(
'_signal_',
smalltalk.method({
selector: 'signal:',
category: 'instance creation',
fn: function (aString) {
    var self = this;
    return function ($rec) {$rec._messageText_(aString);return $rec._signal();}(self._new());
    return self;
},
source: unescape('signal%3A%20aString%0A%09%20%20%20%20%5Eself%20new%0A%09%09messageText%3A%20aString%3B%0A%09%09signal%0A')}),
smalltalk.Error.klass);


smalltalk.addClass('Association', smalltalk.Object, ['key', 'value'], 'Kernel');
smalltalk.addMethod(
'__eq',
smalltalk.method({
selector: '=',
category: 'comparing',
fn: function (anAssociation) {
    var self = this;
    return self._class().__eq(anAssociation._class())._and_(function () {return self._key().__eq(anAssociation._key())._and_(function () {return self._value().__eq(anAssociation._value());});});
    return self;
},
source: unescape('%3D%20anAssociation%0A%09%5Eself%20class%20%3D%20anAssociation%20class%20and%3A%20%5B%0A%09%20%20%20%20self%20key%20%3D%20anAssociation%20key%20and%3A%20%5B%0A%09%09self%20value%20%3D%20anAssociation%20value%5D%5D%0A')}),
smalltalk.Association);

smalltalk.addMethod(
'_key_',
smalltalk.method({
selector: 'key:',
category: 'accessing',
fn: function (aKey) {
    var self = this;
    self['@key'] = aKey;
    return self;
},
source: unescape('key%3A%20aKey%0A%09key%20%3A%3D%20aKey%0A')}),
smalltalk.Association);

smalltalk.addMethod(
'_key',
smalltalk.method({
selector: 'key',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@key'];
    return self;
},
source: unescape('key%0A%09%5Ekey%0A')}),
smalltalk.Association);

smalltalk.addMethod(
'_value_',
smalltalk.method({
selector: 'value:',
category: 'accessing',
fn: function (aValue) {
    var self = this;
    self['@value'] = aValue;
    return self;
},
source: unescape('value%3A%20aValue%0A%09value%20%3A%3D%20aValue%0A')}),
smalltalk.Association);

smalltalk.addMethod(
'_value',
smalltalk.method({
selector: 'value',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@value'];
    return self;
},
source: unescape('value%0A%09%5Evalue%0A')}),
smalltalk.Association);


smalltalk.addMethod(
'_key_value_',
smalltalk.method({
selector: 'key:value:',
category: 'instance creation',
fn: function (aKey, aValue) {
    var self = this;
    return function ($rec) {$rec._key_(aKey);$rec._value_(aValue);return $rec._yourself();}(self._new());
    return self;
},
source: unescape('key%3A%20aKey%20value%3A%20aValue%0A%09%20%20%20%20%5Eself%20new%0A%09%09key%3A%20aKey%3B%0A%09%09value%3A%20aValue%3B%0A%09%09yourself%0A')}),
smalltalk.Association.klass);


smalltalk.addClass('Dictionary', smalltalk.Collection, ['keys'], 'Kernel');
smalltalk.addMethod(
'__eq',
smalltalk.method({
selector: '=',
category: 'comparing',
fn: function (aDictionary) {
    var self = this;
    try {
        self._class().__eq(aDictionary._class())._ifFalse_(function () {return function () {throw {name: "stReturn", selector: "__eq", fn: function () {return false;}};}();});
        self._associationsDo_(function (assoc) {return aDictionary._at_ifAbsent_(assoc._key(), function () {return function () {throw {name: "stReturn", selector: "__eq", fn: function () {return false;}};}();}).__eq(assoc._value())._ifFalse_(function () {return function () {throw {name: "stReturn", selector: "__eq", fn: function () {return false;}};}();});});
        (function () {throw {name: "stReturn", selector: "__eq", fn: function () {return true;}};}());
        return self;
    } catch (e) {
        if (e.name === "stReturn" && e.selector === "__eq") {
            return e.fn();
        }
        throw e;
    }
},
source: unescape('%3D%20aDictionary%0A%09self%20class%20%3D%20aDictionary%20class%20ifFalse%3A%20%5B%5Efalse%5D.%0A%09self%20associationsDo%3A%20%5B%3Aassoc%20%7C%0A%09%20%20%20%20%28aDictionary%20at%3A%20assoc%20key%20ifAbsent%3A%20%5B%5Efalse%5D%29%20%3D%20assoc%20value%20%0A%09%09ifFalse%3A%20%5B%5Efalse%5D%5D.%0A%09%5Etrue%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_shallowCopy',
smalltalk.method({
selector: 'shallowCopy',
category: 'copying',
fn: function () {
    var self = this;
    var copy = nil;
    copy = self._class()._new();
    self._associationsDo_(function (each) {return copy._at_put_(each._key(), each._value());});
    return copy;
    return self;
},
source: unescape('shallowCopy%0A%09%7C%20copy%20%7C%0A%09copy%20%3A%3D%20self%20class%20new.%0A%09self%20associationsDo%3A%20%5B%3Aeach%20%7C%0A%09%20%20%20%20copy%20at%3A%20each%20key%20%20put%3A%20each%20value%5D.%0A%09%5Ecopy%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_initialize',
smalltalk.method({
selector: 'initialize',
category: 'initialization',
fn: function () {
    var self = this;
    self.klass.superclass.fn.prototype._initialize.apply(self, []);
    self['@keys'] = [];
    return self;
},
source: unescape('initialize%0A%20%20%20%20%09super%20initialize.%0A%20%20%20%20%09keys%20%3A%3D%20%23%28%29%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_size',
smalltalk.method({
selector: 'size',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@keys']._size();
    return self;
},
source: unescape('size%0A%09%5Ekeys%20size%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_associations',
smalltalk.method({
selector: 'associations',
category: 'accessing',
fn: function () {
    var self = this;
    var associations = nil;
    associations = [];
    self['@keys']._do_(function (each) {return associations._add_(smalltalk.Association._key_value_(each, self._at_(each)));});
    return associations;
    return self;
},
source: unescape('associations%0A%09%7C%20associations%20%7C%0A%09associations%20%3A%3D%20%23%28%29.%0A%09keys%20do%3A%20%5B%3Aeach%20%7C%0A%09%20%20%20%20associations%20add%3A%20%28Association%20key%3A%20each%20value%3A%20%28self%20at%3A%20each%29%29%5D.%0A%09%5Eassociations%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_keys',
smalltalk.method({
selector: 'keys',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@keys']._copy();
    return self;
},
source: unescape('keys%0A%09%5Ekeys%20copy%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_values',
smalltalk.method({
selector: 'values',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@keys']._collect_(function (each) {return self._at_(each);});
    return self;
},
source: unescape('values%0A%20%20%20%20%09%5Ekeys%20collect%3A%20%5B%3Aeach%20%7C%20self%20at%3A%20each%5D%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_at_put_',
smalltalk.method({
selector: 'at:put:',
category: 'accessing',
fn: function (aKey, aValue) {
    var self = this;
    self['@keys']._includes_(aKey)._ifFalse_(function () {return self['@keys']._add_(aKey);});
    return self._basicAt_put_(aKey, aValue);
    return self;
},
source: unescape('at%3A%20aKey%20put%3A%20aValue%0A%09%28keys%20includes%3A%20aKey%29%20ifFalse%3A%20%5Bkeys%20add%3A%20aKey%5D.%0A%09%5Eself%20basicAt%3A%20aKey%20put%3A%20aValue%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_at_ifAbsent_',
smalltalk.method({
selector: 'at:ifAbsent:',
category: 'accessing',
fn: function (aKey, aBlock) {
    var self = this;
    return self._basicAt_(aKey)._ifNil_(aBlock);
    return self;
},
source: unescape('at%3A%20aKey%20ifAbsent%3A%20aBlock%0A%09%5E%28self%20basicAt%3A%20aKey%29%20ifNil%3A%20aBlock%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_at_ifAbsentPut_',
smalltalk.method({
selector: 'at:ifAbsentPut:',
category: 'accessing',
fn: function (aKey, aBlock) {
    var self = this;
    return self._at_ifAbsent_(aKey, function () {return self._at_put_(aKey, aBlock._value());});
    return self;
},
source: unescape('at%3A%20aKey%20ifAbsentPut%3A%20aBlock%0A%20%20%20%20%09%5Eself%20at%3A%20aKey%20ifAbsent%3A%20%5B%0A%20%20%20%20%09%20%20%20%20self%20at%3A%20aKey%20put%3A%20aBlock%20value%5D%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_at_ifPresent_',
smalltalk.method({
selector: 'at:ifPresent:',
category: 'accessing',
fn: function (aKey, aBlock) {
    var self = this;
    return self._basicAt_(aKey)._ifNotNil_(function () {return aBlock._value_(self._at_(aKey));});
    return self;
},
source: unescape('at%3A%20aKey%20ifPresent%3A%20aBlock%0A%09%5E%28self%20basicAt%3A%20aKey%29%20ifNotNil%3A%20%5BaBlock%20value%3A%20%28self%20at%3A%20aKey%29%5D%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_at_ifPresent_ifAbsent_',
smalltalk.method({
selector: 'at:ifPresent:ifAbsent:',
category: 'accessing',
fn: function (aKey, aBlock, anotherBlock) {
    var self = this;
    return self._basicAt_(aKey)._ifNil_ifNotNil_(anotherBlock, function () {return aBlock._value_(self._at_(aKey));});
    return self;
},
source: unescape('at%3A%20aKey%20ifPresent%3A%20aBlock%20ifAbsent%3A%20anotherBlock%0A%09%5E%28self%20basicAt%3A%20aKey%29%0A%09%20%20%20%20ifNil%3A%20anotherBlock%0A%09%20%20%20%20ifNotNil%3A%20%5BaBlock%20value%3A%20%28self%20at%3A%20aKey%29%5D%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_add_',
smalltalk.method({
selector: 'add:',
category: 'adding/removing',
fn: function (anAssociation) {
    var self = this;
    self._at_put_(anAssociation._key(), anAssociation._value());
    return self;
},
source: unescape('add%3A%20anAssociation%0A%20%20%20%20%09self%20at%3A%20anAssociation%20key%20put%3A%20anAssociation%20value%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_addAll_',
smalltalk.method({
selector: 'addAll:',
category: 'adding/removing',
fn: function (aDictionary) {
    var self = this;
    self.klass.superclass.fn.prototype._addAll_.apply(self, [aDictionary._associations()]);
    return aDictionary;
    return self;
},
source: unescape('addAll%3A%20aDictionary%0A%20%20%20%20%09super%20addAll%3A%20aDictionary%20associations.%0A%20%20%20%20%09%5EaDictionary%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'__comma',
smalltalk.method({
selector: ',',
category: 'copying',
fn: function (aCollection) {
    var self = this;
    self._shouldNotImplement();
    return self;
},
source: unescape('%2C%20aCollection%0A%09self%20shouldNotImplement%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_copyFrom_to_',
smalltalk.method({
selector: 'copyFrom:to:',
category: 'copying',
fn: function (anIndex, anotherIndex) {
    var self = this;
    self._shouldNotImplement();
    return self;
},
source: unescape('copyFrom%3A%20anIndex%20to%3A%20anotherIndex%0A%09self%20shouldNotImplement%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_associationsDo_',
smalltalk.method({
selector: 'associationsDo:',
category: 'enumerating',
fn: function (aBlock) {
    var self = this;
    self._associations()._do_(aBlock);
    return self;
},
source: unescape('associationsDo%3A%20aBlock%0A%20%20%20%20%09self%20associations%20do%3A%20aBlock%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_keysAndValuesDo_',
smalltalk.method({
selector: 'keysAndValuesDo:',
category: 'enumerating',
fn: function (aBlock) {
    var self = this;
    self._associationsDo_(function (each) {return aBlock._value_value_(each._key(), each._value());});
    return self;
},
source: unescape('keysAndValuesDo%3A%20aBlock%0A%20%20%20%20%09self%20associationsDo%3A%20%5B%3Aeach%20%7C%0A%20%20%20%20%09%20%20%20%20aBlock%20value%3A%20each%20key%20value%3A%20each%20value%5D%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_do_',
smalltalk.method({
selector: 'do:',
category: 'enumerating',
fn: function (aBlock) {
    var self = this;
    self._values()._do_(aBlock);
    return self;
},
source: unescape('do%3A%20aBlock%0A%20%20%20%20%09self%20values%20do%3A%20aBlock%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_select_',
smalltalk.method({
selector: 'select:',
category: 'enumerating',
fn: function (aBlock) {
    var self = this;
    var newDict = nil;
    newDict = self._class()._new();
    self._keysAndValuesDo_(function (key, value) {return aBlock._value_(value)._ifTrue_(function () {return newDict._at_put_(key, value);});});
    return newDict;
    return self;
},
source: unescape('select%3A%20aBlock%0A%20%20%20%20%09%7C%20newDict%20%7C%0A%20%20%20%20%09newDict%20%3A%3D%20self%20class%20new.%0A%20%20%20%20%09self%20keysAndValuesDo%3A%20%5B%3Akey%20%3Avalue%20%7C%0A%20%20%20%20%09%20%20%20%20%28aBlock%20value%3A%20value%29%20ifTrue%3A%20%5BnewDict%20at%3A%20key%20put%3A%20value%5D%5D.%0A%20%20%20%20%09%5EnewDict%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_collect_',
smalltalk.method({
selector: 'collect:',
category: 'enumerating',
fn: function (aBlock) {
    var self = this;
    var newDict = nil;
    newDict = self._class()._new();
    self._keysAndValuesDo_(function (key, value) {return aBlock._value_(value)._ifTrue_(function () {return newDict._at_put_(key, value);});});
    return newDict;
    return self;
},
source: unescape('collect%3A%20aBlock%0A%20%20%20%20%09%7C%20newDict%20%7C%0A%20%20%20%20%09newDict%20%3A%3D%20self%20class%20new.%0A%20%20%20%20%09self%20keysAndValuesDo%3A%20%5B%3Akey%20%3Avalue%20%7C%0A%20%20%20%20%09%20%20%20%20%28aBlock%20value%3A%20value%29%20ifTrue%3A%20%5BnewDict%20at%3A%20key%20put%3A%20value%5D%5D.%0A%20%20%20%20%09%5EnewDict%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_detect_ifNone_',
smalltalk.method({
selector: 'detect:ifNone:',
category: 'enumerating',
fn: function (aBlock, anotherBlock) {
    var self = this;
    return self._values()._detect_ifNone_(aBlock, anotherBlock);
    return self;
},
source: unescape('detect%3A%20aBlock%20ifNone%3A%20anotherBlock%0A%09%5Eself%20values%20detect%3A%20aBlock%20ifNone%3A%20anotherBlock%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_includes_',
smalltalk.method({
selector: 'includes:',
category: 'enumerating',
fn: function (anObject) {
    var self = this;
    return self._values()._includes_(anObject);
    return self;
},
source: unescape('includes%3A%20anObject%0A%09%5Eself%20values%20includes%3A%20anObject%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_remove_',
smalltalk.method({
selector: 'remove:',
category: 'adding/removing',
fn: function (aKey) {
    var self = this;
    self._removeKey_(aKey);
    return self;
},
source: unescape('remove%3A%20aKey%0A%20%20%20%20self%20removeKey%3A%20aKey%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_removeKey_',
smalltalk.method({
selector: 'removeKey:',
category: 'adding/removing',
fn: function (aKey) {
    var self = this;
    self['@keys']._remove_(aKey);
    return self;
},
source: unescape('removeKey%3A%20aKey%0A%20%20%20%20keys%20remove%3A%20aKey%0A')}),
smalltalk.Dictionary);



smalltalk.addClass('ClassBuilder', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'_superclass_subclass_',
smalltalk.method({
selector: 'superclass:subclass:',
category: 'class creation',
fn: function (aClass, aString) {
    var self = this;
    self._superclass_subclass_instanceVariableNames_category_(aClass, aString, "", nil);
    return self;
},
source: unescape('superclass%3A%20aClass%20subclass%3A%20aString%0A%09self%20superclass%3A%20aClass%20subclass%3A%20aString%20instanceVariableNames%3A%20%27%27%20category%3A%20nil%0A')}),
smalltalk.ClassBuilder);

smalltalk.addMethod(
'_superclass_subclass_instanceVariableNames_category_',
smalltalk.method({
selector: 'superclass:subclass:instanceVariableNames:category:',
category: 'class creation',
fn: function (aClass, aString, aString2, aString3) {
    var self = this;
    var newClass = nil;
    newClass = self._addSubclassOf_named_instanceVariableNames_(aClass, aString, self._instanceVariableNamesFor_(aString2));
    self._setupClass_(newClass);
    newClass._category_(aString3._ifNil_(function () {return "unclassified";}));
    return self;
},
source: unescape('superclass%3A%20aClass%20subclass%3A%20aString%20instanceVariableNames%3A%20aString2%20category%3A%20aString3%0A%09%7C%20newClass%20%7C%0A%09newClass%20%3A%3D%20self%20addSubclassOf%3A%20aClass%20named%3A%20aString%20instanceVariableNames%3A%20%28self%20instanceVariableNamesFor%3A%20aString2%29.%0A%09self%20setupClass%3A%20newClass.%0A%09newClass%20category%3A%20%28aString3%20ifNil%3A%20%5B%27unclassified%27%5D%29%0A')}),
smalltalk.ClassBuilder);

smalltalk.addMethod(
'_class_instanceVariableNames_',
smalltalk.method({
selector: 'class:instanceVariableNames:',
category: 'class creation',
fn: function (aClass, aString) {
    var self = this;
    aClass._isMetaclass()._ifFalse_(function () {return self._error_(aClass._name().__comma(" is not a metaclass"));});
    aClass._basicAt_put_("iVarNames", self._instanceVariableNamesFor_(aString));
    self._setupClass_(aClass);
    return self;
},
source: unescape('class%3A%20aClass%20instanceVariableNames%3A%20aString%0A%09aClass%20isMetaclass%20ifFalse%3A%20%5Bself%20error%3A%20aClass%20name%2C%20%27%20is%20not%20a%20metaclass%27%5D.%0A%09aClass%20basicAt%3A%20%27iVarNames%27%20put%3A%20%28self%20instanceVariableNamesFor%3A%20aString%29.%0A%09self%20setupClass%3A%20aClass%0A')}),
smalltalk.ClassBuilder);

smalltalk.addMethod(
'_instanceVariableNamesFor_',
smalltalk.method({
selector: 'instanceVariableNamesFor:',
category: 'private',
fn: function (aString) {
    var self = this;
    return aString._tokenize_(" ")._reject_(function (each) {return each._isEmpty();});
    return self;
},
source: unescape('instanceVariableNamesFor%3A%20aString%0A%09%5E%28aString%20tokenize%3A%20%27%20%27%29%20reject%3A%20%5B%3Aeach%20%7C%20each%20isEmpty%5D%0A')}),
smalltalk.ClassBuilder);

smalltalk.addMethod(
'_addSubclassOf_named_instanceVariableNames_',
smalltalk.method({
selector: 'addSubclassOf:named:instanceVariableNames:',
category: 'private',
fn: function (aClass, aString, aCollection) {
    var self = this;
    return function () {smalltalk.addClass(aString, aClass, aCollection);return smalltalk[aString];}();
    return self;
},
source: unescape('addSubclassOf%3A%20aClass%20named%3A%20aString%20instanceVariableNames%3A%20aCollection%0A%09%5E%7B%27smalltalk.addClass%28aString%2C%20aClass%2C%20aCollection%29%3B%0A%09%20%20%20%20return%20smalltalk%5BaString%5D%27%7D%0A')}),
smalltalk.ClassBuilder);

smalltalk.addMethod(
'_setupClass_',
smalltalk.method({
selector: 'setupClass:',
category: 'private',
fn: function (aClass) {
    var self = this;
    (function () {smalltalk.init(aClass);}());
    return self;
},
source: unescape('setupClass%3A%20aClass%0A%09%7B%27smalltalk.init%28aClass%29%3B%27%7D%0A')}),
smalltalk.ClassBuilder);



smalltalk.addClass('ClassCategoryReader', smalltalk.Object, ['class', 'category', 'chunkParser'], 'Kernel');
smalltalk.addMethod(
'_initialize',
smalltalk.method({
selector: 'initialize',
category: 'initialization',
fn: function () {
    var self = this;
    self.klass.superclass.fn.prototype._initialize.apply(self, []);
    self['@chunkParser'] = smalltalk.ChunkParser._new();
    return self;
},
source: unescape('initialize%0A%09super%20initialize.%0A%09chunkParser%20%3A%3D%20ChunkParser%20new.%0A')}),
smalltalk.ClassCategoryReader);

smalltalk.addMethod(
'_class_category_',
smalltalk.method({
selector: 'class:category:',
category: 'accessing',
fn: function (aClass, aString) {
    var self = this;
    self['@class'] = aClass;
    self['@category'] = aString;
    return self;
},
source: unescape('class%3A%20aClass%20category%3A%20aString%0A%09class%20%3A%3D%20aClass.%0A%09category%20%3A%3D%20aString%0A')}),
smalltalk.ClassCategoryReader);

smalltalk.addMethod(
'_scanFrom_',
smalltalk.method({
selector: 'scanFrom:',
category: 'fileIn',
fn: function (aStream) {
    var self = this;
    var nextChunk = nil;
    nextChunk = self['@chunkParser']._emptyChunk().__slash(self['@chunkParser']._chunk())._parse_(aStream);
    nextChunk._isEmptyChunk()._ifFalse_(function () {self._compileMethod_(nextChunk._contents());return self._scanFrom_(aStream);});
    return self;
},
source: unescape('scanFrom%3A%20aStream%0A%09%7C%20nextChunk%20%7C%0A%09nextChunk%20%3A%3D%20%28chunkParser%20emptyChunk%20/%20chunkParser%20chunk%29%20parse%3A%20aStream.%0A%09nextChunk%20isEmptyChunk%20ifFalse%3A%20%5B%0A%09%20%20%20%20self%20compileMethod%3A%20nextChunk%20contents.%0A%09%20%20%20%20self%20scanFrom%3A%20aStream%5D.%0A')}),
smalltalk.ClassCategoryReader);

smalltalk.addMethod(
'_compileMethod_',
smalltalk.method({
selector: 'compileMethod:',
category: 'private',
fn: function (aString) {
    var self = this;
    var method = nil;
    method = smalltalk.Compiler._new()._load_forClass_(aString, self['@class']);
    method._category_(self['@category']);
    self['@class']._addCompiledMethod_(method);
    return self;
},
source: unescape('compileMethod%3A%20aString%0A%09%7C%20method%20%7C%0A%09method%20%3A%3D%20Compiler%20new%20load%3A%20aString%20forClass%3A%20class.%0A%09method%20category%3A%20category.%0A%09class%20addCompiledMethod%3A%20method%0A')}),
smalltalk.ClassCategoryReader);



smalltalk.addClass('Stream', smalltalk.Object, ['collection', 'position', 'streamSize'], 'Kernel');
smalltalk.addMethod(
'_collection',
smalltalk.method({
selector: 'collection',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@collection'];
    return self;
},
source: unescape('collection%0A%09%5Ecollection%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_setCollection_',
smalltalk.method({
selector: 'setCollection:',
category: 'accessing',
fn: function (aCollection) {
    var self = this;
    self['@collection'] = aCollection;
    return self;
},
source: unescape('setCollection%3A%20aCollection%0A%09collection%20%3A%3D%20aCollection%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_position',
smalltalk.method({
selector: 'position',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@position']._ifNil_(function () {return self['@position'] = 0;});
    return self;
},
source: unescape('position%0A%09%5Eposition%20ifNil%3A%20%5Bposition%20%3A%3D%200%5D%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_position_',
smalltalk.method({
selector: 'position:',
category: 'accessing',
fn: function (anInteger) {
    var self = this;
    self['@position'] = anInteger;
    return self;
},
source: unescape('position%3A%20anInteger%0A%09position%20%3A%3D%20anInteger%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_streamSize',
smalltalk.method({
selector: 'streamSize',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@streamSize'];
    return self;
},
source: unescape('streamSize%0A%09%5EstreamSize%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_setStreamSize_',
smalltalk.method({
selector: 'setStreamSize:',
category: 'accessing',
fn: function (anInteger) {
    var self = this;
    self['@streamSize'] = anInteger;
    return self;
},
source: unescape('setStreamSize%3A%20anInteger%0A%09streamSize%20%3A%3D%20anInteger%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_contents',
smalltalk.method({
selector: 'contents',
category: 'accessing',
fn: function () {
    var self = this;
    return self._collection()._copyFrom_to_(1, self._streamSize());
    return self;
},
source: unescape('contents%0A%09%5Eself%20collection%0A%09%20%20%20%20copyFrom%3A%201%20%0A%09%20%20%20%20to%3A%20self%20streamSize%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_size',
smalltalk.method({
selector: 'size',
category: 'accessing',
fn: function () {
    var self = this;
    return self._streamSize();
    return self;
},
source: unescape('size%0A%09%5Eself%20streamSize%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_reset',
smalltalk.method({
selector: 'reset',
category: 'actions',
fn: function () {
    var self = this;
    self._position_(0);
    return self;
},
source: unescape('reset%0A%09self%20position%3A%200%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_close',
smalltalk.method({
selector: 'close',
category: 'actions',
fn: function () {
    var self = this;
    return self;
},
source: unescape('close%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_flush',
smalltalk.method({
selector: 'flush',
category: 'actions',
fn: function () {
    var self = this;
    return self;
},
source: unescape('flush%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_resetContents',
smalltalk.method({
selector: 'resetContents',
category: 'actions',
fn: function () {
    var self = this;
    self._reset();
    self._setStreamSize_(0);
    return self;
},
source: unescape('resetContents%0A%09self%20reset.%0A%09self%20setStreamSize%3A%200%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_do_',
smalltalk.method({
selector: 'do:',
category: 'enumerating',
fn: function (aBlock) {
    var self = this;
    (function () {return self._atEnd();}._whileFalse_(function () {return aBlock._value_(self._next());}));
    return self;
},
source: unescape('do%3A%20aBlock%0A%09%5Bself%20atEnd%5D%20whileFalse%3A%20%5BaBlock%20value%3A%20self%20next%5D%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_setToEnd',
smalltalk.method({
selector: 'setToEnd',
category: 'positioning',
fn: function () {
    var self = this;
    self._position_(self._size());
    return self;
},
source: unescape('setToEnd%0A%09self%20position%3A%20self%20size%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_skip_',
smalltalk.method({
selector: 'skip:',
category: 'positioning',
fn: function (anInteger) {
    var self = this;
    self._position_(self._position().__plus(anInteger)._min_max_(self._size(), 0));
    return self;
},
source: unescape('skip%3A%20anInteger%0A%09self%20position%3A%20%28%28self%20position%20+%20anInteger%29%20min%3A%20self%20size%20max%3A%200%29%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_next',
smalltalk.method({
selector: 'next',
category: 'reading',
fn: function () {
    var self = this;
    self._position_(self._position().__plus(1));
    return self['@collection']._at_(self._position());
    return self;
},
source: unescape('next%0A%09self%20position%3A%20self%20position%20+%201.%20%0A%09%5Ecollection%20at%3A%20self%20position%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_next_',
smalltalk.method({
selector: 'next:',
category: 'reading',
fn: function (anInteger) {
    var self = this;
    var tempCollection = nil;
    tempCollection = self._collection()._class()._new();
    anInteger._timesRepeat_(function () {return self._atEnd()._ifFalse_(function () {return tempCollection._add_(self._next());});});
    return tempCollection;
    return self;
},
source: unescape('next%3A%20anInteger%0A%09%7C%20tempCollection%20%7C%0A%09tempCollection%20%3A%3D%20self%20collection%20class%20new.%0A%09anInteger%20timesRepeat%3A%20%5B%0A%09%20%20%20%20self%20atEnd%20ifFalse%3A%20%5B%0A%09%09tempCollection%20add%3A%20self%20next%5D%5D.%0A%09%5EtempCollection%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_nextPut_',
smalltalk.method({
selector: 'nextPut:',
category: 'writing',
fn: function (anObject) {
    var self = this;
    self._position_(self._position().__plus(1));
    self._collection()._at_put_(self._position(), anObject);
    self._setStreamSize_(self._streamSize()._max_(self._position()));
    return self;
},
source: unescape('nextPut%3A%20anObject%0A%09self%20position%3A%20self%20position%20+%201.%0A%09self%20collection%20at%3A%20self%20position%20put%3A%20anObject.%0A%09self%20setStreamSize%3A%20%28self%20streamSize%20max%3A%20self%20position%29%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_nextPutAll_',
smalltalk.method({
selector: 'nextPutAll:',
category: 'writing',
fn: function (aCollection) {
    var self = this;
    aCollection._do_(function (each) {return self._nextPut_(each);});
    return self;
},
source: unescape('nextPutAll%3A%20aCollection%0A%09aCollection%20do%3A%20%5B%3Aeach%20%7C%0A%09%20%20%20%20self%20nextPut%3A%20each%5D%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_peek',
smalltalk.method({
selector: 'peek',
category: 'reading',
fn: function () {
    var self = this;
    return self._atEnd()._ifFalse_(function () {return self._collection()._at_(self._position().__plus(1));});
    return self;
},
source: unescape('peek%0A%09%5Eself%20atEnd%20ifFalse%3A%20%5B%0A%09%20%20%20%20self%20collection%20at%3A%20self%20position%20+%201%5D%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_atEnd',
smalltalk.method({
selector: 'atEnd',
category: 'testing',
fn: function () {
    var self = this;
    return self._position().__eq(self._size());
    return self;
},
source: unescape('atEnd%0A%09%5Eself%20position%20%3D%20self%20size%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_atStart',
smalltalk.method({
selector: 'atStart',
category: 'testing',
fn: function () {
    var self = this;
    return self._position().__eq(0);
    return self;
},
source: unescape('atStart%0A%09%5Eself%20position%20%3D%200%0A')}),
smalltalk.Stream);

smalltalk.addMethod(
'_isEmpty',
smalltalk.method({
selector: 'isEmpty',
category: 'testing',
fn: function () {
    var self = this;
    return self._size().__eq(0);
    return self;
},
source: unescape('isEmpty%0A%09%5Eself%20size%20%3D%200%0A')}),
smalltalk.Stream);


smalltalk.addMethod(
'_on_',
smalltalk.method({
selector: 'on:',
category: 'instance creation',
fn: function (aCollection) {
    var self = this;
    return function ($rec) {$rec._setCollection_(aCollection);$rec._setStreamSize_(aCollection._size());return $rec._yourself();}(self._new());
    return self;
},
source: unescape('on%3A%20aCollection%0A%09%20%20%20%20%5Eself%20new%20%0A%09%09setCollection%3A%20aCollection%3B%0A%09%09setStreamSize%3A%20aCollection%20size%3B%0A%09%09yourself%0A')}),
smalltalk.Stream.klass);


smalltalk.addClass('StringStream', smalltalk.Stream, [], 'Kernel');
smalltalk.addMethod(
'_next_',
smalltalk.method({
selector: 'next:',
category: 'reading',
fn: function (anInteger) {
    var self = this;
    var tempCollection = nil;
    tempCollection = self._collection()._class()._new();
    anInteger._timesRepeat_(function () {return self._atEnd()._ifFalse_(function () {return tempCollection = tempCollection.__comma(self._next());});});
    return tempCollection;
    return self;
},
source: unescape('next%3A%20anInteger%0A%09%7C%20tempCollection%20%7C%0A%09tempCollection%20%3A%3D%20self%20collection%20class%20new.%0A%09anInteger%20timesRepeat%3A%20%5B%0A%09%20%20%20%20self%20atEnd%20ifFalse%3A%20%5B%0A%09%09tempCollection%20%3A%3D%20tempCollection%2C%20self%20next%5D%5D.%0A%09%5EtempCollection%0A')}),
smalltalk.StringStream);

smalltalk.addMethod(
'_nextPut_',
smalltalk.method({
selector: 'nextPut:',
category: 'writing',
fn: function (aString) {
    var self = this;
    self._nextPutAll_(aString);
    return self;
},
source: unescape('nextPut%3A%20aString%0A%09self%20nextPutAll%3A%20aString%0A')}),
smalltalk.StringStream);

smalltalk.addMethod(
'_nextPutAll_',
smalltalk.method({
selector: 'nextPutAll:',
category: 'writing',
fn: function (aString) {
    var self = this;
    self._setCollection_(self._collection()._copyFrom_to_(1, self._position()).__comma(aString).__comma(self._collection()._copyFrom_to_(self._position().__plus(1).__plus(aString._size()), self._collection()._size())));
    self._position_(self._position().__plus(aString._size()));
    self._setStreamSize_(self._streamSize()._max_(self._position()));
    return self;
},
source: unescape('nextPutAll%3A%20aString%0A%09self%20setCollection%3A%20%0A%09%20%20%20%20%28self%20collection%20copyFrom%3A%201%20to%3A%20self%20position%29%2C%0A%09%20%20%20%20aString%2C%0A%09%20%20%20%20%28self%20collection%20copyFrom%3A%20%28self%20position%20+%201%20+%20aString%20size%29%20to%3A%20self%20collection%20size%29.%0A%09self%20position%3A%20self%20position%20+%20aString%20size.%0A%09self%20setStreamSize%3A%20%28self%20streamSize%20max%3A%20self%20position%29%0A')}),
smalltalk.StringStream);



smalltalk.addClass('ClassCommentReader', smalltalk.Object, ['class', 'chunkParser'], 'Kernel');
smalltalk.addMethod(
'_class_',
smalltalk.method({
selector: 'class:',
category: 'accessing',
fn: function (aClass) {
    var self = this;
    self['@class'] = aClass;
    return self;
},
source: unescape('class%3A%20aClass%0A%09class%20%3A%3D%20aClass%0A')}),
smalltalk.ClassCommentReader);

smalltalk.addMethod(
'_scanFrom_',
smalltalk.method({
selector: 'scanFrom:',
category: 'fileIn',
fn: function (aStream) {
    var self = this;
    var nextChunk = nil;
    nextChunk = self['@chunkParser']._emptyChunk().__slash(self['@chunkParser']._chunk())._parse_(aStream);
    nextChunk._isEmptyChunk()._ifFalse_(function () {return self._setComment_(nextChunk._contents());});
    return self;
},
source: unescape('scanFrom%3A%20aStream%0A%09%7C%20nextChunk%20%7C%0A%09nextChunk%20%3A%3D%20%28chunkParser%20emptyChunk%20/%20chunkParser%20chunk%29%20parse%3A%20aStream.%0A%09nextChunk%20isEmptyChunk%20ifFalse%3A%20%5B%0A%09%20%20%20%20self%20setComment%3A%20nextChunk%20contents%5D.%0A')}),
smalltalk.ClassCommentReader);

smalltalk.addMethod(
'_initialize',
smalltalk.method({
selector: 'initialize',
category: 'initialization',
fn: function () {
    var self = this;
    self.klass.superclass.fn.prototype._initialize.apply(self, []);
    self['@chunkParser'] = smalltalk.ChunkParser._new();
    return self;
},
source: unescape('initialize%0A%09super%20initialize.%0A%09chunkParser%20%3A%3D%20ChunkParser%20new.%0A')}),
smalltalk.ClassCommentReader);

smalltalk.addMethod(
'_setComment_',
smalltalk.method({
selector: 'setComment:',
category: 'private',
fn: function (aString) {
    var self = this;
    self['@class']._comment_(aString);
    return self;
},
source: unescape('setComment%3A%20aString%0A%20%20%20%20class%20comment%3A%20aString%0A')}),
smalltalk.ClassCommentReader);



smalltalk.addClass('Random', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'_next',
smalltalk.method({
selector: 'next',
category: 'accessing',
fn: function () {
    var self = this;
    return function () {return Math.random();}();
    return self;
},
source: unescape('next%0A%20%20%20%20%5E%7B%27return%20Math.random%28%29%27%7D%0A')}),
smalltalk.Random);

smalltalk.addMethod(
'_next_',
smalltalk.method({
selector: 'next:',
category: 'accessing',
fn: function (anInteger) {
    var self = this;
    return (1)._to_collect_(anInteger, function (each) {return self._next();});
    return self;
},
source: unescape('next%3A%20anInteger%0A%20%20%20%20%5E1%20to%3A%20anInteger%20collect%3A%20%5B%3Aeach%20%7C%20self%20next%5D%0A')}),
smalltalk.Random);



smalltalk.addClass('Point', smalltalk.Object, ['x', 'y'], 'Kernel');
smalltalk.addMethod(
'_x',
smalltalk.method({
selector: 'x',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@x'];
    return self;
},
source: unescape('x%0A%09%5Ex')}),
smalltalk.Point);

smalltalk.addMethod(
'_y',
smalltalk.method({
selector: 'y',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@y'];
    return self;
},
source: unescape('y%0A%09%5Ey')}),
smalltalk.Point);

smalltalk.addMethod(
'_y_',
smalltalk.method({
selector: 'y:',
category: 'accessing',
fn: function (aNumber) {
    var self = this;
    self['@y'] = aNumber;
    return self;
},
source: unescape('y%3A%20aNumber%0A%09y%20%3A%3D%20aNumber')}),
smalltalk.Point);

smalltalk.addMethod(
'_x_',
smalltalk.method({
selector: 'x:',
category: 'accessing',
fn: function (aNumber) {
    var self = this;
    self['@x'] = aNumber;
    return self;
},
source: unescape('x%3A%20aNumber%0A%09x%20%3A%3D%20aNumber')}),
smalltalk.Point);

smalltalk.addMethod(
'__star',
smalltalk.method({
selector: '*',
category: 'arithmetic',
fn: function (aPoint) {
    var self = this;
    return smalltalk.Point._x_y_(self._x().__star(aPoint._asPoint()._x()), self._y().__star(aPoint._asPoint()._y()));
    return self;
},
source: unescape('*%20aPoint%0A%09%5EPoint%20x%3A%20self%20x%20*%20aPoint%20asPoint%20x%20y%3A%20self%20y%20*%20aPoint%20asPoint%20y')}),
smalltalk.Point);

smalltalk.addMethod(
'__plus',
smalltalk.method({
selector: '+',
category: 'arithmetic',
fn: function (aPoint) {
    var self = this;
    return smalltalk.Point._x_y_(self._x().__plus(aPoint._asPoint()._x()), self._y().__plus(aPoint._asPoint()._y()));
    return self;
},
source: unescape('+%20aPoint%0A%09%5EPoint%20x%3A%20self%20x%20+%20aPoint%20asPoint%20x%20y%3A%20self%20y%20+%20aPoint%20asPoint%20y')}),
smalltalk.Point);

smalltalk.addMethod(
'__minus',
smalltalk.method({
selector: '-',
category: 'arithmetic',
fn: function (aPoint) {
    var self = this;
    return smalltalk.Point._x_y_(self._x().__minus(aPoint._asPoint()._x()), self._y().__minus(aPoint._asPoint()._y()));
    return self;
},
source: unescape('-%20aPoint%0A%09%5EPoint%20x%3A%20self%20x%20-%20aPoint%20asPoint%20x%20y%3A%20self%20y%20-%20aPoint%20asPoint%20y')}),
smalltalk.Point);

smalltalk.addMethod(
'__slash',
smalltalk.method({
selector: '/',
category: 'arithmetic',
fn: function (aPoint) {
    var self = this;
    return smalltalk.Point._x_y_(self._x().__slash(aPoint._asPoint()._x()), self._y().__slash(aPoint._asPoint()._y()));
    return self;
},
source: unescape('/%20aPoint%0A%09%5EPoint%20x%3A%20self%20x%20/%20aPoint%20asPoint%20x%20y%3A%20self%20y%20/%20aPoint%20asPoint%20y')}),
smalltalk.Point);

smalltalk.addMethod(
'_asPoint',
smalltalk.method({
selector: 'asPoint',
category: 'converting',
fn: function () {
    var self = this;
    return self;
    return self;
},
source: unescape('asPoint%0A%09%5Eself')}),
smalltalk.Point);


smalltalk.addMethod(
'_x_y_',
smalltalk.method({
selector: 'x:y:',
category: 'instance creation',
fn: function (aNumber, anotherNumber) {
    var self = this;
    return function ($rec) {$rec._x_(aNumber);$rec._y_(anotherNumber);return $rec._yourself();}(self._new());
    return self;
},
source: unescape('x%3A%20aNumber%20y%3A%20anotherNumber%0A%09%5Eself%20new%0A%09%09x%3A%20aNumber%3B%0A%09%09y%3A%20anotherNumber%3B%0A%09%09yourself')}),
smalltalk.Point.klass);


smalltalk.addClass('JQuery', smalltalk.Object, ['jquery'], 'JQuery');
smalltalk.addMethod(
'_removeAttribute_',
smalltalk.method({
selector: 'removeAttribute:',
category: 'attributes',
fn: function (aString){
var self=this;
return self._call_withArgument_("removeAttribute",aString);
return self;},
source: unescape('removeAttribute%3A%20aString%0A%20%20%20%20%22Remove%20an%20attribute%20from%20each%20element%20in%20the%20set%20of%20matched%20elements.%22%0A%20%20%20%20%5Eself%20call%3A%20%27removeAttribute%27%20withArgument%3A%20aString%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_attr_',
smalltalk.method({
selector: 'attr:',
category: 'attributes',
fn: function (aString){
var self=this;
return self._call_withArgument_("attr",aString);
return self;},
source: unescape('attr%3A%20aString%0A%20%20%20%20%22Get%20the%20value%20of%20an%20attribute%20for%20the%20first%20element%20in%20the%20set%20of%20matched%20elements.%22%0A%20%20%20%20%5Eself%20call%3A%20%27attr%27%20withArgument%3A%20aString%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_val',
smalltalk.method({
selector: 'val',
category: 'attributes',
fn: function (){
var self=this;
return self._call_("val");
return self;},
source: unescape('val%0A%20%20%20%20%22Get%20the%20current%20value%20of%20the%20first%20element%20in%20the%20set%20of%20matched%20elements.%22%0A%20%20%20%20%5Eself%20call%3A%20%27val%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_val_',
smalltalk.method({
selector: 'val:',
category: 'attributes',
fn: function (aString){
var self=this;
self._call_withArgument_("val",aString);
return self;},
source: unescape('val%3A%20aString%0A%20%20%20%20self%20call%3A%20%27val%27%20withArgument%3A%20aString%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_cssAt_',
smalltalk.method({
selector: 'cssAt:',
category: 'css',
fn: function (aString){
var self=this;
return (function(){return self['@jquery'].css(aString)})();
return self;},
source: unescape('cssAt%3A%20aString%0A%20%20%20%20%5E%7B%27return%20self%5B%27%27@jquery%27%27%5D.css%28aString%29%27%7D%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_cssAt_put_',
smalltalk.method({
selector: 'cssAt:put:',
category: 'css',
fn: function (aString, anotherString){
var self=this;
(function(){self['@jquery'].css(aString, anotherString)})();
return self;},
source: unescape('cssAt%3A%20aString%20put%3A%20anotherString%0A%20%20%20%20%7B%27self%5B%27%27@jquery%27%27%5D.css%28aString%2C%20anotherString%29%27%7D%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_addClass_',
smalltalk.method({
selector: 'addClass:',
category: 'css',
fn: function (aString){
var self=this;
self._call_withArgument_("addClass",aString);
return self;},
source: unescape('addClass%3A%20aString%0A%20%20%20%20%22Adds%20the%20specified%20class%28es%29%20to%20each%20of%20the%20set%20of%20matched%20elements.%22%0A%20%20%20%20self%20call%3A%20%27addClass%27%20withArgument%3A%20aString%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_removeClass_',
smalltalk.method({
selector: 'removeClass:',
category: 'css',
fn: function (aString){
var self=this;
self._call_withArgument_("removeClass",aString);
return self;},
source: unescape('removeClass%3A%20aString%0A%20%20%20%20%22Remove%20a%20single%20class%2C%20multiple%20classes%2C%20or%20all%20classes%20from%20each%20element%20in%20the%20set%20of%20matched%20elements.%22%0A%20%20%20%20self%20call%3A%20%27removeClass%27%20withArgument%3A%20aString%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_toggleClass_',
smalltalk.method({
selector: 'toggleClass:',
category: 'css',
fn: function (aString){
var self=this;
self._call_withArgument_("toggleClass",aString);
return self;},
source: unescape('toggleClass%3A%20aString%0A%20%20%20%20%22Add%20or%20remove%20one%20or%20more%20classes%20from%20each%20element%20in%20the%20set%20of%20matched%20elements%2C%20depending%20on%20either%20the%20class%27s%20presence%20or%20the%20value%20of%20the%20switch%20argument.%22%0A%20%20%20%20self%20call%3A%20%27toggleClass%27%20withArgument%3A%20aString%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_height',
smalltalk.method({
selector: 'height',
category: 'css',
fn: function (){
var self=this;
return self._call_("height");
return self;},
source: unescape('height%20%0A%20%20%20%20%22Get%20the%20current%20computed%20height%20for%20the%20first%20element%20in%20the%20set%20of%20matched%20elements.%22%0A%20%20%20%20%5Eself%20call%3A%20%27height%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_height_',
smalltalk.method({
selector: 'height:',
category: 'css',
fn: function (anInteger){
var self=this;
self._call_withArgument_("height",anInteger);
return self;},
source: unescape('height%3A%20anInteger%0A%20%20%20%20self%20call%3A%20%27height%27%20withArgument%3A%20anInteger%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_width_',
smalltalk.method({
selector: 'width:',
category: 'css',
fn: function (anInteger){
var self=this;
self._call_withArgument_("width",anInteger);
return self;},
source: unescape('width%3A%20anInteger%0A%20%20%20%20self%20call%3A%20%27width%27%20withArgument%3A%20anInteger%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_width',
smalltalk.method({
selector: 'width',
category: 'css',
fn: function (){
var self=this;
return self._call_("width");
return self;},
source: unescape('width%0A%20%20%20%20%22Get%20the%20current%20computed%20width%20for%20the%20first%20element%20in%20the%20set%20of%20matched%20elements.%22%0A%20%20%20%20%5Eself%20call%3A%20%27width%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_innerHeight',
smalltalk.method({
selector: 'innerHeight',
category: 'css',
fn: function (){
var self=this;
return self._call_("innerHeight");
return self;},
source: unescape('innerHeight%0A%20%20%20%20%22Get%20the%20current%20computed%20height%20for%20the%20first%20element%20in%20the%20set%20of%20matched%20elements%2C%20including%20padding%20but%20not%20border.%22%0A%20%20%20%20%5Eself%20call%3A%20%27innerHeight%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_innerWidth',
smalltalk.method({
selector: 'innerWidth',
category: 'css',
fn: function (){
var self=this;
return self._call_("innerWidth");
return self;},
source: unescape('innerWidth%0A%20%20%20%20%22Get%20the%20current%20computed%20width%20for%20the%20first%20element%20in%20the%20set%20of%20matched%20elements%2C%20including%20padding%20but%20not%20border.%22%0A%20%20%20%20%5Eself%20call%3A%20%27innerWidth%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_outerHeight',
smalltalk.method({
selector: 'outerHeight',
category: 'css',
fn: function (){
var self=this;
return self._call_("outerHeight");
return self;},
source: unescape('outerHeight%0A%20%20%20%20%22Get%20the%20current%20computed%20height%20for%20the%20first%20element%20in%20the%20set%20of%20matched%20elements%2C%20including%20padding%2C%20border%2C%20and%20optionally%20margin.%22%0A%20%20%20%20%5Eself%20call%3A%20%27outerHeight%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_outerWidth',
smalltalk.method({
selector: 'outerWidth',
category: 'css',
fn: function (){
var self=this;
return self._call_("outerWidth");
return self;},
source: unescape('outerWidth%0A%20%20%20%20%22Get%20the%20current%20computed%20width%20for%20the%20first%20element%20in%20the%20set%20of%20matched%20elements%2C%20including%20padding%20and%20border.%22%0A%20%20%20%20%5Eself%20call%3A%20%27outerWidth%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_top',
smalltalk.method({
selector: 'top',
category: 'css',
fn: function (){
var self=this;
return self._call_("position")._basicAt_("top");
return self;},
source: unescape('top%0A%20%20%20%20%22Get%20the%20current%20y%20coordinate%20of%20the%20first%20element%20in%20the%20set%20of%20matched%20elements%2C%20relative%20to%20the%20offset%20parent.%22%0A%20%20%20%20%5E%28self%20call%3A%20%27position%27%29%20basicAt%3A%20%27top%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_left',
smalltalk.method({
selector: 'left',
category: 'css',
fn: function (){
var self=this;
return self._call_("position")._basicAt_("left");
return self;},
source: unescape('left%0A%20%20%20%20%22Get%20the%20current%20x%20coordinate%20of%20the%20first%20element%20in%20the%20set%20of%20matched%20elements%2C%20relative%20to%20the%20offset%20parent.%22%0A%20%20%20%20%5E%28self%20call%3A%20%27position%27%29%20basicAt%3A%20%27left%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_offsetLeft',
smalltalk.method({
selector: 'offsetLeft',
category: 'css',
fn: function (){
var self=this;
return self._call_("offset")._basicAt_("left");
return self;},
source: unescape('offsetLeft%0A%20%20%20%20%22Get%20the%20current%20coordinates%20of%20the%20first%20element%20in%20the%20set%20of%20matched%20elements%2C%20relative%20to%20the%20document.%22%0A%20%20%20%20%5E%28self%20call%3A%20%27offset%27%29%20basicAt%3A%20%27left%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_offsetTop',
smalltalk.method({
selector: 'offsetTop',
category: 'css',
fn: function (){
var self=this;
return self._call_("offset")._basicAt_("top");
return self;},
source: unescape('offsetTop%0A%20%20%20%20%22Get%20the%20current%20coordinates%20of%20the%20first%20element%20in%20the%20set%20of%20matched%20elements%2C%20relative%20to%20the%20document.%22%0A%20%20%20%20%5E%28self%20call%3A%20%27offset%27%29%20basicAt%3A%20%27top%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_scrollLeft',
smalltalk.method({
selector: 'scrollLeft',
category: 'css',
fn: function (){
var self=this;
return self._call_("scrollLeft");
return self;},
source: unescape('scrollLeft%0A%20%20%20%20%22Get%20the%20current%20horizontal%20position%20of%20the%20scroll%20bar%20for%20the%20first%20element%20in%20the%20set%20of%20matched%20elements.%22%0A%20%20%20%20%5Eself%20call%3A%20%27scrollLeft%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_scrollTop',
smalltalk.method({
selector: 'scrollTop',
category: 'css',
fn: function (){
var self=this;
return self._call_("scrollTop");
return self;},
source: unescape('scrollTop%0A%20%20%20%20%22Get%20the%20current%20vertical%20position%20of%20the%20scroll%20bar%20for%20the%20first%20element%20in%20the%20set%20of%20matched%20elements.%22%0A%20%20%20%20%5Eself%20call%3A%20%27scrollTop%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_scrollLeft_',
smalltalk.method({
selector: 'scrollLeft:',
category: 'css',
fn: function (anInteger){
var self=this;
self._call_withArgument_("scrollLeft",anInteger);
return self;},
source: unescape('scrollLeft%3A%20anInteger%0A%20%20%20%20self%20call%3A%20%27scrollLeft%27%20withArgument%3A%20anInteger%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_scrollTop_',
smalltalk.method({
selector: 'scrollTop:',
category: 'css',
fn: function (anInteger){
var self=this;
self._call_withArgument_("scrollTop",anInteger);
return self;},
source: unescape('scrollTop%3A%20anInteger%0A%20%20%20%20self%20call%3A%20%27scrollTop%27%20withArgument%3A%20anInteger%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_focus',
smalltalk.method({
selector: 'focus',
category: 'events',
fn: function (){
var self=this;
self._call_("focus");
return self;},
source: unescape('focus%0A%20%20%20%20self%20call%3A%20%27focus%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_show',
smalltalk.method({
selector: 'show',
category: 'events',
fn: function (){
var self=this;
self._call_("show");
return self;},
source: unescape('show%0A%20%20%20%20self%20call%3A%20%27show%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_hide',
smalltalk.method({
selector: 'hide',
category: 'events',
fn: function (){
var self=this;
self._call_("hide");
return self;},
source: unescape('hide%0A%20%20%20%20self%20call%3A%20%27hide%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_remove',
smalltalk.method({
selector: 'remove',
category: 'events',
fn: function (){
var self=this;
self._call_("remove");
return self;},
source: unescape('remove%0A%20%20%20%20self%20call%3A%20%27remove%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_on_do_',
smalltalk.method({
selector: 'on:do:',
category: 'events',
fn: function (anEventString, aBlock){
var self=this;
(function(){self['@jquery'].bind(anEventString, function(e){aBlock(self)})})();
return self;},
source: unescape('on%3A%20anEventString%20do%3A%20aBlock%0A%20%20%20%20%22Attach%20aBlock%20for%20anEventString%20on%20the%20element%22%0A%20%20%20%20%7B%27self%5B%27%27@jquery%27%27%5D.bind%28anEventString%2C%20function%28e%29%7BaBlock%28self%29%7D%29%27%7D%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_removeEvents_',
smalltalk.method({
selector: 'removeEvents:',
category: 'events',
fn: function (aString){
var self=this;
self._call_withArgument_("unbind",aString);
return self;},
source: unescape('removeEvents%3A%20aString%0A%20%20%20%20%22Unbind%20all%20handlers%20attached%20to%20the%20event%20aString%22%0A%20%20%20%20self%20call%3A%20%27unbind%27%20withArgument%3A%20aString%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_append_',
smalltalk.method({
selector: 'append:',
category: 'DOM insertion',
fn: function (anObject){
var self=this;
anObject._appendToJQuery_(self);
return self;},
source: unescape('append%3A%20anObject%0A%20%20%20%20%22Append%20anObject%20at%20the%20end%20of%20the%20element.%22%0A%20%20%20%20anObject%20appendToJQuery%3A%20self%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_appendElement_',
smalltalk.method({
selector: 'appendElement:',
category: 'DOM insertion',
fn: function (anElement){
var self=this;
self._call_withArgument_("append",anElement);
return self;},
source: unescape('appendElement%3A%20anElement%0A%20%20%20%20%22Append%20anElement%20at%20the%20end%20of%20the%20element.%0A%20%20%20%20%20Dont%27t%20call%20this%20method%20directly%2C%20use%20%23append%3A%20instead%22%0A%20%20%20%20self%20call%3A%20%27append%27%20withArgument%3A%20anElement%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_appendToJQuery_',
smalltalk.method({
selector: 'appendToJQuery:',
category: 'DOM insertion',
fn: function (aJQuery){
var self=this;
aJQuery._appendElement_(self['@jquery']);
return self;},
source: unescape('appendToJQuery%3A%20aJQuery%0A%20%20%20%20aJQuery%20appendElement%3A%20jquery%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_contents_',
smalltalk.method({
selector: 'contents:',
category: 'DOM insertion',
fn: function (anObject){
var self=this;
self._empty();
self._append_(anObject);
return self;},
source: unescape('contents%3A%20anObject%0A%20%20%20%20self%20empty.%0A%20%20%20%20self%20append%3A%20anObject%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_empty',
smalltalk.method({
selector: 'empty',
category: 'DOM insertion',
fn: function (){
var self=this;
self._call_("empty");
return self;},
source: unescape('empty%0A%20%20%20%20self%20call%3A%20%27empty%27%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_initializeWithJQueryObject_',
smalltalk.method({
selector: 'initializeWithJQueryObject:',
category: 'initialization',
fn: function (anObject){
var self=this;
self['@jquery']=anObject;
return self;},
source: unescape('initializeWithJQueryObject%3A%20anObject%0A%20%20%20%20jquery%20%3A%3D%20anObject%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_call_',
smalltalk.method({
selector: 'call:',
category: 'private',
fn: function (aString){
var self=this;
return (function(){return self['@jquery'][aString]()})();
return self;},
source: unescape('call%3A%20aString%0A%20%20%20%20%5E%7B%27return%20self%5B%27%27@jquery%27%27%5D%5BaString%5D%28%29%27%7D%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_call_withArgument_',
smalltalk.method({
selector: 'call:withArgument:',
category: 'private',
fn: function (aString, anObject){
var self=this;
return (function(){return self['@jquery'][aString](anObject)})();
return self;},
source: unescape('call%3A%20aString%20withArgument%3A%20anObject%0A%20%20%20%20%5E%7B%27return%20self%5B%27%27@jquery%27%27%5D%5BaString%5D%28anObject%29%27%7D%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_hasClass_',
smalltalk.method({
selector: 'hasClass:',
category: 'testing',
fn: function (aString){
var self=this;
return self._call_withArgument_("hasClass",aString);
return self;},
source: unescape('hasClass%3A%20aString%0A%20%20%20%20%22Determine%20whether%20any%20of%20the%20matched%20elements%20are%20assigned%20the%20given%20class.%22%0A%20%20%20%20%5Eself%20call%3A%20%27hasClass%27%20withArgument%3A%20aString%0A')}),
smalltalk.JQuery);


smalltalk.addMethod(
'_fromString_',
smalltalk.method({
selector: 'fromString:',
category: 'instance creation',
fn: function (aString){
var self=this;
var newJQuery=nil;
(function(){newJQuery = jQuery(String(aString))})();
return self._from_(newJQuery);
return self;},
source: unescape('fromString%3A%20aString%0A%20%20%20%20%7C%20newJQuery%20%7C%0A%20%20%20%20%7B%27newJQuery%20%3D%20jQuery%28String%28aString%29%29%27%7D.%0A%20%20%20%20%5Eself%20from%3A%20newJQuery%0A')}),
smalltalk.JQuery.klass);

smalltalk.addMethod(
'_from_',
smalltalk.method({
selector: 'from:',
category: 'instance creation',
fn: function (anObject){
var self=this;
return (function($rec){$rec._initializeWithJQueryObject_(anObject);return $rec._yourself();})(self._new());
return self;},
source: unescape('from%3A%20anObject%0A%20%20%20%20%5Eself%20new%0A%09initializeWithJQueryObject%3A%20anObject%3B%0A%09yourself%0A')}),
smalltalk.JQuery.klass);


smalltalk.addClass('Ajax', smalltalk.Object, ['settings'], 'JQuery');
smalltalk.Ajax.comment=unescape('instance%20variable%20names%3A%0A-%20settings%20%20A%20set%20of%20key/value%20pairs%20that%20configure%20the%20Ajax%20request.%20All%20settings%20are%20optional.%0A%0AFull%20list%20of%20settings%20options%20at%20http%3A//api.jquery.com/jQuery.ajax/%0A')
smalltalk.addMethod(
'_initialize',
smalltalk.method({
selector: 'initialize',
category: 'initialization',
fn: function (){
var self=this;
self.klass.superclass.fn.prototype['_initialize'].apply(self, []);
self['@settings']=smalltalk.Dictionary._new();
return self;},
source: unescape('initialize%0A%20%20%20%20super%20initialize.%0A%20%20%20%20settings%20%3A%3D%20Dictionary%20new%0A')}),
smalltalk.Ajax);

smalltalk.addMethod(
'_at_',
smalltalk.method({
selector: 'at:',
category: 'accessing',
fn: function (aKey){
var self=this;
return self['@settings']._at_ifAbsent_(aKey,(function(){return nil;}));
return self;},
source: unescape('at%3A%20aKey%0A%20%20%20%20%5Esettings%20at%3A%20aKey%20ifAbsent%3A%20%5Bnil%5D%0A')}),
smalltalk.Ajax);

smalltalk.addMethod(
'_at_put_',
smalltalk.method({
selector: 'at:put:',
category: 'accessing',
fn: function (aKey, aValue){
var self=this;
self['@settings']._at_put_(aKey,aValue);
return self;},
source: unescape('at%3A%20aKey%20put%3A%20aValue%0A%20%20%20%20settings%20at%3A%20aKey%20put%3A%20aValue%0A')}),
smalltalk.Ajax);

smalltalk.addMethod(
'_url',
smalltalk.method({
selector: 'url',
category: 'accessing',
fn: function (){
var self=this;
return self._at_("url");
return self;},
source: unescape('url%0A%20%20%20%20%5Eself%20at%3A%20%27url%27%0A')}),
smalltalk.Ajax);

smalltalk.addMethod(
'_url_',
smalltalk.method({
selector: 'url:',
category: 'accessing',
fn: function (aString){
var self=this;
self._at_put_("url",aString);
return self;},
source: unescape('url%3A%20aString%0A%20%20%20%20self%20at%3A%20%27url%27%20put%3A%20aString%0A')}),
smalltalk.Ajax);

smalltalk.addMethod(
'_send',
smalltalk.method({
selector: 'send',
category: 'actions',
fn: function (){
var self=this;
(function(){jQuery.ajax(self['@settings'])})();
return self;},
source: unescape('send%0A%20%20%20%20%7B%27jQuery.ajax%28self%5B%27%27@settings%27%27%5D%29%27%7D%0A')}),
smalltalk.Ajax);


smalltalk.addMethod(
'_url_',
smalltalk.method({
selector: 'url:',
category: 'instance creation',
fn: function (aString){
var self=this;
return (function($rec){$rec._url_(aString);return $rec._yourself();})(self._new());
return self;},
source: unescape('url%3A%20aString%0A%20%20%20%20%5Eself%20new%0A%09url%3A%20aString%3B%0A%09yourself%0A')}),
smalltalk.Ajax.klass);



smalltalk.addClass('CanvasRenderingContext', smalltalk.Object, [], 'Canvas');
smalltalk.addMethod(
'_fillStyle_',
smalltalk.method({
selector: 'fillStyle:',
category: 'drawing paths',
fn: function (aString) {
    var self = this;
    (function () {self.fillStyle = String(aString);}());
    return self;
},
source: unescape('fillStyle%3A%20aString%0A%09%7B%27self.fillStyle%20%3D%20String%28aString%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_beginPath',
smalltalk.method({
selector: 'beginPath',
category: 'drawing paths',
fn: function () {
    var self = this;
    (function () {self.beginPath();}());
    return self;
},
source: unescape('beginPath%0A%09%7B%27self.beginPath%28%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_closePath',
smalltalk.method({
selector: 'closePath',
category: 'drawing paths',
fn: function () {
    var self = this;
    (function () {self.closePath();}());
    return self;
},
source: unescape('closePath%0A%09%7B%27self.closePath%28%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_fill',
smalltalk.method({
selector: 'fill',
category: 'drawing paths',
fn: function () {
    var self = this;
    (function () {self.fill();}());
    return self;
},
source: unescape('fill%0A%09%7B%27self.fill%28%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_stroke',
smalltalk.method({
selector: 'stroke',
category: 'drawing paths',
fn: function () {
    var self = this;
    (function () {self.stroke();}());
    return self;
},
source: unescape('stroke%0A%09%7B%27self.stroke%28%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_moveTo_',
smalltalk.method({
selector: 'moveTo:',
category: 'drawing paths',
fn: function (aPoint) {
    var self = this;
    (function () {self.moveTo(aPoint._x(), aPoint._y());}());
    return self;
},
source: unescape('moveTo%3A%20aPoint%0A%09%7B%27self.moveTo%28aPoint._x%28%29%2C%20aPoint._y%28%29%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_lineTo_',
smalltalk.method({
selector: 'lineTo:',
category: 'drawing paths',
fn: function (aPoint) {
    var self = this;
    (function () {self.lineTo(aPoint._x(), aPoint._y());}());
    return self;
},
source: unescape('lineTo%3A%20aPoint%0A%09%7B%27self.lineTo%28aPoint._x%28%29%2C%20aPoint._y%28%29%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_arcTo_radius_startAngle_endAngle_anticlockwise_',
smalltalk.method({
selector: 'arcTo:radius:startAngle:endAngle:anticlockwise:',
category: 'drawing arcs',
fn: function (aPoint, aNumber, aNumber2, aNumber3, aBoolean) {
    var self = this;
    (function () {self.arc(aPoint._x(), aPoint._y(), aNumber, aNumber2, aNumber3, aBoolean);}());
    return self;
},
source: unescape('arcTo%3A%20aPoint%20radius%3A%20aNumber%20startAngle%3A%20aNumber2%20endAngle%3A%20aNumber3%20anticlockwise%3A%20aBoolean%0A%09%7B%27self.arc%28aPoint._x%28%29%2C%20aPoint._y%28%29%2C%20aNumber%2C%20aNumber2%2C%20aNumber3%2C%20aBoolean%29%27%7D%20')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_arcTo_radius_',
smalltalk.method({
selector: 'arcTo:radius:',
category: 'drawing arcs',
fn: function (aPoint, aNumber) {
    var self = this;
    self._arcTo_radius_startAngle_endAngle_anticlockwise_(aPoint, aNumber, 0, smalltalk.Number._pi().__star(2), false);
    return self;
},
source: unescape('arcTo%3A%20aPoint%20radius%3A%20aNumber%0A%09self%20arcTo%3A%20aPoint%20radius%3A%20aNumber%20startAngle%3A%200%20endAngle%3A%20Number%20pi%20*%202%20anticlockwise%3A%20false')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_fillRectFrom_to_',
smalltalk.method({
selector: 'fillRectFrom:to:',
category: 'drawing rectangles',
fn: function (aPoint, anotherPoint) {
    var self = this;
    (function () {self.fillRect(aPoint._x(), aPoint._y(), anotherPoint._x(), anotherPoint._y());}());
    return self;
},
source: unescape('fillRectFrom%3A%20aPoint%20to%3A%20anotherPoint%0A%09%7B%27self.fillRect%28aPoint._x%28%29%2C%20aPoint._y%28%29%2C%20anotherPoint._x%28%29%2C%20anotherPoint._y%28%29%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_strokeRectFrom_to_',
smalltalk.method({
selector: 'strokeRectFrom:to:',
category: 'drawing rectangles',
fn: function (aPoint, anotherPoint) {
    var self = this;
    (function () {self.strokeRect(aPoint._x(), aPoint._y(), anotherPoint._x(), anotherPoint._y());}());
    return self;
},
source: unescape('strokeRectFrom%3A%20aPoint%20to%3A%20anotherPoint%0A%09%7B%27self.strokeRect%28aPoint._x%28%29%2C%20aPoint._y%28%29%2C%20anotherPoint._x%28%29%2C%20anotherPoint._y%28%29%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_clearRectFrom_to_',
smalltalk.method({
selector: 'clearRectFrom:to:',
category: 'drawing rectangles',
fn: function (aPoint, anotherPoint) {
    var self = this;
    (function () {self.fillRect(aPoint._x(), aPoint._y(), anotherPoint._x(), anotherPoint._y());}());
    return self;
},
source: unescape('clearRectFrom%3A%20aPoint%20to%3A%20anotherPoint%0A%09%7B%27self.fillRect%28aPoint._x%28%29%2C%20aPoint._y%28%29%2C%20anotherPoint._x%28%29%2C%20anotherPoint._y%28%29%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_strokeStyle_',
smalltalk.method({
selector: 'strokeStyle:',
category: 'drawing paths',
fn: function (aString) {
    var self = this;
    (function () {self.strokeStyle = String(aString);}());
    return self;
},
source: unescape('strokeStyle%3A%20aString%0A%09%7B%27self.strokeStyle%20%3D%20String%28aString%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_lineWidth_',
smalltalk.method({
selector: 'lineWidth:',
category: 'drawing paths',
fn: function (aNumber) {
    var self = this;
    (function () {self.lineWidth = aNumber;}());
    return self;
},
source: unescape('lineWidth%3A%20aNumber%0A%09%7B%27self.lineWidth%20%3D%20aNumber%27%7D')}),
smalltalk.CanvasRenderingContext);


smalltalk.addMethod(
'_tagBrush_',
smalltalk.method({
selector: 'tagBrush:',
category: 'instance creation',
fn: function (aTagBrush) {
    var self = this;
    return function () {return aTagBrush._element().getContext("2d");}();
    return self;
},
source: unescape('tagBrush%3A%20aTagBrush%0A%09%5E%7B%27return%20aTagBrush._element%28%29.getContext%28%27%272d%27%27%29%27%7D')}),
smalltalk.CanvasRenderingContext.klass);


smalltalk.addClass('HTMLCanvas', smalltalk.Object, ['root'], 'Canvas');
smalltalk.addMethod(
'_root_',
smalltalk.method({
selector: 'root:',
category: 'accessing',
fn: function (aTagBrush) {
    var self = this;
    self['@root'] = aTagBrush;
    return self;
},
source: unescape('root%3A%20aTagBrush%0A%20%20%20%20root%20%3A%3D%20aTagBrush%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_root',
smalltalk.method({
selector: 'root',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@root'];
    return self;
},
source: unescape('root%0A%20%20%20%20%5Eroot%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_initialize',
smalltalk.method({
selector: 'initialize',
category: 'initialization',
fn: function () {
    var self = this;
    self.klass.superclass.fn.prototype._initialize.apply(self, []);
    self['@root'] = smalltalk.TagBrush._fromString_canvas_("div", self);
    return self;
},
source: unescape('initialize%0A%20%20%20%20super%20initialize.%0A%20%20%20%20root%20%3A%3D%20TagBrush%20fromString%3A%20%27div%27%20canvas%3A%20self%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_with_',
smalltalk.method({
selector: 'with:',
category: 'adding',
fn: function (anObject) {
    var self = this;
    return self._root()._with_(anObject);
    return self;
},
source: unescape('with%3A%20anObject%0A%20%20%20%20%5Eself%20root%20with%3A%20anObject%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_newTag_',
smalltalk.method({
selector: 'newTag:',
category: 'tags',
fn: function (aString) {
    var self = this;
    return smalltalk.TagBrush._fromString_canvas_(aString, self);
    return self;
},
source: unescape('newTag%3A%20aString%0A%20%20%20%20%5ETagBrush%20fromString%3A%20aString%20canvas%3A%20self%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_tag_',
smalltalk.method({
selector: 'tag:',
category: 'tags',
fn: function (aString) {
    var self = this;
    return self['@root']._addBrush_(self._newTag_(aString));
    return self;
},
source: unescape('tag%3A%20aString%0A%20%20%20%20%5Eroot%20addBrush%3A%20%28self%20newTag%3A%20aString%29%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_h1',
smalltalk.method({
selector: 'h1',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("h1");
    return self;
},
source: unescape('h1%0A%20%20%20%20%5Eself%20tag%3A%20%27h1%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_h2',
smalltalk.method({
selector: 'h2',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("h2");
    return self;
},
source: unescape('h2%0A%20%20%20%20%5Eself%20tag%3A%20%27h2%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_h3',
smalltalk.method({
selector: 'h3',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("h3");
    return self;
},
source: unescape('h3%0A%20%20%20%20%5Eself%20tag%3A%20%27h3%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_h4',
smalltalk.method({
selector: 'h4',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("h4");
    return self;
},
source: unescape('h4%0A%20%20%20%20%5Eself%20tag%3A%20%27h4%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_h5',
smalltalk.method({
selector: 'h5',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("h5");
    return self;
},
source: unescape('h5%0A%20%20%20%20%5Eself%20tag%3A%20%27h5%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_h6',
smalltalk.method({
selector: 'h6',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("h6");
    return self;
},
source: unescape('h6%0A%20%20%20%20%5Eself%20tag%3A%20%27h6%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_p',
smalltalk.method({
selector: 'p',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("p");
    return self;
},
source: unescape('p%0A%20%20%20%20%5Eself%20tag%3A%20%27p%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_div',
smalltalk.method({
selector: 'div',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("div");
    return self;
},
source: unescape('div%0A%20%20%20%20%5Eself%20tag%3A%20%27div%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_span',
smalltalk.method({
selector: 'span',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("span");
    return self;
},
source: unescape('span%0A%20%20%20%20%5Eself%20tag%3A%20%27span%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_img',
smalltalk.method({
selector: 'img',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("img");
    return self;
},
source: unescape('img%0A%20%20%20%20%5Eself%20tag%3A%20%27img%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_ul',
smalltalk.method({
selector: 'ul',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("ul");
    return self;
},
source: unescape('ul%0A%20%20%20%20%5Eself%20tag%3A%20%27ul%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_ol',
smalltalk.method({
selector: 'ol',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("ol");
    return self;
},
source: unescape('ol%0A%20%20%20%20%5Eself%20tag%3A%20%27ol%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_li',
smalltalk.method({
selector: 'li',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("li");
    return self;
},
source: unescape('li%0A%20%20%20%20%5Eself%20tag%3A%20%27li%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_table',
smalltalk.method({
selector: 'table',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("table");
    return self;
},
source: unescape('table%0A%20%20%20%20%5Eself%20tag%3A%20%27table%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_tr',
smalltalk.method({
selector: 'tr',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("tr");
    return self;
},
source: unescape('tr%0A%20%20%20%20%5Eself%20tag%3A%20%27tr%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_td',
smalltalk.method({
selector: 'td',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("td");
    return self;
},
source: unescape('td%20%0A%20%20%20%20%5Eself%20tag%3A%20%27td%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_th',
smalltalk.method({
selector: 'th',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("th");
    return self;
},
source: unescape('th%0A%20%20%20%20%5Eself%20tag%3A%20%27th%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_form',
smalltalk.method({
selector: 'form',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("form");
    return self;
},
source: unescape('form%0A%20%20%20%20%5Eself%20tag%3A%20%27form%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_input',
smalltalk.method({
selector: 'input',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("input");
    return self;
},
source: unescape('input%0A%20%20%20%20%5Eself%20tag%3A%20%27input%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_button',
smalltalk.method({
selector: 'button',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("button");
    return self;
},
source: unescape('button%0A%20%20%20%20%5Eself%20tag%3A%20%27button%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_select',
smalltalk.method({
selector: 'select',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("select");
    return self;
},
source: unescape('select%0A%20%20%20%20%5Eself%20tag%3A%20%27select%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_option',
smalltalk.method({
selector: 'option',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("option");
    return self;
},
source: unescape('option%0A%20%20%20%20%5Eself%20tag%3A%20%27option%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_textarea',
smalltalk.method({
selector: 'textarea',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("textarea");
    return self;
},
source: unescape('textarea%0A%20%20%20%20%5Eself%20tag%3A%20%27textarea%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_a',
smalltalk.method({
selector: 'a',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("a");
    return self;
},
source: unescape('a%0A%20%20%20%20%5Eself%20tag%3A%20%27a%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_appendToJQuery_',
smalltalk.method({
selector: 'appendToJQuery:',
category: '*JQuery',
fn: function (aJQuery) {
    var self = this;
    aJQuery._appendElement_(self['@root']._element());
    return self;
},
source: unescape('appendToJQuery%3A%20aJQuery%0A%20%20%20%20aJQuery%20appendElement%3A%20root%20element%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_canvas',
smalltalk.method({
selector: 'canvas',
category: 'tags',
fn: function () {
    var self = this;
    return self._tag_("canvas");
    return self;
},
source: unescape('canvas%0A%09%5Eself%20tag%3A%20%27canvas%27%0A')}),
smalltalk.HTMLCanvas);



smalltalk.addClass('TagBrush', smalltalk.Object, ['canvas', 'element'], 'Canvas');
smalltalk.addMethod(
'_contents_',
smalltalk.method({
selector: 'contents:',
category: 'adding',
fn: function (anObject) {
    var self = this;
    self._asJQuery()._empty();
    self._append_(anObject);
    return self;
},
source: unescape('contents%3A%20anObject%0A%20%20%20%20self%20asJQuery%20empty.%0A%20%20%20%20self%20append%3A%20anObject%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_addBrush_',
smalltalk.method({
selector: 'addBrush:',
category: 'adding',
fn: function (aTagBrush) {
    var self = this;
    self._appendChild_(aTagBrush._element());
    return aTagBrush;
    return self;
},
source: unescape('addBrush%3A%20aTagBrush%0A%20%20%20%20self%20appendChild%3A%20aTagBrush%20element.%0A%20%20%20%20%5EaTagBrush%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_with_',
smalltalk.method({
selector: 'with:',
category: 'adding',
fn: function (anObject) {
    var self = this;
    self._append_(anObject);
    return self;
},
source: unescape('with%3A%20anObject%0A%20%20%20%20self%20append%3A%20anObject%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_append_',
smalltalk.method({
selector: 'append:',
category: 'adding',
fn: function (anObject) {
    var self = this;
    anObject._appendToBrush_(self);
    return self;
},
source: unescape('append%3A%20anObject%0A%20%20%20%20anObject%20appendToBrush%3A%20self%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_appendToBrush_',
smalltalk.method({
selector: 'appendToBrush:',
category: 'adding',
fn: function (aTagBrush) {
    var self = this;
    aTagBrush._addBrush_(self);
    return self;
},
source: unescape('appendToBrush%3A%20aTagBrush%0A%20%20%20%20aTagBrush%20addBrush%3A%20self%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_appendBlock_',
smalltalk.method({
selector: 'appendBlock:',
category: 'adding',
fn: function (aBlock) {
    var self = this;
    var root = nil;
    root = canvas._root();
    canvas._root_(self);
    aBlock._value_(canvas);
    canvas._root_(root);
    return self;
},
source: unescape('appendBlock%3A%20aBlock%0A%20%20%20%20%7C%20root%20%7C%0A%20%20%20%20root%20%3A%3D%20canvas%20root.%0A%20%20%20%20canvas%20root%3A%20self.%0A%20%20%20%20aBlock%20value%3A%20canvas.%0A%20%20%20%20canvas%20root%3A%20root%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_appendChild_',
smalltalk.method({
selector: 'appendChild:',
category: 'adding',
fn: function (anElement) {
    var self = this;
    (function () {self['@element'].appendChild(anElement);}());
    return self;
},
source: unescape('appendChild%3A%20anElement%0A%20%20%20%20%7B%27self%5B%27%27@element%27%27%5D.appendChild%28anElement%29%27%7D%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_appendString_',
smalltalk.method({
selector: 'appendString:',
category: 'adding',
fn: function (aString) {
    var self = this;
    self._appendChild_(self._createTextNodeFor_(aString));
    return self;
},
source: unescape('appendString%3A%20aString%0A%20%20%20%20self%20appendChild%3A%20%28self%20createTextNodeFor%3A%20aString%29%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_at_put_',
smalltalk.method({
selector: 'at:put:',
category: 'attributes',
fn: function (aString, aValue) {
    var self = this;
    (function () {self['@element'].setAttribute(aString, aValue);}());
    return self;
},
source: unescape('at%3A%20aString%20put%3A%20aValue%0A%20%20%20%20%7B%27self%5B%27%27@element%27%27%5D.setAttribute%28aString%2C%20aValue%29%27%7D%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_removeAt_',
smalltalk.method({
selector: 'removeAt:',
category: 'attributes',
fn: function (aString) {
    var self = this;
    (function () {self['@element'].removeAttribute(aString);}());
    return self;
},
source: unescape('removeAt%3A%20aString%0A%20%20%20%20%7B%27self%5B%27%27@element%27%27%5D.removeAttribute%28aString%29%27%7D%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_class_',
smalltalk.method({
selector: 'class:',
category: 'attributes',
fn: function (aString) {
    var self = this;
    self._at_put_("class", aString);
    return self;
},
source: unescape('class%3A%20aString%0A%20%20%20%20self%20at%3A%20%27class%27%20put%3A%20aString%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_id_',
smalltalk.method({
selector: 'id:',
category: 'attributes',
fn: function (aString) {
    var self = this;
    self._at_put_("id", aString);
    return self;
},
source: unescape('id%3A%20aString%0A%20%20%20%20self%20at%3A%20%27id%27%20put%3A%20aString%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_src_',
smalltalk.method({
selector: 'src:',
category: 'attributes',
fn: function (aString) {
    var self = this;
    self._at_put_("src", aString);
    return self;
},
source: unescape('src%3A%20aString%0A%20%20%20%20self%20%20at%3A%20%27src%27%20put%3A%20aString%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_href_',
smalltalk.method({
selector: 'href:',
category: 'attributes',
fn: function (aString) {
    var self = this;
    self._at_put_("href", aString);
    return self;
},
source: unescape('href%3A%20aString%0A%20%20%20%20self%20at%3A%20%27href%27%20put%3A%20aString%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_title_',
smalltalk.method({
selector: 'title:',
category: 'attributes',
fn: function (aString) {
    var self = this;
    self._at_put_("title", aString);
    return self;
},
source: unescape('title%3A%20aString%0A%20%20%20%20self%20at%3A%20%27title%27%20put%3A%20aString%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_style_',
smalltalk.method({
selector: 'style:',
category: 'attributes',
fn: function (aString) {
    var self = this;
    self._at_put_("style", aString);
    return self;
},
source: unescape('style%3A%20aString%0A%20%20%20%20self%20at%3A%20%27style%27%20put%3A%20aString%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_initializeFromString_canvas_',
smalltalk.method({
selector: 'initializeFromString:canvas:',
category: 'initialization',
fn: function (aString, aCanvas) {
    var self = this;
    self['@element'] = self._createElementFor_(aString);
    canvas = aCanvas;
    return self;
},
source: unescape('initializeFromString%3A%20aString%20canvas%3A%20aCanvas%0A%20%20%20%20element%20%3A%3D%20self%20createElementFor%3A%20aString.%0A%20%20%20%20canvas%20%3A%3D%20aCanvas%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_element',
smalltalk.method({
selector: 'element',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@element'];
    return self;
},
source: unescape('element%0A%20%20%20%20%5Eelement%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_asJQuery',
smalltalk.method({
selector: 'asJQuery',
category: 'converting',
fn: function () {
    var self = this;
    return function () {return smalltalk.JQuery._from_(jQuery(self['@element']));}();
    return self;
},
source: unescape('asJQuery%0A%20%20%20%20%5E%7B%27return%20smalltalk.JQuery._from_%28jQuery%28self%5B%27%27@element%27%27%5D%29%29%27%7D%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_asJQueryDo_',
smalltalk.method({
selector: 'asJQueryDo:',
category: 'converting',
fn: function (aBlock) {
    var self = this;
    aBlock._value_(self._asJQuery());
    return self;
},
source: unescape('asJQueryDo%3A%20aBlock%0A%20%20%20%20aBlock%20value%3A%20self%20asJQuery%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_onKeyDown_',
smalltalk.method({
selector: 'onKeyDown:',
category: 'events',
fn: function (aBlock) {
    var self = this;
    self._asJQuery()._on_do_("keydown", aBlock);
    return self;
},
source: unescape('onKeyDown%3A%20aBlock%0A%20%20%20%20self%20asJQuery%20on%3A%20%27keydown%27%20do%3A%20aBlock%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_onKeyPress_',
smalltalk.method({
selector: 'onKeyPress:',
category: 'events',
fn: function (aBlock) {
    var self = this;
    self._asJQuery()._on_do_("keypress", aBlock);
    return self;
},
source: unescape('onKeyPress%3A%20aBlock%0A%20%20%20%20self%20asJQuery%20on%3A%20%27keypress%27%20do%3A%20aBlock%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_onKeyUp_',
smalltalk.method({
selector: 'onKeyUp:',
category: 'events',
fn: function (aBlock) {
    var self = this;
    self._asJQuery()._on_do_("keyup", aBlock);
    return self;
},
source: unescape('onKeyUp%3A%20aBlock%0A%20%20%20%20self%20asJQuery%20on%3A%20%27keyup%27%20do%3A%20aBlock%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_onFocus_',
smalltalk.method({
selector: 'onFocus:',
category: 'events',
fn: function (aBlock) {
    var self = this;
    self._asJQuery()._on_do_("focus", aBlock);
    return self;
},
source: unescape('onFocus%3A%20aBlock%0A%20%20%20%20self%20asJQuery%20on%3A%20%27focus%27%20do%3A%20aBlock%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_onBlur_',
smalltalk.method({
selector: 'onBlur:',
category: 'events',
fn: function (aBlock) {
    var self = this;
    self._asJQuery()._on_do_("blur", aBlock);
    return self;
},
source: unescape('onBlur%3A%20aBlock%0A%20%20%20%20self%20asJQuery%20on%3A%20%27blur%27%20do%3A%20aBlock%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_onChange_',
smalltalk.method({
selector: 'onChange:',
category: 'events',
fn: function (aBlock) {
    var self = this;
    self._asJQuery()._on_do_("change", aBlock);
    return self;
},
source: unescape('onChange%3A%20aBlock%0A%20%20%20%20self%20asJQuery%20on%3A%20%27change%27%20do%3A%20aBlock%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_onClick_',
smalltalk.method({
selector: 'onClick:',
category: 'events',
fn: function (aBlock) {
    var self = this;
    self._asJQuery()._on_do_("click", aBlock);
    return self;
},
source: unescape('onClick%3A%20aBlock%0A%20%20%20%20self%20asJQuery%20on%3A%20%27click%27%20do%3A%20aBlock%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_createElementFor_',
smalltalk.method({
selector: 'createElementFor:',
category: 'private',
fn: function (aString) {
    var self = this;
    return function () {return document.createElement(String(aString));}();
    return self;
},
source: unescape('createElementFor%3A%20aString%0A%20%20%20%20%5E%7B%27return%20document.createElement%28String%28aString%29%29%27%7D%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_createTextNodeFor_',
smalltalk.method({
selector: 'createTextNodeFor:',
category: 'private',
fn: function (aString) {
    var self = this;
    return function () {return document.createTextNode(String(aString));}();
    return self;
},
source: unescape('createTextNodeFor%3A%20aString%0A%20%20%20%20%5E%7B%27return%20document.createTextNode%28String%28aString%29%29%27%7D%0A')}),
smalltalk.TagBrush);


smalltalk.addMethod(
'_fromString_canvas_',
smalltalk.method({
selector: 'fromString:canvas:',
category: 'instance creation',
fn: function (aString, aCanvas) {
    var self = this;
    return function ($rec) {$rec._initializeFromString_canvas_(aString, aCanvas);return $rec._yourself();}(self._new());
    return self;
},
source: unescape('fromString%3A%20aString%20canvas%3A%20aCanvas%0A%20%20%20%20%5Eself%20new%0A%09initializeFromString%3A%20aString%20canvas%3A%20aCanvas%3B%0A%09yourself%0A')}),
smalltalk.TagBrush.klass);


smalltalk.addClass('Widget', smalltalk.Object, ['root'], 'Canvas');
smalltalk.addMethod(
'_root',
smalltalk.method({
selector: 'root',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@root'];
    return self;
},
source: unescape('root%0A%20%20%20%20%5Eroot%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_appendToBrush_',
smalltalk.method({
selector: 'appendToBrush:',
category: 'adding',
fn: function (aTagBrush) {
    var self = this;
    self._appendToJQuery_(aTagBrush._asJQuery());
    return self;
},
source: unescape('appendToBrush%3A%20aTagBrush%0A%20%20%20%20self%20appendToJQuery%3A%20aTagBrush%20asJQuery%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_appendToJQuery_',
smalltalk.method({
selector: 'appendToJQuery:',
category: 'adding',
fn: function (aJQuery) {
    var self = this;
    self._render();
    aJQuery._append_(self._root()._asJQuery());
    return self;
},
source: unescape('appendToJQuery%3A%20aJQuery%0A%20%20%20%20self%20render.%0A%20%20%20%20aJQuery%20append%3A%20self%20root%20asJQuery%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_alert_',
smalltalk.method({
selector: 'alert:',
category: 'actions',
fn: function (aString) {
    var self = this;
    (function () {alert(aString);}());
    return self;
},
source: unescape('alert%3A%20aString%0A%20%20%20%20%7B%27alert%28aString%29%27%7D%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_confirm_',
smalltalk.method({
selector: 'confirm:',
category: 'actions',
fn: function (aString) {
    var self = this;
    return function () {return window.confirm(aString);}();
    return self;
},
source: unescape('confirm%3A%20aString%0A%20%20%20%20%5E%7B%27return%20window.confirm%28aString%29%27%7D%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_prompt_',
smalltalk.method({
selector: 'prompt:',
category: 'actions',
fn: function (aString) {
    var self = this;
    return self._prompt_default_(aString, "");
    return self;
},
source: unescape('prompt%3A%20aString%0A%20%20%20%20%5Eself%20prompt%3A%20aString%20default%3A%20%27%27%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_prompt_default_',
smalltalk.method({
selector: 'prompt:default:',
category: 'actions',
fn: function (aString, anotherString) {
    var self = this;
    return function () {return window.prompt(aString, anotherString);}();
    return self;
},
source: unescape('prompt%3A%20aString%20default%3A%20anotherString%0A%20%20%20%20%5E%7B%27return%20window.prompt%28aString%2C%20anotherString%29%27%7D%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_update',
smalltalk.method({
selector: 'update',
category: 'actions',
fn: function () {
    var self = this;
    var canvas = nil;
    canvas = smalltalk.HTMLCanvas._new();
    canvas._root_(self._root());
    self._root()._asJQuery()._empty();
    self._renderOn_(canvas);
    return self;
},
source: unescape('update%0A%20%20%20%20%7C%20canvas%20%7C%0A%20%20%20%20canvas%20%3A%3D%20HTMLCanvas%20new.%0A%20%20%20%20canvas%20root%3A%20self%20root.%0A%20%20%20%20self%20root%20asJQuery%20empty.%0A%20%20%20%20self%20renderOn%3A%20canvas%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_render',
smalltalk.method({
selector: 'render',
category: 'rendering',
fn: function () {
    var self = this;
    var canvas = nil;
    canvas = smalltalk.HTMLCanvas._new();
    self['@root'] = canvas._root();
    self._renderOn_(canvas);
    return self;
},
source: unescape('render%0A%20%20%20%20%7C%20canvas%20%7C%0A%20%20%20%20canvas%20%3A%3D%20HTMLCanvas%20new.%0A%20%20%20%20root%20%3A%3D%20canvas%20root.%0A%20%20%20%20self%20renderOn%3A%20canvas%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_renderOn_',
smalltalk.method({
selector: 'renderOn:',
category: 'rendering',
fn: function (html) {
    var self = this;
    return self;
},
source: unescape('renderOn%3A%20html%0A%20%20%20%20self%0A')}),
smalltalk.Widget);



smalltalk.addClass('CanvasBrush', smalltalk.TagBrush, [], 'Canvas');
smalltalk.addMethod(
'_createElement',
smalltalk.method({
selector: 'createElement',
category: 'private',
fn: function () {
    var self = this;
    return function () {return document.createElement("canvas");}();
    return self;
},
source: unescape('createElement%0A%20%20%20%20%5E%7B%27return%20document.createElement%28%27%27canvas%27%27%29%27%7D%0A')}),
smalltalk.CanvasBrush);

smalltalk.addMethod(
'_initializeWithCanvas_',
smalltalk.method({
selector: 'initializeWithCanvas:',
category: 'initialization',
fn: function (aCanvas) {
    var self = this;
    canvas = aCanvas;
    return self;
},
source: unescape('initializeWithCanvas%3A%20aCanvas%0A%09canvas%20%3A%3D%20aCanvas')}),
smalltalk.CanvasBrush);


smalltalk.addMethod(
'_canvas_',
smalltalk.method({
selector: 'canvas:',
category: 'instance creation',
fn: function (aCanvas) {
    var self = this;
    return function ($rec) {$rec._initializeWithCanvas_(aCanvas);return $rec._yourself();}(self._new());
    return self;
},
source: unescape('canvas%3A%20aCanvas%0A%09%5Eself%20new%0A%09%09initializeWithCanvas%3A%20aCanvas%3B%0A%09%09yourself')}),
smalltalk.CanvasBrush.klass);


smalltalk.init(smalltalk.Object);
