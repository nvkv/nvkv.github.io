/* ====================================================================
|
|   Jtalk Smalltalk
|   http://jtalk-project.org
|
 ======================================================================

 ======================================================================
|
| Copyright (c) 2010-2011
| Nicolas Petton <petton.nicolas@gmail.com>
|
| Jtalk is released under the MIT license
|
| Permission is hereby granted, free of charge, to any person obtaining
| a copy of this software and associated documentation files (the 
| 'Software'), to deal in the Software without restriction, including 
| without limitation the rights to use, copy, modify, merge, publish, 
| distribute, sublicense, and/or sell copies of the Software, and to 
| permit persons to whom the Software is furnished to do so, subject to 
| the following conditions:
|
| The above copyright notice and this permission notice shall be 
| included in all copies or substantial portions of the Software.
|
| THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, 
| EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF 
| MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. 
| IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY 
| CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, 
| TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE 
| SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.  
|
 ==================================================================== */


/* Smalltalk constructors definition */

function Smalltalk(){};
function SmalltalkObject(){};
function SmalltalkBehavior(){};
function SmalltalkClass(){};
function SmalltalkMetaclass(){
    this.meta = true;
};
function SmalltalkMethod(){};
function SmalltalkNil(){};

/* Global Smalltalk objects. nil shouldn't be a global. */

var nil = new SmalltalkNil();
var smalltalk = new Smalltalk();


/* Smalltalk class creation. A class is an instance of an automatically 
   created metaclass object. Newly created classes (not their metaclass) 
   should be added to the smalltalk object, see smalltalk.addClass().
   Superclass linking is *not* handled here, see smalltalk.init()  */

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

/* Smalltalk method object. To add a method to a class,
   use smalltalk.addMethod() */

smalltalk.method = function(spec) {
    var that = new SmalltalkMethod();
    that.selector = spec.selector;
    that.category = spec.category;
    that.source   = spec.source;
    that.fn       = spec.fn;
    return that
};

/* Initialize a class in its class hierarchy. Handle both class and
   metaclasses. */

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

/* Answer all registered Smalltalk classes */

smalltalk.classes = function() {
    var classes = [];
    for(var i in smalltalk) {
	if(i.search(/^[A-Z]/g) != -1) {
	    classes.push(smalltalk[i]);
	}

    }
    return classes
};

/* Answer the direct subclasses of a given class.
   This is computed dynamically */

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

/* Create a new class wrapping a JavaScript constructor, and add it to the 
   global smalltalk object. */

smalltalk.mapClassName = function(className, category, fn, superclass) {
    smalltalk[className] = smalltalk.klass({
		className:  className, 
		category:   category, 
		superclass: superclass,
		fn:         fn
	});
};

/* Add a class to the smalltalk object, creating a new one if needed. */

smalltalk.addClass = function(className, superclass, iVarNames, category) {
    if(smalltalk[className]) {
	smalltalk[className].superclass = superclass;
	smalltalk[className].iVarNames = iVarNames;
	smalltalk[className].category = category || smalltalk[className].category;
    } else {
	smalltalk[className] = smalltalk.klass({
		className: className, 
		iVarNames: iVarNames,
		superclass: superclass
	    });
	smalltalk[className].category = category || '';
    }
};

/* Add a method to a class */

smalltalk.addMethod = function(jsSelector, method, klass) {
    klass.fn.prototype[jsSelector] = method.fn;
    klass.fn.prototype.methods[method.selector] = method;
};

/* Handles Smalltalk message send. Automatically converts undefined to the nil object.
   If the receiver does not understand the selector, call its #doesNotUnderstand: method */

smalltalk.send = function(receiver, selector, args) {
    if(typeof receiver === "undefined") {
	receiver = nil;
    }
    if(receiver[selector]) {
	return receiver[selector].apply(receiver, args);
    } else {
	return smalltalk.messageNotUnderstood(receiver, selector, args);
    }
};


/* handle #dnu:. 
   Assume that the receiver understands #doesNotUnderstand: */

smalltalk.messageNotUnderstood = function(receiver, selector, args) {
    return receiver._doesNotUnderstand_(
	smalltalk.Message._new()
	    ._selector_(smalltalk.convertSelector(selector))
	    ._arguments_(args)
    );
};

/* Convert a string to a valid smalltalk selector.
   if you modify the following functions, also change String>>asSelector
   accordingly */

smalltalk.convertSelector = function(selector) {
    if(selector.match(/__/)) {
	return smalltalk.convertBinarySelector(selector);
    } else {
	return smalltalk.convertKeywordSelector(selector);
    }
};

smalltalk.convertKeywordSelector = function(selector) {
    return selector.replace(/^_/, '').replace(/_/g, ':');
};

smalltalk.convertBinarySelector = function(selector) {
    return selector
	.replace(/^_/, '')
	.replace(/_plus/, '+')
	.replace(/_minus/, '-')
	.replace(/_star/, '*')
	.replace(/_slash/, '/')
	.replace(/_gt/, '>')
	.replace(/_lt/, '<')
	.replace(/_eq/, '=')
	.replace(/_comma/, ',')
	.replace(/_at/, '@')
};


/****************************************************************************************/


/* Base classes mapping. If you edit this part, do not forget to set the superclass of the
   object metaclass to Class after the definition of Object */

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
smalltalk.mapClassName("Date", "Kernel", Date, smalltalk.Object);
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
    return self == anObject;
    return self;
},
source: unescape('%3D%20anObject%0A%09%7B%27return%20self%20%3D%3D%20anObject%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_~_eq',
smalltalk.method({
selector: '~=',
category: 'comparing',
fn: function (anObject) {
    var self = this;
    return smalltalk.send(smalltalk.send(self, "__eq", [anObject]), "__eq_eq", [false]);
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
    return self.klass;
    return self;
},
source: unescape('class%0A%09%7B%27return%20self.klass%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_size',
smalltalk.method({
selector: 'size',
category: 'accessing',
fn: function () {
    var self = this;
    smalltalk.send(self, "_error_", ["Object not indexable"]);
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
    return smalltalk.send(smalltalk.send(self, "_shallowCopy", []), "_postCopy", []);
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
    var copy = self.klass._new();
    for (var i in self) {
        if (/^@.+/.test(i)) {
            copy[i] = self[i];
        }
    }
    return copy;
    return self;
},
source: unescape('shallowCopy%0A%09%7B%27%0A%09%20%20%20%20var%20copy%20%3D%20self.klass._new%28%29%3B%0A%09%20%20%20%20for%28var%20i%20in%20self%29%20%7B%0A%09%09if%28/%5E@.+/.test%28i%29%29%20%7B%0A%09%09%20%20%20%20copy%5Bi%5D%20%3D%20self%5Bi%5D%3B%0A%09%09%7D%0A%09%20%20%20%20%7D%0A%09%20%20%20%20return%20copy%3B%0A%09%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_deepCopy',
smalltalk.method({
selector: 'deepCopy',
category: 'copying',
fn: function () {
    var self = this;
    var copy = self.klass._new();
    for (var i in self) {
        if (/^@.+/.test(i)) {
            copy[i] = self[i]._deepCopy();
        }
    }
    return copy;
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
    return smalltalk.send(smalltalk.Association, "_key_value_", [self, anObject]);
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
    return smalltalk.send(self, "_printString", []);
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
    return smalltalk.send(self, "_asString", []);
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
    return smalltalk.send(self, "_perform_withArguments_", [aSymbol, []]);
    return self;
},
source: unescape('perform%3A%20aSymbol%0A%09%5Eself%20perform%3A%20aSymbol%20withArguments%3A%20%23%28%29%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_perform_withArguments_',
smalltalk.method({
selector: 'perform:withArguments:',
category: 'message handling',
fn: function (aSymbol, aCollection) {
    var self = this;
    return smalltalk.send(self, "_basicPerform_withArguments_", [smalltalk.send(aSymbol, "_asSelector", []), aCollection]);
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
    var value = self["@" + aString];
    if (typeof value == "undefined") {
        return nil;
    } else {
        return value;
    }
    return self;
},
source: unescape('instVarAt%3A%20aString%0A%09%7B%27%0A%09%20%20%20%20var%20value%20%3D%20self%5B%27%27@%27%27+aString%5D%3B%0A%09%20%20%20%20if%28typeof%28value%29%20%3D%3D%20%27%27undefined%27%27%29%20%7B%0A%09%09return%20nil%3B%0A%09%20%20%20%20%7D%20else%20%7B%0A%09%09return%20value%3B%0A%09%20%20%20%20%7D%0A%09%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_instVarAt_put_',
smalltalk.method({
selector: 'instVarAt:put:',
category: 'accessing',
fn: function (aString, anObject) {
    var self = this;
    self["@" + aString] = anObject;
    return self;
},
source: unescape('instVarAt%3A%20aString%20put%3A%20anObject%0A%09%7B%27self%5B%27%27@%27%27%20+%20aString%5D%20%3D%20anObject%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_basicAt_',
smalltalk.method({
selector: 'basicAt:',
category: 'accessing',
fn: function (aString) {
    var self = this;
    var value = self[aString];
    if (typeof value == "undefined") {
        return nil;
    } else {
        return value;
    }
    return self;
},
source: unescape('basicAt%3A%20aString%0A%09%7B%27%0A%09%20%20%20%20var%20value%20%3D%20self%5BaString%5D%3B%0A%09%20%20%20%20if%28typeof%28value%29%20%3D%3D%20%27%27undefined%27%27%29%20%7B%0A%09%09return%20nil%3B%0A%09%20%20%20%20%7D%20else%20%7B%0A%09%09return%20value%3B%0A%09%20%20%20%20%7D%0A%09%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_basicAt_put_',
smalltalk.method({
selector: 'basicAt:put:',
category: 'accessing',
fn: function (aString, anObject) {
    var self = this;
    return self[aString] = anObject;
    return self;
},
source: unescape('basicAt%3A%20aString%20put%3A%20anObject%0A%09%7B%27return%20self%5BaString%5D%20%3D%20anObject%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_error_',
smalltalk.method({
selector: 'error:',
category: 'error handling',
fn: function (aString) {
    var self = this;
    smalltalk.send(smalltalk.Error, "_signal_", [aString]);
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
    smalltalk.send(self, "_error_", ["This method is a responsibility of a subclass"]);
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
    smalltalk.send(self, "_error_", [smalltalk.send("This method should not be implemented in ", "__comma", [smalltalk.send(smalltalk.send(self, "_class", []), "_name", [])])]);
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
    try {
        aBlock();
    } catch (e) {
        anotherBlock(e);
    }
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
    return smalltalk.send("a ", "__comma", [smalltalk.send(smalltalk.send(self, "_class", []), "_name", [])]);
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
    console.log(self);
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
    return smalltalk.send(smalltalk.send(self, "_isMemberOf_", [aClass]), "_ifTrue_ifFalse_", [function () {return true;}, function () {return smalltalk.send(smalltalk.send(self, "_class", []), "_inheritsFrom_", [aClass]);}]);
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
    return smalltalk.send(smalltalk.send(self, "_class", []), "__eq", [aClass]);
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
    return smalltalk.send(anotherBlock, "_value", []);
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
    return smalltalk.send(aBlock, "_value", []);
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
    return smalltalk.send(aBlock, "_value", []);
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
    return smalltalk.send(smalltalk.send(self, "_isNil", []), "_not", []);
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
category: 'message handling',
fn: function (aSymbol) {
    var self = this;
    return smalltalk.send(self, "_basicPerform_withArguments_", [aSymbol, []]);
    return self;
},
source: unescape('basicPerform%3A%20aSymbol%20%0A%20%20%20%20%5Eself%20basicPerform%3A%20aSymbol%20withArguments%3A%20%23%28%29%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_basicPerform_withArguments_',
smalltalk.method({
selector: 'basicPerform:withArguments:',
category: 'message handling',
fn: function (aSymbol, aCollection) {
    var self = this;
    return self[aSymbol].apply(self, aCollection);
    return self;
},
source: unescape('basicPerform%3A%20aSymbol%20withArguments%3A%20aCollection%0A%09%7B%27return%20self%5BaSymbol%5D.apply%28self%2C%20aCollection%29%3B%27%7D%0A')}),
smalltalk.Object);

smalltalk.addMethod(
'_appendToBrush_',
smalltalk.method({
selector: 'appendToBrush:',
category: '*Canvas',
fn: function (aTagBrush) {
    var self = this;
    smalltalk.send(aTagBrush, "_append_", [smalltalk.send(self, "_asString", [])]);
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
    delete self[aString];
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
    (function ($rec) {smalltalk.send($rec, "_inspect_", [self]);return smalltalk.send($rec, "_open", []);}(smalltalk.send(smalltalk.Inspector, "_new", [])));
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
    variables = smalltalk.send(smalltalk.Dictionary, "_new", []);
    smalltalk.send(variables, "_at_put_", [unescape("%23self"), self]);
    smalltalk.send(smalltalk.send(smalltalk.send(self, "_class", []), "_instanceVariableNames", []), "_do_", [function (each) {return smalltalk.send(variables, "_at_put_", [each, smalltalk.send(self, "_instVarAt_", [each])]);}]);
    (function ($rec) {smalltalk.send($rec, "_setLabel_", [smalltalk.send(self, "_printString", [])]);return smalltalk.send($rec, "_setVariables_", [variables]);}(anInspector));
    return self;
},
source: unescape('inspectOn%3A%20anInspector%0A%09%7C%20variables%20%7C%0A%09variables%20%3A%3D%20Dictionary%20new.%0A%09variables%20at%3A%20%27%23self%27%20put%3A%20self.%0A%09self%20class%20instanceVariableNames%20do%3A%20%5B%3Aeach%20%7C%0A%09%09variables%20at%3A%20each%20put%3A%20%28self%20instVarAt%3A%20each%29%5D.%0A%09anInspector%20%0A%09%09setLabel%3A%20self%20printString%3B%0A%09%09setVariables%3A%20variables%0A%09%0A%09')}),
smalltalk.Object);

smalltalk.addMethod(
'_doesNotUnderstand_',
smalltalk.method({
selector: 'doesNotUnderstand:',
category: 'error handling',
fn: function (aMessage) {
    var self = this;
    (function ($rec) {smalltalk.send($rec, "_receiver_", [self]);smalltalk.send($rec, "_message_", [aMessage]);return smalltalk.send($rec, "_signal", []);}(smalltalk.send(smalltalk.MessageNotUnderstood, "_new", [])));
    return self;
},
source: unescape('doesNotUnderstand%3A%20aMessage%0A%09MessageNotUnderstood%20new%0A%09%09receiver%3A%20self%3B%0A%09%09message%3A%20aMessage%3B%0A%09%09signal')}),
smalltalk.Object);



smalltalk.addClass('Smalltalk', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'_classes',
smalltalk.method({
selector: 'classes',
category: 'accessing',
fn: function () {
    var self = this;
    return self.classes();
    return self;
},
source: unescape('classes%0A%09%7B%27return%20self.classes%28%29%27%7D')}),
smalltalk.Smalltalk);


smalltalk.Smalltalk.klass.iVarNames = ['current'];
smalltalk.addMethod(
'_current',
smalltalk.method({
selector: 'current',
category: 'accessing',
fn: function () {
    var self = this;
    return smalltalk;
    return self;
},
source: unescape('current%0A%09%7B%27return%20smalltalk%27%7D%0A')}),
smalltalk.Smalltalk.klass);


smalltalk.addClass('Behavior', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'_new',
smalltalk.method({
selector: 'new',
category: 'instance creation',
fn: function () {
    var self = this;
    return smalltalk.send(smalltalk.send(self, "_basicNew", []), "_initialize", []);
    return self;
},
source: unescape('new%0A%09%5Eself%20basicNew%20initialize')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_basicNew',
smalltalk.method({
selector: 'basicNew',
category: 'instance creation',
fn: function () {
    var self = this;
    return new self.fn;
    return self;
},
source: unescape('basicNew%0A%09%7B%27return%20new%20self.fn%28%29%27%7D%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_name',
smalltalk.method({
selector: 'name',
category: 'accessing',
fn: function () {
    var self = this;
    return self.className || nil;
    return self;
},
source: unescape('name%0A%09%7B%27return%20self.className%20%7C%7C%20nil%27%7D%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_superclass',
smalltalk.method({
selector: 'superclass',
category: 'accessing',
fn: function () {
    var self = this;
    return self.superclass || nil;
    return self;
},
source: unescape('superclass%0A%09%7B%27return%20self.superclass%20%7C%7C%20nil%27%7D%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_subclasses',
smalltalk.method({
selector: 'subclasses',
category: 'accessing',
fn: function () {
    var self = this;
    return smalltalk.subclasses(self);
    return self;
},
source: unescape('subclasses%0A%09%7B%27return%20smalltalk.subclasses%28self%29%27%7D%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_allSubclasses',
smalltalk.method({
selector: 'allSubclasses',
category: 'accessing',
fn: function () {
    var self = this;
    var result = nil;
    result = smalltalk.send(self, "_subclasses", []);
    smalltalk.send(smalltalk.send(self, "_subclasses", []), "_do_", [function (each) {return smalltalk.send(result, "_addAll_", [smalltalk.send(each, "_allSubclasses", [])]);}]);
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
    return function ($rec) {smalltalk.send($rec, "_addAll_", [smalltalk.send(self, "_allSubclasses", [])]);return smalltalk.send($rec, "_yourself", []);}(smalltalk.send(smalltalk.Array, "_with_", [self]));
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
    return self.fn.prototype;
    return self;
},
source: unescape('prototype%0A%09%7B%27return%20self.fn.prototype%27%7D%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_methodDictionary',
smalltalk.method({
selector: 'methodDictionary',
category: 'accessing',
fn: function () {
    var self = this;
    var dict = smalltalk.Dictionary._new();
    var methods = self.fn.prototype.methods;
    for (var i in methods) {
        if (methods[i].selector) {
            dict._at_put_(methods[i].selector, methods[i]);
        }
    }
    return dict;
    return self;
},
source: unescape('methodDictionary%0A%09%7B%27var%20dict%20%3D%20smalltalk.Dictionary._new%28%29%3B%0A%09var%20methods%20%3D%20self.fn.prototype.methods%3B%0A%09for%28var%20i%20in%20methods%29%20%7B%0A%09%09if%28methods%5Bi%5D.selector%29%20%7B%0A%09%09%09dict._at_put_%28methods%5Bi%5D.selector%2C%20methods%5Bi%5D%29%3B%0A%09%09%7D%0A%09%7D%3B%0A%09return%20dict%27%7D%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_methodsFor_',
smalltalk.method({
selector: 'methodsFor:',
category: 'accessing',
fn: function (aString) {
    var self = this;
    return function ($rec) {smalltalk.send($rec, "_class_category_", [self, aString]);return smalltalk.send($rec, "_yourself", []);}(smalltalk.send(smalltalk.ClassCategoryReader, "_new", []));
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
    self.fn.prototype[aMethod.selector._asSelector()] = aMethod.fn;
    self.fn.prototype.methods[aMethod.selector] = aMethod;
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
    return self.iVarNames;
    return self;
},
source: unescape('instanceVariableNames%0A%09%7B%27return%20self.iVarNames%27%7D%0A')}),
smalltalk.Behavior);

smalltalk.addMethod(
'_comment',
smalltalk.method({
selector: 'comment',
category: 'accessing',
fn: function () {
    var self = this;
    return smalltalk.send(smalltalk.send(self, "_basicAt_", ["comment"]), "_ifNil_", [function () {return "";}]);
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
    smalltalk.send(self, "_basicAt_put_", ["comment", aString]);
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
    return function ($rec) {smalltalk.send($rec, "_class_", [self]);return smalltalk.send($rec, "_yourself", []);}(smalltalk.send(smalltalk.ClassCommentReader, "_new", []));
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
    delete self.fn.prototype[aMethod.selector._asSelector()];
    delete self.fn.prototype.methods[aMethod.selector];
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
    return self.category;
    return self;
},
source: unescape('category%0A%09%7B%27return%20self.category%27%7D')}),
smalltalk.Class);

smalltalk.addMethod(
'_category_',
smalltalk.method({
selector: 'category:',
category: 'accessing',
fn: function (aString) {
    var self = this;
    self.category = aString;
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
    return smalltalk.send(self, "_subclass_instanceVariableNames_category_", [aString, anotherString, nil]);
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
    return smalltalk.send(smalltalk.send(smalltalk.ClassBuilder, "_new", []), "_superclass_subclass_instanceVariableNames_category_", [self, aString, aString2, aString3]);
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
    return smalltalk.send(self, "_name", []);
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
    smalltalk[aString] = self;
    delete smalltalk[self.className];
    self.className = aString;
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
    return self.instanceClass;
    return self;
},
source: unescape('instanceClass%0A%09%7B%27return%20self.instanceClass%27%7D')}),
smalltalk.Metaclass);

smalltalk.addMethod(
'_instanceVariableNames_',
smalltalk.method({
selector: 'instanceVariableNames:',
category: 'accessing',
fn: function (aCollection) {
    var self = this;
    smalltalk.send(smalltalk.send(smalltalk.ClassBuilder, "_new", []), "_class_instanceVariableNames_", [self, aCollection]);
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
    return smalltalk.send(smalltalk.send(smalltalk.send(self, "_instanceClass", []), "_name", []), "__comma", [" class"]);
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
    return smalltalk.send(smalltalk.send(self, "_basicAt_", ["source"]), "_ifNil_", [function () {return "";}]);
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
    smalltalk.send(self, "_basicAt_put_", ["source", aString]);
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
    return smalltalk.send(smalltalk.send(self, "_basicAt_", ["category"]), "_ifNil_", [function () {return "";}]);
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
    smalltalk.send(self, "_basicAt_put_", ["category", aString]);
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
    return smalltalk.send(self, "_basicAt_", ["selector"]);
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
    smalltalk.send(self, "_basicAt_put_", ["selector", aString]);
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
    return smalltalk.send(self, "_basicAt_", ["fn"]);
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
    smalltalk.send(self, "_basicAt_put_", ["fn", aBlock]);
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
    return Number(self) == aNumber;
    return self;
},
source: unescape('%3D%20aNumber%0A%09%7B%27return%20Number%28self%29%20%3D%3D%20aNumber%27%7D')}),
smalltalk.Number);

smalltalk.addMethod(
'__gt',
smalltalk.method({
selector: '>',
category: 'comparing',
fn: function (aNumber) {
    var self = this;
    return self > aNumber;
    return self;
},
source: unescape('%3E%20aNumber%0A%09%7B%27return%20self%20%3E%20aNumber%27%7D')}),
smalltalk.Number);

smalltalk.addMethod(
'__lt',
smalltalk.method({
selector: '<',
category: 'comparing',
fn: function (aNumber) {
    var self = this;
    return self < aNumber;
    return self;
},
source: unescape('%3C%20aNumber%0A%09%7B%27return%20self%20%3C%20aNumber%27%7D')}),
smalltalk.Number);

smalltalk.addMethod(
'__gt_eq',
smalltalk.method({
selector: '>=',
category: 'comparing',
fn: function (aNumber) {
    var self = this;
    return self >= aNumber;
    return self;
},
source: unescape('%3E%3D%20aNumber%0A%09%7B%27return%20self%20%3E%3D%20aNumber%27%7D')}),
smalltalk.Number);

smalltalk.addMethod(
'__lt_eq',
smalltalk.method({
selector: '<=',
category: 'comparing',
fn: function (aNumber) {
    var self = this;
    return self <= aNumber;
    return self;
},
source: unescape('%3C%3D%20aNumber%0A%09%7B%27return%20self%20%3C%3D%20aNumber%27%7D')}),
smalltalk.Number);

smalltalk.addMethod(
'__plus',
smalltalk.method({
selector: '+',
category: 'arithmetic',
fn: function (aNumber) {
    var self = this;
    return self + aNumber;
    return self;
},
source: unescape('+%20aNumber%0A%09%7B%27return%20self%20+%20aNumber%27%7D')}),
smalltalk.Number);

smalltalk.addMethod(
'__minus',
smalltalk.method({
selector: '-',
category: 'arithmetic',
fn: function (aNumber) {
    var self = this;
    return self - aNumber;
    return self;
},
source: unescape('-%20aNumber%0A%09%7B%27return%20self%20-%20aNumber%27%7D')}),
smalltalk.Number);

smalltalk.addMethod(
'__star',
smalltalk.method({
selector: '*',
category: 'arithmetic',
fn: function (aNumber) {
    var self = this;
    return self * aNumber;
    return self;
},
source: unescape('*%20aNumber%0A%09%7B%27return%20self%20*%20aNumber%27%7D')}),
smalltalk.Number);

smalltalk.addMethod(
'__slash',
smalltalk.method({
selector: '/',
category: 'arithmetic',
fn: function (aNumber) {
    var self = this;
    return self / aNumber;
    return self;
},
source: unescape('/%20aNumber%0A%09%7B%27return%20self%20/%20aNumber%27%7D')}),
smalltalk.Number);

smalltalk.addMethod(
'_max_',
smalltalk.method({
selector: 'max:',
category: 'arithmetic',
fn: function (aNumber) {
    var self = this;
    return Math.max(self, aNumber);
    return self;
},
source: unescape('max%3A%20aNumber%0A%09%7B%27return%20Math.max%28self%2C%20aNumber%29%3B%27%7D')}),
smalltalk.Number);

smalltalk.addMethod(
'_min_',
smalltalk.method({
selector: 'min:',
category: 'arithmetic',
fn: function (aNumber) {
    var self = this;
    return Math.min(self, aNumber);
    return self;
},
source: unescape('min%3A%20aNumber%0A%09%7B%27return%20Math.min%28self%2C%20aNumber%29%3B%27%7D')}),
smalltalk.Number);

smalltalk.addMethod(
'_rounded',
smalltalk.method({
selector: 'rounded',
category: 'converting',
fn: function () {
    var self = this;
    return Math.round(self);
    return self;
},
source: unescape('rounded%0A%09%7B%27return%20Math.round%28self%29%3B%27%7D')}),
smalltalk.Number);

smalltalk.addMethod(
'_truncated',
smalltalk.method({
selector: 'truncated',
category: 'converting',
fn: function () {
    var self = this;
    return Math.floor(self);
    return self;
},
source: unescape('truncated%0A%09%7B%27return%20Math.floor%28self%29%3B%27%7D')}),
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
    first = smalltalk.send(self, "_truncated", []);
    last = smalltalk.send(smalltalk.send(aNumber, "_truncated", []), "__plus", [1]);
    count = 1;
    smalltalk.send(smalltalk.send(first, "__lt_eq", [last]), "_ifFalse_", [function () {return smalltalk.send(self, "_error_", ["Wrong interval"]);}]);
    array = smalltalk.send(smalltalk.Array, "_new", []);
    smalltalk.send(smalltalk.send(last, "__minus", [first]), "_timesRepeat_", [function () {smalltalk.send(array, "_at_put_", [count, first]);count = smalltalk.send(count, "__plus", [1]);return first = smalltalk.send(first, "__plus", [1]);}]);
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
    integer = smalltalk.send(self, "_truncated", []);
    count = 1;
    smalltalk.send(function () {return smalltalk.send(count, "__gt", [self]);}, "_whileFalse_", [function () {smalltalk.send(aBlock, "_value", []);return count = smalltalk.send(count, "__plus", [1]);}]);
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
    return smalltalk.send(smalltalk.send(self, "_to_", [aNumber]), "_do_", [aBlock]);
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
    return smalltalk.send(self, "_printString", []);
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
    return smalltalk.send(smalltalk.send(unescape("%28"), "__comma", [smalltalk.send(self, "_printString", [])]), "__comma", [unescape("%29")]);
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
    return String(self);
    return self;
},
source: unescape('printString%0A%09%7B%27return%20String%28self%29%27%7D')}),
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
    return smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.Random, "_new", []), "_next", []), "__star", [self]), "_truncated", []), "__plus", [1]);
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
    return smalltalk.send(smalltalk.Point, "_x_y_", [self, aNumber]);
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
    return smalltalk.send(smalltalk.Point, "_x_y_", [self, self]);
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
    clearInterval(Number(self));
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
    return Math.PI;
    return self;
},
source: unescape('pi%0A%09%7B%27return%20Math.PI%27%7D')}),
smalltalk.Number.klass);


smalltalk.addClass('BlockClosure', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'_compiledSource',
smalltalk.method({
selector: 'compiledSource',
category: 'accessing',
fn: function () {
    var self = this;
    return self.toString();
    return self;
},
source: unescape('compiledSource%0A%09%7B%27return%20self.toString%28%29%27%7D%0A')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_whileTrue_',
smalltalk.method({
selector: 'whileTrue:',
category: 'controlling',
fn: function (aBlock) {
    var self = this;
    while (self()) {
        aBlock();
    }
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
    while (!self()) {
        aBlock();
    }
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
    return self();
    return self;
},
source: unescape('value%0A%09%7B%27return%20self%28%29%3B%27%7D%0A')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_value_',
smalltalk.method({
selector: 'value:',
category: 'evaluating',
fn: function (anArg) {
    var self = this;
    return self(anArg);
    return self;
},
source: unescape('value%3A%20anArg%0A%09%7B%27return%20self%28anArg%29%3B%27%7D%0A')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_value_value_',
smalltalk.method({
selector: 'value:value:',
category: 'evaluating',
fn: function (firstArg, secondArg) {
    var self = this;
    return self(firstArg, secondArg);
    return self;
},
source: unescape('value%3A%20firstArg%20value%3A%20secondArg%0A%09%7B%27return%20self%28firstArg%2C%20secondArg%29%3B%27%7D%0A')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_value_value_value_',
smalltalk.method({
selector: 'value:value:value:',
category: 'evaluating',
fn: function (firstArg, secondArg, thirdArg) {
    var self = this;
    return self(firstArg, secondArg, thirdArg);
    return self;
},
source: unescape('value%3A%20firstArg%20value%3A%20secondArg%20value%3A%20thirdArg%0A%09%7B%27return%20self%28firstArg%2C%20secondArg%2C%20thirdArg%29%3B%27%7D%0A')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_valueWithPossibleArguments_',
smalltalk.method({
selector: 'valueWithPossibleArguments:',
category: 'evaluating',
fn: function (aCollection) {
    var self = this;
    return self.apply(null, aCollection);
    return self;
},
source: unescape('valueWithPossibleArguments%3A%20aCollection%0A%09%7B%27return%20self.apply%28null%2C%20aCollection%29%3B%27%7D%0A')}),
smalltalk.BlockClosure);

smalltalk.addMethod(
'_on_do_',
smalltalk.method({
selector: 'on:do:',
category: 'error handling',
fn: function (anErrorClass, aBlock) {
    var self = this;
    smalltalk.send(self, "_try_catch_", [self, function (error) {return smalltalk.send(smalltalk.send(error, "_isKindOf_", [anErrorClass]), "_ifTrue_ifFalse_", [function () {return smalltalk.send(aBlock, "_value", []);}, function () {return smalltalk.send(error, "_signal", []);}]);}]);
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
    canvas = smalltalk.send(smalltalk.HTMLCanvas, "_new", []);
    smalltalk.send(self, "_value_", [canvas]);
    smalltalk.send(aJQuery, "_append_", [canvas]);
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
    smalltalk.send(aTagBrush, "_appendBlock_", [self]);
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
    setTimeout(self, aNumber);
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
    return setInterval(self, aNumber);
    return self;
},
source: unescape('valueWithInterval%3A%20aNumber%0A%09%7B%27return%20setInterval%28self%2C%20aNumber%29%27%7D')}),
smalltalk.BlockClosure);



smalltalk.addClass('Boolean', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'__eq',
smalltalk.method({
selector: '=',
category: 'comparing',
fn: function (aBoolean) {
    var self = this;
    return Boolean(self == true) == aBoolean;
    return self;
},
source: unescape('%3D%20aBoolean%0A%09%7B%27return%20Boolean%28self%20%3D%3D%20true%29%20%3D%3D%20aBoolean%27%7D')}),
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
    return smalltalk.send(self, "_ifTrue_ifFalse_", [aBlock, function () {return nil;}]);
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
    return smalltalk.send(self, "_ifTrue_ifFalse_", [function () {return nil;}, aBlock]);
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
    return smalltalk.send(self, "_ifTrue_ifFalse_", [anotherBlock, aBlock]);
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
    if (self == true) {
        return aBlock();
    } else {
        return anotherBlock();
    }
    return self;
},
source: unescape('ifTrue%3A%20aBlock%20ifFalse%3A%20anotherBlock%0A%09%7B%27%0A%09%20%20%20%20if%28self%20%3D%3D%20true%29%20%7B%0A%09%09return%20aBlock%28%29%3B%0A%09%20%20%20%20%7D%20else%20%7B%0A%09%09return%20anotherBlock%28%29%3B%0A%09%20%20%20%20%7D%0A%09%27%7D')}),
smalltalk.Boolean);

smalltalk.addMethod(
'_and_',
smalltalk.method({
selector: 'and:',
category: 'controlling',
fn: function (aBlock) {
    var self = this;
    return smalltalk.send(smalltalk.send(self, "__eq", [true]), "_ifTrue_ifFalse_", [aBlock, function () {return false;}]);
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
    return smalltalk.send(smalltalk.send(self, "__eq", [true]), "_ifTrue_ifFalse_", [function () {return true;}, aBlock]);
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
    return smalltalk.send(self, "__eq", [false]);
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
    return self.toString();
    return self;
},
source: unescape('printString%0A%09%7B%27return%20self.toString%28%29%27%7D')}),
smalltalk.Boolean);



smalltalk.addClass('Date', smalltalk.Object, [], 'Kernel');
smalltalk.Date.comment=unescape('The%20Date%20class%20is%20used%20to%20work%20with%20dates%20and%20times.')
smalltalk.addMethod(
'_year',
smalltalk.method({
selector: 'year',
category: 'accessing',
fn: function () {
    var self = this;
    return self.getFullYear();
    return self;
},
source: unescape('year%0A%09%7B%27return%20self.getFullYear%28%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_month',
smalltalk.method({
selector: 'month',
category: 'accessing',
fn: function () {
    var self = this;
    return self.getMonth() + 1;
    return self;
},
source: unescape('month%0A%09%7B%27return%20self.getMonth%28%29%20+%201%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_month_',
smalltalk.method({
selector: 'month:',
category: 'accessing',
fn: function (aNumber) {
    var self = this;
    self.setMonth(aNumber - 1);
    return self;
},
source: unescape('month%3A%20aNumber%0A%09%7B%27self.setMonth%28aNumber%20-%201%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_day',
smalltalk.method({
selector: 'day',
category: 'accessing',
fn: function () {
    var self = this;
    return smalltalk.send(self, "_dayOfWeek", []);
    return self;
},
source: unescape('day%0A%09%5Eself%20dayOfWeek')}),
smalltalk.Date);

smalltalk.addMethod(
'_dayOfWeek',
smalltalk.method({
selector: 'dayOfWeek',
category: 'accessing',
fn: function () {
    var self = this;
    return self.getDay() + 1;
    return self;
},
source: unescape('dayOfWeek%0A%09%7B%27return%20self.getDay%28%29%20+%201%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_dayOfWeek_',
smalltalk.method({
selector: 'dayOfWeek:',
category: 'accessing',
fn: function (aNumber) {
    var self = this;
    return self.setDay(aNumber - 1);
    return self;
},
source: unescape('dayOfWeek%3A%20aNumber%0A%09%7B%27return%20self.setDay%28aNumber%20-%201%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_day_',
smalltalk.method({
selector: 'day:',
category: 'accessing',
fn: function (aNumber) {
    var self = this;
    smalltalk.send(self, "_day_", [aNumber]);
    return self;
},
source: unescape('day%3A%20aNumber%0A%09self%20day%3A%20aNumber')}),
smalltalk.Date);

smalltalk.addMethod(
'_year_',
smalltalk.method({
selector: 'year:',
category: 'accessing',
fn: function (aNumber) {
    var self = this;
    self.setFullYear(aNumber);
    return self;
},
source: unescape('year%3A%20aNumber%0A%09%7B%27self.setFullYear%28aNumber%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_dayOfMonth',
smalltalk.method({
selector: 'dayOfMonth',
category: 'accessing',
fn: function () {
    var self = this;
    return self.getDate();
    return self;
},
source: unescape('dayOfMonth%0A%09%7B%27return%20self.getDate%28%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_dayOfMonth_',
smalltalk.method({
selector: 'dayOfMonth:',
category: 'accessing',
fn: function (aNumber) {
    var self = this;
    self.setDate(aNumber);
    return self;
},
source: unescape('dayOfMonth%3A%20aNumber%0A%09%7B%27self.setDate%28aNumber%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_asString',
smalltalk.method({
selector: 'asString',
category: 'converting',
fn: function () {
    var self = this;
    return self.toString();
    return self;
},
source: unescape('asString%0A%09%7B%27return%20self.toString%28%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_printString',
smalltalk.method({
selector: 'printString',
category: 'printing',
fn: function () {
    var self = this;
    return smalltalk.send(self, "_asString", []);
    return self;
},
source: unescape('printString%0A%09%5Eself%20asString')}),
smalltalk.Date);

smalltalk.addMethod(
'_asMilliseconds',
smalltalk.method({
selector: 'asMilliseconds',
category: 'converting',
fn: function () {
    var self = this;
    return smalltalk.send(self, "_time", []);
    return self;
},
source: unescape('asMilliseconds%0A%09%5Eself%20time')}),
smalltalk.Date);

smalltalk.addMethod(
'_time',
smalltalk.method({
selector: 'time',
category: 'accessing',
fn: function () {
    var self = this;
    return self.getTime();
    return self;
},
source: unescape('time%0A%09%7B%27return%20self.getTime%28%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_time_',
smalltalk.method({
selector: 'time:',
category: 'accessing',
fn: function (aNumber) {
    var self = this;
    self.setTime(aNumber);
    return self;
},
source: unescape('time%3A%20aNumber%0A%09%7B%27self.setTime%28aNumber%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_asDateString',
smalltalk.method({
selector: 'asDateString',
category: 'converting',
fn: function () {
    var self = this;
    return self.toDateString();
    return self;
},
source: unescape('asDateString%0A%09%7B%27return%20self.toDateString%28%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_asTimeString',
smalltalk.method({
selector: 'asTimeString',
category: 'converting',
fn: function () {
    var self = this;
    return self.toTimeString();
    return self;
},
source: unescape('asTimeString%0A%09%7B%27return%20self.toTimeString%28%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_asLocaleString',
smalltalk.method({
selector: 'asLocaleString',
category: 'converting',
fn: function () {
    var self = this;
    return self.toLocaleString();
    return self;
},
source: unescape('asLocaleString%0A%09%7B%27return%20self.toLocaleString%28%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_asNumber',
smalltalk.method({
selector: 'asNumber',
category: 'converting',
fn: function () {
    var self = this;
    return smalltalk.send(self, "_asMilliseconds", []);
    return self;
},
source: unescape('asNumber%0A%09%5Eself%20asMilliseconds')}),
smalltalk.Date);

smalltalk.addMethod(
'_hours_',
smalltalk.method({
selector: 'hours:',
category: 'accessing',
fn: function (aNumber) {
    var self = this;
    self.setHours(aNumber);
    return self;
},
source: unescape('hours%3A%20aNumber%0A%09%7B%27self.setHours%28aNumber%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_minutes_',
smalltalk.method({
selector: 'minutes:',
category: 'accessing',
fn: function (aNumber) {
    var self = this;
    self.setMinutes(aNumber);
    return self;
},
source: unescape('minutes%3A%20aNumber%0A%09%7B%27self.setMinutes%28aNumber%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_seconds_',
smalltalk.method({
selector: 'seconds:',
category: 'accessing',
fn: function (aNumber) {
    var self = this;
    self.setSeconds(aNumber);
    return self;
},
source: unescape('seconds%3A%20aNumber%0A%09%7B%27self.setSeconds%28aNumber%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_milliseconds_',
smalltalk.method({
selector: 'milliseconds:',
category: 'accessing',
fn: function (aNumber) {
    var self = this;
    self.setMilliseconds(aNumber);
    return self;
},
source: unescape('milliseconds%3A%20aNumber%0A%09%7B%27self.setMilliseconds%28aNumber%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_hours',
smalltalk.method({
selector: 'hours',
category: 'accessing',
fn: function () {
    var self = this;
    return self.getHours();
    return self;
},
source: unescape('hours%0A%09%7B%27return%20self.getHours%28%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_minutes',
smalltalk.method({
selector: 'minutes',
category: 'accessing',
fn: function () {
    var self = this;
    return self.getMinutes();
    return self;
},
source: unescape('minutes%0A%09%7B%27return%20self.getMinutes%28%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_seconds',
smalltalk.method({
selector: 'seconds',
category: 'accessing',
fn: function () {
    var self = this;
    return self.getSeconds();
    return self;
},
source: unescape('seconds%0A%09%7B%27return%20self.getSeconds%28%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_milliseconds',
smalltalk.method({
selector: 'milliseconds',
category: 'accessing',
fn: function () {
    var self = this;
    return self.getMilliseconds();
    return self;
},
source: unescape('milliseconds%0A%09%7B%27return%20self.getMilliseconds%28%29%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'_inspectOn_',
smalltalk.method({
selector: 'inspectOn:',
category: '*IDE',
fn: function (anInspector) {
    var self = this;
    var variables = nil;
    variables = smalltalk.send(smalltalk.Dictionary, "_new", []);
    smalltalk.send(variables, "_at_put_", [unescape("%23self"), self]);
    smalltalk.send(variables, "_at_put_", [unescape("%23year"), smalltalk.send(self, "_year", [])]);
    smalltalk.send(variables, "_at_put_", [unescape("%23month"), smalltalk.send(self, "_month", [])]);
    smalltalk.send(variables, "_at_put_", [unescape("%23day"), smalltalk.send(self, "_day", [])]);
    smalltalk.send(variables, "_at_put_", [unescape("%23hours"), smalltalk.send(self, "_hours", [])]);
    smalltalk.send(variables, "_at_put_", [unescape("%23minutes"), smalltalk.send(self, "_minutes", [])]);
    smalltalk.send(variables, "_at_put_", [unescape("%23seconds"), smalltalk.send(self, "_seconds", [])]);
    smalltalk.send(variables, "_at_put_", [unescape("%23milliseconds"), smalltalk.send(self, "_milliseconds", [])]);
    (function ($rec) {smalltalk.send($rec, "_setLabel_", [smalltalk.send(self, "_printString", [])]);return smalltalk.send($rec, "_setVariables_", [variables]);}(anInspector));
    return self;
},
source: unescape('inspectOn%3A%20anInspector%0A%09%7C%20variables%20%7C%0A%09variables%20%3A%3D%20Dictionary%20new.%0A%09variables%20at%3A%20%27%23self%27%20put%3A%20self.%0A%09variables%20at%3A%20%27%23year%27%20put%3A%20self%20year.%0A%09variables%20at%3A%20%27%23month%27%20put%3A%20self%20month.%0A%09variables%20at%3A%20%27%23day%27%20put%3A%20self%20day.%0A%09variables%20at%3A%20%27%23hours%27%20put%3A%20self%20hours.%0A%09variables%20at%3A%20%27%23minutes%27%20put%3A%20self%20minutes.%0A%09variables%20at%3A%20%27%23seconds%27%20put%3A%20self%20seconds.%0A%09variables%20at%3A%20%27%23milliseconds%27%20put%3A%20self%20milliseconds.%0A%09anInspector%20%0A%09%09setLabel%3A%20self%20printString%3B%0A%09%09setVariables%3A%20variables%0A%09%0A%09')}),
smalltalk.Date);

smalltalk.addMethod(
'__lt',
smalltalk.method({
selector: '<',
category: 'comparing',
fn: function (aDate) {
    var self = this;
    return self < aDate;
    return self;
},
source: unescape('%3C%20aDate%0A%09%7B%27return%20self%20%3C%20aDate%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'__gt',
smalltalk.method({
selector: '>',
category: 'comparing',
fn: function (aDate) {
    var self = this;
    return self > aDate;
    return self;
},
source: unescape('%3E%20aDate%0A%09%7B%27return%20self%20%3E%20aDate%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'__lt_eq',
smalltalk.method({
selector: '<=',
category: 'comparing',
fn: function (aDate) {
    var self = this;
    self <= aDate;
    return self;
},
source: unescape('%3C%3D%20aDate%0A%09%7B%27self%20%3C%3D%20aDate%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'__gt_eq',
smalltalk.method({
selector: '>=',
category: 'comparing',
fn: function (aDate) {
    var self = this;
    self >= aDate;
    return self;
},
source: unescape('%3E%3D%20aDate%0A%09%7B%27self%20%3E%3D%20aDate%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'__minus',
smalltalk.method({
selector: '-',
category: 'arithmetic',
fn: function (aDate) {
    var self = this;
    return self - aDate;
    return self;
},
source: unescape('-%20aDate%0A%09%7B%27return%20self%20-%20aDate%27%7D')}),
smalltalk.Date);

smalltalk.addMethod(
'__plus',
smalltalk.method({
selector: '+',
category: 'arithmetic',
fn: function (aDate) {
    var self = this;
    return self + aDate;
    return self;
},
source: unescape('+%20aDate%0A%09%7B%27return%20self%20+%20aDate%27%7D')}),
smalltalk.Date);


smalltalk.addMethod(
'_new_',
smalltalk.method({
selector: 'new:',
category: 'instance creation',
fn: function (anObject) {
    var self = this;
    return new Date(anObject);
    return self;
},
source: unescape('new%3A%20anObject%0A%09%7B%27return%20new%20Date%28anObject%29%27%7D')}),
smalltalk.Date.klass);

smalltalk.addMethod(
'_fromString_',
smalltalk.method({
selector: 'fromString:',
category: 'instance creation',
fn: function (aString) {
    var self = this;
    return smalltalk.send(self, "_new_", [aString]);
    return self;
},
source: unescape('fromString%3A%20aString%0A%09%22Example%3A%20Date%20fromString%28%272011/04/15%2000%3A00%3A00%27%29%22%0A%09%5Eself%20new%3A%20aString')}),
smalltalk.Date.klass);

smalltalk.addMethod(
'_fromSeconds_',
smalltalk.method({
selector: 'fromSeconds:',
category: 'instance creation',
fn: function (aNumber) {
    var self = this;
    return smalltalk.send(self, "_fromMilliseconds_", [smalltalk.send(aNumber, "__star", [1000])]);
    return self;
},
source: unescape('fromSeconds%3A%20aNumber%0A%09%5Eself%20fromMilliseconds%3A%20aNumber%20*%201000')}),
smalltalk.Date.klass);

smalltalk.addMethod(
'_fromMilliseconds_',
smalltalk.method({
selector: 'fromMilliseconds:',
category: 'instance creation',
fn: function (aNumber) {
    var self = this;
    return smalltalk.send(self, "_new_", [aNumber]);
    return self;
},
source: unescape('fromMilliseconds%3A%20aNumber%0A%09%5Eself%20new%3A%20aNumber')}),
smalltalk.Date.klass);

smalltalk.addMethod(
'_today',
smalltalk.method({
selector: 'today',
category: 'instance creation',
fn: function () {
    var self = this;
    return smalltalk.send(self, "_new", []);
    return self;
},
source: unescape('today%0A%09%5Eself%20new')}),
smalltalk.Date.klass);

smalltalk.addMethod(
'_now',
smalltalk.method({
selector: 'now',
category: 'instance creation',
fn: function () {
    var self = this;
    return smalltalk.send(self, "_today", []);
    return self;
},
source: unescape('now%0A%09%5Eself%20today')}),
smalltalk.Date.klass);

smalltalk.addMethod(
'_millisecondsToRun_',
smalltalk.method({
selector: 'millisecondsToRun:',
category: 'instance creation',
fn: function (aBlock) {
    var self = this;
    var t = nil;
    t = smalltalk.send(smalltalk.Date, "_now", []);
    smalltalk.send(aBlock, "_value", []);
    return smalltalk.send(smalltalk.send(smalltalk.Date, "_now", []), "__minus", [t]);
    return self;
},
source: unescape('millisecondsToRun%3A%20aBlock%0A%09%7C%20t%20%7C%0A%09t%20%3A%3D%20Date%20now.%0A%09aBlock%20value.%0A%09%5EDate%20now%20-%20t')}),
smalltalk.Date.klass);


smalltalk.addClass('UndefinedObject', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'_subclass_instanceVariableNames_',
smalltalk.method({
selector: 'subclass:instanceVariableNames:',
category: 'class creation',
fn: function (aString, anotherString) {
    var self = this;
    return smalltalk.send(self, "_subclass_instanceVariableNames_category_", [aString, anotherString, nil]);
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
    return smalltalk.send(smalltalk.send(smalltalk.ClassBuilder, "_new", []), "_superclass_subclass_instanceVariableNames_category_", [self, aString, aString2, aString3]);
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
    return smalltalk.send(self, "_ifNil_ifNotNil_", [aBlock, function () {return nil;}]);
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
    return smalltalk.send(aBlock, "_value", []);
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
    return smalltalk.send(anotherBlock, "_value", []);
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
    smalltalk.send(self, "_error_", ["You cannot create new instances of UndefinedObject. Use nil"]);
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
    smalltalk.send(self, "_subclassResponsibility", []);
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
    return smalltalk.send(self, "_at_ifAbsent_", [anIndex, function () {return smalltalk.send(self, "_errorNotFound", []);}]);
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
    smalltalk.send(self, "_subclassResponsibility", []);
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
    smalltalk.send(self, "_subclassResponsibility", []);
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
    return smalltalk.send(self, "_at_", [1]);
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
    return smalltalk.send(self, "_at_", [2]);
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
    return smalltalk.send(self, "_at_", [3]);
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
    return smalltalk.send(self, "_at_", [4]);
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
    return smalltalk.send(self, "_at_", [smalltalk.send(self, "_size", [])]);
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
    return smalltalk.send(self, "_stream", []);
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
    return smalltalk.send(self, "_stream", []);
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
    return smalltalk.send(smalltalk.send(self, "_streamClass", []), "_on_", [self]);
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
    return smalltalk.send(smalltalk.send(self, "_class", []), "_streamClass", []);
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
    smalltalk.send(self, "_subclassResponsibility", []);
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
    smalltalk.send(aCollection, "_do_", [function (each) {return smalltalk.send(self, "_add_", [each]);}]);
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
    return function ($rec) {smalltalk.send($rec, "_addAll_", [aCollection]);return smalltalk.send($rec, "_yourself", []);}(smalltalk.send(self, "_copy", []));
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
    smalltalk.send(self, "_subclassResponsibility", []);
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
    return function ($rec) {smalltalk.send($rec, "_add_", [anObject]);return smalltalk.send($rec, "_yourself", []);}(smalltalk.send(self, "_copy", []));
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
    return function ($rec) {smalltalk.send($rec, "_addAll_", [aCollection]);return smalltalk.send($rec, "_yourself", []);}(smalltalk.send(self, "_copy", []));
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
    array = smalltalk.send(smalltalk.Array, "_new", []);
    index = 0;
    smalltalk.send(self, "_do_", [function (each) {index = smalltalk.send(index, "__plus", [1]);return smalltalk.send(array, "_at_put_", [index, each]);}]);
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
    for (var i = 0; i < self.length; i++) {
        aBlock(self[i]);
    }
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
    stream = smalltalk.send(smalltalk.send(smalltalk.send(self, "_class", []), "_new", []), "_writeStream", []);
    smalltalk.send(self, "_do_", [function (each) {return smalltalk.send(stream, "_nextPut_", [smalltalk.send(aBlock, "_value_", [each])]);}]);
    return smalltalk.send(stream, "_contents", []);
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
    return smalltalk.send(self, "_detect_ifNone_", [aBlock, function () {return smalltalk.send(self, "_errorNotFound", []);}]);
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
    for (var i = 0; i < self.length; i++) {
        if (aBlock(self[i])) {
            return self[i];
        }
    }
    return anotherBlock();
    return self;
},
source: unescape('detect%3A%20aBlock%20ifNone%3A%20anotherBlock%0A%09%7B%27%0A%09%09for%28var%20i%20%3D%200%3B%20i%20%3C%20self.length%3B%20i++%29%0A%09%09%09if%28aBlock%28self%5Bi%5D%29%29%0A%09%09%09%09return%20self%5Bi%5D%3B%0A%09%09return%20anotherBlock%28%29%3B%0A%09%27%7D')}),
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
    smalltalk.send(self, "_do_", [function (each) {smalltalk.send(first, "_ifTrue_ifFalse_", [function () {return first = false;}, function () {return smalltalk.send(anotherBlock, "_value", []);}]);return smalltalk.send(aBlock, "_value_", [each]);}]);
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
    smalltalk.send(self, "_do_", [function (each) {return result = smalltalk.send(aBlock, "_value_value_", [result, each]);}]);
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
    return smalltalk.send(self, "_select_", [function (each) {return smalltalk.send(smalltalk.send(aBlock, "_value_", [each]), "__eq", [false]);}]);
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
    stream = smalltalk.send(smalltalk.send(smalltalk.send(self, "_class", []), "_new", []), "_writeStream", []);
    smalltalk.send(self, "_do_", [function (each) {return smalltalk.send(smalltalk.send(aBlock, "_value_", [each]), "_ifTrue_", [function () {return smalltalk.send(stream, "_nextPut_", [each]);}]);}]);
    return smalltalk.send(stream, "_contents", []);
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
    smalltalk.send(self, "_error_", ["Object is not in the collection"]);
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
    var i = self.length;
    while (i--) {
        if (self[i].__eq(anObject)) {
            return true;
        }
    }
    return false;
    return self;
},
source: unescape('includes%3A%20anObject%0A%09%7B%27%0A%09%09var%20i%20%3D%20self.length%3B%0A%09%09while%20%28i--%29%20%7B%0A%09%09%09if%20%28self%5Bi%5D.__eq%28anObject%29%29%20%7Breturn%20true%3B%7D%09%0A%09%09%7D%0A%09%09return%20false%0A%09%27%7D%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_notEmpty',
smalltalk.method({
selector: 'notEmpty',
category: 'testing',
fn: function () {
    var self = this;
    return smalltalk.send(smalltalk.send(self, "_isEmpty", []), "_not", []);
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
    return smalltalk.send(smalltalk.send(self, "_size", []), "__eq", [0]);
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
    smalltalk.send(self, "_subclassResponsibility", []);
    return self;
},
source: unescape('remove%3A%20anObject%0A%20%20%20%20self%20subclassResponsibility%0A')}),
smalltalk.Collection);

smalltalk.addMethod(
'_removeLast',
smalltalk.method({
selector: 'removeLast',
category: 'adding/removing',
fn: function () {
    var self = this;
    smalltalk.send(self, "_remove_", [smalltalk.send(self, "_last", [])]);
    return self;
},
source: unescape('removeLast%0A%09self%20remove%3A%20self%20last')}),
smalltalk.Collection);

smalltalk.addMethod(
'_inspectOn_',
smalltalk.method({
selector: 'inspectOn:',
category: '*IDE',
fn: function (anInspector) {
    var self = this;
    var variables = nil;
    variables = smalltalk.send(smalltalk.Dictionary, "_new", []);
    smalltalk.send(variables, "_at_put_", [unescape("%23self"), self]);
    smalltalk.send(self, "_withIndexDo_", [function (each, i) {return smalltalk.send(variables, "_at_put_", [i, each]);}]);
    (function ($rec) {smalltalk.send($rec, "_setLabel_", [smalltalk.send(self, "_printString", [])]);return smalltalk.send($rec, "_setVariables_", [variables]);}(anInspector));
    return self;
},
source: unescape('inspectOn%3A%20anInspector%0A%09%7C%20variables%20%7C%0A%09variables%20%3A%3D%20Dictionary%20new.%0A%09variables%20at%3A%20%27%23self%27%20put%3A%20self.%0A%09self%20withIndexDo%3A%20%5B%3Aeach%20%3Ai%20%7C%0A%09%09variables%20at%3A%20i%20put%3A%20each%5D.%0A%09anInspector%20%0A%09%09setLabel%3A%20self%20printString%3B%0A%09%09setVariables%3A%20variables')}),
smalltalk.Collection);

smalltalk.addMethod(
'_withIndexDo_',
smalltalk.method({
selector: 'withIndexDo:',
category: 'enumerating',
fn: function (aBlock) {
    var self = this;
    for (var i = 0; i < self.length; i++) {
        aBlock(self[i], i + 1);
    }
    return self;
},
source: unescape('withIndexDo%3A%20aBlock%0A%09%7B%27for%28var%20i%3D0%3Bi%3Cself.length%3Bi++%29%7BaBlock%28self%5Bi%5D%2C%20i+1%29%3B%7D%27%7D%0A')}),
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
    return function ($rec) {smalltalk.send($rec, "_add_", [anObject]);return smalltalk.send($rec, "_yourself", []);}(smalltalk.send(self, "_new", []));
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
    return function ($rec) {smalltalk.send($rec, "_add_", [anObject]);smalltalk.send($rec, "_add_", [anotherObject]);return smalltalk.send($rec, "_yourself", []);}(smalltalk.send(self, "_new", []));
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
    return function ($rec) {smalltalk.send($rec, "_add_", [firstObject]);smalltalk.send($rec, "_add_", [secondObject]);smalltalk.send($rec, "_add_", [thirdObject]);return smalltalk.send($rec, "_yourself", []);}(smalltalk.send(self, "_new", []));
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
    return function ($rec) {smalltalk.send($rec, "_addAll_", [aCollection]);return smalltalk.send($rec, "_yourself", []);}(smalltalk.send(self, "_new", []));
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
    return String(self) == aString;
    return self;
},
source: unescape('%3D%20aString%0A%09%7B%27return%20String%28self%29%20%3D%3D%20aString%27%7D')}),
smalltalk.String);

smalltalk.addMethod(
'_size',
smalltalk.method({
selector: 'size',
category: 'accessing',
fn: function () {
    var self = this;
    return self.length;
    return self;
},
source: unescape('size%0A%09%7B%27return%20self.length%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_at_',
smalltalk.method({
selector: 'at:',
category: 'accessing',
fn: function (anIndex) {
    var self = this;
    return self[anIndex - 1] || nil;
    return self;
},
source: unescape('at%3A%20anIndex%0A%09%7B%27return%20self%5BanIndex%20-%201%5D%20%7C%7C%20nil%3B%27%7D')}),
smalltalk.String);

smalltalk.addMethod(
'_at_put_',
smalltalk.method({
selector: 'at:put:',
category: 'accessing',
fn: function (anIndex, anObject) {
    var self = this;
    smalltalk.send(self, "_errorReadOnly", []);
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
    smalltalk.send(smalltalk.send(self, "_at_", [anIndex]), "_ifNil_", [function () {return aBlock;}]);
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
    return escape(self);
    return self;
},
source: unescape('escaped%0A%09%7B%27return%20escape%28self%29%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_unescaped',
smalltalk.method({
selector: 'unescaped',
category: 'accessing',
fn: function () {
    var self = this;
    return unescape(self);
    return self;
},
source: unescape('unescaped%0A%09%7B%27return%20unescape%28self%29%27%7D')}),
smalltalk.String);

smalltalk.addMethod(
'_add_',
smalltalk.method({
selector: 'add:',
category: 'adding',
fn: function (anObject) {
    var self = this;
    smalltalk.send(self, "_errorReadOnly", []);
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
    return self + aString;
    return self;
},
source: unescape('%2C%20aString%0A%09%7B%27return%20self%20+%20aString%27%7D')}),
smalltalk.String);

smalltalk.addMethod(
'_copyFrom_to_',
smalltalk.method({
selector: 'copyFrom:to:',
category: 'copying',
fn: function (anIndex, anotherIndex) {
    var self = this;
    return self.substring(anIndex - 1, anotherIndex);
    return self;
},
source: unescape('copyFrom%3A%20anIndex%20to%3A%20anotherIndex%0A%09%7B%27return%20self.substring%28anIndex%20-%201%2C%20anotherIndex%29%3B%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_shallowCopy',
smalltalk.method({
selector: 'shallowCopy',
category: 'copying',
fn: function () {
    var self = this;
    return smalltalk.send(smalltalk.send(self, "_class", []), "_fromString_", [self]);
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
    return smalltalk.send(self, "_shallowCopy", []);
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
    selector = smalltalk.send("_", "__comma", [self]);
    selector = smalltalk.send(selector, "_replace_with_", [":", "_"]);
    selector = smalltalk.send(selector, "_replace_with_", [unescape("%5B+%5D"), "_plus"]);
    selector = smalltalk.send(selector, "_replace_with_", [unescape("-"), "_minus"]);
    selector = smalltalk.send(selector, "_replace_with_", [unescape("%5B*%5D"), "_star"]);
    selector = smalltalk.send(selector, "_replace_with_", [unescape("%5B/%5D"), "_slash"]);
    selector = smalltalk.send(selector, "_replace_with_", [unescape("%3E"), "_gt"]);
    selector = smalltalk.send(selector, "_replace_with_", [unescape("%3C"), "_lt"]);
    selector = smalltalk.send(selector, "_replace_with_", [unescape("%3D"), "_eq"]);
    selector = smalltalk.send(selector, "_replace_with_", [unescape("%2C"), "_comma"]);
    selector = smalltalk.send(selector, "_replace_with_", [unescape("%5B@%5D"), "_at"]);
    return selector;
    return self;
},
source: unescape('asSelector%0A%09%22If%20you%20change%20this%20method%2C%20change%20smalltalk.convertSelector%20too%20%28see%20js/boot.js%20file%29%22%0A%0A%09%7C%20selector%20%7C%0A%09selector%20%3A%3D%20%27_%27%2C%20self.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%3A%27%20with%3A%20%27_%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%5B+%5D%27%20with%3A%20%27_plus%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27-%27%20with%3A%20%27_minus%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%5B*%5D%27%20with%3A%20%27_star%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%5B/%5D%27%20with%3A%20%27_slash%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%3E%27%20with%3A%20%27_gt%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%3C%27%20with%3A%20%27_lt%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%3D%27%20with%3A%20%27_eq%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%2C%27%20with%3A%20%27_comma%27.%0A%20%20%20%20%09selector%20%3A%3D%20selector%20replace%3A%20%27%5B@%5D%27%20with%3A%20%27_at%27.%0A%09%5Eselector%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_asJavascript',
smalltalk.method({
selector: 'asJavascript',
category: 'converting',
fn: function () {
    var self = this;
    if (self.search(/^[a-zA-Z0-9_:.$ ]*$/) == -1) {
        return "unescape(\"" + escape(self) + "\")";
    } else {
        return "\"" + self + "\"";
    }
    return self;
},
source: unescape('asJavascript%0A%09%7B%27%0A%09%09if%28self.search%28/%5E%5Ba-zA-Z0-9_%3A.%24%20%5D*%24/%29%20%3D%3D%20-1%29%0A%09%09%09return%20%22unescape%28%5C%22%22%20+%20escape%28self%29%20+%20%22%5C%22%29%22%3B%0A%09%09else%0A%09%09%09return%20%22%5C%22%22%20+%20self%20+%20%22%5C%22%22%3B%0A%09%27%7D')}),
smalltalk.String);

smalltalk.addMethod(
'_replace_with_',
smalltalk.method({
selector: 'replace:with:',
category: 'regular expressions',
fn: function (aString, anotherString) {
    var self = this;
    return smalltalk.send(self, "_replaceRegexp_with_", [smalltalk.send(smalltalk.RegularExpression, "_fromString_flag_", [aString, "g"]), anotherString]);
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
    return self.replace(aRegexp, aString);
    return self;
},
source: unescape('replaceRegexp%3A%20aRegexp%20with%3A%20aString%0A%09%7B%27return%20self.replace%28aRegexp%2C%20aString%29%3B%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_tokenize_',
smalltalk.method({
selector: 'tokenize:',
category: 'converting',
fn: function (aString) {
    var self = this;
    return self.split(aString);
    return self;
},
source: unescape('tokenize%3A%20aString%0A%09%7B%27return%20self.split%28aString%29%27%7D')}),
smalltalk.String);

smalltalk.addMethod(
'_match_',
smalltalk.method({
selector: 'match:',
category: 'regular expressions',
fn: function (aRegexp) {
    var self = this;
    return self.search(aRegexp) != -1;
    return self;
},
source: unescape('match%3A%20aRegexp%0A%09%7B%27return%20self.search%28aRegexp%29%20%21%3D%20-1%27%7D%0A')}),
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
    return Number(self);
    return self;
},
source: unescape('asNumber%0A%09%7B%27return%20Number%28self%29%3B%27%7D')}),
smalltalk.String);

smalltalk.addMethod(
'_asParser',
smalltalk.method({
selector: 'asParser',
category: 'converting',
fn: function () {
    var self = this;
    return smalltalk.send(smalltalk.send(smalltalk.PPStringParser, "_new", []), "_string_", [self]);
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
    return smalltalk.send(smalltalk.PPChoiceParser, "_withAll_", [smalltalk.send(smalltalk.send(self, "_asArray", []), "_collect_", [function (each) {return smalltalk.send(each, "_asParser", []);}])]);
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
    return smalltalk.send(smalltalk.send(smalltalk.PPCharacterParser, "_new", []), "_string_", [self]);
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
    smalltalk.send(self, "_error_", [unescape("Object%20is%20read-only")]);
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
    return smalltalk.send(smalltalk.send(unescape("%27"), "__comma", [self]), "__comma", [unescape("%27")]);
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
    console.log(self);
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
    return smalltalk.send(smalltalk.JQuery, "_fromString_", [self]);
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
    aJQuery._appendElement_(String(self));
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
    smalltalk.send(aTagBrush, "_appendString_", [self]);
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
    return String(self) > aString;
    return self;
},
source: unescape('%3E%20aString%0A%09%7B%27return%20String%28self%29%20%3E%20aString%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'__lt',
smalltalk.method({
selector: '<',
category: 'comparing',
fn: function (aString) {
    var self = this;
    return String(self) < aString;
    return self;
},
source: unescape('%3C%20aString%0A%09%7B%27return%20String%28self%29%20%3C%20aString%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'__gt_eq',
smalltalk.method({
selector: '>=',
category: 'comparing',
fn: function (aString) {
    var self = this;
    return String(self) >= aString;
    return self;
},
source: unescape('%3E%3D%20aString%0A%09%7B%27return%20String%28self%29%20%3E%3D%20aString%27%7D%0A')}),
smalltalk.String);

smalltalk.addMethod(
'__lt_eq',
smalltalk.method({
selector: '<=',
category: 'comparing',
fn: function (aString) {
    var self = this;
    return String(self) <= aString;
    return self;
},
source: unescape('%3C%3D%20aString%0A%09%7B%27return%20String%28self%29%20%3C%3D%20aString%27%7D')}),
smalltalk.String);

smalltalk.addMethod(
'_remove_',
smalltalk.method({
selector: 'remove:',
category: 'adding',
fn: function (anObject) {
    var self = this;
    smalltalk.send(self, "_errorReadOnly", []);
    return self;
},
source: unescape('remove%3A%20anObject%0A%20%20%20%20self%20errorReadOnly%0A')}),
smalltalk.String);

smalltalk.addMethod(
'_inspectOn_',
smalltalk.method({
selector: 'inspectOn:',
category: '*IDE',
fn: function (anInspector) {
    var self = this;
    var label = nil;
    self.klass.superclass.fn.prototype._inspectOn_.apply(self, [anInspector]);
    smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(self, "_printString", []), "_size", []), "__gt", [30]), "_ifTrue_ifFalse_", [function () {return label = smalltalk.send(smalltalk.send(smalltalk.send(self, "_printString", []), "_copyFrom_to_", [1, 30]), "__comma", [unescape("...%27")]);}, function () {return label = smalltalk.send(self, "_printString", []);}]);
    smalltalk.send(anInspector, "_setLabel_", [label]);
    return self;
},
source: unescape('inspectOn%3A%20anInspector%0A%09%7C%20label%20%7C%0A%09super%20inspectOn%3A%20anInspector.%0A%09self%20printString%20size%20%3E%2030%20%0A%09%09ifTrue%3A%20%5Blabel%20%3A%3D%20%28self%20printString%20copyFrom%3A%201%20to%3A%2030%29%2C%20%27...%27%27%27%5D%0A%09%09ifFalse%3A%20%5Blabel%20%3A%3D%20self%20printString%5D.%20%0A%09anInspector%20setLabel%3A%20label')}),
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
    return new self.fn(aString);
    return self;
},
source: unescape('fromString%3A%20aString%0A%09%20%20%20%20%7B%27return%20new%20self.fn%28aString%29%3B%27%7D%0A')}),
smalltalk.String.klass);

smalltalk.addMethod(
'_cr',
smalltalk.method({
selector: 'cr',
category: 'accessing',
fn: function () {
    var self = this;
    return "\n";
    return self;
},
source: unescape('cr%0A%09%7B%27return%20%27%27%5Cn%27%27%3B%27%7D')}),
smalltalk.String.klass);

smalltalk.addMethod(
'_lf',
smalltalk.method({
selector: 'lf',
category: 'accessing',
fn: function () {
    var self = this;
    return "\r";
    return self;
},
source: unescape('lf%0A%09%7B%27return%20%27%27%5Cr%27%27%3B%27%7D%0A')}),
smalltalk.String.klass);

smalltalk.addMethod(
'_space',
smalltalk.method({
selector: 'space',
category: 'accessing',
fn: function () {
    var self = this;
    return " ";
    return self;
},
source: unescape('space%0A%09%7B%27return%20%27%27%20%27%27%3B%27%7D%0A')}),
smalltalk.String.klass);

smalltalk.addMethod(
'_tab',
smalltalk.method({
selector: 'tab',
category: 'accessing',
fn: function () {
    var self = this;
    return "\t";
    return self;
},
source: unescape('tab%0A%09%7B%27return%20%27%27%5Ct%27%27%3B%27%7D')}),
smalltalk.String.klass);


smalltalk.addClass('RegularExpression', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'_compile_',
smalltalk.method({
selector: 'compile:',
category: 'evaluating',
fn: function (aString) {
    var self = this;
    return self.compile(aString);
    return self;
},
source: unescape('compile%3A%20aString%0A%09%7B%27return%20self.compile%28aString%29%3B%27%7D')}),
smalltalk.RegularExpression);

smalltalk.addMethod(
'_exec_',
smalltalk.method({
selector: 'exec:',
category: 'evaluating',
fn: function (aString) {
    var self = this;
    return self.exec(aString);
    return self;
},
source: unescape('exec%3A%20aString%0A%09%7B%27return%20self.exec%28aString%29%3B%27%7D')}),
smalltalk.RegularExpression);

smalltalk.addMethod(
'_test_',
smalltalk.method({
selector: 'test:',
category: 'evaluating',
fn: function (aString) {
    var self = this;
    return self.test(aString);
    return self;
},
source: unescape('test%3A%20aString%0A%09%7B%27return%20self.test%28aString%29%3B%27%7D')}),
smalltalk.RegularExpression);


smalltalk.addMethod(
'_fromString_flag_',
smalltalk.method({
selector: 'fromString:flag:',
category: 'instance creation',
fn: function (aString, anotherString) {
    var self = this;
    return new RegExp(aString, anotherString);
    return self;
},
source: unescape('fromString%3A%20aString%20flag%3A%20anotherString%0A%09%7B%27return%20new%20RegExp%28aString%2C%20anotherString%29%3B%27%7D%0A')}),
smalltalk.RegularExpression.klass);

smalltalk.addMethod(
'_fromString_',
smalltalk.method({
selector: 'fromString:',
category: 'instance creation',
fn: function (aString) {
    var self = this;
    return smalltalk.send(self, "_fromString_flag_", [aString, ""]);
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
    return self.length;
    return self;
},
source: unescape('size%0A%09%7B%27return%20self.length%27%7D')}),
smalltalk.Array);

smalltalk.addMethod(
'_at_put_',
smalltalk.method({
selector: 'at:put:',
category: 'accessing',
fn: function (anIndex, anObject) {
    var self = this;
    return self[anIndex - 1] = anObject;
    return self;
},
source: unescape('at%3A%20anIndex%20put%3A%20anObject%0A%09%7B%27return%20self%5BanIndex%20-%201%5D%20%3D%20anObject%27%7D%0A')}),
smalltalk.Array);

smalltalk.addMethod(
'_at_ifAbsent_',
smalltalk.method({
selector: 'at:ifAbsent:',
category: 'accessing',
fn: function (anIndex, aBlock) {
    var self = this;
    var value = self[anIndex - 1];
    if (value === undefined) {
        return aBlock();
    } else {
        return value;
    }
    return self;
},
source: unescape('at%3A%20anIndex%20ifAbsent%3A%20aBlock%0A%09%7B%27%0A%09%20%20%20%20var%20value%20%3D%20self%5BanIndex%20-%201%5D%3B%0A%09%20%20%20%20if%28value%20%3D%3D%3D%20undefined%29%20%7B%0A%09%09return%20aBlock%28%29%3B%0A%09%20%20%20%20%7D%20else%20%7B%0A%09%09return%20value%3B%0A%09%20%20%20%20%7D%0A%09%27%7D%0A')}),
smalltalk.Array);

smalltalk.addMethod(
'_add_',
smalltalk.method({
selector: 'add:',
category: 'adding',
fn: function (anObject) {
    var self = this;
    self.push(anObject);
    return anObject;
    return self;
},
source: unescape('add%3A%20anObject%0A%09%7B%27self.push%28anObject%29%3B%20return%20anObject%3B%27%7D%0A')}),
smalltalk.Array);

smalltalk.addMethod(
'_addLast_',
smalltalk.method({
selector: 'addLast:',
category: 'adding',
fn: function (anObject) {
    var self = this;
    return smalltalk.send(self, "_add_", [anObject]);
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
    newCollection = smalltalk.send(smalltalk.send(self, "_class", []), "_new", []);
    smalltalk.send(self, "_do_", [function (each) {return smalltalk.send(newCollection, "_add_", [each]);}]);
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
    newCollection = smalltalk.send(smalltalk.send(self, "_class", []), "_new", []);
    smalltalk.send(self, "_do_", [function (each) {return smalltalk.send(newCollection, "_add_", [smalltalk.send(each, "_deepCopy", [])]);}]);
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
    array = smalltalk.send(smalltalk.send(self, "_class", []), "_new", []);
    smalltalk.send(anIndex, "_to_do_", [anotherIndex, function (each) {return smalltalk.send(array, "_add_", [smalltalk.send(self, "_at_", [each])]);}]);
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
    return self.join(aString);
    return self;
},
source: unescape('join%3A%20aString%0A%09%7B%27return%20self.join%28aString%29%3B%27%7D')}),
smalltalk.Array);

smalltalk.addMethod(
'_asJavascript',
smalltalk.method({
selector: 'asJavascript',
category: 'converting',
fn: function () {
    var self = this;
    return smalltalk.send(smalltalk.send(unescape("%5B"), "__comma", [smalltalk.send(smalltalk.send(self, "_collect_", [function (each) {return smalltalk.send(each, "_asJavascript", []);}]), "_join_", [unescape("%2C%20")])]), "__comma", [unescape("%5D")]);
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
    return smalltalk.send(self, "_basicPerform_", ["sort"]);
    return self;
},
source: unescape('sort%0A%20%20%20%20%5Eself%20basicPerform%3A%20%27sort%27%0A')}),
smalltalk.Array);

smalltalk.addMethod(
'_sort_',
smalltalk.method({
selector: 'sort:',
category: 'enumerating',
fn: function (aBlock) {
    var self = this;
    return self.sort(function (a, b) {if (aBlock(a, b)) {return 1;} else {return -1;}});
    return self;
},
source: unescape('sort%3A%20aBlock%0A%09%7B%27%0A%09%09return%20self.sort%28function%28a%2C%20b%29%20%7B%0A%09%09%09if%28aBlock%28a%2Cb%29%29%20%7Breturn%201%7D%20else%20%7Breturn%20-1%7D%0A%09%09%7D%29%0A%09%27%7D')}),
smalltalk.Array);

smalltalk.addMethod(
'_remove_',
smalltalk.method({
selector: 'remove:',
category: 'adding',
fn: function (anObject) {
    var self = this;
    for (var i = 0; i < self.length; i++) {
        if (self[i] == anObject) {
            self.splice(i, 1);
            break;
        }
    }
    return self;
},
source: unescape('remove%3A%20anObject%0A%09%7B%27%0A%09%09for%28var%20i%3D0%3Bi%3Cself.length%3Bi++%29%20%7B%0A%09%09%09if%28self%5Bi%5D%20%3D%3D%20anObject%29%20%7B%0A%09%09%09%09self.splice%28i%2C1%29%3B%0A%09%09%09%09break%3B%0A%09%09%09%7D%0A%09%09%7D%0A%09%27%7D%0A')}),
smalltalk.Array);

smalltalk.addMethod(
'_sorted',
smalltalk.method({
selector: 'sorted',
category: 'enumerating',
fn: function () {
    var self = this;
    return smalltalk.send(smalltalk.send(self, "_copy", []), "_sort", []);
    return self;
},
source: unescape('sorted%0A%09%5Eself%20copy%20sort')}),
smalltalk.Array);

smalltalk.addMethod(
'_sorted_',
smalltalk.method({
selector: 'sorted:',
category: 'enumerating',
fn: function (aBlock) {
    var self = this;
    return smalltalk.send(smalltalk.send(self, "_copy", []), "_sorted_", [aBlock]);
    return self;
},
source: unescape('sorted%3A%20aBlock%0A%09%5Eself%20copy%20sorted%3A%20aBlock')}),
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
    throw new Error(self._messageText());
    return self;
},
source: unescape('signal%0A%09%7B%27throw%28new%20Error%28self._messageText%28%29%29%29%27%7D')}),
smalltalk.Error);


smalltalk.addMethod(
'_signal_',
smalltalk.method({
selector: 'signal:',
category: 'instance creation',
fn: function (aString) {
    var self = this;
    return function ($rec) {smalltalk.send($rec, "_messageText_", [aString]);return smalltalk.send($rec, "_signal", []);}(smalltalk.send(self, "_new", []));
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
    return smalltalk.send(smalltalk.send(smalltalk.send(self, "_class", []), "__eq", [smalltalk.send(anAssociation, "_class", [])]), "_and_", [function () {return smalltalk.send(smalltalk.send(smalltalk.send(self, "_key", []), "__eq", [smalltalk.send(anAssociation, "_key", [])]), "_and_", [function () {return smalltalk.send(smalltalk.send(self, "_value", []), "__eq", [smalltalk.send(anAssociation, "_value", [])]);}]);}]);
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
    return function ($rec) {smalltalk.send($rec, "_key_", [aKey]);smalltalk.send($rec, "_value_", [aValue]);return smalltalk.send($rec, "_yourself", []);}(smalltalk.send(self, "_new", []));
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
        smalltalk.send(smalltalk.send(smalltalk.send(self, "_class", []), "__eq", [smalltalk.send(aDictionary, "_class", [])]), "_ifFalse_", [function () {return function () {throw {name: "stReturn", selector: "__eq", fn: function () {return false;}};}();}]);
        smalltalk.send(self, "_associationsDo_", [function (assoc) {return smalltalk.send(smalltalk.send(smalltalk.send(aDictionary, "_at_ifAbsent_", [smalltalk.send(assoc, "_key", []), function () {return function () {throw {name: "stReturn", selector: "__eq", fn: function () {return false;}};}();}]), "__eq", [smalltalk.send(assoc, "_value", [])]), "_ifFalse_", [function () {return function () {throw {name: "stReturn", selector: "__eq", fn: function () {return false;}};}();}]);}]);
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
    copy = smalltalk.send(smalltalk.send(self, "_class", []), "_new", []);
    smalltalk.send(self, "_associationsDo_", [function (each) {return smalltalk.send(copy, "_at_put_", [smalltalk.send(each, "_key", []), smalltalk.send(each, "_value", [])]);}]);
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
    return smalltalk.send(self['@keys'], "_size", []);
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
    smalltalk.send(self['@keys'], "_do_", [function (each) {return smalltalk.send(associations, "_add_", [smalltalk.send(smalltalk.Association, "_key_value_", [each, smalltalk.send(self, "_at_", [each])])]);}]);
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
    return smalltalk.send(self['@keys'], "_copy", []);
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
    return smalltalk.send(self['@keys'], "_collect_", [function (each) {return smalltalk.send(self, "_at_", [each]);}]);
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
    smalltalk.send(smalltalk.send(self['@keys'], "_includes_", [aKey]), "_ifFalse_", [function () {return smalltalk.send(self['@keys'], "_add_", [aKey]);}]);
    return smalltalk.send(self, "_basicAt_put_", [aKey, aValue]);
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
    return smalltalk.send(smalltalk.send(smalltalk.send(self, "_keys", []), "_includes_", [aKey]), "_ifTrue_ifFalse_", [function () {return smalltalk.send(self, "_basicAt_", [aKey]);}, aBlock]);
    return self;
},
source: unescape('at%3A%20aKey%20ifAbsent%3A%20aBlock%0A%09%5E%28self%20keys%20includes%3A%20aKey%29%0A%09%09ifTrue%3A%20%5Bself%20basicAt%3A%20aKey%5D%0A%09%09ifFalse%3A%20aBlock')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_at_ifAbsentPut_',
smalltalk.method({
selector: 'at:ifAbsentPut:',
category: 'accessing',
fn: function (aKey, aBlock) {
    var self = this;
    return smalltalk.send(self, "_at_ifAbsent_", [aKey, function () {return smalltalk.send(self, "_at_put_", [aKey, smalltalk.send(aBlock, "_value", [])]);}]);
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
    return smalltalk.send(smalltalk.send(self, "_basicAt_", [aKey]), "_ifNotNil_", [function () {return smalltalk.send(aBlock, "_value_", [smalltalk.send(self, "_at_", [aKey])]);}]);
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
    return smalltalk.send(smalltalk.send(self, "_basicAt_", [aKey]), "_ifNil_ifNotNil_", [anotherBlock, function () {return smalltalk.send(aBlock, "_value_", [smalltalk.send(self, "_at_", [aKey])]);}]);
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
    smalltalk.send(self, "_at_put_", [smalltalk.send(anAssociation, "_key", []), smalltalk.send(anAssociation, "_value", [])]);
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
    self.klass.superclass.fn.prototype._addAll_.apply(self, [smalltalk.send(aDictionary, "_associations", [])]);
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
    smalltalk.send(self, "_shouldNotImplement", []);
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
    smalltalk.send(self, "_shouldNotImplement", []);
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
    smalltalk.send(smalltalk.send(self, "_associations", []), "_do_", [aBlock]);
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
    smalltalk.send(self, "_associationsDo_", [function (each) {return smalltalk.send(aBlock, "_value_value_", [smalltalk.send(each, "_key", []), smalltalk.send(each, "_value", [])]);}]);
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
    smalltalk.send(smalltalk.send(self, "_values", []), "_do_", [aBlock]);
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
    newDict = smalltalk.send(smalltalk.send(self, "_class", []), "_new", []);
    smalltalk.send(self, "_keysAndValuesDo_", [function (key, value) {return smalltalk.send(smalltalk.send(aBlock, "_value_", [value]), "_ifTrue_", [function () {return smalltalk.send(newDict, "_at_put_", [key, value]);}]);}]);
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
    newDict = smalltalk.send(smalltalk.send(self, "_class", []), "_new", []);
    smalltalk.send(self, "_keysAndValuesDo_", [function (key, value) {return smalltalk.send(smalltalk.send(aBlock, "_value_", [value]), "_ifTrue_", [function () {return smalltalk.send(newDict, "_at_put_", [key, value]);}]);}]);
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
    return smalltalk.send(smalltalk.send(self, "_values", []), "_detect_ifNone_", [aBlock, anotherBlock]);
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
    return smalltalk.send(smalltalk.send(self, "_values", []), "_includes_", [anObject]);
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
    smalltalk.send(self, "_removeKey_", [aKey]);
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
    smalltalk.send(self['@keys'], "_remove_", [aKey]);
    return self;
},
source: unescape('removeKey%3A%20aKey%0A%20%20%20%20keys%20remove%3A%20aKey%0A')}),
smalltalk.Dictionary);

smalltalk.addMethod(
'_inspectOn_',
smalltalk.method({
selector: 'inspectOn:',
category: '*IDE',
fn: function (anInspector) {
    var self = this;
    var variables = nil;
    variables = smalltalk.send(smalltalk.Dictionary, "_new", []);
    smalltalk.send(variables, "_at_put_", [unescape("%23self"), self]);
    smalltalk.send(variables, "_at_put_", [unescape("%23keys"), smalltalk.send(self, "_keys", [])]);
    smalltalk.send(self, "_keysAndValuesDo_", [function (key, value) {return smalltalk.send(variables, "_at_put_", [key, value]);}]);
    (function ($rec) {smalltalk.send($rec, "_setLabel_", [smalltalk.send(self, "_printString", [])]);return smalltalk.send($rec, "_setVariables_", [variables]);}(anInspector));
    return self;
},
source: unescape('inspectOn%3A%20anInspector%0A%09%7C%20variables%20%7C%0A%09variables%20%3A%3D%20Dictionary%20new.%0A%09variables%20at%3A%20%27%23self%27%20put%3A%20self.%0A%09variables%20at%3A%20%27%23keys%27%20put%3A%20self%20keys.%0A%09self%20keysAndValuesDo%3A%20%5B%3Akey%20%3Avalue%20%7C%0A%09%09variables%20at%3A%20key%20put%3A%20value%5D.%0A%09anInspector%20%0A%09%09setLabel%3A%20self%20printString%3B%0A%09%09setVariables%3A%20variables')}),
smalltalk.Dictionary);



smalltalk.addClass('ClassBuilder', smalltalk.Object, [], 'Kernel');
smalltalk.addMethod(
'_superclass_subclass_',
smalltalk.method({
selector: 'superclass:subclass:',
category: 'class creation',
fn: function (aClass, aString) {
    var self = this;
    smalltalk.send(self, "_superclass_subclass_instanceVariableNames_category_", [aClass, aString, "", nil]);
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
    newClass = smalltalk.send(self, "_addSubclassOf_named_instanceVariableNames_", [aClass, aString, smalltalk.send(self, "_instanceVariableNamesFor_", [aString2])]);
    smalltalk.send(self, "_setupClass_", [newClass]);
    smalltalk.send(newClass, "_category_", [smalltalk.send(aString3, "_ifNil_", [function () {return "unclassified";}])]);
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
    smalltalk.send(smalltalk.send(aClass, "_isMetaclass", []), "_ifFalse_", [function () {return smalltalk.send(self, "_error_", [smalltalk.send(smalltalk.send(aClass, "_name", []), "__comma", [" is not a metaclass"])]);}]);
    smalltalk.send(aClass, "_basicAt_put_", ["iVarNames", smalltalk.send(self, "_instanceVariableNamesFor_", [aString])]);
    smalltalk.send(self, "_setupClass_", [aClass]);
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
    return smalltalk.send(smalltalk.send(aString, "_tokenize_", [" "]), "_reject_", [function (each) {return smalltalk.send(each, "_isEmpty", []);}]);
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
    smalltalk.addClass(aString, aClass, aCollection);
    return smalltalk[aString];
    return self;
},
source: unescape('addSubclassOf%3A%20aClass%20named%3A%20aString%20instanceVariableNames%3A%20aCollection%0A%09%7B%27smalltalk.addClass%28aString%2C%20aClass%2C%20aCollection%29%3B%0A%09%20%20%20%20return%20smalltalk%5BaString%5D%27%7D')}),
smalltalk.ClassBuilder);

smalltalk.addMethod(
'_setupClass_',
smalltalk.method({
selector: 'setupClass:',
category: 'private',
fn: function (aClass) {
    var self = this;
    smalltalk.init(aClass);
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
    self['@chunkParser'] = smalltalk.send(smalltalk.ChunkParser, "_new", []);
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
    nextChunk = smalltalk.send(smalltalk.send(smalltalk.send(self['@chunkParser'], "_emptyChunk", []), "__slash", [smalltalk.send(self['@chunkParser'], "_chunk", [])]), "_parse_", [aStream]);
    smalltalk.send(smalltalk.send(nextChunk, "_isEmptyChunk", []), "_ifFalse_", [function () {smalltalk.send(self, "_compileMethod_", [smalltalk.send(nextChunk, "_contents", [])]);return smalltalk.send(self, "_scanFrom_", [aStream]);}]);
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
    method = smalltalk.send(smalltalk.send(smalltalk.Compiler, "_new", []), "_load_forClass_", [aString, self['@class']]);
    smalltalk.send(method, "_category_", [self['@category']]);
    smalltalk.send(self['@class'], "_addCompiledMethod_", [method]);
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
    return smalltalk.send(self['@position'], "_ifNil_", [function () {return self['@position'] = 0;}]);
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
    return smalltalk.send(smalltalk.send(self, "_collection", []), "_copyFrom_to_", [1, smalltalk.send(self, "_streamSize", [])]);
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
    return smalltalk.send(self, "_streamSize", []);
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
    smalltalk.send(self, "_position_", [0]);
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
    smalltalk.send(self, "_reset", []);
    smalltalk.send(self, "_setStreamSize_", [0]);
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
    smalltalk.send(function () {return smalltalk.send(self, "_atEnd", []);}, "_whileFalse_", [function () {return smalltalk.send(aBlock, "_value_", [smalltalk.send(self, "_next", [])]);}]);
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
    smalltalk.send(self, "_position_", [smalltalk.send(self, "_size", [])]);
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
    smalltalk.send(self, "_position_", [smalltalk.send(smalltalk.send(smalltalk.send(self, "_position", []), "__plus", [anInteger]), "_min_max_", [smalltalk.send(self, "_size", []), 0])]);
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
    smalltalk.send(self, "_position_", [smalltalk.send(smalltalk.send(self, "_position", []), "__plus", [1])]);
    return smalltalk.send(self['@collection'], "_at_", [smalltalk.send(self, "_position", [])]);
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
    tempCollection = smalltalk.send(smalltalk.send(smalltalk.send(self, "_collection", []), "_class", []), "_new", []);
    smalltalk.send(anInteger, "_timesRepeat_", [function () {return smalltalk.send(smalltalk.send(self, "_atEnd", []), "_ifFalse_", [function () {return smalltalk.send(tempCollection, "_add_", [smalltalk.send(self, "_next", [])]);}]);}]);
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
    smalltalk.send(self, "_position_", [smalltalk.send(smalltalk.send(self, "_position", []), "__plus", [1])]);
    smalltalk.send(smalltalk.send(self, "_collection", []), "_at_put_", [smalltalk.send(self, "_position", []), anObject]);
    smalltalk.send(self, "_setStreamSize_", [smalltalk.send(smalltalk.send(self, "_streamSize", []), "_max_", [smalltalk.send(self, "_position", [])])]);
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
    smalltalk.send(aCollection, "_do_", [function (each) {return smalltalk.send(self, "_nextPut_", [each]);}]);
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
    return smalltalk.send(smalltalk.send(self, "_atEnd", []), "_ifFalse_", [function () {return smalltalk.send(smalltalk.send(self, "_collection", []), "_at_", [smalltalk.send(smalltalk.send(self, "_position", []), "__plus", [1])]);}]);
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
    return smalltalk.send(smalltalk.send(self, "_position", []), "__eq", [smalltalk.send(self, "_size", [])]);
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
    return smalltalk.send(smalltalk.send(self, "_position", []), "__eq", [0]);
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
    return smalltalk.send(smalltalk.send(self, "_size", []), "__eq", [0]);
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
    return function ($rec) {smalltalk.send($rec, "_setCollection_", [aCollection]);smalltalk.send($rec, "_setStreamSize_", [smalltalk.send(aCollection, "_size", [])]);return smalltalk.send($rec, "_yourself", []);}(smalltalk.send(self, "_new", []));
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
    tempCollection = smalltalk.send(smalltalk.send(smalltalk.send(self, "_collection", []), "_class", []), "_new", []);
    smalltalk.send(anInteger, "_timesRepeat_", [function () {return smalltalk.send(smalltalk.send(self, "_atEnd", []), "_ifFalse_", [function () {return tempCollection = smalltalk.send(tempCollection, "__comma", [smalltalk.send(self, "_next", [])]);}]);}]);
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
    smalltalk.send(self, "_nextPutAll_", [aString]);
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
    smalltalk.send(self, "_setCollection_", [smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(self, "_collection", []), "_copyFrom_to_", [1, smalltalk.send(self, "_position", [])]), "__comma", [aString]), "__comma", [smalltalk.send(smalltalk.send(self, "_collection", []), "_copyFrom_to_", [smalltalk.send(smalltalk.send(smalltalk.send(self, "_position", []), "__plus", [1]), "__plus", [smalltalk.send(aString, "_size", [])]), smalltalk.send(smalltalk.send(self, "_collection", []), "_size", [])])])]);
    smalltalk.send(self, "_position_", [smalltalk.send(smalltalk.send(self, "_position", []), "__plus", [smalltalk.send(aString, "_size", [])])]);
    smalltalk.send(self, "_setStreamSize_", [smalltalk.send(smalltalk.send(self, "_streamSize", []), "_max_", [smalltalk.send(self, "_position", [])])]);
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
    nextChunk = smalltalk.send(smalltalk.send(smalltalk.send(self['@chunkParser'], "_emptyChunk", []), "__slash", [smalltalk.send(self['@chunkParser'], "_chunk", [])]), "_parse_", [aStream]);
    smalltalk.send(smalltalk.send(nextChunk, "_isEmptyChunk", []), "_ifFalse_", [function () {return smalltalk.send(self, "_setComment_", [smalltalk.send(nextChunk, "_contents", [])]);}]);
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
    self['@chunkParser'] = smalltalk.send(smalltalk.ChunkParser, "_new", []);
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
    smalltalk.send(self['@class'], "_comment_", [aString]);
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
    return Math.random();
    return self;
},
source: unescape('next%0A%09%7B%27return%20Math.random%28%29%27%7D%0A')}),
smalltalk.Random);

smalltalk.addMethod(
'_next_',
smalltalk.method({
selector: 'next:',
category: 'accessing',
fn: function (anInteger) {
    var self = this;
    return smalltalk.send(1, "_to_collect_", [anInteger, function (each) {return smalltalk.send(self, "_next", []);}]);
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
    return smalltalk.send(smalltalk.Point, "_x_y_", [smalltalk.send(smalltalk.send(self, "_x", []), "__star", [smalltalk.send(smalltalk.send(aPoint, "_asPoint", []), "_x", [])]), smalltalk.send(smalltalk.send(self, "_y", []), "__star", [smalltalk.send(smalltalk.send(aPoint, "_asPoint", []), "_y", [])])]);
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
    return smalltalk.send(smalltalk.Point, "_x_y_", [smalltalk.send(smalltalk.send(self, "_x", []), "__plus", [smalltalk.send(smalltalk.send(aPoint, "_asPoint", []), "_x", [])]), smalltalk.send(smalltalk.send(self, "_y", []), "__plus", [smalltalk.send(smalltalk.send(aPoint, "_asPoint", []), "_y", [])])]);
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
    return smalltalk.send(smalltalk.Point, "_x_y_", [smalltalk.send(smalltalk.send(self, "_x", []), "__minus", [smalltalk.send(smalltalk.send(aPoint, "_asPoint", []), "_x", [])]), smalltalk.send(smalltalk.send(self, "_y", []), "__minus", [smalltalk.send(smalltalk.send(aPoint, "_asPoint", []), "_y", [])])]);
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
    return smalltalk.send(smalltalk.Point, "_x_y_", [smalltalk.send(smalltalk.send(self, "_x", []), "__slash", [smalltalk.send(smalltalk.send(aPoint, "_asPoint", []), "_x", [])]), smalltalk.send(smalltalk.send(self, "_y", []), "__slash", [smalltalk.send(smalltalk.send(aPoint, "_asPoint", []), "_y", [])])]);
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
    return function ($rec) {smalltalk.send($rec, "_x_", [aNumber]);smalltalk.send($rec, "_y_", [anotherNumber]);return smalltalk.send($rec, "_yourself", []);}(smalltalk.send(self, "_new", []));
    return self;
},
source: unescape('x%3A%20aNumber%20y%3A%20anotherNumber%0A%09%5Eself%20new%0A%09%09x%3A%20aNumber%3B%0A%09%09y%3A%20anotherNumber%3B%0A%09%09yourself')}),
smalltalk.Point.klass);


smalltalk.addClass('Message', smalltalk.Object, ['selector', 'arguments'], 'Kernel');
smalltalk.addMethod(
'_selector',
smalltalk.method({
selector: 'selector',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@selector'];
    return self;
},
source: unescape('selector%0A%09%5Eselector')}),
smalltalk.Message);

smalltalk.addMethod(
'_selector_',
smalltalk.method({
selector: 'selector:',
category: 'accessing',
fn: function (aString) {
    var self = this;
    self['@selector'] = aString;
    return self;
},
source: unescape('selector%3A%20aString%0A%09selector%20%3A%3D%20aString')}),
smalltalk.Message);

smalltalk.addMethod(
'_arguments_',
smalltalk.method({
selector: 'arguments:',
category: 'accessing',
fn: function (anArray) {
    var self = this;
    self['@arguments'] = anArray;
    return self;
},
source: unescape('arguments%3A%20anArray%0A%09arguments%20%3A%3D%20anArray')}),
smalltalk.Message);

smalltalk.addMethod(
'_arguments',
smalltalk.method({
selector: 'arguments',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@arguments'];
    return self;
},
source: unescape('arguments%0A%09%5Earguments')}),
smalltalk.Message);


smalltalk.addMethod(
'_selector_arguments_',
smalltalk.method({
selector: 'selector:arguments:',
category: 'instance creation',
fn: function (aString, anArray) {
    var self = this;
    return function ($rec) {smalltalk.send($rec, "_selector_", [aString]);smalltalk.send($rec, "_arguments_", [anArray]);return smalltalk.send($rec, "_yourself", []);}(smalltalk.send(self, "_new", []));
    return self;
},
source: unescape('selector%3A%20aString%20arguments%3A%20anArray%0A%09%5Eself%20new%0A%09%09selector%3A%20aString%3B%0A%09%09arguments%3A%20anArray%3B%0A%09%09yourself')}),
smalltalk.Message.klass);


smalltalk.addClass('MessageNotUnderstood', smalltalk.Error, ['message', 'receiver'], 'Kernel');
smalltalk.addMethod(
'_message',
smalltalk.method({
selector: 'message',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@message'];
    return self;
},
source: unescape('message%0A%09%5Emessage')}),
smalltalk.MessageNotUnderstood);

smalltalk.addMethod(
'_message_',
smalltalk.method({
selector: 'message:',
category: 'accessing',
fn: function (aMessage) {
    var self = this;
    self['@message'] = aMessage;
    return self;
},
source: unescape('message%3A%20aMessage%0A%09message%20%3A%3D%20aMessage')}),
smalltalk.MessageNotUnderstood);

smalltalk.addMethod(
'_receiver',
smalltalk.method({
selector: 'receiver',
category: 'accessing',
fn: function () {
    var self = this;
    return self['@receiver'];
    return self;
},
source: unescape('receiver%0A%09%5Ereceiver')}),
smalltalk.MessageNotUnderstood);

smalltalk.addMethod(
'_receiver_',
smalltalk.method({
selector: 'receiver:',
category: 'accessing',
fn: function (anObject) {
    var self = this;
    self['@receiver'] = anObject;
    return self;
},
source: unescape('receiver%3A%20anObject%0A%09receiver%20%3A%3D%20anObject')}),
smalltalk.MessageNotUnderstood);

smalltalk.addMethod(
'_messageText',
smalltalk.method({
selector: 'messageText',
category: 'accessing',
fn: function () {
    var self = this;
    return smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(self, "_receiver", []), "_asString", []), "__comma", [unescape("%20does%20not%20understand%20%23")]), "__comma", [smalltalk.send(smalltalk.send(self, "_message", []), "_selector", [])]);
    return self;
},
source: unescape('messageText%0A%09%5Eself%20receiver%20asString%2C%20%27%20does%20not%20understand%20%23%27%2C%20self%20message%20selector')}),
smalltalk.MessageNotUnderstood);



smalltalk.addClass('PPParser', smalltalk.Object, ['memo'], 'Parser');
smalltalk.addMethod(
'_initialize',
smalltalk.method({
selector: 'initialize',
category: 'initialization',
fn: function (){
var self=this;
self['@memo']=smalltalk.send(smalltalk.Dictionary, "_new", []);
return self;},
source: unescape('initialize%0A%09memo%20%3A%3D%20Dictionary%20new%0A')}),
smalltalk.PPParser);

smalltalk.addMethod(
'_memo',
smalltalk.method({
selector: 'memo',
category: 'accessing',
fn: function (){
var self=this;
return self['@memo'];
return self;},
source: unescape('memo%0A%09%5Ememo%0A')}),
smalltalk.PPParser);

smalltalk.addMethod(
'_onFailure_',
smalltalk.method({
selector: 'onFailure:',
category: 'error handling',
fn: function (aBlock){
var self=this;
return smalltalk.send(smalltalk.PPFailureActionParser, "_on_block_", [self, aBlock]);
return self;},
source: unescape('onFailure%3A%20aBlock%0A%09%5EPPFailureActionParser%20on%3A%20self%20block%3A%20aBlock%0A')}),
smalltalk.PPParser);

smalltalk.addMethod(
'_flatten',
smalltalk.method({
selector: 'flatten',
category: 'operations',
fn: function (){
var self=this;
return smalltalk.send(smalltalk.PPFlattenParser, "_on_", [self]);
return self;},
source: unescape('flatten%0A%09%5EPPFlattenParser%20on%3A%20self%0A')}),
smalltalk.PPParser);

smalltalk.addMethod(
'_withSource',
smalltalk.method({
selector: 'withSource',
category: 'operations',
fn: function (){
var self=this;
return smalltalk.send(smalltalk.PPSourceParser, "_on_", [self]);
return self;},
source: unescape('withSource%0A%09%5EPPSourceParser%20on%3A%20self%0A')}),
smalltalk.PPParser);

smalltalk.addMethod(
'__eq_eq_gt',
smalltalk.method({
selector: '==>',
category: 'operations',
fn: function (aBlock){
var self=this;
return smalltalk.send(smalltalk.PPActionParser, "_on_block_", [self, aBlock]);
return self;},
source: unescape('%3D%3D%3E%20aBlock%0A%09%5EPPActionParser%20on%3A%20self%20block%3A%20aBlock%0A')}),
smalltalk.PPParser);

smalltalk.addMethod(
'__comma',
smalltalk.method({
selector: ',',
category: 'operations',
fn: function (aParser){
var self=this;
return smalltalk.send(smalltalk.PPSequenceParser, "_with_with_", [self, aParser]);
return self;},
source: unescape('%2C%20aParser%0A%09%5EPPSequenceParser%20with%3A%20self%20with%3A%20aParser%0A')}),
smalltalk.PPParser);

smalltalk.addMethod(
'__slash',
smalltalk.method({
selector: '/',
category: 'operations',
fn: function (aParser){
var self=this;
return smalltalk.send(smalltalk.PPChoiceParser, "_with_with_", [self, aParser]);
return self;},
source: unescape('/%20aParser%0A%09%5EPPChoiceParser%20with%3A%20self%20with%3A%20aParser%0A')}),
smalltalk.PPParser);

smalltalk.addMethod(
'_plus',
smalltalk.method({
selector: 'plus',
category: 'operations',
fn: function (){
var self=this;
return smalltalk.send(smalltalk.PPRepeatingParser, "_on_min_", [self, (1)]);
return self;},
source: unescape('plus%0A%09%5EPPRepeatingParser%20on%3A%20self%20min%3A%201%0A')}),
smalltalk.PPParser);

smalltalk.addMethod(
'_star',
smalltalk.method({
selector: 'star',
category: 'operations',
fn: function (){
var self=this;
return smalltalk.send(smalltalk.PPRepeatingParser, "_on_min_", [self, (0)]);
return self;},
source: unescape('star%0A%09%5EPPRepeatingParser%20on%3A%20self%20min%3A%200%0A')}),
smalltalk.PPParser);

smalltalk.addMethod(
'_not',
smalltalk.method({
selector: 'not',
category: 'operations',
fn: function (){
var self=this;
return smalltalk.send(smalltalk.PPNotParser, "_on_", [self]);
return self;},
source: unescape('not%0A%09%5EPPNotParser%20on%3A%20self%0A')}),
smalltalk.PPParser);

smalltalk.addMethod(
'_optional',
smalltalk.method({
selector: 'optional',
category: 'operations',
fn: function (){
var self=this;
return smalltalk.send(self, "__slash", [smalltalk.send(smalltalk.PPEpsilonParser, "_new", [])]);
return self;},
source: unescape('optional%0A%09%5Eself%20/%20PPEpsilonParser%20new%0A')}),
smalltalk.PPParser);

smalltalk.addMethod(
'_memoizedParse_',
smalltalk.method({
selector: 'memoizedParse:',
category: 'operations',
fn: function (aStream){
var self=this;
var start=nil;
var end=nil;
var node=nil;
start=smalltalk.send(aStream, "_position", []);
return smalltalk.send(smalltalk.send(self, "_memo", []), "_at_ifPresent_ifAbsent_", [start, (function(value){smalltalk.send(aStream, "_position_", [smalltalk.send(smalltalk.send(smalltalk.send(self, "_memo", []), "_at_", [start]), "_second", [])]);return smalltalk.send(value, "_first", []);}), (function(){node=smalltalk.send(self, "_parse_", [aStream]);end=smalltalk.send(aStream, "_position", []);smalltalk.send(smalltalk.send(self, "_memo", []), "_at_put_", [start, smalltalk.send(smalltalk.Array, "_with_with_", [node, end])]);return node;})]);
return self;},
source: unescape('memoizedParse%3A%20aStream%0A%09%7C%20start%20end%20node%20%7C%0A%09start%20%3A%3D%20aStream%20position.%0A%09%5Eself%20memo%20at%3A%20start%20%0A%09%20%20%20%20ifPresent%3A%20%5B%3Avalue%20%7C%0A%09%09aStream%20position%3A%20%28self%20memo%20at%3A%20start%29%20second.%0A%09%09value%20first%5D%0A%09%20%20%20%20ifAbsent%3A%20%5B%0A%09%09node%20%3A%3D%20self%20parse%3A%20aStream.%0A%09%09end%20%3A%3D%20aStream%20position.%0A%09%09self%20memo%20at%3A%20start%20put%3A%20%28Array%20with%3A%20node%20with%3A%20end%29.%0A%09%09node%5D%0A')}),
smalltalk.PPParser);

smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'parsing',
fn: function (aStream){
var self=this;
smalltalk.send(self, "_subclassResponsibility", []);
return self;},
source: unescape('parse%3A%20aStream%0A%09self%20subclassResponsibility%0A')}),
smalltalk.PPParser);

smalltalk.addMethod(
'_parseAll_',
smalltalk.method({
selector: 'parseAll:',
category: 'parsing',
fn: function (aStream){
var self=this;
var result=nil;
result=smalltalk.send(smalltalk.send(smalltalk.PPSequenceParser, "_with_with_", [self, smalltalk.send(smalltalk.PPEOFParser, "_new", [])]), "_memoizedParse_", [aStream]);
return smalltalk.send(smalltalk.send(result, "_isParseFailure", []), "_ifTrue_ifFalse_", [(function(){return smalltalk.send(self, "_error_", [smalltalk.send(result, "_messageFor_", [smalltalk.send(aStream, "_contents", [])])]);}), (function(){return smalltalk.send(result, "_first", []);})]);
return self;},
source: unescape('parseAll%3A%20aStream%0A%09%7C%20result%20%7C%0A%09result%20%3A%3D%20%28PPSequenceParser%20with%3A%20self%20with%3A%20PPEOFParser%20new%29%20memoizedParse%3A%20aStream.%0A%09%5Eresult%20isParseFailure%20%0A%09%20%20%20%20ifTrue%3A%20%5Bself%20error%3A%20%28result%20messageFor%3A%20aStream%20contents%29%5D%0A%09%20%20%20%20ifFalse%3A%20%5Bresult%20first%5D%0A')}),
smalltalk.PPParser);



smalltalk.addClass('PPEOFParser', smalltalk.PPParser, [], 'Parser');
smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'parsing',
fn: function (aStream){
var self=this;
return smalltalk.send(smalltalk.send(aStream, "_atEnd", []), "_ifFalse_ifTrue_", [(function(){return smalltalk.send(smalltalk.send(smalltalk.PPFailure, "_new", []), "_reason_at_", ["EOF expected", smalltalk.send(aStream, "_position", [])]);}), (function(){return nil;})]);
return self;},
source: unescape('parse%3A%20aStream%0A%09%5EaStream%20atEnd%20%0A%09%20%20%20%20ifFalse%3A%20%5B%0A%09%09PPFailure%20new%20reason%3A%20%27EOF%20expected%27%20at%3A%20aStream%20position%5D%0A%09%20%20%20%20ifTrue%3A%20%5Bnil%5D%0A')}),
smalltalk.PPEOFParser);



smalltalk.addClass('PPAnyParser', smalltalk.PPParser, [], 'Parser');
smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'parsing',
fn: function (aStream){
var self=this;
return smalltalk.send(smalltalk.send(aStream, "_atEnd", []), "_ifTrue_ifFalse_", [(function(){return smalltalk.send(smalltalk.send(smalltalk.PPFailure, "_new", []), "_reason_at_", ["did not expect EOF", smalltalk.send(aStream, "_position", [])]);}), (function(){return smalltalk.send(aStream, "_next", []);})]);
return self;},
source: unescape('parse%3A%20aStream%0A%09%5EaStream%20atEnd%0A%09%20%20%20%20ifTrue%3A%20%5BPPFailure%20new%0A%09%09%09%20reason%3A%20%27did%20not%20expect%20EOF%27%20at%3A%20aStream%20position%5D%0A%09%20%20%20%20ifFalse%3A%20%5BaStream%20next%5D%0A')}),
smalltalk.PPAnyParser);



smalltalk.addClass('PPEpsilonParser', smalltalk.PPParser, [], 'Parser');
smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'parsing',
fn: function (aStream){
var self=this;
return nil;
return self;},
source: unescape('parse%3A%20aStream%0A%09%5Enil%0A')}),
smalltalk.PPEpsilonParser);



smalltalk.addClass('PPStringParser', smalltalk.PPParser, ['string'], 'Parser');
smalltalk.addMethod(
'_string',
smalltalk.method({
selector: 'string',
category: 'accessing',
fn: function (){
var self=this;
return self['@string'];
return self;},
source: unescape('string%0A%09%5Estring%0A')}),
smalltalk.PPStringParser);

smalltalk.addMethod(
'_string_',
smalltalk.method({
selector: 'string:',
category: 'accessing',
fn: function (aString){
var self=this;
self['@string']=aString;
return self;},
source: unescape('string%3A%20aString%0A%09string%20%3A%3D%20aString%0A')}),
smalltalk.PPStringParser);

smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'parsing',
fn: function (aStream){
var self=this;
var position=nil;
var result=nil;
position=smalltalk.send(aStream, "_position", []);
result=smalltalk.send(aStream, "_next_", [smalltalk.send(smalltalk.send(self, "_string", []), "_size", [])]);
return smalltalk.send(smalltalk.send(result, "__eq", [smalltalk.send(self, "_string", [])]), "_ifTrue_ifFalse_", [(function(){return result;}), (function(){smalltalk.send(aStream, "_position_", [position]);return (function($rec){smalltalk.send($rec, "_reason_", [smalltalk.send(smalltalk.send(smalltalk.send("Expected ", "__comma", [smalltalk.send(self, "_string", [])]), "__comma", [" but got "]), "__comma", [smalltalk.send(smalltalk.send(result, "_at_", [position]), "_printString", [])])]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(smalltalk.PPFailure, "_new", []));})]);
return self;},
source: unescape('parse%3A%20aStream%0A%09%7C%20position%20result%20%7C%0A%09position%20%3A%3D%20aStream%20position.%0A%09result%20%3A%3D%20aStream%20next%3A%20self%20string%20size.%0A%09%5Eresult%20%3D%20self%20string%0A%09%20%20%20%20ifTrue%3A%20%5Bresult%5D%0A%09%20%20%20%20ifFalse%3A%20%5B%0A%09%09aStream%20position%3A%20position.%0A%09%09PPFailure%20new%20reason%3A%20%27Expected%20%27%2C%20self%20string%2C%20%27%20but%20got%20%27%2C%20%28result%20at%3A%20position%29%20printString%3B%20yourself%5D%0A')}),
smalltalk.PPStringParser);



smalltalk.addClass('PPCharacterParser', smalltalk.PPParser, ['regexp'], 'Parser');
smalltalk.addMethod(
'_string_',
smalltalk.method({
selector: 'string:',
category: 'accessing',
fn: function (aString){
var self=this;
self['@regexp']=smalltalk.send(smalltalk.RegularExpression, "_fromString_", [smalltalk.send(smalltalk.send(unescape("%5B"), "__comma", [aString]), "__comma", [unescape("%5D")])]);
return self;},
source: unescape('string%3A%20aString%0A%09regexp%20%3A%3D%20RegularExpression%20fromString%3A%20%27%5B%27%2C%20aString%2C%20%27%5D%27%0A')}),
smalltalk.PPCharacterParser);

smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'parsing',
fn: function (aStream){
var self=this;
return smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(aStream, "_peek", []), "_notNil", []), "_and_", [(function(){return smalltalk.send(self, "_match_", [smalltalk.send(aStream, "_peek", [])]);})]), "_ifTrue_ifFalse_", [(function(){return smalltalk.send(aStream, "_next", []);}), (function(){return smalltalk.send(smalltalk.send(smalltalk.PPFailure, "_new", []), "_reason_at_", ["Could not match", smalltalk.send(aStream, "_position", [])]);})]);
return self;},
source: unescape('parse%3A%20aStream%0A%09%5E%28aStream%20peek%20notNil%20and%3A%20%5Bself%20match%3A%20aStream%20peek%5D%29%0A%09%20%20%20%20ifTrue%3A%20%5BaStream%20next%5D%0A%09%20%20%20%20ifFalse%3A%20%5BPPFailure%20new%20reason%3A%20%27Could%20not%20match%27%20at%3A%20aStream%20position%5D%0A')}),
smalltalk.PPCharacterParser);

smalltalk.addMethod(
'_match_',
smalltalk.method({
selector: 'match:',
category: 'private',
fn: function (aString){
var self=this;
return smalltalk.send(aString, "_match_", [self['@regexp']]);
return self;},
source: unescape('match%3A%20aString%0A%09%5EaString%20match%3A%20regexp%0A')}),
smalltalk.PPCharacterParser);



smalltalk.addClass('PPListParser', smalltalk.PPParser, ['parsers'], 'Parser');
smalltalk.addMethod(
'_parsers',
smalltalk.method({
selector: 'parsers',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@parsers'], "_ifNil_", [(function(){return [];})]);
return self;},
source: unescape('parsers%0A%09%5Eparsers%20ifNil%3A%20%5B%23%28%29%5D%0A')}),
smalltalk.PPListParser);

smalltalk.addMethod(
'_parsers_',
smalltalk.method({
selector: 'parsers:',
category: 'accessing',
fn: function (aCollection){
var self=this;
self['@parsers']=aCollection;
return self;},
source: unescape('parsers%3A%20aCollection%0A%09parsers%20%3A%3D%20aCollection%0A')}),
smalltalk.PPListParser);

smalltalk.addMethod(
'_copyWith_',
smalltalk.method({
selector: 'copyWith:',
category: 'copying',
fn: function (aParser){
var self=this;
return smalltalk.send(smalltalk.send(self, "_class", []), "_withAll_", [smalltalk.send(smalltalk.send(self, "_parsers", []), "_copyWith_", [aParser])]);
return self;},
source: unescape('copyWith%3A%20aParser%0A%09%5Eself%20class%20withAll%3A%20%28self%20parsers%20copyWith%3A%20aParser%29%0A')}),
smalltalk.PPListParser);


smalltalk.addMethod(
'_withAll_',
smalltalk.method({
selector: 'withAll:',
category: 'instance creation',
fn: function (aCollection){
var self=this;
return (function($rec){smalltalk.send($rec, "_parsers_", [aCollection]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(self, "_new", []));
return self;},
source: unescape('withAll%3A%20aCollection%0A%09%20%20%20%20%5Eself%20new%0A%09%09parsers%3A%20aCollection%3B%0A%09%09yourself%0A')}),
smalltalk.PPListParser.klass);

smalltalk.addMethod(
'_with_with_',
smalltalk.method({
selector: 'with:with:',
category: 'instance creation',
fn: function (aParser, anotherParser){
var self=this;
return smalltalk.send(self, "_withAll_", [smalltalk.send(smalltalk.Array, "_with_with_", [aParser, anotherParser])]);
return self;},
source: unescape('with%3A%20aParser%20with%3A%20anotherParser%0A%09%20%20%20%20%5Eself%20withAll%3A%20%28Array%20with%3A%20aParser%20with%3A%20anotherParser%29%0A')}),
smalltalk.PPListParser.klass);


smalltalk.addClass('PPSequenceParser', smalltalk.PPListParser, [], 'Parser');
smalltalk.addMethod(
'__comma',
smalltalk.method({
selector: ',',
category: 'copying',
fn: function (aRule){
var self=this;
return smalltalk.send(self, "_copyWith_", [aRule]);
return self;},
source: unescape('%2C%20aRule%0A%09%5Eself%20copyWith%3A%20aRule%0A')}),
smalltalk.PPSequenceParser);

smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'parsing',
fn: function (aStream){
var self=this;
var start=nil;
var elements=nil;
var element=nil;
start=smalltalk.send(aStream, "_position", []);
elements=[];
smalltalk.send(smalltalk.send(self, "_parsers", []), "_detect_ifNone_", [(function(each){element=smalltalk.send(each, "_memoizedParse_", [aStream]);smalltalk.send(elements, "_add_", [element]);return smalltalk.send(element, "_isParseFailure", []);}), (function(){return nil;})]);
return smalltalk.send(smalltalk.send(element, "_isParseFailure", []), "_ifFalse_ifTrue_", [(function(){return elements;}), (function(){smalltalk.send(aStream, "_position_", [start]);return element;})]);
return self;},
source: unescape('parse%3A%20aStream%0A%09%7C%20start%20elements%20element%20%7C%0A%09start%20%3A%3D%20aStream%20position.%0A%09elements%20%3A%3D%20%23%28%29.%0A%09self%20parsers%20%0A%09%20%20%20%20detect%3A%20%5B%3Aeach%20%7C%0A%09%09element%20%3A%3D%20each%20memoizedParse%3A%20aStream.%0A%09%09elements%20add%3A%20element.%0A%09%09element%20isParseFailure%5D%20%0A%09%20%20%20%20ifNone%3A%20%5B%5D.%0A%09%5Eelement%20isParseFailure%0A%09%20%20%20%20ifFalse%3A%20%5Belements%5D%0A%09%20%20%20%20ifTrue%3A%20%5BaStream%20position%3A%20start.%20element%5D%0A')}),
smalltalk.PPSequenceParser);



smalltalk.addClass('PPChoiceParser', smalltalk.PPListParser, [], 'Parser');
smalltalk.addMethod(
'__slash',
smalltalk.method({
selector: '/',
category: 'copying',
fn: function (aRule){
var self=this;
return smalltalk.send(self, "_copyWith_", [aRule]);
return self;},
source: unescape('/%20aRule%0A%09%5Eself%20copyWith%3A%20aRule%0A')}),
smalltalk.PPChoiceParser);

smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'parsing',
fn: function (aStream){
var self=this;
var result=nil;
smalltalk.send(smalltalk.send(self, "_parsers", []), "_detect_ifNone_", [(function(each){result=smalltalk.send(each, "_memoizedParse_", [aStream]);return smalltalk.send(smalltalk.send(result, "_isParseFailure", []), "_not", []);}), (function(){return nil;})]);
return result;
return self;},
source: unescape('parse%3A%20aStream%0A%09%7C%20result%20%7C%0A%09self%20parsers%0A%20%20%20%20%09%20%20%20%20detect%3A%20%5B%3Aeach%20%7C%0A%09%09result%20%3A%3D%20each%20memoizedParse%3A%20aStream.%0A%09%09result%20isParseFailure%20not%5D%0A%09%20%20%20%20ifNone%3A%20%5B%5D.%0A%09%5Eresult%0A')}),
smalltalk.PPChoiceParser);



smalltalk.addClass('PPDelegateParser', smalltalk.PPParser, ['parser'], 'Parser');
smalltalk.addMethod(
'_parser',
smalltalk.method({
selector: 'parser',
category: 'accessing',
fn: function (){
var self=this;
return self['@parser'];
return self;},
source: unescape('parser%0A%09%5Eparser%0A')}),
smalltalk.PPDelegateParser);

smalltalk.addMethod(
'_parser_',
smalltalk.method({
selector: 'parser:',
category: 'accessing',
fn: function (aParser){
var self=this;
self['@parser']=aParser;
return self;},
source: unescape('parser%3A%20aParser%0A%09parser%20%3A%3D%20aParser%0A')}),
smalltalk.PPDelegateParser);

smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'parsing',
fn: function (aStream){
var self=this;
return smalltalk.send(smalltalk.send(self, "_parser", []), "_memoizedParse_", [aStream]);
return self;},
source: unescape('parse%3A%20aStream%0A%09%5Eself%20parser%20memoizedParse%3A%20aStream%0A')}),
smalltalk.PPDelegateParser);


smalltalk.addMethod(
'_on_',
smalltalk.method({
selector: 'on:',
category: 'instance creation',
fn: function (aParser){
var self=this;
return (function($rec){smalltalk.send($rec, "_parser_", [aParser]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(self, "_new", []));
return self;},
source: unescape('on%3A%20aParser%0A%09%20%20%20%20%5Eself%20new%0A%09%09parser%3A%20aParser%3B%0A%09%09yourself%0A')}),
smalltalk.PPDelegateParser.klass);


smalltalk.addClass('PPAndParser', smalltalk.PPDelegateParser, [], 'Parser');
smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'parsing',
fn: function (aStream){
var self=this;
return smalltalk.send(self, "_basicParse_", [aStream]);
return self;},
source: unescape('parse%3A%20aStream%0A%09%5Eself%20basicParse%3A%20aStream%0A')}),
smalltalk.PPAndParser);

smalltalk.addMethod(
'_basicParse_',
smalltalk.method({
selector: 'basicParse:',
category: 'parsing',
fn: function (aStream){
var self=this;
var element=nil;
var position=nil;
position=smalltalk.send(aStream, "_position", []);
element=smalltalk.send(smalltalk.send(self, "_parser", []), "_memoizedParse_", [aStream]);
smalltalk.send(aStream, "_position_", [position]);
return element;
return self;},
source: unescape('basicParse%3A%20aStream%0A%09%7C%20element%20position%20%7C%0A%09position%20%3A%3D%20aStream%20position.%0A%09element%20%3A%3D%20self%20parser%20memoizedParse%3A%20aStream.%0A%09aStream%20position%3A%20position.%0A%09%5Eelement%0A')}),
smalltalk.PPAndParser);



smalltalk.addClass('PPNotParser', smalltalk.PPAndParser, [], 'Parser');
smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'parsing',
fn: function (aStream){
var self=this;
var element=nil;
element=smalltalk.send(self, "_basicParse_", [aStream]);
return smalltalk.send(smalltalk.send(element, "_isParseFailure", []), "_ifTrue_ifFalse_", [(function(){return nil;}), (function(){return smalltalk.send(smalltalk.PPFailure, "_reason_at_", [element, smalltalk.send(aStream, "_position", [])]);})]);
return self;},
source: unescape('parse%3A%20aStream%0A%09%7C%20element%20%7C%0A%09element%20%3A%3D%20self%20basicParse%3A%20aStream.%0A%09%5Eelement%20isParseFailure%20%0A%09%20%20%20%20ifTrue%3A%20%5Bnil%5D%0A%09%20%20%20%20ifFalse%3A%20%5BPPFailure%20reason%3A%20element%20at%3A%20aStream%20position%5D%0A')}),
smalltalk.PPNotParser);



smalltalk.addClass('PPActionParser', smalltalk.PPDelegateParser, ['block'], 'Parser');
smalltalk.addMethod(
'_block',
smalltalk.method({
selector: 'block',
category: 'accessing',
fn: function (){
var self=this;
return self['@block'];
return self;},
source: unescape('block%0A%09%5Eblock%0A')}),
smalltalk.PPActionParser);

smalltalk.addMethod(
'_block_',
smalltalk.method({
selector: 'block:',
category: 'accessing',
fn: function (aBlock){
var self=this;
self['@block']=aBlock;
return self;},
source: unescape('block%3A%20aBlock%0A%09block%20%3A%3D%20aBlock%0A')}),
smalltalk.PPActionParser);

smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'parsing',
fn: function (aStream){
var self=this;
var element=nil;
element=smalltalk.send(smalltalk.send(self, "_parser", []), "_memoizedParse_", [aStream]);
return smalltalk.send(smalltalk.send(element, "_isParseFailure", []), "_ifFalse_ifTrue_", [(function(){return smalltalk.send(smalltalk.send(self, "_block", []), "_value_", [element]);}), (function(){return element;})]);
return self;},
source: unescape('parse%3A%20aStream%0A%09%7C%20element%20%7C%0A%09element%20%3A%3D%20self%20parser%20memoizedParse%3A%20aStream.%0A%09%5Eelement%20isParseFailure%0A%09%20%20%20%20ifFalse%3A%20%5Bself%20block%20value%3A%20element%5D%0A%09%20%20%20%20ifTrue%3A%20%5Belement%5D%0A')}),
smalltalk.PPActionParser);


smalltalk.addMethod(
'_on_block_',
smalltalk.method({
selector: 'on:block:',
category: 'instance creation',
fn: function (aParser, aBlock){
var self=this;
return (function($rec){smalltalk.send($rec, "_parser_", [aParser]);smalltalk.send($rec, "_block_", [aBlock]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(self, "_new", []));
return self;},
source: unescape('on%3A%20aParser%20block%3A%20aBlock%0A%09%20%20%20%20%5Eself%20new%0A%09%09parser%3A%20aParser%3B%0A%09%09block%3A%20aBlock%3B%0A%09%09yourself%0A')}),
smalltalk.PPActionParser.klass);


smalltalk.addClass('PPFlattenParser', smalltalk.PPDelegateParser, [], 'Parser');
smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'parsing',
fn: function (aStream){
var self=this;
var start=nil;
var element=nil;
var stop=nil;
start=smalltalk.send(aStream, "_position", []);
element=smalltalk.send(smalltalk.send(self, "_parser", []), "_memoizedParse_", [aStream]);
return smalltalk.send(smalltalk.send(element, "_isParseFailure", []), "_ifTrue_ifFalse_", [(function(){return element;}), (function(){return smalltalk.send(smalltalk.send(aStream, "_collection", []), "_copyFrom_to_", [smalltalk.send(start, "__plus", [(1)]), smalltalk.send(aStream, "_position", [])]);})]);
return self;},
source: unescape('parse%3A%20aStream%0A%09%7C%20start%20element%20stop%20%7C%0A%09start%20%3A%3D%20aStream%20position.%0A%09element%20%3A%3D%20self%20parser%20memoizedParse%3A%20aStream.%0A%09%5Eelement%20isParseFailure%0A%09%20%20%20%20ifTrue%3A%20%5Belement%5D%0A%09%20%20%20%20ifFalse%3A%20%5BaStream%20collection%20%0A%09%09copyFrom%3A%20start%20+%201%20%0A%09%09to%3A%20aStream%20position%5D%0A')}),
smalltalk.PPFlattenParser);



smalltalk.addClass('PPSourceParser', smalltalk.PPDelegateParser, [], 'Parser');
smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'parsing',
fn: function (aStream){
var self=this;
var start=nil;
var element=nil;
var stop=nil;
var result=nil;
start=smalltalk.send(aStream, "_position", []);
element=smalltalk.send(smalltalk.send(self, "_parser", []), "_memoizedParse_", [aStream]);
return smalltalk.send(smalltalk.send(element, "_isParseFailure", []), "_ifTrue_ifFalse_", [(function(){return element;}), (function(){result=smalltalk.send(smalltalk.send(aStream, "_collection", []), "_copyFrom_to_", [smalltalk.send(start, "__plus", [(1)]), smalltalk.send(aStream, "_position", [])]);return smalltalk.send(smalltalk.Array, "_with_with_", [element, result]);})]);
return self;},
source: unescape('parse%3A%20aStream%0A%09%7C%20start%20element%20stop%20result%20%7C%0A%09start%20%3A%3D%20aStream%20position.%0A%09element%20%3A%3D%20self%20parser%20memoizedParse%3A%20aStream.%0A%09%5Eelement%20isParseFailure%0A%09%09ifTrue%3A%20%5Belement%5D%0A%09%09ifFalse%3A%20%5Bresult%20%3A%3D%20aStream%20collection%20copyFrom%3A%20start%20+%201%20to%3A%20aStream%20position.%0A%09%09%09Array%20with%3A%20element%20with%3A%20result%5D.%0A')}),
smalltalk.PPSourceParser);



smalltalk.addClass('PPRepeatingParser', smalltalk.PPDelegateParser, ['min'], 'Parser');
smalltalk.addMethod(
'_min',
smalltalk.method({
selector: 'min',
category: 'accessing',
fn: function (){
var self=this;
return self['@min'];
return self;},
source: unescape('min%0A%09%5Emin%0A')}),
smalltalk.PPRepeatingParser);

smalltalk.addMethod(
'_min_',
smalltalk.method({
selector: 'min:',
category: 'accessing',
fn: function (aNumber){
var self=this;
self['@min']=aNumber;
return self;},
source: unescape('min%3A%20aNumber%0A%09min%20%3A%3D%20aNumber%0A')}),
smalltalk.PPRepeatingParser);

smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'parsing',
fn: function (aStream){
var self=this;
var start=nil;
var element=nil;
var elements=nil;
var failure=nil;
start=smalltalk.send(aStream, "_position", []);
elements=smalltalk.send(smalltalk.Array, "_new", []);
smalltalk.send((function(){return smalltalk.send(smalltalk.send(smalltalk.send(elements, "_size", []), "__lt", [smalltalk.send(self, "_min", [])]), "_and_", [(function(){return smalltalk.send(failure, "_isNil", []);})]);}), "_whileTrue_", [(function(){element=smalltalk.send(smalltalk.send(self, "_parser", []), "_memoizedParse_", [aStream]);return smalltalk.send(smalltalk.send(element, "_isParseFailure", []), "_ifFalse_ifTrue_", [(function(){return smalltalk.send(elements, "_addLast_", [element]);}), (function(){smalltalk.send(aStream, "_position_", [start]);return failure=element;})]);})]);
return smalltalk.send(failure, "_ifNil_ifNotNil_", [(function(){smalltalk.send((function(){return smalltalk.send(failure, "_isNil", []);}), "_whileTrue_", [(function(){element=smalltalk.send(smalltalk.send(self, "_parser", []), "_memoizedParse_", [aStream]);return smalltalk.send(smalltalk.send(element, "_isParseFailure", []), "_ifTrue_ifFalse_", [(function(){return failure=element;}), (function(){return smalltalk.send(elements, "_addLast_", [element]);})]);})]);return elements;}), (function(){return failure;})]);
return self;},
source: unescape('parse%3A%20aStream%0A%09%7C%20start%20element%20elements%20failure%20%7C%0A%09start%20%3A%3D%20aStream%20position.%0A%09elements%20%3A%3D%20Array%20new.%0A%09%5B%28elements%20size%20%3C%20self%20min%29%20and%3A%20%5Bfailure%20isNil%5D%5D%20whileTrue%3A%20%5B%0A%09%20%20%20%20element%20%3A%3D%20self%20parser%20memoizedParse%3A%20aStream.%0A%09%20%20%20%20element%20isParseFailure%0A%09%09%09ifFalse%3A%20%5Belements%20addLast%3A%20element%5D%0A%09%09%09ifTrue%3A%20%5BaStream%20position%3A%20start.%0A%09%09%09%09%20failure%20%3A%3D%20element%5D%5D.%0A%09%5Efailure%20ifNil%3A%20%5B%0A%09%20%20%20%20%5Bfailure%20isNil%5D%20whileTrue%3A%20%5B%0A%09%09%09element%20%3A%3D%20self%20parser%20memoizedParse%3A%20aStream.%0A%09%20%09%09element%20isParseFailure%0A%09%09%09%09ifTrue%3A%20%5Bfailure%20%3A%3D%20element%5D%0A%09%09%09%09ifFalse%3A%20%5Belements%20addLast%3A%20element%5D%5D.%0A%09%09%09%09elements%5D%0A%09%09ifNotNil%3A%20%5Bfailure%5D.%0A')}),
smalltalk.PPRepeatingParser);


smalltalk.addMethod(
'_on_min_',
smalltalk.method({
selector: 'on:min:',
category: 'instance creation',
fn: function (aParser, aNumber){
var self=this;
return (function($rec){smalltalk.send($rec, "_parser_", [aParser]);smalltalk.send($rec, "_min_", [aNumber]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(self, "_new", []));
return self;},
source: unescape('on%3A%20aParser%20min%3A%20aNumber%0A%09%20%20%20%20%5Eself%20new%0A%09%09parser%3A%20aParser%3B%0A%09%09min%3A%20aNumber%3B%0A%09%09yourself%0A')}),
smalltalk.PPRepeatingParser.klass);


smalltalk.addClass('PPFailure', smalltalk.Object, ['position', 'reason'], 'Parser');
smalltalk.addMethod(
'_position',
smalltalk.method({
selector: 'position',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@position'], "_ifNil_", [(function(){return (0);})]);
return self;},
source: unescape('position%0A%09%5Eposition%20ifNil%3A%20%5B0%5D%0A')}),
smalltalk.PPFailure);

smalltalk.addMethod(
'_position_',
smalltalk.method({
selector: 'position:',
category: 'accessing',
fn: function (aNumber){
var self=this;
self['@position']=aNumber;
return self;},
source: unescape('position%3A%20aNumber%0A%09position%20%3A%3D%20aNumber%0A')}),
smalltalk.PPFailure);

smalltalk.addMethod(
'_reason',
smalltalk.method({
selector: 'reason',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@reason'], "_ifNil_", [(function(){return "";})]);
return self;},
source: unescape('reason%0A%09%5Ereason%20ifNil%3A%20%5B%27%27%5D%0A')}),
smalltalk.PPFailure);

smalltalk.addMethod(
'_reason_',
smalltalk.method({
selector: 'reason:',
category: 'accessing',
fn: function (aString){
var self=this;
self['@reason']=aString;
return self;},
source: unescape('reason%3A%20aString%0A%09reason%20%3A%3D%20aString%0A')}),
smalltalk.PPFailure);

smalltalk.addMethod(
'_reason_at_',
smalltalk.method({
selector: 'reason:at:',
category: 'accessing',
fn: function (aString, anInteger){
var self=this;
(function($rec){smalltalk.send($rec, "_reason_", [aString]);return smalltalk.send($rec, "_position_", [anInteger]);})(self);
return self;},
source: unescape('reason%3A%20aString%20at%3A%20anInteger%0A%09self%20%0A%09%20%20%20%20reason%3A%20aString%3B%20%0A%09%20%20%20%20position%3A%20anInteger%0A')}),
smalltalk.PPFailure);

smalltalk.addMethod(
'_isParseFailure',
smalltalk.method({
selector: 'isParseFailure',
category: 'testing',
fn: function (){
var self=this;
return true;
return self;},
source: unescape('isParseFailure%0A%09%5Etrue%0A')}),
smalltalk.PPFailure);


smalltalk.addMethod(
'_reason_at_',
smalltalk.method({
selector: 'reason:at:',
category: 'instance creation',
fn: function (aString, anInteger){
var self=this;
return (function($rec){smalltalk.send($rec, "_reason_at_", [aString, anInteger]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(self, "_new", []));
return self;},
source: unescape('reason%3A%20aString%20at%3A%20anInteger%0A%09%20%20%20%20%5Eself%20new%0A%09%09reason%3A%20aString%20at%3A%20anInteger%3B%0A%09%09yourself%0A')}),
smalltalk.PPFailure.klass);


smalltalk.addClass('SmalltalkParser', smalltalk.Object, [], 'Parser');
smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'parsing',
fn: function (aStream){
var self=this;
return smalltalk.send(smalltalk.send(self, "_parser", []), "_parse_", [aStream]);
return self;},
source: unescape('parse%3A%20aStream%0A%09%5Eself%20parser%20parse%3A%20aStream%0A')}),
smalltalk.SmalltalkParser);

smalltalk.addMethod(
'_parser',
smalltalk.method({
selector: 'parser',
category: 'grammar',
fn: function (){
var self=this;
var method=nil;
var expression=nil;
var separator=nil;
var comment=nil;
var ws=nil;
var identifier=nil;
var keyword=nil;
var className=nil;
var string=nil;
var symbol=nil;
var number=nil;
var literalArray=nil;
var variable=nil;
var reference=nil;
var classReference=nil;
var literal=nil;
var ret=nil;
var methodParser=nil;
var expressionParser=nil;
var keyword=nil;
var unarySelector=nil;
var binarySelector=nil;
var keywordPattern=nil;
var unaryPattern=nil;
var binaryPattern=nil;
var assignment=nil;
var temps=nil;
var blockParamList=nil;
var block=nil;
var expression=nil;
var expressions=nil;
var subexpression=nil;
var statements=nil;
var sequence=nil;
var operand=nil;
var unaryMessage=nil;
var unarySend=nil;
var unaryTail=nil;
var binaryMessage=nil;
var binarySend=nil;
var binaryTail=nil;
var keywordMessage=nil;
var keywordSend=nil;
var keywordPair=nil;
var cascade=nil;
var message=nil;
var jsStatement=nil;
separator=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.String, "_cr", []), "__comma", [smalltalk.send(smalltalk.String, "_space", [])]), "__comma", [smalltalk.send(smalltalk.String, "_lf", [])]), "__comma", [smalltalk.send(smalltalk.String, "_tab", [])]), "_asChoiceParser", []);
comment=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(unescape("%22"), "_asCharacterParser", []), "__comma", [smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(unescape("%22"), "_asParser", []), "_not", []), "__comma", [smalltalk.send(smalltalk.PPAnyParser, "_new", [])]), "_star", [])]), "__comma", [smalltalk.send(unescape("%22"), "_asCharacterParser", [])]), "_flatten", []);
ws=smalltalk.send(smalltalk.send(separator, "__slash", [comment]), "_star", []);
identifier=smalltalk.send(smalltalk.send(smalltalk.send(unescape("a-z"), "_asCharacterParser", []), "__comma", [smalltalk.send(smalltalk.send(unescape("a-zA-Z0-9"), "_asCharacterParser", []), "_star", [])]), "_flatten", []);
keyword=smalltalk.send(smalltalk.send(identifier, "__comma", [smalltalk.send(":", "_asParser", [])]), "_flatten", []);
className=smalltalk.send(smalltalk.send(smalltalk.send(unescape("A-Z"), "_asCharacterParser", []), "__comma", [smalltalk.send(smalltalk.send(unescape("a-zA-Z0-9"), "_asCharacterParser", []), "_star", [])]), "_flatten", []);
string=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(unescape("%27"), "_asParser", []), "__comma", [smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(unescape("%27%27"), "_asParser", []), "__slash", [smalltalk.send(smalltalk.send(smalltalk.send(unescape("%27"), "_asParser", []), "_not", []), "__comma", [smalltalk.send(smalltalk.PPAnyParser, "_new", [])])]), "_star", []), "_flatten", [])]), "__comma", [smalltalk.send(unescape("%27"), "_asParser", [])]), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.send(smalltalk.ValueNode, "_new", []), "_value_", [smalltalk.send(smalltalk.send(node, "_at_", [(2)]), "_replace_with_", [unescape("%27%27"), unescape("%27")])]);})]);
symbol=smalltalk.send(smalltalk.send(smalltalk.send(unescape("%23"), "_asParser", []), "__comma", [smalltalk.send(smalltalk.send(smalltalk.send(unescape("a-zA-Z0-9"), "_asCharacterParser", []), "_plus", []), "_flatten", [])]), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.send(smalltalk.ValueNode, "_new", []), "_value_", [smalltalk.send(node, "_second", [])]);})]);
number=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(unescape("0-9"), "_asCharacterParser", []), "_plus", []), "__comma", [smalltalk.send(smalltalk.send(smalltalk.send(".", "_asParser", []), "__comma", [smalltalk.send(smalltalk.send(unescape("0-9"), "_asCharacterParser", []), "_plus", [])]), "_optional", [])]), "_flatten", []), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.send(smalltalk.ValueNode, "_new", []), "_value_", [smalltalk.send(node, "_asNumber", [])]);})]);
literal=smalltalk.send(smalltalk.PPDelegateParser, "_new", []);
literalArray=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(unescape("%23%28"), "_asParser", []), "__comma", [smalltalk.send(smalltalk.send(smalltalk.send(ws, "__comma", [literal]), "__comma", [ws]), "_star", [])]), "__comma", [smalltalk.send(unescape("%29"), "_asParser", [])]), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.send(smalltalk.ValueNode, "_new", []), "_value_", [smalltalk.send(smalltalk.Array, "_withAll_", [smalltalk.send(smalltalk.send(node, "_second", []), "_collect_", [(function(each){return smalltalk.send(smalltalk.send(each, "_second", []), "_value", []);})])])]);})]);
variable=smalltalk.send(identifier, "__eq_eq_gt", [(function(token){return smalltalk.send(smalltalk.send(smalltalk.VariableNode, "_new", []), "_value_", [token]);})]);
classReference=smalltalk.send(className, "__eq_eq_gt", [(function(token){return smalltalk.send(smalltalk.send(smalltalk.ClassReferenceNode, "_new", []), "_value_", [token]);})]);
reference=smalltalk.send(variable, "__slash", [classReference]);
binarySelector=smalltalk.send(smalltalk.send(smalltalk.send(unescape("+*/%3D%3E%3C%2C@%25%7E-"), "_asCharacterParser", []), "_plus", []), "_flatten", []);
unarySelector=identifier;
keywordPattern=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(ws, "__comma", [keyword]), "__comma", [ws]), "__comma", [identifier]), "_plus", []), "__eq_eq_gt", [(function(nodes){return smalltalk.send(smalltalk.Array, "_with_with_", [smalltalk.send(smalltalk.send(nodes, "_collect_", [(function(each){return smalltalk.send(each, "_at_", [(2)]);})]), "_join_", [""]), smalltalk.send(nodes, "_collect_", [(function(each){return smalltalk.send(each, "_at_", [(4)]);})])]);})]);
binaryPattern=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(ws, "__comma", [binarySelector]), "__comma", [ws]), "__comma", [identifier]), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.Array, "_with_with_", [smalltalk.send(node, "_second", []), smalltalk.send(smalltalk.Array, "_with_", [smalltalk.send(node, "_fourth", [])])]);})]);
unaryPattern=smalltalk.send(smalltalk.send(ws, "__comma", [unarySelector]), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.Array, "_with_with_", [smalltalk.send(node, "_second", []), smalltalk.send(smalltalk.Array, "_new", [])]);})]);
expression=smalltalk.send(smalltalk.PPDelegateParser, "_new", []);
expressions=smalltalk.send(smalltalk.send(expression, "__comma", [smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(ws, "__comma", [smalltalk.send(".", "_asParser", [])]), "__comma", [ws]), "__comma", [expression]), "__eq_eq_gt", [(function(node){return smalltalk.send(node, "_fourth", []);})]), "_star", [])]), "__eq_eq_gt", [(function(node){var result=nil;
result=smalltalk.send(smalltalk.Array, "_with_", [smalltalk.send(node, "_first", [])]);smalltalk.send(smalltalk.send(node, "_second", []), "_do_", [(function(each){return smalltalk.send(result, "_add_", [each]);})]);return result;})]);
assignment=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(reference, "__comma", [ws]), "__comma", [smalltalk.send(unescape("%3A%3D"), "_asParser", [])]), "__comma", [ws]), "__comma", [expression]), "__eq_eq_gt", [(function(node){return (function($rec){smalltalk.send($rec, "_left_", [smalltalk.send(node, "_first", [])]);return smalltalk.send($rec, "_right_", [smalltalk.send(node, "_at_", [(5)])]);})(smalltalk.send(smalltalk.AssignmentNode, "_new", []));})]);
ret=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(unescape("%5E"), "_asParser", []), "__comma", [ws]), "__comma", [expression]), "__comma", [ws]), "__comma", [smalltalk.send(smalltalk.send(".", "_asParser", []), "_optional", [])]), "__eq_eq_gt", [(function(node){return (function($rec){smalltalk.send($rec, "_addNode_", [smalltalk.send(node, "_third", [])]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(smalltalk.ReturnNode, "_new", []));})]);
temps=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(unescape("%7C"), "_asParser", []), "__comma", [smalltalk.send(smalltalk.send(ws, "__comma", [identifier]), "_star", [])]), "__comma", [ws]), "__comma", [smalltalk.send(unescape("%7C"), "_asParser", [])]), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.send(node, "_second", []), "_collect_", [(function(each){return smalltalk.send(each, "_second", []);})]);})]);
blockParamList=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(":", "_asParser", []), "__comma", [identifier]), "__comma", [ws]), "_plus", []), "__comma", [smalltalk.send(unescape("%7C"), "_asParser", [])]), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.send(node, "_first", []), "_collect_", [(function(each){return smalltalk.send(each, "_second", []);})]);})]);
subexpression=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(unescape("%28"), "_asParser", []), "__comma", [ws]), "__comma", [expression]), "__comma", [ws]), "__comma", [smalltalk.send(unescape("%29"), "_asParser", [])]), "__eq_eq_gt", [(function(node){return smalltalk.send(node, "_third", []);})]);
statements=smalltalk.send(smalltalk.send(smalltalk.send(ret, "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.Array, "_with_", [node]);})]), "__slash", [smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(expressions, "__comma", [ws]), "__comma", [smalltalk.send(".", "_asParser", [])]), "__comma", [ws]), "__comma", [ret]), "__eq_eq_gt", [(function(node){return (function($rec){smalltalk.send($rec, "_add_", [smalltalk.send(node, "_at_", [(5)])]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(node, "_first", []));})])]), "__slash", [smalltalk.send(smalltalk.send(expressions, "__comma", [smalltalk.send(smalltalk.send(".", "_asParser", []), "_optional", [])]), "__eq_eq_gt", [(function(node){return smalltalk.send(node, "_first", []);})])]);
sequence=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(temps, "_optional", []), "__comma", [ws]), "__comma", [smalltalk.send(statements, "_optional", [])]), "__comma", [ws]), "__eq_eq_gt", [(function(node){return (function($rec){smalltalk.send($rec, "_temps_", [smalltalk.send(node, "_first", [])]);smalltalk.send($rec, "_nodes_", [smalltalk.send(node, "_third", [])]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(smalltalk.SequenceNode, "_new", []));})]);
block=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(unescape("%5B"), "_asParser", []), "__comma", [ws]), "__comma", [smalltalk.send(blockParamList, "_optional", [])]), "__comma", [ws]), "__comma", [smalltalk.send(sequence, "_optional", [])]), "__comma", [ws]), "__comma", [smalltalk.send(unescape("%5D"), "_asParser", [])]), "__eq_eq_gt", [(function(node){return (function($rec){smalltalk.send($rec, "_parameters_", [smalltalk.send(node, "_third", [])]);return smalltalk.send($rec, "_addNode_", [smalltalk.send(smalltalk.send(node, "_at_", [(5)]), "_asBlockSequenceNode", [])]);})(smalltalk.send(smalltalk.BlockNode, "_new", []));})]);
operand=smalltalk.send(smalltalk.send(literal, "__slash", [reference]), "__slash", [subexpression]);
smalltalk.send(literal, "_parser_", [smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(number, "__slash", [string]), "__slash", [literalArray]), "__slash", [symbol]), "__slash", [block])]);
unaryMessage=smalltalk.send(smalltalk.send(smalltalk.send(ws, "__comma", [unarySelector]), "__comma", [smalltalk.send(smalltalk.send(":", "_asParser", []), "_not", [])]), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.send(smalltalk.SendNode, "_new", []), "_selector_", [smalltalk.send(node, "_second", [])]);})]);
unaryTail=smalltalk.send(smalltalk.PPDelegateParser, "_new", []);
smalltalk.send(unaryTail, "_parser_", [smalltalk.send(smalltalk.send(unaryMessage, "__comma", [smalltalk.send(unaryTail, "_optional", [])]), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.send(node, "_second", []), "_ifNil_ifNotNil_", [(function(){return smalltalk.send(node, "_first", []);}), (function(){return smalltalk.send(smalltalk.send(node, "_second", []), "_valueForReceiver_", [smalltalk.send(node, "_first", [])]);})]);})])]);
unarySend=smalltalk.send(smalltalk.send(operand, "__comma", [smalltalk.send(unaryTail, "_optional", [])]), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.send(node, "_second", []), "_ifNil_ifNotNil_", [(function(){return smalltalk.send(node, "_first", []);}), (function(){return smalltalk.send(smalltalk.send(node, "_second", []), "_valueForReceiver_", [smalltalk.send(node, "_first", [])]);})]);})]);
binaryMessage=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(ws, "__comma", [binarySelector]), "__comma", [ws]), "__comma", [smalltalk.send(unarySend, "__slash", [operand])]), "__eq_eq_gt", [(function(node){return (function($rec){smalltalk.send($rec, "_selector_", [smalltalk.send(node, "_second", [])]);return smalltalk.send($rec, "_arguments_", [smalltalk.send(smalltalk.Array, "_with_", [smalltalk.send(node, "_fourth", [])])]);})(smalltalk.send(smalltalk.SendNode, "_new", []));})]);
binaryTail=smalltalk.send(smalltalk.PPDelegateParser, "_new", []);
smalltalk.send(binaryTail, "_parser_", [smalltalk.send(smalltalk.send(binaryMessage, "__comma", [smalltalk.send(binaryTail, "_optional", [])]), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.send(node, "_second", []), "_ifNil_ifNotNil_", [(function(){return smalltalk.send(node, "_first", []);}), (function(){return smalltalk.send(smalltalk.send(node, "_second", []), "_valueForReceiver_", [smalltalk.send(node, "_first", [])]);})]);})])]);
binarySend=smalltalk.send(smalltalk.send(unarySend, "__comma", [smalltalk.send(binaryTail, "_optional", [])]), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.send(node, "_second", []), "_ifNil_ifNotNil_", [(function(){return smalltalk.send(node, "_first", []);}), (function(){return smalltalk.send(smalltalk.send(node, "_second", []), "_valueForReceiver_", [smalltalk.send(node, "_first", [])]);})]);})]);
keywordPair=smalltalk.send(smalltalk.send(keyword, "__comma", [ws]), "__comma", [binarySend]);
keywordMessage=smalltalk.send(smalltalk.send(smalltalk.send(ws, "__comma", [keywordPair]), "_plus", []), "__eq_eq_gt", [(function(nodes){return (function($rec){smalltalk.send($rec, "_selector_", [smalltalk.send(smalltalk.send(nodes, "_collect_", [(function(each){return smalltalk.send(smalltalk.send(each, "_second", []), "_first", []);})]), "_join_", [""])]);return smalltalk.send($rec, "_arguments_", [smalltalk.send(nodes, "_collect_", [(function(each){return smalltalk.send(smalltalk.send(each, "_second", []), "_third", []);})])]);})(smalltalk.send(smalltalk.SendNode, "_new", []));})]);
keywordSend=smalltalk.send(smalltalk.send(binarySend, "__comma", [keywordMessage]), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.send(node, "_second", []), "_valueForReceiver_", [smalltalk.send(node, "_first", [])]);})]);
message=smalltalk.send(smalltalk.send(binaryMessage, "__slash", [unaryMessage]), "__slash", [keywordMessage]);
cascade=smalltalk.send(smalltalk.send(smalltalk.send(keywordSend, "__slash", [binarySend]), "__comma", [smalltalk.send(smalltalk.send(smalltalk.send(ws, "__comma", [smalltalk.send(unescape("%3B"), "_asParser", [])]), "__comma", [message]), "_plus", [])]), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.send(node, "_first", []), "_cascadeNodeWithMessages_", [smalltalk.send(smalltalk.send(node, "_second", []), "_collect_", [(function(each){return smalltalk.send(each, "_third", []);})])]);})]);
jsStatement=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(unescape("%7B"), "_asParser", []), "__comma", [ws]), "__comma", [string]), "__comma", [ws]), "__comma", [smalltalk.send(unescape("%7D"), "_asParser", [])]), "__eq_eq_gt", [(function(node){return (function($rec){smalltalk.send($rec, "_source_", [smalltalk.send(node, "_third", [])]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(smalltalk.JSStatementNode, "_new", []));})]);
smalltalk.send(expression, "_parser_", [smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(assignment, "__slash", [cascade]), "__slash", [keywordSend]), "__slash", [binarySend]), "__slash", [jsStatement])]);
method=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(ws, "__comma", [smalltalk.send(smalltalk.send(keywordPattern, "__slash", [binaryPattern]), "__slash", [unaryPattern])]), "__comma", [ws]), "__comma", [smalltalk.send(sequence, "_optional", [])]), "__comma", [ws]), "_withSource", []), "__eq_eq_gt", [(function(node){return (function($rec){smalltalk.send($rec, "_selector_", [smalltalk.send(smalltalk.send(smalltalk.send(node, "_first", []), "_second", []), "_first", [])]);smalltalk.send($rec, "_arguments_", [smalltalk.send(smalltalk.send(smalltalk.send(node, "_first", []), "_second", []), "_second", [])]);smalltalk.send($rec, "_addNode_", [smalltalk.send(smalltalk.send(node, "_first", []), "_fourth", [])]);smalltalk.send($rec, "_source_", [smalltalk.send(node, "_second", [])]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(smalltalk.MethodNode, "_new", []));})]);
return smalltalk.send(smalltalk.send(method, "__comma", [smalltalk.send(smalltalk.PPEOFParser, "_new", [])]), "__eq_eq_gt", [(function(node){return smalltalk.send(node, "_first", []);})]);
return self;},
source: unescape('parser%0A%09%7C%20method%20expression%20separator%20comment%20ws%20identifier%20keyword%20className%20string%20symbol%20number%20literalArray%20variable%20reference%20classReference%20literal%20ret%20methodParser%20expressionParser%20keyword%20unarySelector%20binarySelector%20keywordPattern%20unaryPattern%20binaryPattern%20assignment%20temps%20blockParamList%20block%20expression%20expressions%20subexpression%20statements%20sequence%20operand%20unaryMessage%20unarySend%20unaryTail%20binaryMessage%20binarySend%20binaryTail%20keywordMessage%20keywordSend%20keywordPair%20cascade%20message%20jsStatement%20%7C%0A%09%0A%09separator%20%3A%3D%20%28String%20cr%2C%20String%20space%2C%20String%20lf%2C%20String%20tab%29%20asChoiceParser.%0A%09comment%20%3A%3D%20%28%27%22%27%20asCharacterParser%2C%20%28%27%22%27%20asParser%20not%2C%20PPAnyParser%20new%29%20star%2C%20%27%22%27%20asCharacterParser%29%20flatten.%0A%0A%09ws%20%3A%3D%20%28separator%20/%20comment%29%20star.%0A%09%0A%09identifier%20%3A%3D%20%28%27a-z%27%20asCharacterParser%2C%20%27a-zA-Z0-9%27%20asCharacterParser%20star%29%20flatten.%0A%0A%09keyword%20%3A%3D%20%28identifier%2C%20%27%3A%27%20asParser%29%20flatten.%0A%0A%09className%20%3A%3D%20%28%27A-Z%27%20asCharacterParser%2C%20%27a-zA-Z0-9%27%20asCharacterParser%20star%29%20flatten.%0A%0A%09string%20%3A%3D%20%27%27%27%27%20asParser%2C%20%28%27%27%27%27%27%27%20asParser%20/%20%28%27%27%27%27%20asParser%20not%2C%20PPAnyParser%20new%29%29%20star%20flatten%2C%20%27%27%27%27%20asParser%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%20ValueNode%20new%20value%3A%20%28%28node%20at%3A%202%29%20replace%3A%20%27%27%27%27%27%27%20with%3A%20%27%27%27%27%29%5D.%0A%0A%09symbol%20%3A%3D%20%27%23%27%20asParser%2C%20%27a-zA-Z0-9%27%20asCharacterParser%20plus%20flatten%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%20ValueNode%20new%20value%3A%20node%20second%5D.%0A%0A%09number%20%3A%3D%20%28%270-9%27%20asCharacterParser%20plus%2C%20%28%27.%27%20asParser%2C%20%270-9%27%20asCharacterParser%20plus%29%20optional%29%20flatten%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%20ValueNode%20new%20value%3A%20node%20asNumber%5D.%0A%0A%09literal%20%3A%3D%20PPDelegateParser%20new.%0A%0A%09literalArray%20%3A%3D%20%27%23%28%27%20asParser%2C%20%28ws%2C%20literal%2C%20ws%29%20star%2C%20%27%29%27%20asParser%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%20ValueNode%20new%20value%3A%20%28Array%20withAll%3A%20%28node%20second%20collect%3A%20%5B%3Aeach%20%7C%20each%20second%20value%5D%29%29%5D.%0A%0A%09variable%20%3A%3D%20identifier%20%3D%3D%3E%20%5B%3Atoken%20%7C%20VariableNode%20new%20value%3A%20token%5D.%0A%0A%09classReference%20%3A%3D%20className%20%3D%3D%3E%20%5B%3Atoken%20%7C%20ClassReferenceNode%20new%20value%3A%20token%5D.%0A%0A%09reference%20%3A%3D%20variable%20/%20classReference.%0A%0A%09binarySelector%20%3A%3D%20%27+*/%3D%3E%3C%2C@%25%7E-%27%20asCharacterParser%20plus%20flatten.%0A%0A%09unarySelector%20%3A%3D%20identifier.%0A%0A%09keywordPattern%20%3A%3D%20%28ws%2C%20keyword%2C%20ws%2C%20identifier%29%20plus%0A%09%09%3D%3D%3E%20%5B%3Anodes%20%7C%20Array%0A%09%09%09%09%20%20with%3A%20%28%28nodes%20collect%3A%20%5B%3Aeach%20%7C%20each%20at%3A%202%5D%29%20join%3A%20%27%27%29%0A%09%09%09%09%20%20with%3A%20%28nodes%20collect%3A%20%5B%3Aeach%20%7C%20each%20at%3A%204%5D%29%5D.%0A%0A%09binaryPattern%20%3A%3D%20ws%2C%20binarySelector%2C%20ws%2C%20identifier%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%20Array%20with%3A%20node%20second%20with%3A%20%28Array%20with%3A%20node%20fourth%29%5D.%0A%0A%09unaryPattern%20%3A%3D%20ws%2C%20unarySelector%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%20Array%20with%3A%20node%20second%20with%3A%20Array%20new%5D.%0A%09%0A%09expression%20%3A%3D%20PPDelegateParser%20new.%0A%0A%09expressions%20%3A%3D%20expression%2C%20%28%28ws%2C%20%27.%27%20asParser%2C%20ws%2C%20expression%29%20%3D%3D%3E%20%5B%3Anode%20%7C%20node%20fourth%5D%29%20star%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%7C%20result%20%7C%0A%09%09%20%20%20%20result%20%3A%3D%20Array%20with%3A%20node%20first.%0A%09%09%20%20%20%20node%20second%20do%3A%20%5B%3Aeach%20%7C%20result%20add%3A%20each%5D.%0A%09%09%20%20%20%20result%5D.%0A%0A%09assignment%20%3A%3D%20reference%2C%20ws%2C%20%27%3A%3D%27%20asParser%2C%20ws%2C%20expression%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%20AssignmentNode%20new%20left%3A%20node%20first%3B%20right%3A%20%28node%20at%3A%205%29%5D.%0A%0A%09ret%20%3A%3D%20%27%5E%27%20asParser%2C%20ws%2C%20expression%2C%20ws%2C%20%27.%27%20asParser%20optional%0A%09%20%20%20%20%3D%3D%3E%20%5B%3Anode%20%7C%20ReturnNode%20new%0A%09%09%09%20%20%20%20%20addNode%3A%20node%20third%3B%0A%09%09%09%20%20%20%20%20yourself%5D.%0A%0A%09temps%20%3A%3D%20%27%7C%27%20asParser%2C%20%28ws%2C%20identifier%29%20star%2C%20ws%2C%20%27%7C%27%20asParser%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%20node%20second%20collect%3A%20%5B%3Aeach%20%7C%20each%20second%5D%5D.%0A%0A%09blockParamList%20%3A%3D%20%28%27%3A%27%20asParser%2C%20identifier%2C%20ws%29%20plus%2C%20%27%7C%27%20asParser%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%20node%20first%20collect%3A%20%5B%3Aeach%20%7C%20each%20second%5D%5D.%0A%0A%09subexpression%20%3A%3D%20%27%28%27%20asParser%2C%20ws%2C%20expression%2C%20ws%2C%20%27%29%27%20asParser%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%20node%20third%5D.%0A%0A%09statements%20%3A%3D%20%28ret%20%3D%3D%3E%20%5B%3Anode%20%7C%20Array%20with%3A%20node%5D%29%20/%20%28expressions%2C%20ws%2C%20%27.%27%20asParser%2C%20ws%2C%20ret%20%3D%3D%3E%20%5B%3Anode%20%7C%20node%20first%20add%3A%20%28node%20at%3A%205%29%3B%20yourself%5D%29%20/%20%28expressions%20%2C%20%27.%27%20asParser%20optional%20%3D%3D%3E%20%5B%3Anode%20%7C%20node%20first%5D%29.%0A%0A%09sequence%20%3A%3D%20temps%20optional%2C%20ws%2C%20statements%20optional%2C%20ws%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%20SequenceNode%20new%0A%09%09%09%09%20temps%3A%20node%20first%3B%0A%09%09%09%09%20nodes%3A%20node%20third%3B%0A%09%09%09%09%20yourself%5D.%0A%0A%09block%20%3A%3D%20%27%5B%27%20asParser%2C%20ws%2C%20blockParamList%20optional%2C%20ws%2C%20sequence%20optional%2C%20ws%2C%20%27%5D%27%20asParser%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%0A%09%09%20%20%20%20BlockNode%20new%0A%09%09%09parameters%3A%20node%20third%3B%0A%09%09%09addNode%3A%20%28node%20at%3A%205%29%20asBlockSequenceNode%5D.%0A%0A%09operand%20%3A%3D%20literal%20/%20reference%20/%20subexpression.%0A%0A%09literal%20parser%3A%20number%20/%20string%20/%20literalArray%20/%20symbol%20/%20block.%0A%0A%09unaryMessage%20%3A%3D%20ws%2C%20unarySelector%2C%20%27%3A%27%20asParser%20not%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%20SendNode%20new%20selector%3A%20node%20second%5D.%0A%0A%09unaryTail%20%3A%3D%20PPDelegateParser%20new.%0A%09unaryTail%20parser%3A%20%28unaryMessage%2C%20unaryTail%20optional%0A%09%09%09%20%20%20%20%20%20%20%3D%3D%3E%20%5B%3Anode%20%7C%0A%09%09%09%09%20%20%20node%20second%0A%09%09%09%09%09%20%20%20ifNil%3A%20%5Bnode%20first%5D%0A%09%09%09%09%09%20%20%20ifNotNil%3A%20%5Bnode%20second%20valueForReceiver%3A%20node%20first%5D%5D%29.%0A%0A%09unarySend%20%3A%3D%20operand%2C%20unaryTail%20optional%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%0A%09%09%20%20%20%20node%20second%20%0A%09%09%09ifNil%3A%20%5Bnode%20first%5D%0A%09%09%09ifNotNil%3A%20%5Bnode%20second%20valueForReceiver%3A%20node%20first%5D%5D.%0A%0A%09binaryMessage%20%3A%3D%20ws%2C%20binarySelector%2C%20ws%2C%20%28unarySend%20/%20operand%29%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%0A%09%09%20%20%20%20SendNode%20new%0A%09%09%09selector%3A%20node%20second%3B%0A%09%09%09arguments%3A%20%28Array%20with%3A%20node%20fourth%29%5D.%0A%0A%09binaryTail%20%3A%3D%20PPDelegateParser%20new.%0A%09binaryTail%20parser%3A%20%28binaryMessage%2C%20binaryTail%20optional%0A%09%09%09%09%20%20%20%20%3D%3D%3E%20%5B%3Anode%20%7C%0A%09%09%09%09%09node%20second%20%0A%09%09%09%09%09%20%20%20%20ifNil%3A%20%5Bnode%20first%5D%0A%09%09%09%09%09%20%20%20%20ifNotNil%3A%20%5B%20node%20second%20valueForReceiver%3A%20node%20first%5D%5D%29.%0A%0A%09binarySend%20%3A%3D%20unarySend%2C%20binaryTail%20optional%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%0A%09%09%20%20%20%20node%20second%0A%09%09%09ifNil%3A%20%5Bnode%20first%5D%0A%09%09%09ifNotNil%3A%20%5Bnode%20second%20valueForReceiver%3A%20node%20first%5D%5D.%0A%0A%09keywordPair%20%3A%3D%20keyword%2C%20ws%2C%20binarySend.%0A%0A%09keywordMessage%20%3A%3D%20%28ws%2C%20keywordPair%29%20plus%0A%09%09%3D%3D%3E%20%5B%3Anodes%20%7C%0A%09%09%20%20%20%20SendNode%20new%0A%09%09%09selector%3A%20%28%28nodes%20collect%3A%20%5B%3Aeach%20%7C%20each%20second%20first%5D%29%20join%3A%20%27%27%29%3B%0A%09%09%09arguments%3A%20%28nodes%20collect%3A%20%5B%3Aeach%20%7C%20each%20second%20third%5D%29%5D.%0A%0A%09keywordSend%20%3A%3D%20binarySend%2C%20keywordMessage%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%0A%09%09%20%20%20%20node%20second%20valueForReceiver%3A%20node%20first%5D.%0A%0A%09message%20%3A%3D%20binaryMessage%20/%20unaryMessage%20/%20keywordMessage.%0A%0A%09cascade%20%3A%3D%20%28keywordSend%20/%20binarySend%29%2C%20%28ws%2C%20%27%3B%27%20asParser%2C%20message%29%20plus%0A%09%09%3D%3D%3E%20%5B%3Anode%20%7C%0A%09%09%20%20%20%20node%20first%20cascadeNodeWithMessages%3A%20%0A%09%09%09%28node%20second%20collect%3A%20%5B%3Aeach%20%7C%20each%20third%5D%29%5D.%0A%0A%09jsStatement%20%3A%3D%20%27%7B%27%20asParser%2C%20ws%2C%20string%2C%20ws%2C%20%27%7D%27%20asParser%0A%09%20%20%20%20%3D%3D%3E%20%5B%3Anode%20%7C%20JSStatementNode%20new%0A%09%09%09%20%20%20%20%20source%3A%20node%20third%3B%0A%09%09%09%20%20%20%20%20yourself%5D.%0A%0A%09expression%20parser%3A%20assignment%20/%20cascade%20/%20keywordSend%20/%20binarySend%20/%20jsStatement.%0A%0A%09method%20%3A%3D%20%28ws%2C%20%28keywordPattern%20/%20binaryPattern%20/%20unaryPattern%29%2C%20ws%2C%20sequence%20optional%2C%20ws%29%20withSource%0A%09%20%20%20%20%3D%3D%3E%20%5B%3Anode%20%7C%0A%09%09MethodNode%20new%0A%09%09%20%20%20%20selector%3A%20node%20first%20second%20first%3B%0A%09%09%20%20%20%20arguments%3A%20node%20first%20second%20second%3B%0A%09%09%20%20%20%20addNode%3A%20node%20first%20fourth%3B%0A%09%09%20%20%20%20source%3A%20node%20second%3B%0A%09%09%20%20%20%20yourself%5D.%0A%09%0A%09%5Emethod%2C%20PPEOFParser%20new%20%3D%3D%3E%20%5B%3Anode%20%7C%20node%20first%5D%0A')}),
smalltalk.SmalltalkParser);


smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'instance creation',
fn: function (aStream){
var self=this;
return smalltalk.send(smalltalk.send(self, "_new", []), "_parse_", [aStream]);
return self;},
source: unescape('parse%3A%20aStream%0A%09%20%20%20%20%5Eself%20new%0A%09%09parse%3A%20aStream%0A')}),
smalltalk.SmalltalkParser.klass);


smalltalk.addClass('Chunk', smalltalk.Object, ['contents'], 'Parser');
smalltalk.addMethod(
'_contents',
smalltalk.method({
selector: 'contents',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@contents'], "_ifNil_", [(function(){return "";})]);
return self;},
source: unescape('contents%0A%09%5Econtents%20ifNil%3A%20%5B%27%27%5D%0A')}),
smalltalk.Chunk);

smalltalk.addMethod(
'_contents_',
smalltalk.method({
selector: 'contents:',
category: 'accessing',
fn: function (aString){
var self=this;
self['@contents']=aString;
return self;},
source: unescape('contents%3A%20aString%0A%09contents%20%3A%3D%20aString%0A')}),
smalltalk.Chunk);

smalltalk.addMethod(
'_isEmptyChunk',
smalltalk.method({
selector: 'isEmptyChunk',
category: 'testing',
fn: function (){
var self=this;
return false;
return self;},
source: unescape('isEmptyChunk%0A%09%5Efalse%0A')}),
smalltalk.Chunk);

smalltalk.addMethod(
'_isInstructionChunk',
smalltalk.method({
selector: 'isInstructionChunk',
category: 'testing',
fn: function (){
var self=this;
return false;
return self;},
source: unescape('isInstructionChunk%0A%09%5Efalse%0A')}),
smalltalk.Chunk);



smalltalk.addClass('InstructionChunk', smalltalk.Chunk, [], 'Parser');
smalltalk.addMethod(
'_isInstructionChunk',
smalltalk.method({
selector: 'isInstructionChunk',
category: 'testing',
fn: function (){
var self=this;
return true;
return self;},
source: unescape('isInstructionChunk%0A%09%5Etrue%0A')}),
smalltalk.InstructionChunk);



smalltalk.addClass('EmptyChunk', smalltalk.Chunk, [], 'Parser');
smalltalk.addMethod(
'_isEmptyChunk',
smalltalk.method({
selector: 'isEmptyChunk',
category: 'testing',
fn: function (){
var self=this;
return true;
return self;},
source: unescape('isEmptyChunk%0A%09%5Etrue%0A')}),
smalltalk.EmptyChunk);



smalltalk.addClass('ChunkParser', smalltalk.Object, ['parser', 'separator', 'eof', 'ws', 'chunk', 'emptyChunk', 'instructionChunk'], 'Parser');
smalltalk.addMethod(
'_parser',
smalltalk.method({
selector: 'parser',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@parser'], "_ifNil_", [(function(){return self['@parser']=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(self, "_instructionChunk", []), "__slash", [smalltalk.send(self, "_emptyChunk", [])]), "__slash", [smalltalk.send(self, "_chunk", [])]), "__slash", [smalltalk.send(self, "_eof", [])]);})]);
return self;},
source: unescape('parser%0A%09%5Eparser%20ifNil%3A%20%5B%0A%09%20%20%20%20parser%20%3A%3D%20self%20instructionChunk%20/%20self%20emptyChunk%20/%20self%20chunk%20/%20self%20eof%5D%0A')}),
smalltalk.ChunkParser);

smalltalk.addMethod(
'_eof',
smalltalk.method({
selector: 'eof',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@eof'], "_ifNil_", [(function(){return self['@eof']=smalltalk.send(smalltalk.send(smalltalk.send(self, "_ws", []), "__comma", [smalltalk.send(smalltalk.PPEOFParser, "_new", [])]), "__eq_eq_gt", [(function(node){return nil;})]);})]);
return self;},
source: unescape('eof%0A%09%5Eeof%20ifNil%3A%20%5Beof%20%3A%3D%20self%20ws%2C%20PPEOFParser%20new%20%3D%3D%3E%20%5B%3Anode%20%7C%20nil%5D%5D%0A')}),
smalltalk.ChunkParser);

smalltalk.addMethod(
'_separator',
smalltalk.method({
selector: 'separator',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@separator'], "_ifNil_", [(function(){return self['@separator']=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.String, "_cr", []), "__comma", [smalltalk.send(smalltalk.String, "_space", [])]), "__comma", [smalltalk.send(smalltalk.String, "_lf", [])]), "__comma", [smalltalk.send(smalltalk.String, "_tab", [])]), "_asChoiceParser", []);})]);
return self;},
source: unescape('separator%0A%09%5Eseparator%20ifNil%3A%20%5Bseparator%20%3A%3D%20%28String%20cr%2C%20String%20space%2C%20String%20lf%2C%20String%20tab%29%20asChoiceParser%5D%0A')}),
smalltalk.ChunkParser);

smalltalk.addMethod(
'_ws',
smalltalk.method({
selector: 'ws',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@ws'], "_ifNil_", [(function(){return self['@ws']=smalltalk.send(smalltalk.send(self, "_separator", []), "_star", []);})]);
return self;},
source: unescape('ws%0A%09%5Ews%20ifNil%3A%20%5Bws%20%3A%3D%20self%20separator%20star%5D%0A')}),
smalltalk.ChunkParser);

smalltalk.addMethod(
'_chunk',
smalltalk.method({
selector: 'chunk',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@chunk'], "_ifNil_", [(function(){return self['@chunk']=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(self, "_ws", []), "__comma", [smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(unescape("%21%21"), "_asParser", []), "__slash", [smalltalk.send(smalltalk.send(smalltalk.send(unescape("%21"), "_asParser", []), "_not", []), "__comma", [smalltalk.send(smalltalk.PPAnyParser, "_new", [])])]), "_plus", []), "_flatten", [])]), "__comma", [smalltalk.send(unescape("%21"), "_asParser", [])]), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.send(smalltalk.Chunk, "_new", []), "_contents_", [smalltalk.send(smalltalk.send(node, "_second", []), "_replace_with_", [unescape("%21%21"), unescape("%21")])]);})]);})]);
return self;},
source: unescape('chunk%0A%09%5Echunk%20ifNil%3A%20%5Bchunk%20%3A%3D%20self%20ws%2C%20%28%27%21%21%27%20asParser%20/%20%28%27%21%27%20asParser%20not%2C%20PPAnyParser%20new%29%29%20plus%20flatten%2C%20%27%21%27%20asParser%20%3D%3D%3E%20%5B%3Anode%20%7C%20Chunk%20new%20contents%3A%20%28node%20second%20replace%3A%20%27%21%21%27%20with%3A%20%27%21%27%29%5D%5D%0A')}),
smalltalk.ChunkParser);

smalltalk.addMethod(
'_emptyChunk',
smalltalk.method({
selector: 'emptyChunk',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@emptyChunk'], "_ifNil_", [(function(){return self['@emptyChunk']=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(self, "_separator", []), "_plus", []), "__comma", [smalltalk.send(unescape("%21"), "_asParser", [])]), "__comma", [smalltalk.send(self, "_ws", [])]), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.EmptyChunk, "_new", []);})]);})]);
return self;},
source: unescape('emptyChunk%0A%09%5EemptyChunk%20ifNil%3A%20%5BemptyChunk%20%3A%3D%20self%20separator%20plus%2C%20%27%21%27%20asParser%2C%20self%20ws%20%3D%3D%3E%20%5B%3Anode%20%7C%20EmptyChunk%20new%5D%5D%0A')}),
smalltalk.ChunkParser);

smalltalk.addMethod(
'_instructionChunk',
smalltalk.method({
selector: 'instructionChunk',
category: '',
fn: function (){
var self=this;
return smalltalk.send(self['@instructionChunk'], "_ifNil_", [(function(){return self['@instructionChunk']=smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(self, "_ws", []), "__comma", [smalltalk.send(unescape("%21"), "_asParser", [])]), "__comma", [smalltalk.send(self, "_chunk", [])]), "__eq_eq_gt", [(function(node){return smalltalk.send(smalltalk.send(smalltalk.InstructionChunk, "_new", []), "_contents_", [smalltalk.send(smalltalk.send(node, "_last", []), "_contents", [])]);})]);})]);
return self;},
source: unescape('instructionChunk%0A%09%5EinstructionChunk%20ifNil%3A%20%5B%0A%09%20%20%20%20instructionChunk%20%3A%3D%20self%20ws%2C%20%27%21%27%20asParser%2C%20self%20chunk%0A%09%20%20%20%20%3D%3D%3E%20%5B%3Anode%20%7C%20InstructionChunk%20new%20contents%3A%20node%20last%20contents%5D%5D%0A')}),
smalltalk.ChunkParser);



smalltalk.addClass('Importer', smalltalk.Object, ['chunkParser'], 'Parser');
smalltalk.addMethod(
'_chunkParser',
smalltalk.method({
selector: 'chunkParser',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@chunkParser'], "_ifNil_", [(function(){return self['@chunkParser']=smalltalk.send(smalltalk.send(smalltalk.ChunkParser, "_new", []), "_parser", []);})]);
return self;},
source: unescape('chunkParser%0A%09%5EchunkParser%20ifNil%3A%20%5BchunkParser%20%3A%3D%20ChunkParser%20new%20parser%5D%0A')}),
smalltalk.Importer);

smalltalk.addMethod(
'_import_',
smalltalk.method({
selector: 'import:',
category: 'fileIn',
fn: function (aStream){
var self=this;
smalltalk.send(smalltalk.send(aStream, "_atEnd", []), "_ifFalse_", [(function(){var nextChunk=nil;
nextChunk=smalltalk.send(smalltalk.send(self, "_chunkParser", []), "_parse_", [aStream]);return smalltalk.send(nextChunk, "_ifNotNil_", [(function(){smalltalk.send(smalltalk.send(nextChunk, "_isInstructionChunk", []), "_ifTrue_ifFalse_", [(function(){return smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.Compiler, "_new", []), "_loadExpression_", [smalltalk.send(nextChunk, "_contents", [])]), "_scanFrom_", [aStream]);}), (function(){return smalltalk.send(smalltalk.send(smalltalk.Compiler, "_new", []), "_loadExpression_", [smalltalk.send(nextChunk, "_contents", [])]);})]);return smalltalk.send(self, "_import_", [aStream]);})]);})]);
return self;},
source: unescape('import%3A%20aStream%0A%09aStream%20atEnd%20ifFalse%3A%20%5B%0A%09%20%20%20%20%7C%20nextChunk%20%7C%0A%09%20%20%20%20nextChunk%20%3A%3D%20self%20chunkParser%20parse%3A%20aStream.%0A%09%20%20%20%20nextChunk%20ifNotNil%3A%20%5B%0A%09%09nextChunk%20isInstructionChunk%20%0A%09%09%20%20%20%20ifTrue%3A%20%5B%28Compiler%20new%20loadExpression%3A%20nextChunk%20contents%29%0A%09%09%09%09%09%20scanFrom%3A%20aStream%5D%0A%09%09%20%20%20%20ifFalse%3A%20%5BCompiler%20new%20loadExpression%3A%20nextChunk%20contents%5D.%0A%09%09self%20import%3A%20aStream%5D%5D%0A')}),
smalltalk.Importer);



smalltalk.addClass('Exporter', smalltalk.Object, [], 'Parser');
smalltalk.addMethod(
'_exportCategory_',
smalltalk.method({
selector: 'exportCategory:',
category: 'fileOut',
fn: function (aString){
var self=this;
var stream=nil;
stream=smalltalk.send("", "_writeStream", []);
smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.Smalltalk, "_current", []), "_classes", []), "_select_", [(function(each){return smalltalk.send(smalltalk.send(each, "_category", []), "__eq", [aString]);})]), "_do_", [(function(each){return smalltalk.send(stream, "_nextPutAll_", [smalltalk.send(self, "_export_", [each])]);})]);
return smalltalk.send(stream, "_contents", []);
return self;},
source: unescape('exportCategory%3A%20aString%0A%09%7C%20stream%20%7C%0A%09stream%20%3A%3D%20%27%27%20writeStream.%0A%09%28Smalltalk%20current%20classes%20%0A%09%20%20%20%20select%3A%20%5B%3Aeach%20%7C%20each%20category%20%3D%20aString%5D%29%0A%09%20%20%20%20do%3A%20%5B%3Aeach%20%7C%20stream%20nextPutAll%3A%20%28self%20export%3A%20each%29%5D.%0A%09%5Estream%20contents%0A')}),
smalltalk.Exporter);

smalltalk.addMethod(
'_export_',
smalltalk.method({
selector: 'export:',
category: 'fileOut',
fn: function (aClass){
var self=this;
var stream=nil;
stream=smalltalk.send("", "_writeStream", []);
smalltalk.send(self, "_exportDefinitionOf_on_", [aClass, stream]);
smalltalk.send(stream, "_nextPutAll_", [smalltalk.send(smalltalk.String, "_cr", [])]);
smalltalk.send(self, "_exportMethodsOf_on_", [aClass, stream]);
smalltalk.send(stream, "_nextPutAll_", [smalltalk.send(smalltalk.String, "_cr", [])]);
smalltalk.send(self, "_exportMetaDefinitionOf_on_", [aClass, stream]);
smalltalk.send(self, "_exportMethodsOf_on_", [smalltalk.send(aClass, "_class", []), stream]);
smalltalk.send(stream, "_nextPutAll_", [smalltalk.send(smalltalk.String, "_cr", [])]);
return smalltalk.send(stream, "_contents", []);
return self;},
source: unescape('export%3A%20aClass%0A%09%7C%20stream%20%7C%0A%09stream%20%3A%3D%20%27%27%20writeStream.%0A%09self%20exportDefinitionOf%3A%20aClass%20on%3A%20stream.%0A%09stream%20nextPutAll%3A%20String%20cr.%0A%09self%20exportMethodsOf%3A%20aClass%20on%3A%20stream.%0A%09stream%20nextPutAll%3A%20String%20cr.%0A%09self%20exportMetaDefinitionOf%3A%20aClass%20on%3A%20stream.%0A%09self%20exportMethodsOf%3A%20aClass%20class%20on%3A%20stream.%0A%09stream%20nextPutAll%3A%20String%20cr.%0A%09%5Estream%20contents%0A')}),
smalltalk.Exporter);

smalltalk.addMethod(
'_exportDefinitionOf_on_',
smalltalk.method({
selector: 'exportDefinitionOf:on:',
category: 'private',
fn: function (aClass, aStream){
var self=this;
(function($rec){smalltalk.send($rec, "_nextPutAll_", [unescape("smalltalk.addClass%28")]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(smalltalk.send(unescape("%27"), "__comma", [smalltalk.send(self, "_classNameFor_", [aClass])]), "__comma", [unescape("%27%2C%20")])]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send("smalltalk.", "__comma", [smalltalk.send(self, "_classNameFor_", [smalltalk.send(aClass, "_superclass", [])])])]);return smalltalk.send($rec, "_nextPutAll_", [unescape("%2C%20%5B")]);})(aStream);
smalltalk.send(smalltalk.send(aClass, "_instanceVariableNames", []), "_do_separatedBy_", [(function(each){return smalltalk.send(aStream, "_nextPutAll_", [smalltalk.send(smalltalk.send(unescape("%27"), "__comma", [each]), "__comma", [unescape("%27")])]);}), (function(){return smalltalk.send(aStream, "_nextPutAll_", [unescape("%2C%20")]);})]);
(function($rec){smalltalk.send($rec, "_nextPutAll_", [unescape("%5D%2C%20%27")]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(smalltalk.send(aClass, "_category", []), "__comma", [unescape("%27")])]);return smalltalk.send($rec, "_nextPutAll_", [unescape("%29%3B")]);})(aStream);
smalltalk.send(smalltalk.send(smalltalk.send(aClass, "_comment", []), "_notEmpty", []), "_ifTrue_", [(function(){return (function($rec){smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(smalltalk.String, "_cr", [])]);smalltalk.send($rec, "_nextPutAll_", ["smalltalk."]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(self, "_classNameFor_", [aClass])]);smalltalk.send($rec, "_nextPutAll_", [unescape(".comment%3D")]);return smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(smalltalk.send(unescape("unescape%28%27"), "__comma", [smalltalk.send(smalltalk.send(aClass, "_comment", []), "_escaped", [])]), "__comma", [unescape("%27%29")])]);})(aStream);})]);
return self;},
source: unescape('exportDefinitionOf%3A%20aClass%20on%3A%20aStream%0A%09aStream%20%0A%09%20%20%20%20nextPutAll%3A%20%27smalltalk.addClass%28%27%3B%0A%09%20%20%20%20nextPutAll%3A%20%27%27%27%27%2C%20%28self%20classNameFor%3A%20aClass%29%2C%20%27%27%27%2C%20%27%3B%0A%09%20%20%20%20nextPutAll%3A%20%27smalltalk.%27%2C%20%28self%20classNameFor%3A%20aClass%20superclass%29%3B%0A%09%20%20%20%20nextPutAll%3A%20%27%2C%20%5B%27.%0A%09aClass%20instanceVariableNames%20%0A%09%20%20%20%20do%3A%20%5B%3Aeach%20%7C%20aStream%20nextPutAll%3A%20%27%27%27%27%2C%20each%2C%20%27%27%27%27%5D%0A%09%20%20%20%20separatedBy%3A%20%5BaStream%20nextPutAll%3A%20%27%2C%20%27%5D.%0A%09aStream%09%0A%09%20%20%20%20nextPutAll%3A%20%27%5D%2C%20%27%27%27%3B%0A%09%20%20%20%20nextPutAll%3A%20aClass%20category%2C%20%27%27%27%27%3B%0A%09%20%20%20%20nextPutAll%3A%20%27%29%3B%27.%0A%09aClass%20comment%20notEmpty%20ifTrue%3A%20%5B%0A%09%20%20%20%20aStream%20%0A%09%20%20%20%20%09nextPutAll%3A%20String%20cr%3B%0A%09%09nextPutAll%3A%20%27smalltalk.%27%3B%0A%09%09nextPutAll%3A%20%28self%20classNameFor%3A%20aClass%29%3B%0A%09%09nextPutAll%3A%20%27.comment%3D%27%3B%0A%09%09nextPutAll%3A%20%27unescape%28%27%27%27%2C%20aClass%20comment%20escaped%2C%20%27%27%27%29%27%5D%0A')}),
smalltalk.Exporter);

smalltalk.addMethod(
'_exportMetaDefinitionOf_on_',
smalltalk.method({
selector: 'exportMetaDefinitionOf:on:',
category: 'private',
fn: function (aClass, aStream){
var self=this;
smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(aClass, "_class", []), "_instanceVariableNames", []), "_isEmpty", []), "_ifFalse_", [(function(){(function($rec){smalltalk.send($rec, "_nextPutAll_", [smalltalk.send("smalltalk.", "__comma", [smalltalk.send(self, "_classNameFor_", [smalltalk.send(aClass, "_class", [])])])]);return smalltalk.send($rec, "_nextPutAll_", [unescape(".iVarNames%20%3D%20%5B")]);})(aStream);smalltalk.send(smalltalk.send(smalltalk.send(aClass, "_class", []), "_instanceVariableNames", []), "_do_separatedBy_", [(function(each){return smalltalk.send(aStream, "_nextPutAll_", [smalltalk.send(smalltalk.send(unescape("%27"), "__comma", [each]), "__comma", [unescape("%27")])]);}), (function(){return smalltalk.send(aStream, "_nextPutAll_", [unescape("%2C")]);})]);return smalltalk.send(aStream, "_nextPutAll_", [smalltalk.send(unescape("%5D%3B"), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])])]);})]);
return self;},
source: unescape('exportMetaDefinitionOf%3A%20aClass%20on%3A%20aStream%0A%09aClass%20class%20instanceVariableNames%20isEmpty%20ifFalse%3A%20%5B%0A%09%20%20%20%20aStream%20%0A%09%09nextPutAll%3A%20%27smalltalk.%27%2C%20%28self%20classNameFor%3A%20aClass%20class%29%3B%0A%09%09nextPutAll%3A%20%27.iVarNames%20%3D%20%5B%27.%0A%09%20%20%20%20aClass%20class%20instanceVariableNames%0A%09%09do%3A%20%5B%3Aeach%20%7C%20aStream%20nextPutAll%3A%20%27%27%27%27%2C%20each%2C%20%27%27%27%27%5D%0A%09%09separatedBy%3A%20%5BaStream%20nextPutAll%3A%20%27%2C%27%5D.%0A%09%20%20%20%20aStream%20nextPutAll%3A%20%27%5D%3B%27%2C%20String%20cr%5D%0A')}),
smalltalk.Exporter);

smalltalk.addMethod(
'_exportMethodsOf_on_',
smalltalk.method({
selector: 'exportMethodsOf:on:',
category: 'private',
fn: function (aClass, aStream){
var self=this;
smalltalk.send(smalltalk.send(aClass, "_methodDictionary", []), "_keysAndValuesDo_", [(function(key, value){return (function($rec){smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(unescape("smalltalk.addMethod%28"), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])])]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(smalltalk.send(smalltalk.send(unescape("%27"), "__comma", [smalltalk.send(smalltalk.send(value, "_selector", []), "_asSelector", [])]), "__comma", [unescape("%27%2C")]), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])])]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(unescape("smalltalk.method%28%7B"), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])])]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(smalltalk.send(smalltalk.send(unescape("selector%3A%20%27"), "__comma", [smalltalk.send(value, "_selector", [])]), "__comma", [unescape("%27%2C")]), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])])]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(smalltalk.send(smalltalk.send(unescape("category%3A%20%27"), "__comma", [smalltalk.send(value, "_category", [])]), "__comma", [unescape("%27%2C")]), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])])]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(smalltalk.send(smalltalk.send("fn: ", "__comma", [smalltalk.send(smalltalk.send(value, "_fn", []), "_compiledSource", [])]), "__comma", [unescape("%2C")]), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])])]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(smalltalk.send(unescape("source%3A%20unescape%28%27"), "__comma", [smalltalk.send(smalltalk.send(value, "_source", []), "_escaped", [])]), "__comma", [unescape("%27%29")])]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(unescape("%7D%29%2C"), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])])]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send("smalltalk.", "__comma", [smalltalk.send(self, "_classNameFor_", [aClass])])]);return smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(smalltalk.send(unescape("%29%3B"), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])]), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])])]);})(aStream);})]);
return self;},
source: unescape('exportMethodsOf%3A%20aClass%20on%3A%20aStream%0A%09aClass%20methodDictionary%20keysAndValuesDo%3A%20%5B%3Akey%20%3Avalue%20%7C%0A%09%20%20%20%20aStream%20%0A%09%09nextPutAll%3A%20%27smalltalk.addMethod%28%27%2C%20String%20cr%3B%0A%09%09nextPutAll%3A%20%27%27%27%27%2C%20value%20selector%20asSelector%2C%20%27%27%27%2C%27%2C%20String%20cr%3B%0A%09%09nextPutAll%3A%20%27smalltalk.method%28%7B%27%2C%20String%20cr%3B%0A%09%09nextPutAll%3A%20%27selector%3A%20%27%27%27%2C%20value%20selector%2C%20%27%27%27%2C%27%2C%20String%20cr%3B%0A%09%09nextPutAll%3A%20%27category%3A%20%27%27%27%2C%20value%20category%2C%20%27%27%27%2C%27%2C%20String%20cr%3B%0A%09%09nextPutAll%3A%20%27fn%3A%20%27%2C%20value%20fn%20compiledSource%2C%20%27%2C%27%2C%20String%20cr%3B%0A%09%09nextPutAll%3A%20%27source%3A%20unescape%28%27%27%27%2C%20value%20source%20escaped%2C%20%27%27%27%29%27%3B%0A%09%09nextPutAll%3A%20%27%7D%29%2C%27%2C%20String%20cr%3B%0A%09%09nextPutAll%3A%20%27smalltalk.%27%2C%20%28self%20classNameFor%3A%20aClass%29%3B%0A%09%09nextPutAll%3A%20%27%29%3B%27%2C%20String%20cr%2C%20String%20cr%5D%0A')}),
smalltalk.Exporter);

smalltalk.addMethod(
'_classNameFor_',
smalltalk.method({
selector: 'classNameFor:',
category: 'private',
fn: function (aClass){
var self=this;
return smalltalk.send(smalltalk.send(aClass, "_isMetaclass", []), "_ifTrue_ifFalse_", [(function(){return smalltalk.send(smalltalk.send(smalltalk.send(aClass, "_instanceClass", []), "_name", []), "__comma", [".klass"]);}), (function(){return smalltalk.send(smalltalk.send(aClass, "_isNil", []), "_ifTrue_ifFalse_", [(function(){return "nil";}), (function(){return smalltalk.send(aClass, "_name", []);})]);})]);
return self;},
source: unescape('classNameFor%3A%20aClass%0A%09%5EaClass%20isMetaclass%0A%09%20%20%20%20ifTrue%3A%20%5BaClass%20instanceClass%20name%2C%20%27.klass%27%5D%0A%09%20%20%20%20ifFalse%3A%20%5B%0A%09%09aClass%20isNil%0A%09%09%20%20%20%20ifTrue%3A%20%5B%27nil%27%5D%0A%09%09%20%20%20%20ifFalse%3A%20%5BaClass%20name%5D%5D%0A')}),
smalltalk.Exporter);

smalltalk.addMethod(
'_exportAll',
smalltalk.method({
selector: 'exportAll',
category: 'fileOut',
fn: function (){
var self=this;
var categories=nil;
categories=smalltalk.send(smalltalk.Array, "_new", []);
smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.Smalltalk, "_current", []), "_classes", []), "_do_", [(function(each){return smalltalk.send(smalltalk.send(categories, "_includes_", [smalltalk.send(each, "_category", [])]), "_ifFalse_", [(function(){return smalltalk.send(categories, "_add_", [smalltalk.send(each, "_category", [])]);})]);})]);
smalltalk.send(categories, "_do_", [(function(each){return smalltalk.send(self, "_exportCategory_", [each]);})]);
return self;},
source: unescape('exportAll%0A%20%20%20%20%7C%20categories%20%7C%0A%20%20%20%20categories%20%3A%3D%20Array%20new.%0A%20%20%20%20Smalltalk%20current%20classes%20do%3A%20%5B%3Aeach%20%7C%0A%09%28categories%20includes%3A%20each%20category%29%20ifFalse%3A%20%5B%0A%09%20%20%20%20categories%20add%3A%20each%20category%5D%5D.%0A%09categories%20do%3A%20%5B%3Aeach%20%7C%0A%09%09self%20exportCategory%3A%20each%5D')}),
smalltalk.Exporter);



smalltalk.addClass('Node', smalltalk.Object, ['nodes'], 'Compiler');
smalltalk.addMethod(
'_nodes',
smalltalk.method({
selector: 'nodes',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@nodes'], "_ifNil_", [(function(){return self['@nodes']=smalltalk.send(smalltalk.Array, "_new", []);})]);
return self;},
source: unescape('nodes%0A%09%5Enodes%20ifNil%3A%20%5Bnodes%20%3A%3D%20Array%20new%5D%0A')}),
smalltalk.Node);

smalltalk.addMethod(
'_nodes_',
smalltalk.method({
selector: 'nodes:',
category: 'building',
fn: function (aCollection){
var self=this;
self['@nodes']=aCollection;
return self;},
source: unescape('nodes%3A%20aCollection%0A%09nodes%20%3A%3D%20aCollection%0A')}),
smalltalk.Node);

smalltalk.addMethod(
'_addNode_',
smalltalk.method({
selector: 'addNode:',
category: 'accessing',
fn: function (aNode){
var self=this;
smalltalk.send(smalltalk.send(self, "_nodes", []), "_add_", [aNode]);
return self;},
source: unescape('addNode%3A%20aNode%0A%09self%20nodes%20add%3A%20aNode%0A')}),
smalltalk.Node);

smalltalk.addMethod(
'_accept_',
smalltalk.method({
selector: 'accept:',
category: 'visiting',
fn: function (aVisitor){
var self=this;
smalltalk.send(aVisitor, "_visitNode_", [self]);
return self;},
source: unescape('accept%3A%20aVisitor%0A%09aVisitor%20visitNode%3A%20self%0A')}),
smalltalk.Node);



smalltalk.addClass('MethodNode', smalltalk.Node, ['selector', 'arguments', 'source'], 'Compiler');
smalltalk.addMethod(
'_selector',
smalltalk.method({
selector: 'selector',
category: 'accessing',
fn: function (){
var self=this;
return self['@selector'];
return self;},
source: unescape('selector%0A%09%5Eselector%0A')}),
smalltalk.MethodNode);

smalltalk.addMethod(
'_selector_',
smalltalk.method({
selector: 'selector:',
category: 'accessing',
fn: function (aString){
var self=this;
self['@selector']=aString;
return self;},
source: unescape('selector%3A%20aString%0A%09selector%20%3A%3D%20aString%0A')}),
smalltalk.MethodNode);

smalltalk.addMethod(
'_arguments',
smalltalk.method({
selector: 'arguments',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@arguments'], "_ifNil_", [(function(){return [];})]);
return self;},
source: unescape('arguments%0A%09%5Earguments%20ifNil%3A%20%5B%23%28%29%5D%0A')}),
smalltalk.MethodNode);

smalltalk.addMethod(
'_arguments_',
smalltalk.method({
selector: 'arguments:',
category: 'accessing',
fn: function (aCollection){
var self=this;
self['@arguments']=aCollection;
return self;},
source: unescape('arguments%3A%20aCollection%0A%09arguments%20%3A%3D%20aCollection%0A')}),
smalltalk.MethodNode);

smalltalk.addMethod(
'_source',
smalltalk.method({
selector: 'source',
category: 'accessing',
fn: function (){
var self=this;
return self['@source'];
return self;},
source: unescape('source%0A%09%5Esource%0A')}),
smalltalk.MethodNode);

smalltalk.addMethod(
'_source_',
smalltalk.method({
selector: 'source:',
category: 'accessing',
fn: function (aString){
var self=this;
self['@source']=aString;
return self;},
source: unescape('source%3A%20aString%0A%09source%20%3A%3D%20aString%0A')}),
smalltalk.MethodNode);

smalltalk.addMethod(
'_accept_',
smalltalk.method({
selector: 'accept:',
category: 'visiting',
fn: function (aVisitor){
var self=this;
smalltalk.send(aVisitor, "_visitMethodNode_", [self]);
return self;},
source: unescape('accept%3A%20aVisitor%0A%09aVisitor%20visitMethodNode%3A%20self%0A')}),
smalltalk.MethodNode);



smalltalk.addClass('SendNode', smalltalk.Node, ['selector', 'arguments', 'receiver'], 'Compiler');
smalltalk.addMethod(
'_selector',
smalltalk.method({
selector: 'selector',
category: 'accessing',
fn: function (){
var self=this;
return self['@selector'];
return self;},
source: unescape('selector%0A%09%5Eselector%0A')}),
smalltalk.SendNode);

smalltalk.addMethod(
'_selector_',
smalltalk.method({
selector: 'selector:',
category: 'accessing',
fn: function (aString){
var self=this;
self['@selector']=aString;
return self;},
source: unescape('selector%3A%20aString%0A%09selector%20%3A%3D%20aString%0A')}),
smalltalk.SendNode);

smalltalk.addMethod(
'_arguments',
smalltalk.method({
selector: 'arguments',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@arguments'], "_ifNil_", [(function(){return self['@arguments']=[];})]);
return self;},
source: unescape('arguments%0A%09%5Earguments%20ifNil%3A%20%5Barguments%20%3A%3D%20%23%28%29%5D%0A')}),
smalltalk.SendNode);

smalltalk.addMethod(
'_arguments_',
smalltalk.method({
selector: 'arguments:',
category: 'accessing',
fn: function (aCollection){
var self=this;
self['@arguments']=aCollection;
return self;},
source: unescape('arguments%3A%20aCollection%0A%09arguments%20%3A%3D%20aCollection%0A')}),
smalltalk.SendNode);

smalltalk.addMethod(
'_receiver',
smalltalk.method({
selector: 'receiver',
category: 'accessing',
fn: function (){
var self=this;
return self['@receiver'];
return self;},
source: unescape('receiver%0A%09%5Ereceiver%0A')}),
smalltalk.SendNode);

smalltalk.addMethod(
'_receiver_',
smalltalk.method({
selector: 'receiver:',
category: 'accessing',
fn: function (aNode){
var self=this;
self['@receiver']=aNode;
return self;},
source: unescape('receiver%3A%20aNode%0A%09receiver%20%3A%3D%20aNode%0A')}),
smalltalk.SendNode);

smalltalk.addMethod(
'_valueForReceiver_',
smalltalk.method({
selector: 'valueForReceiver:',
category: 'accessing',
fn: function (anObject){
var self=this;
return (function($rec){smalltalk.send($rec, "_receiver_", [smalltalk.send(smalltalk.send(self, "_receiver", []), "_ifNil_ifNotNil_", [(function(){return anObject;}), (function(){return smalltalk.send(smalltalk.send(self, "_receiver", []), "_valueForReceiver_", [anObject]);})])]);smalltalk.send($rec, "_selector_", [smalltalk.send(self, "_selector", [])]);smalltalk.send($rec, "_arguments_", [smalltalk.send(self, "_arguments", [])]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(smalltalk.SendNode, "_new", []));
return self;},
source: unescape('valueForReceiver%3A%20anObject%0A%09%5ESendNode%20new%0A%09%20%20%20%20receiver%3A%20%28self%20receiver%20%0A%09%09ifNil%3A%20%5BanObject%5D%0A%09%09ifNotNil%3A%20%5Bself%20receiver%20valueForReceiver%3A%20anObject%5D%29%3B%0A%09%20%20%20%20selector%3A%20self%20selector%3B%0A%09%20%20%20%20arguments%3A%20self%20arguments%3B%0A%09%20%20%20%20yourself%0A')}),
smalltalk.SendNode);

smalltalk.addMethod(
'_cascadeNodeWithMessages_',
smalltalk.method({
selector: 'cascadeNodeWithMessages:',
category: 'accessing',
fn: function (aCollection){
var self=this;
var first=nil;
first=(function($rec){smalltalk.send($rec, "_selector_", [smalltalk.send(self, "_selector", [])]);smalltalk.send($rec, "_arguments_", [smalltalk.send(self, "_arguments", [])]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(smalltalk.SendNode, "_new", []));
return (function($rec){smalltalk.send($rec, "_receiver_", [smalltalk.send(self, "_receiver", [])]);smalltalk.send($rec, "_nodes_", [smalltalk.send(smalltalk.send(smalltalk.Array, "_with_", [first]), "__comma", [aCollection])]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(smalltalk.CascadeNode, "_new", []));
return self;},
source: unescape('cascadeNodeWithMessages%3A%20aCollection%0A%09%7C%20first%20%7C%0A%09first%20%3A%3D%20SendNode%20new%0A%09%20%20%20%20selector%3A%20self%20selector%3B%0A%09%20%20%20%20arguments%3A%20self%20arguments%3B%0A%09%20%20%20%20yourself.%0A%09%5ECascadeNode%20new%0A%09%20%20%20%20receiver%3A%20self%20receiver%3B%0A%09%20%20%20%20nodes%3A%20%28Array%20with%3A%20first%29%2C%20aCollection%3B%0A%09%20%20%20%20yourself%0A')}),
smalltalk.SendNode);

smalltalk.addMethod(
'_accept_',
smalltalk.method({
selector: 'accept:',
category: 'visiting',
fn: function (aVisitor){
var self=this;
smalltalk.send(aVisitor, "_visitSendNode_", [self]);
return self;},
source: unescape('accept%3A%20aVisitor%0A%09aVisitor%20visitSendNode%3A%20self%0A')}),
smalltalk.SendNode);



smalltalk.addClass('CascadeNode', smalltalk.Node, ['receiver'], 'Compiler');
smalltalk.addMethod(
'_receiver',
smalltalk.method({
selector: 'receiver',
category: 'accessing',
fn: function (){
var self=this;
return self['@receiver'];
return self;},
source: unescape('receiver%0A%09%5Ereceiver%0A')}),
smalltalk.CascadeNode);

smalltalk.addMethod(
'_receiver_',
smalltalk.method({
selector: 'receiver:',
category: 'accessing',
fn: function (aNode){
var self=this;
self['@receiver']=aNode;
return self;},
source: unescape('receiver%3A%20aNode%0A%09receiver%20%3A%3D%20aNode%0A')}),
smalltalk.CascadeNode);

smalltalk.addMethod(
'_accept_',
smalltalk.method({
selector: 'accept:',
category: 'visiting',
fn: function (aVisitor){
var self=this;
smalltalk.send(aVisitor, "_visitCascadeNode_", [self]);
return self;},
source: unescape('accept%3A%20aVisitor%0A%09aVisitor%20visitCascadeNode%3A%20self%0A')}),
smalltalk.CascadeNode);



smalltalk.addClass('AssignmentNode', smalltalk.Node, ['left', 'right'], 'Compiler');
smalltalk.addMethod(
'_left',
smalltalk.method({
selector: 'left',
category: 'accessing',
fn: function (){
var self=this;
return self['@left'];
return self;},
source: unescape('left%0A%09%5Eleft%0A')}),
smalltalk.AssignmentNode);

smalltalk.addMethod(
'_left_',
smalltalk.method({
selector: 'left:',
category: 'accessing',
fn: function (aNode){
var self=this;
self['@left']=aNode;
return self;},
source: unescape('left%3A%20aNode%0A%09left%20%3A%3D%20aNode%0A')}),
smalltalk.AssignmentNode);

smalltalk.addMethod(
'_right',
smalltalk.method({
selector: 'right',
category: 'accessing',
fn: function (){
var self=this;
return self['@right'];
return self;},
source: unescape('right%0A%09%5Eright%0A')}),
smalltalk.AssignmentNode);

smalltalk.addMethod(
'_right_',
smalltalk.method({
selector: 'right:',
category: 'accessing',
fn: function (aNode){
var self=this;
self['@right']=aNode;
return self;},
source: unescape('right%3A%20aNode%0A%09right%20%3A%3D%20aNode%0A')}),
smalltalk.AssignmentNode);

smalltalk.addMethod(
'_accept_',
smalltalk.method({
selector: 'accept:',
category: 'visiting',
fn: function (aVisitor){
var self=this;
smalltalk.send(aVisitor, "_visitAssignmentNode_", [self]);
return self;},
source: unescape('accept%3A%20aVisitor%0A%09aVisitor%20visitAssignmentNode%3A%20self%0A')}),
smalltalk.AssignmentNode);



smalltalk.addClass('BlockNode', smalltalk.Node, ['parameters'], 'Compiler');
smalltalk.addMethod(
'_parameters',
smalltalk.method({
selector: 'parameters',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@parameters'], "_ifNil_", [(function(){return self['@parameters']=smalltalk.send(smalltalk.Array, "_new", []);})]);
return self;},
source: unescape('parameters%0A%09%5Eparameters%20ifNil%3A%20%5Bparameters%20%3A%3D%20Array%20new%5D%0A')}),
smalltalk.BlockNode);

smalltalk.addMethod(
'_parameters_',
smalltalk.method({
selector: 'parameters:',
category: 'accessing',
fn: function (aCollection){
var self=this;
self['@parameters']=aCollection;
return self;},
source: unescape('parameters%3A%20aCollection%0A%09parameters%20%3A%3D%20aCollection%0A')}),
smalltalk.BlockNode);

smalltalk.addMethod(
'_accept_',
smalltalk.method({
selector: 'accept:',
category: 'visiting',
fn: function (aVisitor){
var self=this;
smalltalk.send(aVisitor, "_visitBlockNode_", [self]);
return self;},
source: unescape('accept%3A%20aVisitor%0A%09aVisitor%20visitBlockNode%3A%20self%0A')}),
smalltalk.BlockNode);



smalltalk.addClass('SequenceNode', smalltalk.Node, ['temps'], 'Compiler');
smalltalk.addMethod(
'_temps',
smalltalk.method({
selector: 'temps',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@temps'], "_ifNil_", [(function(){return [];})]);
return self;},
source: unescape('temps%0A%09%5Etemps%20ifNil%3A%20%5B%23%28%29%5D%0A')}),
smalltalk.SequenceNode);

smalltalk.addMethod(
'_temps_',
smalltalk.method({
selector: 'temps:',
category: 'accessing',
fn: function (aCollection){
var self=this;
self['@temps']=aCollection;
return self;},
source: unescape('temps%3A%20aCollection%0A%09temps%20%3A%3D%20aCollection%0A')}),
smalltalk.SequenceNode);

smalltalk.addMethod(
'_asBlockSequenceNode',
smalltalk.method({
selector: 'asBlockSequenceNode',
category: 'testing',
fn: function (){
var self=this;
return (function($rec){smalltalk.send($rec, "_nodes_", [smalltalk.send(self, "_nodes", [])]);smalltalk.send($rec, "_temps_", [smalltalk.send(self, "_temps", [])]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(smalltalk.BlockSequenceNode, "_new", []));
return self;},
source: unescape('asBlockSequenceNode%0A%09%5EBlockSequenceNode%20new%0A%09%20%20%20%20nodes%3A%20self%20nodes%3B%0A%09%20%20%20%20temps%3A%20self%20temps%3B%0A%09%20%20%20%20yourself%0A')}),
smalltalk.SequenceNode);

smalltalk.addMethod(
'_accept_',
smalltalk.method({
selector: 'accept:',
category: 'visiting',
fn: function (aVisitor){
var self=this;
smalltalk.send(aVisitor, "_visitSequenceNode_", [self]);
return self;},
source: unescape('accept%3A%20aVisitor%0A%09aVisitor%20visitSequenceNode%3A%20self%0A')}),
smalltalk.SequenceNode);



smalltalk.addClass('BlockSequenceNode', smalltalk.SequenceNode, [], 'Compiler');
smalltalk.addMethod(
'_accept_',
smalltalk.method({
selector: 'accept:',
category: 'visiting',
fn: function (aVisitor){
var self=this;
smalltalk.send(aVisitor, "_visitBlockSequenceNode_", [self]);
return self;},
source: unescape('accept%3A%20aVisitor%0A%09aVisitor%20visitBlockSequenceNode%3A%20self%0A')}),
smalltalk.BlockSequenceNode);



smalltalk.addClass('ReturnNode', smalltalk.Node, [], 'Compiler');
smalltalk.addMethod(
'_accept_',
smalltalk.method({
selector: 'accept:',
category: 'visiting',
fn: function (aVisitor){
var self=this;
smalltalk.send(aVisitor, "_visitReturnNode_", [self]);
return self;},
source: unescape('accept%3A%20aVisitor%0A%09aVisitor%20visitReturnNode%3A%20self%0A')}),
smalltalk.ReturnNode);



smalltalk.addClass('ValueNode', smalltalk.Node, ['value'], 'Compiler');
smalltalk.addMethod(
'_value',
smalltalk.method({
selector: 'value',
category: 'accessing',
fn: function (){
var self=this;
return self['@value'];
return self;},
source: unescape('value%0A%09%5Evalue%0A')}),
smalltalk.ValueNode);

smalltalk.addMethod(
'_value_',
smalltalk.method({
selector: 'value:',
category: 'accessing',
fn: function (anObject){
var self=this;
self['@value']=anObject;
return self;},
source: unescape('value%3A%20anObject%0A%09value%20%3A%3D%20anObject%0A')}),
smalltalk.ValueNode);

smalltalk.addMethod(
'_accept_',
smalltalk.method({
selector: 'accept:',
category: 'visiting',
fn: function (aVisitor){
var self=this;
smalltalk.send(aVisitor, "_visitValueNode_", [self]);
return self;},
source: unescape('accept%3A%20aVisitor%0A%09aVisitor%20visitValueNode%3A%20self%0A')}),
smalltalk.ValueNode);



smalltalk.addClass('VariableNode', smalltalk.ValueNode, [], 'Compiler');
smalltalk.addMethod(
'_accept_',
smalltalk.method({
selector: 'accept:',
category: 'visiting',
fn: function (aVisitor){
var self=this;
smalltalk.send(aVisitor, "_visitVariableNode_", [self]);
return self;},
source: unescape('accept%3A%20aVisitor%0A%09aVisitor%20visitVariableNode%3A%20self%0A')}),
smalltalk.VariableNode);



smalltalk.addClass('ClassReferenceNode', smalltalk.VariableNode, [], 'Compiler');
smalltalk.addMethod(
'_accept_',
smalltalk.method({
selector: 'accept:',
category: 'visiting',
fn: function (aVisitor){
var self=this;
smalltalk.send(aVisitor, "_visitClassReferenceNode_", [self]);
return self;},
source: unescape('accept%3A%20aVisitor%0A%09aVisitor%20visitClassReferenceNode%3A%20self%0A')}),
smalltalk.ClassReferenceNode);



smalltalk.addClass('JSStatementNode', smalltalk.Node, ['source'], 'Compiler');
smalltalk.addMethod(
'_source',
smalltalk.method({
selector: 'source',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@source'], "_ifNil_", [(function(){return "";})]);
return self;},
source: unescape('source%0A%09%5Esource%20ifNil%3A%20%5B%27%27%5D%0A')}),
smalltalk.JSStatementNode);

smalltalk.addMethod(
'_source_',
smalltalk.method({
selector: 'source:',
category: 'accessing',
fn: function (aString){
var self=this;
self['@source']=aString;
return self;},
source: unescape('source%3A%20aString%0A%09source%20%3A%3D%20aString%0A')}),
smalltalk.JSStatementNode);

smalltalk.addMethod(
'_accept_',
smalltalk.method({
selector: 'accept:',
category: 'visiting',
fn: function (aVisitor){
var self=this;
smalltalk.send(aVisitor, "_visitJSStatementNode_", [self]);
return self;},
source: unescape('accept%3A%20aVisitor%0A%09aVisitor%20visitJSStatementNode%3A%20self%0A')}),
smalltalk.JSStatementNode);



smalltalk.addClass('NodeVisitor', smalltalk.Object, [], 'Compiler');
smalltalk.addMethod(
'_visit_',
smalltalk.method({
selector: 'visit:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(aNode, "_accept_", [self]);
return self;},
source: unescape('visit%3A%20aNode%0A%09aNode%20accept%3A%20self%0A')}),
smalltalk.NodeVisitor);

smalltalk.addMethod(
'_visitNode_',
smalltalk.method({
selector: 'visitNode:',
category: 'visiting',
fn: function (aNode){
var self=this;

return self;},
source: unescape('visitNode%3A%20aNode%0A')}),
smalltalk.NodeVisitor);

smalltalk.addMethod(
'_visitMethodNode_',
smalltalk.method({
selector: 'visitMethodNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(self, "_visitNode_", [aNode]);
return self;},
source: unescape('visitMethodNode%3A%20aNode%0A%09self%20visitNode%3A%20aNode%0A')}),
smalltalk.NodeVisitor);

smalltalk.addMethod(
'_visitSequenceNode_',
smalltalk.method({
selector: 'visitSequenceNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(self, "_visitNode_", [aNode]);
return self;},
source: unescape('visitSequenceNode%3A%20aNode%0A%09self%20visitNode%3A%20aNode%0A')}),
smalltalk.NodeVisitor);

smalltalk.addMethod(
'_visitBlockSequenceNode_',
smalltalk.method({
selector: 'visitBlockSequenceNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(self, "_visitSequenceNode_", [aNode]);
return self;},
source: unescape('visitBlockSequenceNode%3A%20aNode%0A%09self%20visitSequenceNode%3A%20aNode%0A')}),
smalltalk.NodeVisitor);

smalltalk.addMethod(
'_visitBlockNode_',
smalltalk.method({
selector: 'visitBlockNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(self, "_visitNode_", [aNode]);
return self;},
source: unescape('visitBlockNode%3A%20aNode%0A%09self%20visitNode%3A%20aNode%0A')}),
smalltalk.NodeVisitor);

smalltalk.addMethod(
'_visitReturnNode_',
smalltalk.method({
selector: 'visitReturnNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(self, "_visitNode_", [aNode]);
return self;},
source: unescape('visitReturnNode%3A%20aNode%0A%09self%20visitNode%3A%20aNode%0A')}),
smalltalk.NodeVisitor);

smalltalk.addMethod(
'_visitSendNode_',
smalltalk.method({
selector: 'visitSendNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(self, "_visitNode_", [aNode]);
return self;},
source: unescape('visitSendNode%3A%20aNode%0A%09self%20visitNode%3A%20aNode%0A')}),
smalltalk.NodeVisitor);

smalltalk.addMethod(
'_visitCascadeNode_',
smalltalk.method({
selector: 'visitCascadeNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(self, "_visitNode_", [aNode]);
return self;},
source: unescape('visitCascadeNode%3A%20aNode%0A%09self%20visitNode%3A%20aNode%0A')}),
smalltalk.NodeVisitor);

smalltalk.addMethod(
'_visitValueNode_',
smalltalk.method({
selector: 'visitValueNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(self, "_visitNode_", [aNode]);
return self;},
source: unescape('visitValueNode%3A%20aNode%0A%09self%20visitNode%3A%20aNode%0A')}),
smalltalk.NodeVisitor);

smalltalk.addMethod(
'_visitVariableNode_',
smalltalk.method({
selector: 'visitVariableNode:',
category: 'visiting',
fn: function (aNode){
var self=this;

return self;},
source: unescape('visitVariableNode%3A%20aNode%0A')}),
smalltalk.NodeVisitor);

smalltalk.addMethod(
'_visitAssignmentNode_',
smalltalk.method({
selector: 'visitAssignmentNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(self, "_visitNode_", [aNode]);
return self;},
source: unescape('visitAssignmentNode%3A%20aNode%0A%09self%20visitNode%3A%20aNode%0A')}),
smalltalk.NodeVisitor);

smalltalk.addMethod(
'_visitClassReferenceNode_',
smalltalk.method({
selector: 'visitClassReferenceNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
(function($rec){smalltalk.send($rec, "_nextPutAll_", ["smalltalk."]);return smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(aNode, "_value", [])]);})(self);
return self;},
source: unescape('visitClassReferenceNode%3A%20aNode%0A%09self%20%0A%09%20%20%20%20nextPutAll%3A%20%27smalltalk.%27%3B%0A%09%20%20%20%20nextPutAll%3A%20aNode%20value%0A')}),
smalltalk.NodeVisitor);

smalltalk.addMethod(
'_visitJSStatementNode_',
smalltalk.method({
selector: 'visitJSStatementNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
(function($rec){smalltalk.send($rec, "_nextPutAll_", [unescape("function%28%29%7B")]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(aNode, "_source", [])]);return smalltalk.send($rec, "_nextPutAll_", [unescape("%7D%29%28%29")]);})(self);
return self;},
source: unescape('visitJSStatementNode%3A%20aNode%0A%09self%20%0A%09%20%20%20%20nextPutAll%3A%20%27function%28%29%7B%27%3B%0A%09%20%20%20%20nextPutAll%3A%20aNode%20source%3B%0A%09%20%20%20%20nextPutAll%3A%20%27%7D%29%28%29%27%0A')}),
smalltalk.NodeVisitor);



smalltalk.addClass('Compiler', smalltalk.NodeVisitor, ['stream', 'nestedBlocks', 'earlyReturn', 'currentClass', 'currentSelector', 'unknownVariables', 'tempVariables'], 'Compiler');
smalltalk.addMethod(
'_initialize',
smalltalk.method({
selector: 'initialize',
category: 'initialization',
fn: function (){
var self=this;
self.klass.superclass.fn.prototype['_initialize'].apply(self, []);
self['@stream']=smalltalk.send("", "_writeStream", []);
self['@unknownVariables']=[];
self['@tempVariables']=[];
return self;},
source: unescape('initialize%0A%09super%20initialize.%0A%09stream%20%3A%3D%20%27%27%20writeStream.%0A%09unknownVariables%20%3A%3D%20%23%28%29.%0A%09tempVariables%20%3A%3D%20%23%28%29%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_parser',
smalltalk.method({
selector: 'parser',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(smalltalk.SmalltalkParser, "_new", []);
return self;},
source: unescape('parser%0A%09%5ESmalltalkParser%20new%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_currentClass',
smalltalk.method({
selector: 'currentClass',
category: 'accessing',
fn: function (){
var self=this;
return self['@currentClass'];
return self;},
source: unescape('currentClass%0A%09%5EcurrentClass%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_currentClass_',
smalltalk.method({
selector: 'currentClass:',
category: 'accessing',
fn: function (aClass){
var self=this;
self['@currentClass']=aClass;
return self;},
source: unescape('currentClass%3A%20aClass%0A%09currentClass%20%3A%3D%20aClass%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_loadExpression_',
smalltalk.method({
selector: 'loadExpression:',
category: 'compiling',
fn: function (aString){
var self=this;
smalltalk.send(smalltalk.DoIt, "_addCompiledMethod_", [smalltalk.send(self, "_eval_", [smalltalk.send(self, "_compileExpression_", [aString])])]);
return smalltalk.send(smalltalk.send(smalltalk.DoIt, "_new", []), "_doIt", []);
return self;},
source: unescape('loadExpression%3A%20aString%0A%09DoIt%20addCompiledMethod%3A%20%28self%20eval%3A%20%28self%20compileExpression%3A%20aString%29%29.%0A%09%5EDoIt%20new%20doIt%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_load_forClass_',
smalltalk.method({
selector: 'load:forClass:',
category: 'compiling',
fn: function (aString, aClass){
var self=this;
return smalltalk.send(self, "_eval_", [smalltalk.send(self, "_compile_forClass_", [aString, aClass])]);
return self;},
source: unescape('load%3A%20aString%20forClass%3A%20aClass%0A%09%5Eself%20eval%3A%20%28self%20compile%3A%20aString%20forClass%3A%20aClass%29%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_compile_forClass_',
smalltalk.method({
selector: 'compile:forClass:',
category: 'compiling',
fn: function (aString, aClass){
var self=this;
smalltalk.send(self, "_currentClass_", [aClass]);
return smalltalk.send(self, "_compile_", [aString]);
return self;},
source: unescape('compile%3A%20aString%20forClass%3A%20aClass%0A%09self%20currentClass%3A%20aClass.%0A%09%5Eself%20compile%3A%20aString%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_compileExpression_',
smalltalk.method({
selector: 'compileExpression:',
category: 'compiling',
fn: function (aString){
var self=this;
smalltalk.send(self, "_currentClass_", [smalltalk.DoIt]);
return smalltalk.send(self, "_compileNode_", [smalltalk.send(self, "_parseExpression_", [aString])]);
return self;},
source: unescape('compileExpression%3A%20aString%0A%09self%20currentClass%3A%20DoIt.%0A%09%5Eself%20compileNode%3A%20%28self%20parseExpression%3A%20aString%29%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_eval_',
smalltalk.method({
selector: 'eval:',
category: 'compiling',
fn: function (aString){
var self=this;
return eval(aString);
return self;},
source: unescape('eval%3A%20aString%0A%09%7B%27return%20eval%28aString%29%27%7D')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_compile_',
smalltalk.method({
selector: 'compile:',
category: 'compiling',
fn: function (aString){
var self=this;
return smalltalk.send(self, "_compileNode_", [smalltalk.send(self, "_parse_", [aString])]);
return self;},
source: unescape('compile%3A%20aString%0A%09%5Eself%20compileNode%3A%20%28self%20parse%3A%20aString%29%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_compileNode_',
smalltalk.method({
selector: 'compileNode:',
category: 'compiling',
fn: function (aNode){
var self=this;
self['@stream']=smalltalk.send("", "_writeStream", []);
smalltalk.send(self, "_visit_", [aNode]);
return smalltalk.send(self['@stream'], "_contents", []);
return self;},
source: unescape('compileNode%3A%20aNode%0A%09stream%20%3A%3D%20%27%27%20writeStream.%0A%09self%20visit%3A%20aNode.%0A%09%5Estream%20contents%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_visit_',
smalltalk.method({
selector: 'visit:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(aNode, "_accept_", [self]);
return self;},
source: unescape('visit%3A%20aNode%0A%09aNode%20accept%3A%20self%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_visitMethodNode_',
smalltalk.method({
selector: 'visitMethodNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
var str=nil;
var currentSelector=nil;
self['@currentSelector']=smalltalk.send(smalltalk.send(aNode, "_selector", []), "_asSelector", []);
self['@nestedBlocks']=(0);
self['@earlyReturn']=false;
self['@unknownVariables']=[];
self['@tempVariables']=[];
(function($rec){smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(unescape("smalltalk.method%28%7B"), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])])]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(smalltalk.send(smalltalk.send(unescape("selector%3A%20%22"), "__comma", [smalltalk.send(aNode, "_selector", [])]), "__comma", [unescape("%22%2C")]), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])])]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(smalltalk.send(smalltalk.send(unescape("source%3A%20unescape%28%22"), "__comma", [smalltalk.send(smalltalk.send(aNode, "_source", []), "_escaped", [])]), "__comma", [unescape("%22%29%2C")]), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])])]);return smalltalk.send($rec, "_nextPutAll_", [unescape("fn%3A%20function%28")]);})(self['@stream']);
smalltalk.send(smalltalk.send(aNode, "_arguments", []), "_do_separatedBy_", [(function(each){smalltalk.send(self['@tempVariables'], "_add_", [each]);return smalltalk.send(self['@stream'], "_nextPutAll_", [each]);}), (function(){return smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("%2C%20")]);})]);
(function($rec){smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(unescape("%29%7B"), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])])]);return smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(unescape("var%20self%3Dthis%3B"), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])])]);})(self['@stream']);
str=self['@stream'];
self['@stream']=smalltalk.send("", "_writeStream", []);
smalltalk.send(smalltalk.send(aNode, "_nodes", []), "_do_", [(function(each){return smalltalk.send(self, "_visit_", [each]);})]);
smalltalk.send(self['@earlyReturn'], "_ifTrue_", [(function(){return smalltalk.send(str, "_nextPutAll_", [unescape("try%7B")]);})]);
smalltalk.send(str, "_nextPutAll_", [smalltalk.send(self['@stream'], "_contents", [])]);
self['@stream']=str;
(function($rec){smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(smalltalk.String, "_cr", [])]);return smalltalk.send($rec, "_nextPutAll_", [unescape("return%20self%3B")]);})(self['@stream']);
smalltalk.send(self['@earlyReturn'], "_ifTrue_", [(function(){return smalltalk.send(self['@stream'], "_nextPutAll_", [smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.String, "_cr", []), "__comma", [unescape("%7D%20catch%28e%29%20%7Bif%28e.name%20%3D%3D%3D%20%27stReturn%27%20%26%26%20e.selector%20%3D%3D%3D%20")]), "__comma", [smalltalk.send(self['@currentSelector'], "_printString", [])]), "__comma", [unescape("%29%7Breturn%20e.fn%28%29%7D%20throw%28e%29%7D")])]);})]);
(function($rec){smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(unescape("%7D"), "__comma", [smalltalk.send(smalltalk.String, "_cr", [])])]);return smalltalk.send($rec, "_nextPutAll_", [unescape("%7D%29")]);})(self['@stream']);
return self;},
source: unescape('visitMethodNode%3A%20aNode%0A%09%7C%20str%20currentSelector%20%7C%0A%09currentSelector%20%3A%3D%20aNode%20selector%20asSelector.%0A%09nestedBlocks%20%3A%3D%200.%0A%09earlyReturn%20%3A%3D%20false.%0A%09unknownVariables%20%3A%3D%20%23%28%29.%0A%09tempVariables%20%3A%3D%20%23%28%29.%0A%09stream%20%0A%09%20%20%20%20nextPutAll%3A%20%27smalltalk.method%28%7B%27%2C%20String%20cr%3B%0A%09%20%20%20%20nextPutAll%3A%20%27selector%3A%20%22%27%2C%20aNode%20selector%2C%20%27%22%2C%27%2C%20String%20cr%3B%0A%09%20%20%20%20nextPutAll%3A%20%27source%3A%20unescape%28%22%27%2C%20aNode%20source%20escaped%2C%20%27%22%29%2C%27%2C%20String%20cr%3B%0A%09%20%20%20%20nextPutAll%3A%20%27fn%3A%20function%28%27.%0A%09aNode%20arguments%20%0A%09%20%20%20%20do%3A%20%5B%3Aeach%20%7C%20%0A%09%09tempVariables%20add%3A%20each.%0A%09%09stream%20nextPutAll%3A%20each%5D%0A%09%20%20%20%20separatedBy%3A%20%5Bstream%20nextPutAll%3A%20%27%2C%20%27%5D.%0A%09stream%20%0A%09%20%20%20%20nextPutAll%3A%20%27%29%7B%27%2C%20String%20cr%3B%0A%09%20%20%20%20nextPutAll%3A%20%27var%20self%3Dthis%3B%27%2C%20String%20cr.%0A%09str%20%3A%3D%20stream.%0A%09stream%20%3A%3D%20%27%27%20writeStream.%0A%09aNode%20nodes%20do%3A%20%5B%3Aeach%20%7C%0A%09%20%20%20%20self%20visit%3A%20each%5D.%0A%09earlyReturn%20ifTrue%3A%20%5B%0A%09%20%20%20%20str%20nextPutAll%3A%20%27try%7B%27%5D.%0A%09str%20nextPutAll%3A%20stream%20contents.%0A%09stream%20%3A%3D%20str.%0A%09stream%20%0A%09%20%20%20%20nextPutAll%3A%20String%20cr%3B%20%0A%09%20%20%20%20nextPutAll%3A%20%27return%20self%3B%27.%0A%09earlyReturn%20ifTrue%3A%20%5B%0A%09%20%20%20%20stream%20nextPutAll%3A%20String%20cr%2C%20%27%7D%20catch%28e%29%20%7Bif%28e.name%20%3D%3D%3D%20%27%27stReturn%27%27%20%26%26%20e.selector%20%3D%3D%3D%20%27%2C%20currentSelector%20printString%2C%20%27%29%7Breturn%20e.fn%28%29%7D%20throw%28e%29%7D%27%5D.%0A%09stream%20%0A%09%20%20%20%20nextPutAll%3A%20%27%7D%27%2C%20String%20cr%3B%0A%09%20%20%20%20nextPutAll%3A%20%27%7D%29%27%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_visitBlockNode_',
smalltalk.method({
selector: 'visitBlockNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("%28function%28")]);
smalltalk.send(smalltalk.send(aNode, "_parameters", []), "_do_separatedBy_", [(function(each){smalltalk.send(self['@tempVariables'], "_add_", [each]);return smalltalk.send(self['@stream'], "_nextPutAll_", [each]);}), (function(){return smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("%2C%20")]);})]);
smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("%29%7B")]);
smalltalk.send(smalltalk.send(aNode, "_nodes", []), "_do_", [(function(each){return smalltalk.send(self, "_visit_", [each]);})]);
smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("%7D%29")]);
return self;},
source: unescape('visitBlockNode%3A%20aNode%0A%09stream%20nextPutAll%3A%20%27%28function%28%27.%0A%09aNode%20parameters%20%0A%09%20%20%20%20do%3A%20%5B%3Aeach%20%7C%0A%09%09tempVariables%20add%3A%20each.%0A%09%09stream%20nextPutAll%3A%20each%5D%0A%09%20%20%20%20separatedBy%3A%20%5Bstream%20nextPutAll%3A%20%27%2C%20%27%5D.%0A%09stream%20nextPutAll%3A%20%27%29%7B%27.%0A%09aNode%20nodes%20do%3A%20%5B%3Aeach%20%7C%20self%20visit%3A%20each%5D.%0A%09stream%20nextPutAll%3A%20%27%7D%29%27%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_visitSequenceNode_',
smalltalk.method({
selector: 'visitSequenceNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(smalltalk.send(aNode, "_temps", []), "_do_", [(function(each){smalltalk.send(self['@tempVariables'], "_add_", [each]);smalltalk.send(self['@stream'], "_nextPutAll_", [smalltalk.send(smalltalk.send("var ", "__comma", [each]), "__comma", [unescape("%3Dnil%3B")])]);return smalltalk.send(self['@stream'], "_nextPutAll_", [smalltalk.send(smalltalk.String, "_cr", [])]);})]);
smalltalk.send(smalltalk.send(aNode, "_nodes", []), "_do_separatedBy_", [(function(each){smalltalk.send(self, "_visit_", [each]);return smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("%3B")]);}), (function(){return smalltalk.send(self['@stream'], "_nextPutAll_", [smalltalk.send(smalltalk.String, "_cr", [])]);})]);
return self;},
source: unescape('visitSequenceNode%3A%20aNode%0A%09aNode%20temps%20do%3A%20%5B%3Aeach%20%7C%0A%09%20%20%20%20tempVariables%20add%3A%20each.%0A%09%20%20%20%20stream%20nextPutAll%3A%20%27var%20%27%2C%20each%2C%20%27%3Dnil%3B%27.%0A%09%20%20%20%20stream%20nextPutAll%3A%20String%20cr%5D.%0A%09aNode%20nodes%20do%3A%20%5B%3Aeach%20%7C%0A%09%20%20%20%20self%20visit%3A%20each.%0A%09%20%20%20%20stream%20nextPutAll%3A%20%27%3B%27%5D%0A%09%20%20%20%20separatedBy%3A%20%5Bstream%20nextPutAll%3A%20String%20cr%5D%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_visitBlockSequenceNode_',
smalltalk.method({
selector: 'visitBlockSequenceNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
var index=nil;
self['@nestedBlocks']=smalltalk.send(self['@nestedBlocks'], "__plus", [(1)]);
smalltalk.send(smalltalk.send(smalltalk.send(aNode, "_nodes", []), "_isEmpty", []), "_ifTrue_ifFalse_", [(function(){return smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("return%20nil%3B")]);}), (function(){smalltalk.send(smalltalk.send(aNode, "_temps", []), "_do_", [(function(each){smalltalk.send(self['@tempVariables'], "_add_", [each]);smalltalk.send(self['@stream'], "_nextPutAll_", [smalltalk.send(smalltalk.send("var ", "__comma", [each]), "__comma", [unescape("%3Dnil%3B")])]);return smalltalk.send(self['@stream'], "_nextPutAll_", [smalltalk.send(smalltalk.String, "_cr", [])]);})]);index=(0);return smalltalk.send(smalltalk.send(aNode, "_nodes", []), "_do_", [(function(each){index=smalltalk.send(index, "__plus", [(1)]);smalltalk.send(smalltalk.send(index, "__eq", [smalltalk.send(smalltalk.send(aNode, "_nodes", []), "_size", [])]), "_ifTrue_", [(function(){return smalltalk.send(self['@stream'], "_nextPutAll_", ["return "]);})]);smalltalk.send(self, "_visit_", [each]);return smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("%3B")]);})]);})]);
self['@nestedBlocks']=smalltalk.send(self['@nestedBlocks'], "__minus", [(1)]);
return self;},
source: unescape('visitBlockSequenceNode%3A%20aNode%0A%09%7C%20index%20%7C%0A%09nestedBlocks%20%3A%3D%20nestedBlocks%20+%201.%0A%09aNode%20nodes%20isEmpty%0A%09%20%20%20%20ifTrue%3A%20%5B%0A%09%09stream%20nextPutAll%3A%20%27return%20nil%3B%27%5D%0A%09%20%20%20%20ifFalse%3A%20%5B%0A%09%09aNode%20temps%20do%3A%20%5B%3Aeach%20%7C%0A%09%09%20%20%20%20tempVariables%20add%3A%20each.%0A%09%09%20%20%20%20stream%20nextPutAll%3A%20%27var%20%27%2C%20each%2C%20%27%3Dnil%3B%27.%0A%09%09%20%20%20%20stream%20nextPutAll%3A%20String%20cr%5D.%0A%09%09index%20%3A%3D%200.%0A%09%09aNode%20nodes%20do%3A%20%5B%3Aeach%20%7C%0A%09%09%20%20%20%20index%20%3A%3D%20index%20+%201.%0A%09%09%20%20%20%20index%20%3D%20aNode%20nodes%20size%20ifTrue%3A%20%5B%0A%09%09%09stream%20nextPutAll%3A%20%27return%20%27%5D.%0A%09%09%20%20%20%20self%20visit%3A%20each.%0A%09%09%20%20%20%20stream%20nextPutAll%3A%20%27%3B%27%5D%5D.%0A%09nestedBlocks%20%3A%3D%20nestedBlocks%20-%201%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_visitReturnNode_',
smalltalk.method({
selector: 'visitReturnNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(smalltalk.send(self['@nestedBlocks'], "__gt", [(0)]), "_ifTrue_", [(function(){return self['@earlyReturn']=true;})]);
smalltalk.send(self['@earlyReturn'], "_ifTrue_ifFalse_", [(function(){return (function($rec){smalltalk.send($rec, "_nextPutAll_", [unescape("%28function%28%29%7Bthrow%28")]);smalltalk.send($rec, "_nextPutAll_", [unescape("%7Bname%3A%20%27stReturn%27%2C%20selector%3A%20")]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(self['@currentSelector'], "_printString", [])]);return smalltalk.send($rec, "_nextPutAll_", [unescape("%2C%20fn%3A%20function%28%29%7Breturn%20")]);})(self['@stream']);}), (function(){return smalltalk.send(self['@stream'], "_nextPutAll_", ["return "]);})]);
smalltalk.send(smalltalk.send(aNode, "_nodes", []), "_do_", [(function(each){return smalltalk.send(self, "_visit_", [each]);})]);
smalltalk.send(self['@earlyReturn'], "_ifTrue_", [(function(){return smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("%7D%7D%29%7D%29%28%29")]);})]);
return self;},
source: unescape('visitReturnNode%3A%20aNode%0A%09nestedBlocks%20%3E%200%20ifTrue%3A%20%5B%0A%09%20%20%20%20earlyReturn%20%3A%3D%20true%5D.%0A%09earlyReturn%0A%09%20%20%20%20ifTrue%3A%20%5B%0A%09%09stream%0A%09%09%20%20%20%20nextPutAll%3A%20%27%28function%28%29%7Bthrow%28%27%3B%0A%09%09%20%20%20%20nextPutAll%3A%20%27%7Bname%3A%20%27%27stReturn%27%27%2C%20selector%3A%20%27%3B%0A%09%09%20%20%20%20nextPutAll%3A%20currentSelector%20printString%3B%0A%09%09%20%20%20%20nextPutAll%3A%20%27%2C%20fn%3A%20function%28%29%7Breturn%20%27%5D%0A%09%20%20%20%20ifFalse%3A%20%5Bstream%20nextPutAll%3A%20%27return%20%27%5D.%0A%09aNode%20nodes%20do%3A%20%5B%3Aeach%20%7C%0A%09%20%20%20%20self%20visit%3A%20each%5D.%0A%09earlyReturn%20ifTrue%3A%20%5B%0A%09%20%20%20%20stream%20nextPutAll%3A%20%27%7D%7D%29%7D%29%28%29%27%5D%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_visitSendNode_',
smalltalk.method({
selector: 'visitSendNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
var str=nil;
str=self['@stream'];
self['@stream']=smalltalk.send("", "_writeStream", []);
smalltalk.send(self, "_visit_", [smalltalk.send(aNode, "_receiver", [])]);
smalltalk.send(smalltalk.send(smalltalk.send(self['@stream'], "_contents", []), "__eq", ["super"]), "_ifTrue_ifFalse_", [(function(){self['@stream']=str;(function($rec){smalltalk.send($rec, "_nextPutAll_", [unescape("self.klass.superclass.fn.prototype%5B%27")]);smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(smalltalk.send(aNode, "_selector", []), "_asSelector", [])]);return smalltalk.send($rec, "_nextPutAll_", [unescape("%27%5D.apply%28self%2C%20%5B")]);})(self['@stream']);smalltalk.send(smalltalk.send(aNode, "_arguments", []), "_do_separatedBy_", [(function(each){return smalltalk.send(self, "_visit_", [each]);}), (function(){return smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("%2C")]);})]);return smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("%5D%29")]);}), (function(){smalltalk.send(str, "_nextPutAll_", [unescape("smalltalk.send%28")]);smalltalk.send(str, "_nextPutAll_", [smalltalk.send(self['@stream'], "_contents", [])]);self['@stream']=str;smalltalk.send(self['@stream'], "_nextPutAll_", [smalltalk.send(smalltalk.send(unescape("%2C%20%22"), "__comma", [smalltalk.send(smalltalk.send(aNode, "_selector", []), "_asSelector", [])]), "__comma", [unescape("%22%2C%20%5B")])]);smalltalk.send(smalltalk.send(aNode, "_arguments", []), "_do_separatedBy_", [(function(each){return smalltalk.send(self, "_visit_", [each]);}), (function(){return smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("%2C%20")]);})]);return smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("%5D%29")]);})]);
return self;},
source: unescape('visitSendNode%3A%20aNode%0A%09%7C%20str%20%7C%0A%09str%20%3A%3D%20stream.%0A%09stream%20%3A%3D%20%27%27%20writeStream.%0A%09self%20visit%3A%20aNode%20receiver.%0A%09stream%20contents%20%3D%20%27super%27%20%0A%09%20%20%20%20ifTrue%3A%20%5B%0A%09%09stream%20%3A%3D%20str.%0A%09%09stream%20%0A%09%09%20%20%20%20nextPutAll%3A%20%27self.klass.superclass.fn.prototype%5B%27%27%27%3B%0A%09%09%20%20%20%20nextPutAll%3A%20aNode%20selector%20asSelector%3B%0A%09%09%20%20%20%20nextPutAll%3A%20%27%27%27%5D.apply%28self%2C%20%5B%27.%0A%09%09aNode%20arguments%20%0A%09%09%20%20%20%20do%3A%20%5B%3Aeach%20%7C%20self%20visit%3A%20each%5D%0A%09%09%20%20%20%20separatedBy%3A%20%5Bstream%20nextPutAll%3A%20%27%2C%27%5D.%0A%09%09stream%20nextPutAll%3A%20%27%5D%29%27%5D%0A%09%20%20%20%20ifFalse%3A%20%5B%0A%09%09str%20nextPutAll%3A%20%27smalltalk.send%28%27.%0A%09%09str%20nextPutAll%3A%20stream%20contents.%0A%09%09stream%20%3A%3D%20str.%0A%09%09stream%20nextPutAll%3A%20%27%2C%20%22%27%2C%20aNode%20selector%20asSelector%2C%20%27%22%2C%20%5B%27.%0A%09%09aNode%20arguments%20%0A%09%09%20%20%20%20do%3A%20%5B%3Aeach%20%7C%20self%20visit%3A%20each%5D%0A%09%09%20%20%20%20separatedBy%3A%20%5Bstream%20nextPutAll%3A%20%27%2C%20%27%5D.%0A%09%09stream%20nextPutAll%3A%20%27%5D%29%27%5D')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_visitCascadeNode_',
smalltalk.method({
selector: 'visitCascadeNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
var index=nil;
index=(0);
smalltalk.send(smalltalk.send(self['@tempVariables'], "_includes_", ["$rec"]), "_ifFalse_", [(function(){return smalltalk.send(self['@tempVariables'], "_add_", ["$rec"]);})]);
smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("%28function%28%24rec%29%7B")]);
smalltalk.send(smalltalk.send(aNode, "_nodes", []), "_do_", [(function(each){index=smalltalk.send(index, "__plus", [(1)]);smalltalk.send(smalltalk.send(index, "__eq", [smalltalk.send(smalltalk.send(aNode, "_nodes", []), "_size", [])]), "_ifTrue_", [(function(){return smalltalk.send(self['@stream'], "_nextPutAll_", ["return "]);})]);smalltalk.send(each, "_receiver_", [smalltalk.send(smalltalk.send(smalltalk.VariableNode, "_new", []), "_value_", ["$rec"])]);smalltalk.send(self, "_visit_", [each]);return smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("%3B")]);})]);
smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("%7D%29%28")]);
smalltalk.send(self, "_visit_", [smalltalk.send(aNode, "_receiver", [])]);
smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("%29")]);
return self;},
source: unescape('visitCascadeNode%3A%20aNode%0A%09%7C%20index%20%7C%0A%09index%20%3A%3D%200.%0A%09%28tempVariables%20includes%3A%20%27%24rec%27%29%20ifFalse%3A%20%5B%0A%09%09tempVariables%20add%3A%20%27%24rec%27%5D.%0A%09stream%20nextPutAll%3A%20%27%28function%28%24rec%29%7B%27.%0A%09aNode%20nodes%20do%3A%20%5B%3Aeach%20%7C%0A%09%20%20%20%20index%20%3A%3D%20index%20+%201.%0A%09%20%20%20%20index%20%3D%20aNode%20nodes%20size%20ifTrue%3A%20%5B%0A%09%09stream%20nextPutAll%3A%20%27return%20%27%5D.%0A%09%20%20%20%20each%20receiver%3A%20%28VariableNode%20new%20value%3A%20%27%24rec%27%29.%0A%09%20%20%20%20self%20visit%3A%20each.%0A%09%20%20%20%20stream%20nextPutAll%3A%20%27%3B%27%5D.%0A%09stream%20nextPutAll%3A%20%27%7D%29%28%27.%0A%09self%20visit%3A%20aNode%20receiver.%0A%09stream%20nextPutAll%3A%20%27%29%27%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_visitValueNode_',
smalltalk.method({
selector: 'visitValueNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(self['@stream'], "_nextPutAll_", [smalltalk.send(smalltalk.send(aNode, "_value", []), "_asJavascript", [])]);
return self;},
source: unescape('visitValueNode%3A%20aNode%0A%09stream%20nextPutAll%3A%20aNode%20value%20asJavascript%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_visitAssignmentNode_',
smalltalk.method({
selector: 'visitAssignmentNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(self, "_visit_", [smalltalk.send(aNode, "_left", [])]);
smalltalk.send(self['@stream'], "_nextPutAll_", [unescape("%3D")]);
smalltalk.send(self, "_visit_", [smalltalk.send(aNode, "_right", [])]);
return self;},
source: unescape('visitAssignmentNode%3A%20aNode%0A%09self%20visit%3A%20aNode%20left.%0A%09stream%20nextPutAll%3A%20%27%3D%27.%0A%09self%20visit%3A%20aNode%20right%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_visitClassReferenceNode_',
smalltalk.method({
selector: 'visitClassReferenceNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
(function($rec){smalltalk.send($rec, "_nextPutAll_", ["smalltalk."]);return smalltalk.send($rec, "_nextPutAll_", [smalltalk.send(aNode, "_value", [])]);})(self['@stream']);
return self;},
source: unescape('visitClassReferenceNode%3A%20aNode%0A%09stream%0A%09%20%20%20%20nextPutAll%3A%20%27smalltalk.%27%3B%0A%09%20%20%20%20nextPutAll%3A%20aNode%20value%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_visitVariableNode_',
smalltalk.method({
selector: 'visitVariableNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(self, "_currentClass", []), "_instanceVariableNames", []), "_includes_", [smalltalk.send(aNode, "_value", [])]), "_ifTrue_ifFalse_", [(function(){return smalltalk.send(self['@stream'], "_nextPutAll_", [smalltalk.send(smalltalk.send(unescape("self%5B%27@"), "__comma", [smalltalk.send(aNode, "_value", [])]), "__comma", [unescape("%27%5D")])]);}), (function(){smalltalk.send(smalltalk.send(smalltalk.send(self, "_knownVariables", []), "_includes_", [smalltalk.send(aNode, "_value", [])]), "_ifFalse_", [(function(){return smalltalk.send(self['@unknownVariables'], "_add_", [smalltalk.send(aNode, "_value", [])]);})]);return smalltalk.send(self['@stream'], "_nextPutAll_", [smalltalk.send(aNode, "_value", [])]);})]);
return self;},
source: unescape('visitVariableNode%3A%20aNode%0A%09%28self%20currentClass%20instanceVariableNames%20includes%3A%20aNode%20value%29%20%0A%09%09ifTrue%3A%20%5Bstream%20nextPutAll%3A%20%27self%5B%27%27@%27%2C%20aNode%20value%2C%20%27%27%27%5D%27%5D%0A%09%09ifFalse%3A%20%5B%0A%09%09%09%28self%20knownVariables%20includes%3A%20aNode%20value%29%20ifFalse%3A%20%5B%0A%09%09%09%09unknownVariables%20add%3A%20aNode%20value%5D.%0A%09%09%09stream%20nextPutAll%3A%20aNode%20value%5D%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_visitJSStatementNode_',
smalltalk.method({
selector: 'visitJSStatementNode:',
category: 'visiting',
fn: function (aNode){
var self=this;
smalltalk.send(self['@stream'], "_nextPutAll_", [smalltalk.send(smalltalk.send(smalltalk.send(aNode, "_source", []), "_value", []), "_replace_with_", [unescape("%27%27"), unescape("%27")])]);
return self;},
source: unescape('visitJSStatementNode%3A%20aNode%0A%09stream%20nextPutAll%3A%20%28aNode%20source%20value%20replace%3A%20%27%27%27%27%27%27%20with%3A%20%27%27%27%27%29')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_parse_',
smalltalk.method({
selector: 'parse:',
category: 'compiling',
fn: function (aString){
var self=this;
return smalltalk.send(smalltalk.send(self, "_parser", []), "_parse_", [smalltalk.send(aString, "_readStream", [])]);
return self;},
source: unescape('parse%3A%20aString%0A%20%20%20%20%5Eself%20parser%20parse%3A%20aString%20readStream%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_parseExpression_',
smalltalk.method({
selector: 'parseExpression:',
category: 'compiling',
fn: function (aString){
var self=this;
return smalltalk.send(self, "_parse_", [smalltalk.send(smalltalk.send(unescape("doIt%20%5E%5B"), "__comma", [aString]), "__comma", [unescape("%5D%20value")])]);
return self;},
source: unescape('parseExpression%3A%20aString%0A%20%20%20%20%5Eself%20parse%3A%20%27doIt%20%5E%5B%27%2C%20aString%2C%20%27%5D%20value%27%0A')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_unknownVariables',
smalltalk.method({
selector: 'unknownVariables',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@unknownVariables'], "_copy", []);
return self;},
source: unescape('unknownVariables%0A%09%5EunknownVariables%20copy')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_pseudoVariables',
smalltalk.method({
selector: 'pseudoVariables',
category: 'accessing',
fn: function (){
var self=this;
return ["self", "super", "true", "false", "nil", "thisContext"];
return self;},
source: unescape('pseudoVariables%0A%09%5E%23%28%27self%27%20%27super%27%20%27true%27%20%27false%27%20%27nil%27%20%27thisContext%27%29')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_tempVariables',
smalltalk.method({
selector: 'tempVariables',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@tempVariables'], "_copy", []);
return self;},
source: unescape('tempVariables%0A%09%5EtempVariables%20copy')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_knownVariables',
smalltalk.method({
selector: 'knownVariables',
category: 'accessing',
fn: function (){
var self=this;
return (function($rec){smalltalk.send($rec, "_addAll_", [smalltalk.send(self, "_tempVariables", [])]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(self, "_pseudoVariables", []));
return self;},
source: unescape('knownVariables%0A%09%5Eself%20pseudoVariables%20%0A%09%09addAll%3A%20self%20tempVariables%3B%0A%09%09yourself')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_recompile_',
smalltalk.method({
selector: 'recompile:',
category: 'compiling',
fn: function (aClass){
var self=this;
smalltalk.send(smalltalk.send(aClass, "_methodDictionary", []), "_do_", [(function(each){var method=nil;
method=smalltalk.send(self, "_load_forClass_", [smalltalk.send(each, "_source", []), aClass]);smalltalk.send(method, "_category_", [smalltalk.send(each, "_category", [])]);return smalltalk.send(aClass, "_addCompiledMethod_", [method]);})]);
smalltalk.send(smalltalk.send(aClass, "_isMetaclass", []), "_ifFalse_", [(function(){return smalltalk.send(self, "_recompile_", [smalltalk.send(aClass, "_class", [])]);})]);
return self;},
source: unescape('recompile%3A%20aClass%0A%09aClass%20methodDictionary%20do%3A%20%5B%3Aeach%20%7C%7C%20method%20%7C%0A%09%09method%20%3A%3D%20self%20load%3A%20each%20source%20forClass%3A%20aClass.%0A%09%09method%20category%3A%20each%20category.%0A%09%09aClass%20addCompiledMethod%3A%20method%5D.%0A%09aClass%20isMetaclass%20ifFalse%3A%20%5Bself%20recompile%3A%20aClass%20class%5D')}),
smalltalk.Compiler);

smalltalk.addMethod(
'_recompileAll',
smalltalk.method({
selector: 'recompileAll',
category: 'compiling',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.Smalltalk, "_current", []), "_classes", []), "_do_", [(function(each){return smalltalk.send(self, "_recompile_", [each]);})]);
return self;},
source: unescape('recompileAll%0A%09Smalltalk%20current%20classes%20do%3A%20%5B%3Aeach%20%7C%0A%09%09self%20recompile%3A%20each%5D')}),
smalltalk.Compiler);



smalltalk.addClass('DoIt', smalltalk.Object, [], 'Compiler');
smalltalk.addMethod(
'_doIt',
smalltalk.method({
selector: 'doIt',
category: '',
fn: function (){
var self=this;
return smalltalk.send((function(){return smalltalk.send(smalltalk.send(smalltalk.Compiler, "_new", []), "_recompileAll", []);}), "_value", []);
return self;},
source: unescape('doIt%20%5E%5BCompiler%20new%20recompileAll%5D%20value')}),
smalltalk.DoIt);



smalltalk.addClass('JQuery', smalltalk.Object, ['jquery'], 'JQuery');
smalltalk.addMethod(
'_removeAttribute_',
smalltalk.method({
selector: 'removeAttribute:',
category: 'attributes',
fn: function (aString){
var self=this;
return smalltalk.send(self, "_call_withArgument_", ["removeAttribute", aString]);
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
return smalltalk.send(self, "_call_withArgument_", ["attr", aString]);
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
return smalltalk.send(self, "_call_", ["val"]);
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
smalltalk.send(self, "_call_withArgument_", ["val", aString]);
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
return self['@jquery'].css(aString);
return self;},
source: unescape('cssAt%3A%20aString%0A%09%7B%27return%20self%5B%27%27@jquery%27%27%5D.css%28aString%29%27%7D')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_cssAt_put_',
smalltalk.method({
selector: 'cssAt:put:',
category: 'css',
fn: function (aString, anotherString){
var self=this;
self['@jquery'].css(aString, anotherString);
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
smalltalk.send(self, "_call_withArgument_", ["addClass", aString]);
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
smalltalk.send(self, "_call_withArgument_", ["removeClass", aString]);
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
smalltalk.send(self, "_call_withArgument_", ["toggleClass", aString]);
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
return smalltalk.send(self, "_call_", ["height"]);
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
smalltalk.send(self, "_call_withArgument_", ["height", anInteger]);
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
smalltalk.send(self, "_call_withArgument_", ["width", anInteger]);
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
return smalltalk.send(self, "_call_", ["width"]);
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
return smalltalk.send(self, "_call_", ["innerHeight"]);
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
return smalltalk.send(self, "_call_", ["innerWidth"]);
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
return smalltalk.send(self, "_call_", ["outerHeight"]);
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
return smalltalk.send(self, "_call_", ["outerWidth"]);
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
return smalltalk.send(smalltalk.send(self, "_call_", ["position"]), "_basicAt_", ["top"]);
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
return smalltalk.send(smalltalk.send(self, "_call_", ["position"]), "_basicAt_", ["left"]);
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
return smalltalk.send(smalltalk.send(self, "_call_", ["offset"]), "_basicAt_", ["left"]);
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
return smalltalk.send(smalltalk.send(self, "_call_", ["offset"]), "_basicAt_", ["top"]);
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
return smalltalk.send(self, "_call_", ["scrollLeft"]);
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
return smalltalk.send(self, "_call_", ["scrollTop"]);
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
smalltalk.send(self, "_call_withArgument_", ["scrollLeft", anInteger]);
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
smalltalk.send(self, "_call_withArgument_", ["scrollTop", anInteger]);
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
smalltalk.send(self, "_call_", ["focus"]);
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
smalltalk.send(self, "_call_", ["show"]);
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
smalltalk.send(self, "_call_", ["hide"]);
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
smalltalk.send(self, "_call_", ["remove"]);
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
self['@jquery'].bind(anEventString, function(e){aBlock(e, self)});
return self;},
source: unescape('on%3A%20anEventString%20do%3A%20aBlock%0A%20%20%20%20%22Attach%20aBlock%20for%20anEventString%20on%20the%20element%22%0A%20%20%20%20%7B%27self%5B%27%27@jquery%27%27%5D.bind%28anEventString%2C%20function%28e%29%7BaBlock%28e%2C%20self%29%7D%29%27%7D%0A')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_removeEvents_',
smalltalk.method({
selector: 'removeEvents:',
category: 'events',
fn: function (aString){
var self=this;
smalltalk.send(self, "_call_withArgument_", ["unbind", aString]);
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
smalltalk.send(anObject, "_appendToJQuery_", [self]);
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
smalltalk.send(self, "_call_withArgument_", ["append", anElement]);
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
smalltalk.send(aJQuery, "_appendElement_", [self['@jquery']]);
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
smalltalk.send(self, "_empty", []);
smalltalk.send(self, "_append_", [anObject]);
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
smalltalk.send(self, "_call_", ["empty"]);
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
return self['@jquery'][aString]();
return self;},
source: unescape('call%3A%20aString%0A%09%7B%27return%20self%5B%27%27@jquery%27%27%5D%5BaString%5D%28%29%27%7D')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_call_withArgument_',
smalltalk.method({
selector: 'call:withArgument:',
category: 'private',
fn: function (aString, anObject){
var self=this;
return self['@jquery'][aString](anObject);
return self;},
source: unescape('call%3A%20aString%20withArgument%3A%20anObject%0A%20%20%20%20%7B%27return%20self%5B%27%27@jquery%27%27%5D%5BaString%5D%28anObject%29%27%7D')}),
smalltalk.JQuery);

smalltalk.addMethod(
'_hasClass_',
smalltalk.method({
selector: 'hasClass:',
category: 'testing',
fn: function (aString){
var self=this;
return smalltalk.send(self, "_call_withArgument_", ["hasClass", aString]);
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
newJQuery = jQuery(String(aString));
return smalltalk.send(self, "_from_", [newJQuery]);
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
return (function($rec){smalltalk.send($rec, "_initializeWithJQueryObject_", [anObject]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(self, "_new", []));
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
self['@settings']=smalltalk.send(smalltalk.Dictionary, "_new", []);
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
return smalltalk.send(self['@settings'], "_at_ifAbsent_", [aKey, (function(){return nil;})]);
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
smalltalk.send(self['@settings'], "_at_put_", [aKey, aValue]);
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
return smalltalk.send(self, "_at_", ["url"]);
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
smalltalk.send(self, "_at_put_", ["url", aString]);
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
jQuery.ajax(self['@settings']);
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
return (function($rec){smalltalk.send($rec, "_url_", [aString]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(self, "_new", []));
return self;},
source: unescape('url%3A%20aString%0A%20%20%20%20%5Eself%20new%0A%09url%3A%20aString%3B%0A%09yourself%0A')}),
smalltalk.Ajax.klass);


smalltalk.addClass('CanvasRenderingContext', smalltalk.Object, [], 'Canvas');
smalltalk.addMethod(
'_fillStyle_',
smalltalk.method({
selector: 'fillStyle:',
category: 'drawing paths',
fn: function (aString){
var self=this;
self.fillStyle = String(aString);
return self;},
source: unescape('fillStyle%3A%20aString%0A%09%7B%27self.fillStyle%20%3D%20String%28aString%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_beginPath',
smalltalk.method({
selector: 'beginPath',
category: 'drawing paths',
fn: function (){
var self=this;
self.beginPath();
return self;},
source: unescape('beginPath%0A%09%7B%27self.beginPath%28%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_closePath',
smalltalk.method({
selector: 'closePath',
category: 'drawing paths',
fn: function (){
var self=this;
self.closePath();
return self;},
source: unescape('closePath%0A%09%7B%27self.closePath%28%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_fill',
smalltalk.method({
selector: 'fill',
category: 'drawing paths',
fn: function (){
var self=this;
self.fill();
return self;},
source: unescape('fill%0A%09%7B%27self.fill%28%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_stroke',
smalltalk.method({
selector: 'stroke',
category: 'drawing paths',
fn: function (){
var self=this;
self.stroke();
return self;},
source: unescape('stroke%0A%09%7B%27self.stroke%28%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_moveTo_',
smalltalk.method({
selector: 'moveTo:',
category: 'drawing paths',
fn: function (aPoint){
var self=this;
self.moveTo(aPoint._x(), aPoint._y());
return self;},
source: unescape('moveTo%3A%20aPoint%0A%09%7B%27self.moveTo%28aPoint._x%28%29%2C%20aPoint._y%28%29%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_lineTo_',
smalltalk.method({
selector: 'lineTo:',
category: 'drawing paths',
fn: function (aPoint){
var self=this;
self.lineTo(aPoint._x(), aPoint._y());
return self;},
source: unescape('lineTo%3A%20aPoint%0A%09%7B%27self.lineTo%28aPoint._x%28%29%2C%20aPoint._y%28%29%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_arcTo_radius_startAngle_endAngle_anticlockwise_',
smalltalk.method({
selector: 'arcTo:radius:startAngle:endAngle:anticlockwise:',
category: 'drawing arcs',
fn: function (aPoint, aNumber, aNumber2, aNumber3, aBoolean){
var self=this;
self.arc(aPoint._x(), aPoint._y(), aNumber, aNumber2, aNumber3, aBoolean);
return self;},
source: unescape('arcTo%3A%20aPoint%20radius%3A%20aNumber%20startAngle%3A%20aNumber2%20endAngle%3A%20aNumber3%20anticlockwise%3A%20aBoolean%0A%09%7B%27self.arc%28aPoint._x%28%29%2C%20aPoint._y%28%29%2C%20aNumber%2C%20aNumber2%2C%20aNumber3%2C%20aBoolean%29%27%7D%20')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_arcTo_radius_',
smalltalk.method({
selector: 'arcTo:radius:',
category: 'drawing arcs',
fn: function (aPoint, aNumber){
var self=this;
smalltalk.send(self, "_arcTo_radius_startAngle_endAngle_anticlockwise_", [aPoint, aNumber, (0), smalltalk.send(smalltalk.send(smalltalk.Number, "_pi", []), "__star", [(2)]), false]);
return self;},
source: unescape('arcTo%3A%20aPoint%20radius%3A%20aNumber%0A%09self%20arcTo%3A%20aPoint%20radius%3A%20aNumber%20startAngle%3A%200%20endAngle%3A%20Number%20pi%20*%202%20anticlockwise%3A%20false')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_fillRectFrom_to_',
smalltalk.method({
selector: 'fillRectFrom:to:',
category: 'drawing rectangles',
fn: function (aPoint, anotherPoint){
var self=this;
self.fillRect(aPoint._x(), aPoint._y(), anotherPoint._x(), anotherPoint._y());
return self;},
source: unescape('fillRectFrom%3A%20aPoint%20to%3A%20anotherPoint%0A%09%7B%27self.fillRect%28aPoint._x%28%29%2C%20aPoint._y%28%29%2C%20anotherPoint._x%28%29%2C%20anotherPoint._y%28%29%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_strokeRectFrom_to_',
smalltalk.method({
selector: 'strokeRectFrom:to:',
category: 'drawing rectangles',
fn: function (aPoint, anotherPoint){
var self=this;
self.strokeRect(aPoint._x(), aPoint._y(), anotherPoint._x(), anotherPoint._y());
return self;},
source: unescape('strokeRectFrom%3A%20aPoint%20to%3A%20anotherPoint%0A%09%7B%27self.strokeRect%28aPoint._x%28%29%2C%20aPoint._y%28%29%2C%20anotherPoint._x%28%29%2C%20anotherPoint._y%28%29%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_clearRectFrom_to_',
smalltalk.method({
selector: 'clearRectFrom:to:',
category: 'drawing rectangles',
fn: function (aPoint, anotherPoint){
var self=this;
self.fillRect(aPoint._x(), aPoint._y(), anotherPoint._x(), anotherPoint._y());
return self;},
source: unescape('clearRectFrom%3A%20aPoint%20to%3A%20anotherPoint%0A%09%7B%27self.fillRect%28aPoint._x%28%29%2C%20aPoint._y%28%29%2C%20anotherPoint._x%28%29%2C%20anotherPoint._y%28%29%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_strokeStyle_',
smalltalk.method({
selector: 'strokeStyle:',
category: 'drawing paths',
fn: function (aString){
var self=this;
self.strokeStyle = String(aString);
return self;},
source: unescape('strokeStyle%3A%20aString%0A%09%7B%27self.strokeStyle%20%3D%20String%28aString%29%27%7D')}),
smalltalk.CanvasRenderingContext);

smalltalk.addMethod(
'_lineWidth_',
smalltalk.method({
selector: 'lineWidth:',
category: 'drawing paths',
fn: function (aNumber){
var self=this;
self.lineWidth = aNumber;
return self;},
source: unescape('lineWidth%3A%20aNumber%0A%09%7B%27self.lineWidth%20%3D%20aNumber%27%7D')}),
smalltalk.CanvasRenderingContext);


smalltalk.addMethod(
'_tagBrush_',
smalltalk.method({
selector: 'tagBrush:',
category: 'instance creation',
fn: function (aTagBrush){
var self=this;
return aTagBrush._element().getContext('2d');
return self;},
source: unescape('tagBrush%3A%20aTagBrush%0A%09%7B%27return%20aTagBrush._element%28%29.getContext%28%27%272d%27%27%29%27%7D')}),
smalltalk.CanvasRenderingContext.klass);


smalltalk.addClass('HTMLCanvas', smalltalk.Object, ['root'], 'Canvas');
smalltalk.addMethod(
'_root_',
smalltalk.method({
selector: 'root:',
category: 'accessing',
fn: function (aTagBrush){
var self=this;
self['@root']=aTagBrush;
return self;},
source: unescape('root%3A%20aTagBrush%0A%20%20%20%20root%20%3A%3D%20aTagBrush%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_root',
smalltalk.method({
selector: 'root',
category: 'accessing',
fn: function (){
var self=this;
return self['@root'];
return self;},
source: unescape('root%0A%20%20%20%20%5Eroot%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_initialize',
smalltalk.method({
selector: 'initialize',
category: 'initialization',
fn: function (){
var self=this;
self.klass.superclass.fn.prototype['_initialize'].apply(self, []);
self['@root']=smalltalk.send(smalltalk.TagBrush, "_fromString_canvas_", ["div", self]);
return self;},
source: unescape('initialize%0A%20%20%20%20super%20initialize.%0A%20%20%20%20root%20%3A%3D%20TagBrush%20fromString%3A%20%27div%27%20canvas%3A%20self%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_with_',
smalltalk.method({
selector: 'with:',
category: 'adding',
fn: function (anObject){
var self=this;
return smalltalk.send(smalltalk.send(self, "_root", []), "_with_", [anObject]);
return self;},
source: unescape('with%3A%20anObject%0A%20%20%20%20%5Eself%20root%20with%3A%20anObject%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_newTag_',
smalltalk.method({
selector: 'newTag:',
category: 'tags',
fn: function (aString){
var self=this;
return smalltalk.send(smalltalk.TagBrush, "_fromString_canvas_", [aString, self]);
return self;},
source: unescape('newTag%3A%20aString%0A%20%20%20%20%5ETagBrush%20fromString%3A%20aString%20canvas%3A%20self%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_tag_',
smalltalk.method({
selector: 'tag:',
category: 'tags',
fn: function (aString){
var self=this;
return smalltalk.send(self['@root'], "_addBrush_", [smalltalk.send(self, "_newTag_", [aString])]);
return self;},
source: unescape('tag%3A%20aString%0A%20%20%20%20%5Eroot%20addBrush%3A%20%28self%20newTag%3A%20aString%29%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_h1',
smalltalk.method({
selector: 'h1',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["h1"]);
return self;},
source: unescape('h1%0A%20%20%20%20%5Eself%20tag%3A%20%27h1%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_h2',
smalltalk.method({
selector: 'h2',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["h2"]);
return self;},
source: unescape('h2%0A%20%20%20%20%5Eself%20tag%3A%20%27h2%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_h3',
smalltalk.method({
selector: 'h3',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["h3"]);
return self;},
source: unescape('h3%0A%20%20%20%20%5Eself%20tag%3A%20%27h3%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_h4',
smalltalk.method({
selector: 'h4',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["h4"]);
return self;},
source: unescape('h4%0A%20%20%20%20%5Eself%20tag%3A%20%27h4%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_h5',
smalltalk.method({
selector: 'h5',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["h5"]);
return self;},
source: unescape('h5%0A%20%20%20%20%5Eself%20tag%3A%20%27h5%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_h6',
smalltalk.method({
selector: 'h6',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["h6"]);
return self;},
source: unescape('h6%0A%20%20%20%20%5Eself%20tag%3A%20%27h6%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_p',
smalltalk.method({
selector: 'p',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["p"]);
return self;},
source: unescape('p%0A%20%20%20%20%5Eself%20tag%3A%20%27p%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_div',
smalltalk.method({
selector: 'div',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["div"]);
return self;},
source: unescape('div%0A%20%20%20%20%5Eself%20tag%3A%20%27div%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_span',
smalltalk.method({
selector: 'span',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["span"]);
return self;},
source: unescape('span%0A%20%20%20%20%5Eself%20tag%3A%20%27span%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_img',
smalltalk.method({
selector: 'img',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["img"]);
return self;},
source: unescape('img%0A%20%20%20%20%5Eself%20tag%3A%20%27img%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_ul',
smalltalk.method({
selector: 'ul',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["ul"]);
return self;},
source: unescape('ul%0A%20%20%20%20%5Eself%20tag%3A%20%27ul%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_ol',
smalltalk.method({
selector: 'ol',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["ol"]);
return self;},
source: unescape('ol%0A%20%20%20%20%5Eself%20tag%3A%20%27ol%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_li',
smalltalk.method({
selector: 'li',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["li"]);
return self;},
source: unescape('li%0A%20%20%20%20%5Eself%20tag%3A%20%27li%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_table',
smalltalk.method({
selector: 'table',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["table"]);
return self;},
source: unescape('table%0A%20%20%20%20%5Eself%20tag%3A%20%27table%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_tr',
smalltalk.method({
selector: 'tr',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["tr"]);
return self;},
source: unescape('tr%0A%20%20%20%20%5Eself%20tag%3A%20%27tr%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_td',
smalltalk.method({
selector: 'td',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["td"]);
return self;},
source: unescape('td%20%0A%20%20%20%20%5Eself%20tag%3A%20%27td%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_th',
smalltalk.method({
selector: 'th',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["th"]);
return self;},
source: unescape('th%0A%20%20%20%20%5Eself%20tag%3A%20%27th%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_form',
smalltalk.method({
selector: 'form',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["form"]);
return self;},
source: unescape('form%0A%20%20%20%20%5Eself%20tag%3A%20%27form%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_input',
smalltalk.method({
selector: 'input',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["input"]);
return self;},
source: unescape('input%0A%20%20%20%20%5Eself%20tag%3A%20%27input%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_button',
smalltalk.method({
selector: 'button',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["button"]);
return self;},
source: unescape('button%0A%20%20%20%20%5Eself%20tag%3A%20%27button%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_select',
smalltalk.method({
selector: 'select',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["select"]);
return self;},
source: unescape('select%0A%20%20%20%20%5Eself%20tag%3A%20%27select%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_option',
smalltalk.method({
selector: 'option',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["option"]);
return self;},
source: unescape('option%0A%20%20%20%20%5Eself%20tag%3A%20%27option%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_textarea',
smalltalk.method({
selector: 'textarea',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["textarea"]);
return self;},
source: unescape('textarea%0A%20%20%20%20%5Eself%20tag%3A%20%27textarea%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_a',
smalltalk.method({
selector: 'a',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["a"]);
return self;},
source: unescape('a%0A%20%20%20%20%5Eself%20tag%3A%20%27a%27%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_appendToJQuery_',
smalltalk.method({
selector: 'appendToJQuery:',
category: '*JQuery',
fn: function (aJQuery){
var self=this;
smalltalk.send(aJQuery, "_appendElement_", [smalltalk.send(self['@root'], "_element", [])]);
return self;},
source: unescape('appendToJQuery%3A%20aJQuery%0A%20%20%20%20aJQuery%20appendElement%3A%20root%20element%0A')}),
smalltalk.HTMLCanvas);

smalltalk.addMethod(
'_canvas',
smalltalk.method({
selector: 'canvas',
category: 'tags',
fn: function (){
var self=this;
return smalltalk.send(self, "_tag_", ["canvas"]);
return self;},
source: unescape('canvas%0A%09%5Eself%20tag%3A%20%27canvas%27%0A')}),
smalltalk.HTMLCanvas);



smalltalk.addClass('TagBrush', smalltalk.Object, ['canvas', 'element'], 'Canvas');
smalltalk.addMethod(
'_contents_',
smalltalk.method({
selector: 'contents:',
category: 'adding',
fn: function (anObject){
var self=this;
smalltalk.send(smalltalk.send(self, "_asJQuery", []), "_empty", []);
smalltalk.send(self, "_append_", [anObject]);
return self;},
source: unescape('contents%3A%20anObject%0A%20%20%20%20self%20asJQuery%20empty.%0A%20%20%20%20self%20append%3A%20anObject%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_addBrush_',
smalltalk.method({
selector: 'addBrush:',
category: 'adding',
fn: function (aTagBrush){
var self=this;
smalltalk.send(self, "_appendChild_", [smalltalk.send(aTagBrush, "_element", [])]);
return aTagBrush;
return self;},
source: unescape('addBrush%3A%20aTagBrush%0A%20%20%20%20self%20appendChild%3A%20aTagBrush%20element.%0A%20%20%20%20%5EaTagBrush%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_with_',
smalltalk.method({
selector: 'with:',
category: 'adding',
fn: function (anObject){
var self=this;
smalltalk.send(self, "_append_", [anObject]);
return self;},
source: unescape('with%3A%20anObject%0A%20%20%20%20self%20append%3A%20anObject%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_append_',
smalltalk.method({
selector: 'append:',
category: 'adding',
fn: function (anObject){
var self=this;
smalltalk.send(anObject, "_appendToBrush_", [self]);
return self;},
source: unescape('append%3A%20anObject%0A%20%20%20%20anObject%20appendToBrush%3A%20self%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_appendToBrush_',
smalltalk.method({
selector: 'appendToBrush:',
category: 'adding',
fn: function (aTagBrush){
var self=this;
smalltalk.send(aTagBrush, "_addBrush_", [self]);
return self;},
source: unescape('appendToBrush%3A%20aTagBrush%0A%20%20%20%20aTagBrush%20addBrush%3A%20self%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_appendBlock_',
smalltalk.method({
selector: 'appendBlock:',
category: 'adding',
fn: function (aBlock){
var self=this;
var root=nil;
root=smalltalk.send(self['@canvas'], "_root", []);
smalltalk.send(self['@canvas'], "_root_", [self]);
smalltalk.send(aBlock, "_value_", [self['@canvas']]);
smalltalk.send(self['@canvas'], "_root_", [root]);
return self;},
source: unescape('appendBlock%3A%20aBlock%0A%20%20%20%20%7C%20root%20%7C%0A%20%20%20%20root%20%3A%3D%20canvas%20root.%0A%20%20%20%20canvas%20root%3A%20self.%0A%20%20%20%20aBlock%20value%3A%20canvas.%0A%20%20%20%20canvas%20root%3A%20root%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_appendChild_',
smalltalk.method({
selector: 'appendChild:',
category: 'adding',
fn: function (anElement){
var self=this;
self['@element'].appendChild(anElement);
return self;},
source: unescape('appendChild%3A%20anElement%0A%20%20%20%20%7B%27self%5B%27%27@element%27%27%5D.appendChild%28anElement%29%27%7D%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_appendString_',
smalltalk.method({
selector: 'appendString:',
category: 'adding',
fn: function (aString){
var self=this;
smalltalk.send(self, "_appendChild_", [smalltalk.send(self, "_createTextNodeFor_", [aString])]);
return self;},
source: unescape('appendString%3A%20aString%0A%20%20%20%20self%20appendChild%3A%20%28self%20createTextNodeFor%3A%20aString%29%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_at_put_',
smalltalk.method({
selector: 'at:put:',
category: 'attributes',
fn: function (aString, aValue){
var self=this;
self['@element'].setAttribute(aString, aValue);
return self;},
source: unescape('at%3A%20aString%20put%3A%20aValue%0A%20%20%20%20%7B%27self%5B%27%27@element%27%27%5D.setAttribute%28aString%2C%20aValue%29%27%7D%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_removeAt_',
smalltalk.method({
selector: 'removeAt:',
category: 'attributes',
fn: function (aString){
var self=this;
self['@element'].removeAttribute(aString);
return self;},
source: unescape('removeAt%3A%20aString%0A%20%20%20%20%7B%27self%5B%27%27@element%27%27%5D.removeAttribute%28aString%29%27%7D%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_class_',
smalltalk.method({
selector: 'class:',
category: 'attributes',
fn: function (aString){
var self=this;
smalltalk.send(self, "_at_put_", ["class", aString]);
return self;},
source: unescape('class%3A%20aString%0A%20%20%20%20self%20at%3A%20%27class%27%20put%3A%20aString%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_id_',
smalltalk.method({
selector: 'id:',
category: 'attributes',
fn: function (aString){
var self=this;
smalltalk.send(self, "_at_put_", ["id", aString]);
return self;},
source: unescape('id%3A%20aString%0A%20%20%20%20self%20at%3A%20%27id%27%20put%3A%20aString%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_src_',
smalltalk.method({
selector: 'src:',
category: 'attributes',
fn: function (aString){
var self=this;
smalltalk.send(self, "_at_put_", ["src", aString]);
return self;},
source: unescape('src%3A%20aString%0A%20%20%20%20self%20%20at%3A%20%27src%27%20put%3A%20aString%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_href_',
smalltalk.method({
selector: 'href:',
category: 'attributes',
fn: function (aString){
var self=this;
smalltalk.send(self, "_at_put_", ["href", aString]);
return self;},
source: unescape('href%3A%20aString%0A%20%20%20%20self%20at%3A%20%27href%27%20put%3A%20aString%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_title_',
smalltalk.method({
selector: 'title:',
category: 'attributes',
fn: function (aString){
var self=this;
smalltalk.send(self, "_at_put_", ["title", aString]);
return self;},
source: unescape('title%3A%20aString%0A%20%20%20%20self%20at%3A%20%27title%27%20put%3A%20aString%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_style_',
smalltalk.method({
selector: 'style:',
category: 'attributes',
fn: function (aString){
var self=this;
smalltalk.send(self, "_at_put_", ["style", aString]);
return self;},
source: unescape('style%3A%20aString%0A%20%20%20%20self%20at%3A%20%27style%27%20put%3A%20aString%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_initializeFromString_canvas_',
smalltalk.method({
selector: 'initializeFromString:canvas:',
category: 'initialization',
fn: function (aString, aCanvas){
var self=this;
self['@element']=smalltalk.send(self, "_createElementFor_", [aString]);
self['@canvas']=aCanvas;
return self;},
source: unescape('initializeFromString%3A%20aString%20canvas%3A%20aCanvas%0A%20%20%20%20element%20%3A%3D%20self%20createElementFor%3A%20aString.%0A%20%20%20%20canvas%20%3A%3D%20aCanvas%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_element',
smalltalk.method({
selector: 'element',
category: 'accessing',
fn: function (){
var self=this;
return self['@element'];
return self;},
source: unescape('element%0A%20%20%20%20%5Eelement%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_asJQuery',
smalltalk.method({
selector: 'asJQuery',
category: 'converting',
fn: function (){
var self=this;
return smalltalk.JQuery._from_(jQuery(self['@element']));
return self;},
source: unescape('asJQuery%0A%09%7B%27return%20smalltalk.JQuery._from_%28jQuery%28self%5B%27%27@element%27%27%5D%29%29%27%7D%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_asJQueryDo_',
smalltalk.method({
selector: 'asJQueryDo:',
category: 'converting',
fn: function (aBlock){
var self=this;
smalltalk.send(aBlock, "_value_", [smalltalk.send(self, "_asJQuery", [])]);
return self;},
source: unescape('asJQueryDo%3A%20aBlock%0A%20%20%20%20aBlock%20value%3A%20self%20asJQuery%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_onKeyDown_',
smalltalk.method({
selector: 'onKeyDown:',
category: 'events',
fn: function (aBlock){
var self=this;
smalltalk.send(smalltalk.send(self, "_asJQuery", []), "_on_do_", ["keydown", aBlock]);
return self;},
source: unescape('onKeyDown%3A%20aBlock%0A%20%20%20%20self%20asJQuery%20on%3A%20%27keydown%27%20do%3A%20aBlock%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_onKeyPress_',
smalltalk.method({
selector: 'onKeyPress:',
category: 'events',
fn: function (aBlock){
var self=this;
smalltalk.send(smalltalk.send(self, "_asJQuery", []), "_on_do_", ["keypress", aBlock]);
return self;},
source: unescape('onKeyPress%3A%20aBlock%0A%20%20%20%20self%20asJQuery%20on%3A%20%27keypress%27%20do%3A%20aBlock%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_onKeyUp_',
smalltalk.method({
selector: 'onKeyUp:',
category: 'events',
fn: function (aBlock){
var self=this;
smalltalk.send(smalltalk.send(self, "_asJQuery", []), "_on_do_", ["keyup", aBlock]);
return self;},
source: unescape('onKeyUp%3A%20aBlock%0A%20%20%20%20self%20asJQuery%20on%3A%20%27keyup%27%20do%3A%20aBlock%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_onFocus_',
smalltalk.method({
selector: 'onFocus:',
category: 'events',
fn: function (aBlock){
var self=this;
smalltalk.send(smalltalk.send(self, "_asJQuery", []), "_on_do_", ["focus", aBlock]);
return self;},
source: unescape('onFocus%3A%20aBlock%0A%20%20%20%20self%20asJQuery%20on%3A%20%27focus%27%20do%3A%20aBlock%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_onBlur_',
smalltalk.method({
selector: 'onBlur:',
category: 'events',
fn: function (aBlock){
var self=this;
smalltalk.send(smalltalk.send(self, "_asJQuery", []), "_on_do_", ["blur", aBlock]);
return self;},
source: unescape('onBlur%3A%20aBlock%0A%20%20%20%20self%20asJQuery%20on%3A%20%27blur%27%20do%3A%20aBlock%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_onChange_',
smalltalk.method({
selector: 'onChange:',
category: 'events',
fn: function (aBlock){
var self=this;
smalltalk.send(smalltalk.send(self, "_asJQuery", []), "_on_do_", ["change", aBlock]);
return self;},
source: unescape('onChange%3A%20aBlock%0A%20%20%20%20self%20asJQuery%20on%3A%20%27change%27%20do%3A%20aBlock%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_onClick_',
smalltalk.method({
selector: 'onClick:',
category: 'events',
fn: function (aBlock){
var self=this;
smalltalk.send(smalltalk.send(self, "_asJQuery", []), "_on_do_", ["click", aBlock]);
return self;},
source: unescape('onClick%3A%20aBlock%0A%20%20%20%20self%20asJQuery%20on%3A%20%27click%27%20do%3A%20aBlock%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_createElementFor_',
smalltalk.method({
selector: 'createElementFor:',
category: 'private',
fn: function (aString){
var self=this;
return document.createElement(String(aString));
return self;},
source: unescape('createElementFor%3A%20aString%0A%09%7B%27return%20document.createElement%28String%28aString%29%29%27%7D%0A')}),
smalltalk.TagBrush);

smalltalk.addMethod(
'_createTextNodeFor_',
smalltalk.method({
selector: 'createTextNodeFor:',
category: 'private',
fn: function (aString){
var self=this;
return document.createTextNode(String(aString));
return self;},
source: unescape('createTextNodeFor%3A%20aString%0A%09%7B%27return%20document.createTextNode%28String%28aString%29%29%27%7D%0A')}),
smalltalk.TagBrush);


smalltalk.addMethod(
'_fromString_canvas_',
smalltalk.method({
selector: 'fromString:canvas:',
category: 'instance creation',
fn: function (aString, aCanvas){
var self=this;
return (function($rec){smalltalk.send($rec, "_initializeFromString_canvas_", [aString, aCanvas]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(self, "_new", []));
return self;},
source: unescape('fromString%3A%20aString%20canvas%3A%20aCanvas%0A%20%20%20%20%5Eself%20new%0A%09initializeFromString%3A%20aString%20canvas%3A%20aCanvas%3B%0A%09yourself%0A')}),
smalltalk.TagBrush.klass);


smalltalk.addClass('Widget', smalltalk.Object, ['root'], 'Canvas');
smalltalk.addMethod(
'_root',
smalltalk.method({
selector: 'root',
category: 'accessing',
fn: function (){
var self=this;
return self['@root'];
return self;},
source: unescape('root%0A%20%20%20%20%5Eroot%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_appendToBrush_',
smalltalk.method({
selector: 'appendToBrush:',
category: 'adding',
fn: function (aTagBrush){
var self=this;
smalltalk.send(self, "_appendToJQuery_", [smalltalk.send(aTagBrush, "_asJQuery", [])]);
return self;},
source: unescape('appendToBrush%3A%20aTagBrush%0A%20%20%20%20self%20appendToJQuery%3A%20aTagBrush%20asJQuery%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_appendToJQuery_',
smalltalk.method({
selector: 'appendToJQuery:',
category: 'adding',
fn: function (aJQuery){
var self=this;
smalltalk.send(self, "_render", []);
smalltalk.send(aJQuery, "_append_", [smalltalk.send(smalltalk.send(self, "_root", []), "_asJQuery", [])]);
return self;},
source: unescape('appendToJQuery%3A%20aJQuery%0A%20%20%20%20self%20render.%0A%20%20%20%20aJQuery%20append%3A%20self%20root%20asJQuery%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_alert_',
smalltalk.method({
selector: 'alert:',
category: 'actions',
fn: function (aString){
var self=this;
alert(aString);
return self;},
source: unescape('alert%3A%20aString%0A%20%20%20%20%7B%27alert%28aString%29%27%7D%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_confirm_',
smalltalk.method({
selector: 'confirm:',
category: 'actions',
fn: function (aString){
var self=this;
return window.confirm(aString);
return self;},
source: unescape('confirm%3A%20aString%0A%20%20%20%20%7B%27return%20window.confirm%28aString%29%27%7D%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_prompt_',
smalltalk.method({
selector: 'prompt:',
category: 'actions',
fn: function (aString){
var self=this;
return smalltalk.send(self, "_prompt_default_", [aString, ""]);
return self;},
source: unescape('prompt%3A%20aString%0A%20%20%20%20%5Eself%20prompt%3A%20aString%20default%3A%20%27%27%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_prompt_default_',
smalltalk.method({
selector: 'prompt:default:',
category: 'actions',
fn: function (aString, anotherString){
var self=this;
return window.prompt(aString, anotherString);
return self;},
source: unescape('prompt%3A%20aString%20default%3A%20anotherString%0A%20%20%20%20%7B%27return%20window.prompt%28aString%2C%20anotherString%29%27%7D%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_update',
smalltalk.method({
selector: 'update',
category: 'actions',
fn: function (){
var self=this;
var canvas=nil;
canvas=smalltalk.send(smalltalk.HTMLCanvas, "_new", []);
smalltalk.send(canvas, "_root_", [smalltalk.send(self, "_root", [])]);
smalltalk.send(smalltalk.send(smalltalk.send(self, "_root", []), "_asJQuery", []), "_empty", []);
smalltalk.send(self, "_renderOn_", [canvas]);
return self;},
source: unescape('update%0A%20%20%20%20%7C%20canvas%20%7C%0A%20%20%20%20canvas%20%3A%3D%20HTMLCanvas%20new.%0A%20%20%20%20canvas%20root%3A%20self%20root.%0A%20%20%20%20self%20root%20asJQuery%20empty.%0A%20%20%20%20self%20renderOn%3A%20canvas%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_render',
smalltalk.method({
selector: 'render',
category: 'rendering',
fn: function (){
var self=this;
var canvas=nil;
canvas=smalltalk.send(smalltalk.HTMLCanvas, "_new", []);
self['@root']=smalltalk.send(canvas, "_root", []);
smalltalk.send(self, "_renderOn_", [canvas]);
return self;},
source: unescape('render%0A%20%20%20%20%7C%20canvas%20%7C%0A%20%20%20%20canvas%20%3A%3D%20HTMLCanvas%20new.%0A%20%20%20%20root%20%3A%3D%20canvas%20root.%0A%20%20%20%20self%20renderOn%3A%20canvas%0A')}),
smalltalk.Widget);

smalltalk.addMethod(
'_renderOn_',
smalltalk.method({
selector: 'renderOn:',
category: 'rendering',
fn: function (html){
var self=this;
self;
return self;},
source: unescape('renderOn%3A%20html%0A%20%20%20%20self%0A')}),
smalltalk.Widget);



smalltalk.addClass('CanvasBrush', smalltalk.TagBrush, [], 'Canvas');
smalltalk.addMethod(
'_createElement',
smalltalk.method({
selector: 'createElement',
category: 'private',
fn: function (){
var self=this;
return document.createElement('canvas');
return self;},
source: unescape('createElement%0A%09%7B%27return%20document.createElement%28%27%27canvas%27%27%29%27%7D')}),
smalltalk.CanvasBrush);

smalltalk.addMethod(
'_initializeWithCanvas_',
smalltalk.method({
selector: 'initializeWithCanvas:',
category: 'initialization',
fn: function (aCanvas){
var self=this;
canvas=aCanvas;
return self;},
source: unescape('initializeWithCanvas%3A%20aCanvas%0A%09canvas%20%3A%3D%20aCanvas')}),
smalltalk.CanvasBrush);


smalltalk.addMethod(
'_canvas_',
smalltalk.method({
selector: 'canvas:',
category: 'instance creation',
fn: function (aCanvas){
var self=this;
return (function($rec){smalltalk.send($rec, "_initializeWithCanvas_", [aCanvas]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(self, "_new", []));
return self;},
source: unescape('canvas%3A%20aCanvas%0A%09%5Eself%20new%0A%09%09initializeWithCanvas%3A%20aCanvas%3B%0A%09%09yourself')}),
smalltalk.CanvasBrush.klass);


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


smalltalk.addClass('Counter', smalltalk.Widget, ['count'], 'Examples');
smalltalk.addMethod(
'_initialize',
smalltalk.method({
selector: 'initialize',
category: 'initialization',
fn: function (){
var self=this;
self.klass.superclass.fn.prototype['_initialize'].apply(self, []);
self['@count']=(0);
return self;},
source: unescape('initialize%0A%20%20%20%20super%20initialize.%0A%20%20%20%20count%20%3A%3D%200%0A')}),
smalltalk.Counter);

smalltalk.addMethod(
'_renderOn_',
smalltalk.method({
selector: 'renderOn:',
category: 'rendering',
fn: function (html){
var self=this;
smalltalk.send(smalltalk.send(html, "_h1", []), "_with_", [smalltalk.send(self['@count'], "_asString", [])]);
(function($rec){smalltalk.send($rec, "_with_", [unescape("++")]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_increase", []);})]);})(smalltalk.send(html, "_button", []));
(function($rec){smalltalk.send($rec, "_with_", [unescape("--")]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_decrease", []);})]);})(smalltalk.send(html, "_button", []));
return self;},
source: unescape('renderOn%3A%20html%0A%20%20%20%20html%20h1%20with%3A%20count%20asString.%0A%20%20%20%20html%20button%0A%09with%3A%20%27++%27%3B%0A%09onClick%3A%20%5Bself%20increase%5D.%0A%20%20%20%20html%20button%0A%09with%3A%20%27--%27%3B%0A%09onClick%3A%20%5Bself%20decrease%5D%0A')}),
smalltalk.Counter);

smalltalk.addMethod(
'_increase',
smalltalk.method({
selector: 'increase',
category: 'actions',
fn: function (){
var self=this;
self['@count']=smalltalk.send(self['@count'], "__plus", [(1)]);
smalltalk.send(self, "_update", []);
return self;},
source: unescape('increase%0A%20%20%20%20count%20%3A%3D%20count%20+%201.%0A%20%20%20%20self%20update%0A')}),
smalltalk.Counter);

smalltalk.addMethod(
'_decrease',
smalltalk.method({
selector: 'decrease',
category: 'actions',
fn: function (){
var self=this;
self['@count']=smalltalk.send(self['@count'], "__minus", [(1)]);
smalltalk.send(self, "_update", []);
return self;},
source: unescape('decrease%0A%20%20%20%20count%20%3A%3D%20count%20-%201.%0A%20%20%20%20self%20update%0A')}),
smalltalk.Counter);



smalltalk.addClass('Tetris', smalltalk.Widget, ['renderingContext', 'timer', 'speed', 'score', 'rows', 'movingPiece'], 'Examples');
smalltalk.addMethod(
'_renderOn_',
smalltalk.method({
selector: 'renderOn:',
category: 'rendering',
fn: function (html){
var self=this;
(function($rec){smalltalk.send($rec, "_class_", ["tetris"]);return smalltalk.send($rec, "_with_", [(function(){smalltalk.send(smalltalk.send(html, "_h3", []), "_with_", ["Tetris"]);smalltalk.send(self, "_renderCanvasOn_", [html]);return smalltalk.send(self, "_renderButtonsOn_", [html]);})]);})(smalltalk.send(html, "_div", []));
return self;},
source: unescape('renderOn%3A%20html%0A%09html%20div%0A%09%09class%3A%20%27tetris%27%3B%0A%09%09with%3A%20%5B%0A%09%09%09html%20h3%20with%3A%20%27Tetris%27.%0A%09%09%09self%20renderCanvasOn%3A%20html.%0A%09%09%09self%20renderButtonsOn%3A%20html%5D')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_renderCanvasOn_',
smalltalk.method({
selector: 'renderCanvasOn:',
category: 'rendering',
fn: function (html){
var self=this;
var canvas=nil;
canvas=smalltalk.send(html, "_canvas", []);
smalltalk.send(canvas, "_at_put_", ["width", smalltalk.send(smalltalk.send(self, "_width", []), "_asString", [])]);
smalltalk.send(canvas, "_at_put_", ["height", smalltalk.send(smalltalk.send(self, "_height", []), "_asString", [])]);
self['@renderingContext']=smalltalk.send(smalltalk.CanvasRenderingContext, "_tagBrush_", [canvas]);
smalltalk.send(self, "_redraw", []);
return self;},
source: unescape('renderCanvasOn%3A%20html%0A%09%7C%20canvas%20%7C%0A%09canvas%20%3A%3D%20html%20canvas.%0A%09canvas%20at%3A%20%27width%27%20put%3A%20self%20width%20asString.%0A%09canvas%20at%3A%20%27height%27%20put%3A%20self%20height%20asString.%0A%09renderingContext%20%3A%3D%20CanvasRenderingContext%20tagBrush%3A%20canvas.%0A%09self%20redraw')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_renderButtonsOn_',
smalltalk.method({
selector: 'renderButtonsOn:',
category: 'rendering',
fn: function (html){
var self=this;
(function($rec){smalltalk.send($rec, "_class_", ["tetris_buttons"]);return smalltalk.send($rec, "_with_", [(function(){(function($rec){smalltalk.send($rec, "_with_", ["New game"]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_startNewGame", []);})]);})(smalltalk.send(html, "_button", []));return (function($rec){smalltalk.send($rec, "_with_", [unescape("play/pause")]);return smalltalk.send($rec, "_onClick_", [(function(){return smalltalk.send(self, "_update", []);})]);})(smalltalk.send(html, "_button", []));})]);})(smalltalk.send(html, "_div", []));
return self;},
source: unescape('renderButtonsOn%3A%20html%0A%09html%20div%20%0A%09%09class%3A%20%27tetris_buttons%27%3B%0A%09%09with%3A%20%5B%0A%09%09%09html%20button%0A%09%09%09%09with%3A%20%27New%20game%27%3B%0A%09%09%09%09onClick%3A%20%5Bself%20startNewGame%5D.%0A%09%09%09html%20button%0A%09%09%09%09with%3A%20%27play/pause%27%3B%0A%09%09%09%09onClick%3A%20%5Bself%20update%5D%5D')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_initialize',
smalltalk.method({
selector: 'initialize',
category: 'initialization',
fn: function (){
var self=this;
self.klass.superclass.fn.prototype['_initialize'].apply(self, []);
smalltalk.send(self, "_newGame", []);
return self;},
source: unescape('initialize%0A%09super%20initialize.%0A%09self%20newGame')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_startNewGame',
smalltalk.method({
selector: 'startNewGame',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(self, "_newGame", []);
smalltalk.send(self['@timer'], "_ifNotNil_", [(function(){return smalltalk.send(self['@timer'], "_clearInterval", []);})]);
self['@timer']=smalltalk.send((function(){return smalltalk.send(self, "_nextStep", []);}), "_valueWithInterval_", [self['@speed']]);
return self;},
source: unescape('startNewGame%0A%09self%20newGame.%0A%09timer%20ifNotNil%3A%20%5Btimer%20clearInterval%5D.%0A%09timer%20%3A%3D%20%5Bself%20nextStep%5D%20valueWithInterval%3A%20speed')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_width',
smalltalk.method({
selector: 'width',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(smalltalk.send(self, "_class", []), "_width", []);
return self;},
source: unescape('width%0A%09%5Eself%20class%20width')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_height',
smalltalk.method({
selector: 'height',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(smalltalk.send(self, "_class", []), "_height", []);
return self;},
source: unescape('height%0A%09%5Eself%20class%20height')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_nextStep',
smalltalk.method({
selector: 'nextStep',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(self['@movingPiece'], "_ifNil_", [(function(){return smalltalk.send(self, "_newPiece", []);})]);
smalltalk.send(smalltalk.send(self['@movingPiece'], "_canMoveIn_", [self]), "_ifTrue_ifFalse_", [(function(){return smalltalk.send(self['@movingPiece'], "_position_", [smalltalk.send(smalltalk.send(self['@movingPiece'], "_position", []), "__plus", [smalltalk.send((0), "__at", [(1)])])]);}), (function(){return smalltalk.send(self, "_newPiece", []);})]);
smalltalk.send(self, "_redraw", []);
return self;},
source: unescape('nextStep%0A%09movingPiece%20ifNil%3A%20%5Bself%20newPiece%5D.%0A%09%28movingPiece%20canMoveIn%3A%20self%29%0A%09%09ifTrue%3A%20%5BmovingPiece%20position%3A%20movingPiece%20position%20+%20%280@1%29%5D%0A%09%09ifFalse%3A%20%5Bself%20newPiece%5D.%0A%09self%20redraw%0A%09')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_redraw',
smalltalk.method({
selector: 'redraw',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(self['@renderingContext'], "_clearRectFrom_to_", [smalltalk.send((0), "__at", [smalltalk.send(self, "_width", [])]), smalltalk.send((0), "__at", [smalltalk.send(self, "_height", [])])]);
(function($rec){smalltalk.send($rec, "_drawMap", []);return smalltalk.send($rec, "_drawPiece", []);})(self);
return self;},
source: unescape('redraw%0A%09renderingContext%20clearRectFrom%3A%200@%20self%20width%20to%3A%200@%20self%20height.%0A%09self%20%0A%09%09drawMap%3B%0A%09%09drawPiece')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_drawMap',
smalltalk.method({
selector: 'drawMap',
category: 'actions',
fn: function (){
var self=this;
(function($rec){smalltalk.send($rec, "_fillStyle_", [unescape("%23fafafa")]);return smalltalk.send($rec, "_fillRectFrom_to_", [smalltalk.send((0), "__at", [(0)]), smalltalk.send(smalltalk.send(self, "_width", []), "__at", [smalltalk.send(self, "_height", [])])]);})(self['@renderingContext']);
(function($rec){smalltalk.send($rec, "_lineWidth_", [(0.5)]);return smalltalk.send($rec, "_strokeStyle_", [unescape("%23999")]);})(self['@renderingContext']);
smalltalk.send((0), "_to_do_", [smalltalk.send(smalltalk.send(smalltalk.send(self, "_class", []), "_squares", []), "_x", []), (function(each){var x=nil;
x=smalltalk.send(each, "__star", [smalltalk.send(smalltalk.send(self, "_class", []), "_squareSize", [])]);return smalltalk.send(self, "_drawLineFrom_to_", [smalltalk.send(x, "__at", [(0)]), smalltalk.send(x, "__at", [smalltalk.send(self, "_height", [])])]);})]);
smalltalk.send((0), "_to_do_", [smalltalk.send(smalltalk.send(smalltalk.send(self, "_class", []), "_squares", []), "_y", []), (function(each){var y=nil;
y=smalltalk.send(each, "__star", [smalltalk.send(smalltalk.send(self, "_class", []), "_squareSize", [])]);return smalltalk.send(self, "_drawLineFrom_to_", [smalltalk.send((0), "__at", [y]), smalltalk.send(smalltalk.send(self, "_width", []), "__at", [y])]);})]);
return self;},
source: unescape('drawMap%0A%09renderingContext%20%0A%09%09fillStyle%3A%20%27%23fafafa%27%3B%0A%09%09fillRectFrom%3A%200@0%20to%3A%20self%20width@self%20height.%0A%09renderingContext%20%0A%09%09lineWidth%3A%200.5%3B%0A%09%09strokeStyle%3A%20%27%23999%27.%0A%090%20to%3A%20self%20class%20squares%20x%20do%3A%20%5B%3Aeach%20%7C%20%7C%20x%20%7C%0A%09%09x%20%3A%3D%20each%20*%20self%20class%20squareSize.%0A%09%09self%20drawLineFrom%3A%20x@0%20to%3A%20x@self%20height%5D.%0A%090%20to%3A%20self%20class%20squares%20y%20do%3A%20%5B%3Aeach%20%7C%20%7C%20y%20%7C%0A%09%09y%20%3A%3D%20each%20*%20self%20class%20squareSize.%0A%09%09self%20drawLineFrom%3A%200@y%20to%3A%20self%20width@y%5D.')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_drawLineFrom_to_',
smalltalk.method({
selector: 'drawLineFrom:to:',
category: 'actions',
fn: function (aPoint, anotherPoint){
var self=this;
(function($rec){smalltalk.send($rec, "_beginPath", []);smalltalk.send($rec, "_moveTo_", [aPoint]);smalltalk.send($rec, "_lineTo_", [anotherPoint]);return smalltalk.send($rec, "_stroke", []);})(self['@renderingContext']);
return self;},
source: unescape('drawLineFrom%3A%20aPoint%20to%3A%20anotherPoint%0A%09renderingContext%20%0A%09%09beginPath%3B%0A%09%09moveTo%3A%20aPoint%3B%0A%09%09lineTo%3A%20anotherPoint%3B%0A%09%09stroke')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_newGame',
smalltalk.method({
selector: 'newGame',
category: 'actions',
fn: function (){
var self=this;
self['@rows']=[];
self['@movingPiece']=nil;
self['@speed']=(200);
self['@score']=(0);
return self;},
source: unescape('newGame%0A%09rows%20%3A%3D%20%23%28%29.%0A%09movingPiece%20%3A%3D%20nil.%0A%09speed%20%3A%3D%20200.%0A%09score%20%3A%3D%200')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_newPiece',
smalltalk.method({
selector: 'newPiece',
category: 'actions',
fn: function (){
var self=this;
self['@movingPiece']=smalltalk.send(smalltalk.TetrisPiece, "_atRandom", []);
return self;},
source: unescape('newPiece%0A%09movingPiece%20%3A%3D%20TetrisPiece%20atRandom')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_squares',
smalltalk.method({
selector: 'squares',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(smalltalk.send(self, "_class", []), "_squares", []);
return self;},
source: unescape('squares%0A%09%5Eself%20class%20squares')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_gluePiece_',
smalltalk.method({
selector: 'gluePiece:',
category: 'accessing',
fn: function (aPiece){
var self=this;
smalltalk.send(aPiece, "_glueOn_", [self]);
return self;},
source: unescape('gluePiece%3A%20aPiece%0A%09aPiece%20glueOn%3A%20self%0A%09')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_drawRows',
smalltalk.method({
selector: 'drawRows',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(smalltalk.send(self, "_rows", []), "_do_", [(function(each){return nil;})]);
smalltalk.send(self['@movingPiece'], "_ifNotNil_", [(function(){return smalltalk.send(self['@movingPiece'], "_drawOn_", [self['@renderingContext']]);})]);
return self;},
source: unescape('drawRows%0A%09self%20rows%20do%3A%20%5B%3Aeach%20%7C%5D.%0A%09movingPiece%20ifNotNil%3A%20%5BmovingPiece%20drawOn%3A%20renderingContext%5D')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_drawPiece',
smalltalk.method({
selector: 'drawPiece',
category: 'actions',
fn: function (){
var self=this;
smalltalk.send(self['@movingPiece'], "_ifNotNil_", [(function(){return smalltalk.send(self['@movingPiece'], "_drawOn_", [self['@renderingContext']]);})]);
return self;},
source: unescape('drawPiece%0A%09movingPiece%20ifNotNil%3A%20%5B%0A%09%09movingPiece%20drawOn%3A%20renderingContext%5D')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_rows',
smalltalk.method({
selector: 'rows',
category: 'accessing',
fn: function (){
var self=this;
return self['@rows'];
return self;},
source: unescape('rows%0A%09%22An%20array%20of%20rows.%20Each%20row%20is%20a%20collection%20of%20points.%22%0A%09%5Erows')}),
smalltalk.Tetris);

smalltalk.addMethod(
'_addRow_',
smalltalk.method({
selector: 'addRow:',
category: 'accessing',
fn: function (aCollection){
var self=this;
smalltalk.send(smalltalk.send(self, "_rows", []), "_add_", [aCollection]);
return self;},
source: unescape('addRow%3A%20aCollection%0A%09self%20rows%20add%3A%20aCollection')}),
smalltalk.Tetris);


smalltalk.addMethod(
'_squareSize',
smalltalk.method({
selector: 'squareSize',
category: 'accessing',
fn: function (){
var self=this;
return (22);
return self;},
source: unescape('squareSize%0A%09%5E22')}),
smalltalk.Tetris.klass);

smalltalk.addMethod(
'_width',
smalltalk.method({
selector: 'width',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(smalltalk.send(self, "_squareSize", []), "__star", [smalltalk.send(smalltalk.send(self, "_squares", []), "_x", [])]);
return self;},
source: unescape('width%0A%09%5Eself%20squareSize%20*%20%28self%20squares%20x%29')}),
smalltalk.Tetris.klass);

smalltalk.addMethod(
'_height',
smalltalk.method({
selector: 'height',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(smalltalk.send(self, "_squareSize", []), "__star", [smalltalk.send(smalltalk.send(self, "_squares", []), "_y", [])]);
return self;},
source: unescape('height%0A%09%5Eself%20squareSize%20*%20%28self%20squares%20y%29')}),
smalltalk.Tetris.klass);

smalltalk.addMethod(
'_squares',
smalltalk.method({
selector: 'squares',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send((10), "__at", [(15)]);
return self;},
source: unescape('squares%0A%09%5E10@15')}),
smalltalk.Tetris.klass);


smalltalk.addClass('TetrisPiece', smalltalk.Widget, ['rotation', 'position'], 'Examples');
smalltalk.addMethod(
'_drawOn_',
smalltalk.method({
selector: 'drawOn:',
category: 'drawing',
fn: function (aRenderingContext){
var self=this;
smalltalk.send(aRenderingContext, "_fillStyle_", [smalltalk.send(self, "_color", [])]);
smalltalk.send(smalltalk.send(self, "_bounds", []), "_do_", [(function(each){return (function($rec){smalltalk.send($rec, "_fillRectFrom_to_", [smalltalk.send(smalltalk.send(each, "__plus", [smalltalk.send(self, "_position", [])]), "__star", [smalltalk.send(smalltalk.Tetris, "_squareSize", [])]), smalltalk.send(smalltalk.send((1), "__at", [(1)]), "__star", [smalltalk.send(smalltalk.Tetris, "_squareSize", [])])]);smalltalk.send($rec, "_strokeStyle_", [unescape("%23999")]);smalltalk.send($rec, "_lineWidth_", [(2)]);return smalltalk.send($rec, "_strokeRectFrom_to_", [smalltalk.send(smalltalk.send(each, "__plus", [smalltalk.send(self, "_position", [])]), "__star", [smalltalk.send(smalltalk.Tetris, "_squareSize", [])]), smalltalk.send(smalltalk.send((1), "__at", [(1)]), "__star", [smalltalk.send(smalltalk.Tetris, "_squareSize", [])])]);})(aRenderingContext);})]);
return self;},
source: unescape('drawOn%3A%20aRenderingContext%0A%09aRenderingContext%20fillStyle%3A%20self%20color.%0A%09self%20bounds%20do%3A%20%5B%3Aeach%20%7C%0A%09%09aRenderingContext%20%0A%09%09%09fillRectFrom%3A%20each%20+%20self%20position*%20Tetris%20squareSize%20to%3A%201@1%20*%20Tetris%20squareSize%3B%0A%09%09%09strokeStyle%3A%20%27%23999%27%3B%0A%09%09%09lineWidth%3A%202%3B%0A%09%09%09strokeRectFrom%3A%20each%20+%20self%20position*%20Tetris%20squareSize%20to%3A%201@1%20*%20Tetris%20squareSize%5D')}),
smalltalk.TetrisPiece);

smalltalk.addMethod(
'_rotation',
smalltalk.method({
selector: 'rotation',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@rotation'], "_ifNil_", [(function(){return self['@rotation']=(1);})]);
return self;},
source: unescape('rotation%0A%09%5Erotation%20ifNil%3A%20%5Brotation%20%3A%3D%201%5D')}),
smalltalk.TetrisPiece);

smalltalk.addMethod(
'_rotation_',
smalltalk.method({
selector: 'rotation:',
category: 'accessing',
fn: function (aNumber){
var self=this;
self['@rotation']=aNumber;
return self;},
source: unescape('rotation%3A%20aNumber%0A%09rotation%20%3A%3D%20aNumber')}),
smalltalk.TetrisPiece);

smalltalk.addMethod(
'_position',
smalltalk.method({
selector: 'position',
category: 'accessing',
fn: function (){
var self=this;
return smalltalk.send(self['@position'], "_ifNil_", [(function(){return smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.Tetris, "_squares", []), "_x", []), "__slash", [(2)]), "__minus", [(1)]), "__at", [(0)]);})]);
return self;},
source: unescape('position%0A%09%5Eposition%20ifNil%3A%20%5B%28Tetris%20squares%20x%20/%202%29%20-1%20@%200%5D')}),
smalltalk.TetrisPiece);

smalltalk.addMethod(
'_position_',
smalltalk.method({
selector: 'position:',
category: 'accessing',
fn: function (aPoint){
var self=this;
return self['@position']=aPoint;
return self;},
source: unescape('position%3A%20aPoint%0A%09%5Eposition%20%3A%3D%20aPoint')}),
smalltalk.TetrisPiece);

smalltalk.addMethod(
'_bounds',
smalltalk.method({
selector: 'bounds',
category: 'accessing',
fn: function (){
var self=this;
smalltalk.send(self, "_subclassResponsibility", []);
return self;},
source: unescape('bounds%0A%09self%20subclassResponsibility')}),
smalltalk.TetrisPiece);

smalltalk.addMethod(
'_color',
smalltalk.method({
selector: 'color',
category: 'accessing',
fn: function (){
var self=this;
return unescape("%23afa");
return self;},
source: unescape('color%0A%09%5E%27%23afa%27')}),
smalltalk.TetrisPiece);

smalltalk.addMethod(
'_canMove',
smalltalk.method({
selector: 'canMove',
category: 'testing',
fn: function (){
var self=this;
return smalltalk.send(smalltalk.send(smalltalk.send(self, "_position", []), "_y", []), "__lt", [smalltalk.send(smalltalk.send(smalltalk.send(smalltalk.Tetris, "_squares", []), "_y", []), "__minus", [smalltalk.send(self, "_height", [])])]);
return self;},
source: unescape('canMove%0A%09%5Eself%20position%20y%20%3C%20%28Tetris%20squares%20y%20-%20self%20height%29')}),
smalltalk.TetrisPiece);

smalltalk.addMethod(
'_height',
smalltalk.method({
selector: 'height',
category: 'accessing',
fn: function (){
var self=this;
return (2);
return self;},
source: unescape('height%0A%09%5E2')}),
smalltalk.TetrisPiece);

smalltalk.addMethod(
'_canMoveIn_',
smalltalk.method({
selector: 'canMoveIn:',
category: 'testing',
fn: function (aTetris){
var self=this;
return smalltalk.send(smalltalk.send(smalltalk.send(self, "_position", []), "_y", []), "__lt", [smalltalk.send(smalltalk.send(smalltalk.send(aTetris, "_squares", []), "_y", []), "__minus", [smalltalk.send(self, "_height", [])])]);
return self;},
source: unescape('canMoveIn%3A%20aTetris%0A%09%5Eself%20position%20y%20%3C%20%28aTetris%20squares%20y%20-%20self%20height%29')}),
smalltalk.TetrisPiece);


smalltalk.addMethod(
'_atRandom',
smalltalk.method({
selector: 'atRandom',
category: 'instance creation',
fn: function (){
var self=this;
return smalltalk.send(smalltalk.send(smalltalk.send(self, "_subclasses", []), "_at_", [smalltalk.send(smalltalk.send(smalltalk.send(self, "_subclasses", []), "_size", []), "_atRandom", [])]), "_new", []);
return self;},
source: unescape('atRandom%0A%09%5E%28self%20subclasses%20at%3A%20self%20subclasses%20size%20atRandom%29%20new')}),
smalltalk.TetrisPiece.klass);


smalltalk.addClass('TetrisPieceO', smalltalk.TetrisPiece, [], 'Examples');
smalltalk.addMethod(
'_bounds',
smalltalk.method({
selector: 'bounds',
category: 'accessing',
fn: function (){
var self=this;
return (function($rec){smalltalk.send($rec, "_add_", [smalltalk.send((0), "__at", [(0)])]);smalltalk.send($rec, "_add_", [smalltalk.send((0), "__at", [(1)])]);smalltalk.send($rec, "_add_", [smalltalk.send((1), "__at", [(0)])]);smalltalk.send($rec, "_add_", [smalltalk.send((1), "__at", [(1)])]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(smalltalk.Array, "_new", []));
return self;},
source: unescape('bounds%0A%09%5EArray%20new%0A%09%09add%3A%200@0%3B%0A%09%09add%3A%200@1%3B%0A%09%09add%3A%201@0%3B%0A%09%09add%3A%201@1%3B%0A%09%09yourself')}),
smalltalk.TetrisPieceO);



smalltalk.addClass('TetrisPieceL', smalltalk.TetrisPiece, [], 'Examples');
smalltalk.addMethod(
'_bounds',
smalltalk.method({
selector: 'bounds',
category: 'accessing',
fn: function (){
var self=this;
return (function($rec){smalltalk.send($rec, "_add_", [smalltalk.send((0), "__at", [(0)])]);smalltalk.send($rec, "_add_", [smalltalk.send((0), "__at", [(1)])]);smalltalk.send($rec, "_add_", [smalltalk.send((0), "__at", [(2)])]);smalltalk.send($rec, "_add_", [smalltalk.send((1), "__at", [(2)])]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(smalltalk.Array, "_new", []));
return self;},
source: unescape('bounds%0A%09%5EArray%20new%0A%09%09add%3A%200@0%3B%0A%09%09add%3A%200@1%3B%0A%09%09add%3A%200@2%3B%0A%09%09add%3A%201@2%3B%0A%09%09yourself')}),
smalltalk.TetrisPieceL);

smalltalk.addMethod(
'_color',
smalltalk.method({
selector: 'color',
category: 'accessing',
fn: function (){
var self=this;
return unescape("%23ffa");
return self;},
source: unescape('color%0A%09%5E%27%23ffa%27')}),
smalltalk.TetrisPieceL);

smalltalk.addMethod(
'_height',
smalltalk.method({
selector: 'height',
category: 'accessing',
fn: function (){
var self=this;
return (3);
return self;},
source: unescape('height%0A%09%5E3')}),
smalltalk.TetrisPieceL);



smalltalk.addClass('TetrisPieceJ', smalltalk.TetrisPiece, [], 'Examples');
smalltalk.addMethod(
'_color',
smalltalk.method({
selector: 'color',
category: 'accessing',
fn: function (){
var self=this;
return unescape("%23aaf");
return self;},
source: unescape('color%0A%09%5E%27%23aaf%27')}),
smalltalk.TetrisPieceJ);

smalltalk.addMethod(
'_bounds',
smalltalk.method({
selector: 'bounds',
category: 'accessing',
fn: function (){
var self=this;
return (function($rec){smalltalk.send($rec, "_add_", [smalltalk.send((1), "__at", [(0)])]);smalltalk.send($rec, "_add_", [smalltalk.send((1), "__at", [(1)])]);smalltalk.send($rec, "_add_", [smalltalk.send((1), "__at", [(2)])]);smalltalk.send($rec, "_add_", [smalltalk.send((0), "__at", [(2)])]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(smalltalk.Array, "_new", []));
return self;},
source: unescape('bounds%0A%09%5EArray%20new%0A%09%09add%3A%201@0%3B%0A%09%09add%3A%201@1%3B%0A%09%09add%3A%201@2%3B%0A%09%09add%3A%200@2%3B%0A%09%09yourself')}),
smalltalk.TetrisPieceJ);

smalltalk.addMethod(
'_height',
smalltalk.method({
selector: 'height',
category: 'accessing',
fn: function (){
var self=this;
return (3);
return self;},
source: unescape('height%0A%09%5E3')}),
smalltalk.TetrisPieceJ);



smalltalk.addClass('TetrisPieceI', smalltalk.TetrisPiece, [], 'Examples');
smalltalk.addMethod(
'_color',
smalltalk.method({
selector: 'color',
category: 'accessing',
fn: function (){
var self=this;
return unescape("%23faa");
return self;},
source: unescape('color%0A%09%5E%27%23faa%27')}),
smalltalk.TetrisPieceI);

smalltalk.addMethod(
'_bounds',
smalltalk.method({
selector: 'bounds',
category: 'accessing',
fn: function (){
var self=this;
return (function($rec){smalltalk.send($rec, "_add_", [smalltalk.send((0), "__at", [(0)])]);smalltalk.send($rec, "_add_", [smalltalk.send((0), "__at", [(1)])]);smalltalk.send($rec, "_add_", [smalltalk.send((0), "__at", [(2)])]);smalltalk.send($rec, "_add_", [smalltalk.send((0), "__at", [(3)])]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(smalltalk.Array, "_new", []));
return self;},
source: unescape('bounds%0A%09%5EArray%20new%0A%09%09add%3A%200@0%3B%0A%09%09add%3A%200@1%3B%0A%09%09add%3A%200@2%3B%0A%09%09add%3A%200@3%3B%0A%09%09yourself')}),
smalltalk.TetrisPieceI);

smalltalk.addMethod(
'_height',
smalltalk.method({
selector: 'height',
category: 'accessing',
fn: function (){
var self=this;
return (4);
return self;},
source: unescape('height%0A%09%5E4')}),
smalltalk.TetrisPieceI);



smalltalk.addClass('TetrisPieceT', smalltalk.TetrisPiece, [], 'Examples');
smalltalk.addMethod(
'_bounds',
smalltalk.method({
selector: 'bounds',
category: 'accessing',
fn: function (){
var self=this;
return (function($rec){smalltalk.send($rec, "_add_", [smalltalk.send((0), "__at", [(0)])]);smalltalk.send($rec, "_add_", [smalltalk.send((1), "__at", [(0)])]);smalltalk.send($rec, "_add_", [smalltalk.send((2), "__at", [(0)])]);smalltalk.send($rec, "_add_", [smalltalk.send((1), "__at", [(1)])]);return smalltalk.send($rec, "_yourself", []);})(smalltalk.send(smalltalk.Array, "_new", []));
return self;},
source: unescape('bounds%0A%09%5EArray%20new%0A%09%09add%3A%200@0%3B%0A%09%09add%3A%201@0%3B%0A%09%09add%3A%202@0%3B%0A%09%09add%3A%201@1%3B%0A%09%09yourself')}),
smalltalk.TetrisPieceT);

smalltalk.addMethod(
'_color',
smalltalk.method({
selector: 'color',
category: 'accessing',
fn: function (){
var self=this;
return unescape("%23aaf");
return self;},
source: unescape('color%0A%09%5E%27%23aaf%27')}),
smalltalk.TetrisPieceT);



