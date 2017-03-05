if(this.mg == undefined) {
	mg = {};
}

(function() {
	var TEST_RUNNER_TITLE = "Magica TEST RUNNER v0.1.0";
	
	var isSetted = function(value) {
		return value != null && value != undefined;
	};

	var dom_removeChildren = function(element) 
	{
		var parent = element.parentNode;
		var nextSibling = element.nextSibling;
	
		parent.removeChild(element);
		
		while(element.lastChild != null)
			element.removeChild(element.lastChild);

		parent.insertBefore(element, nextSibling);
	};
	
	var _= {};

	var _text = function(message) {
		if(message instanceof Node) {
			return message;
		}
		if(message instanceof Array) {
			var f = document.createDocumentFragment();
			for(var i in message) {
				f.appendChild(_text(message[i]));
			}
			return f;
		}
		
		return document.createTextNode(message.toString());
	};
	
	var _element = function(name, attrs, bodies) {
		var e = document.createElement(name);
		if(isSetted(attrs)) {
			if(typeof attrs == "string") {
				e.className = attrs;
			} else {
				for(var i in attrs) {
					e.setAttribute(i, attrs[i].toString());
				}
			}
		}
		if(isSetted(bodies)) {
			e.appendChild(_text(bodies));
		}
		
		return e;
	};
	
	var _span = function(attrs, bodies) {
		return _element("span", attrs, bodies);
	};
	var _div = function(attrs, bodies) {
		return _element("div", attrs, bodies);
	};
	var _a = function(attrs, bodies) {
		return _element("a", attrs, bodies);
	};
	var _br = function(attrs) {
		return _element("br", attrs, null);
	};
	var _pre = function(attrs, bodies) {
		return _element("pre", attrs, bodies);
	};
	var _dl = function(attrs, bodies) {
		return _element("dl", attrs, bodies);
	};
	var _dt = function(attrs, bodies) {
		return _element("dt", attrs, bodies);
	};
	var _dd = function(attrs, bodies) {
		return _element("dd", attrs, bodies);
	};
	
	var _equals = function(a, b) 
	{
		return a === b;
	};
	
	mg.AssertException = function(message)
	{
		this.message = message;
		if(this.stack != null) {
			this.stack = new Error().stack;
		}
	};
	mg.AssertException.prototype = new Error("AssertException");

	mg.assertEquals = function(actual, excepted) 
	{
		mg.testRunner._asserts++;
		if(!(_equals(actual, excepted))) {
			throw new mg.AssertException("assertEquals [actual: " + actual.toString() + ", excepted: " + excepted.toString() +  "]");
		}
	};
	mg.assertNotEquals = function(actual, excepted) 
	{
		mg.testRunner._asserts++;
		if(!(!_equals(actual, excepted))) {
			throw new mg.AssertException("assertNotEquals [actual: " + actual.toString() + ", excepted: " + excepted.toString() +  "]");
		}
	};
	mg.assertSame = function(actual, excepted) 
	{
		mg.testRunner._asserts++;
		if(!(actual === excepted)) {
			throw new mg.AssertException("assertSame [actual: " + actual.toString() + ", excepted: " + excepted.toString() +  "]");
		}
	};
	mg.assertNotSame = function(actual, excepted) 
	{
		mg.testRunner._asserts++;
		if(!(actual !== excepted)) {
			throw new mg.AssertException("assertNotSame [actual: " + actual.toString() + ", excepted: " + excepted.toString() +  "]");
		}
	};
	mg.assertNull = function(value) 
	{
		mg.testRunner._asserts++;
		if(!(value === null)) {
			throw new mg.AssertException("assertNull [value:" + value.toString() + "]");
		}
	};
	mg.assertNotNull = function(value) 
	{
		mg.testRunner._asserts++;
		if(!(value !== null)) {
			throw new mg.AssertException("assertNotNull [value: null]");
		}
	};
	mg.assertTrue = function(value) 
	{
		mg.testRunner._asserts++;
		if(!(value === true)) {
			throw new mg.AssertException("assertTrue [value:" + value.toString() + "]");
		}
	};
	mg.assertFalse = function(value) 
	{
		mg.testRunner._asserts++;
		if(!(value === false)) {
			throw new mg.AssertException("assertFalse [value:" + value.toString() + "]");
		}
	};
	mg.assertUndefined = function(value) 
	{
		mg.testRunner._asserts++;
		if(!(value === undefined)) {
			throw new mg.AssertException("assertUndefined [value:" + value.toString() + "]");
		}
	};
	mg.assertArrayEquals = function(actual, excepted)
	{
		mg.testRunner._asserts++;
		if(actual.length != excepted.length) {
			throw new mg.AssertException("assertArrayEquals unmatch length [actual: " + actual.toString() + ", excepted: " + excepted.toString() + "]");
		}
		for(var i = 0; i < actual.length; i++) {
			if(!(_equals(actual[i], excepted[i]))) {
				throw new mg.AssertException("assertArrayEquals [actual: " + actual[i].toString() + ", excepted: " + excepted[i].toString() + "]");
			}
		}
	};
	mg.assertArrayNotEquals = function(actual, excepted)
	{
		mg.testRunner._asserts++;
		if(actual.length != excepted.length) {
			return;
		}
		var unmatch = false;
		for(var i = 0; i < actual.length; i++) {
			if(!(_equals(actual[i], excepted[i]))) {
				unmatch = true;
			}
		}
		if(!unmatch) {
			throw new mg.AssertException("assertArrayNotEquals [actual: " + actual.toString() + ", excepted: " + excepted.toString() + "]");
		}
	};
	mg.fail = function(message) {
		mg.testRunner._asserts++;
		throw new mg.AssertException(isSetted(message) ? message: "fail");
	};
	
	mg.TestRunner = function() {
		this._testCases = [];
		this._passes = 0;
		this._errors = 0;
		this._asserts = 0;
		this._resultContext = null;
		this._statusContext = null;
		this._testCaseContext = null;
		this._block = null;
		this._showButton = null;
	};
	
	var TestRunner_call = function(thisObj, testCase, name, test)
	{
		try {
			test.call(testCase);
			
			TestRunner_ok(thisObj, name);
		} catch(ex) {
			TestRunner_error(thisObj, name, ex);
		}
	};
	
	var TestRunner_ok = function(thisObj, name)
	{
		thisObj._passes++;
		
		var block = _dl("mgBlock mgOK", [
			_dt("mgHead", [
				_span("mgType", "[OK]"), "\t",
				_span("mgName", name), " ",
			])
		]);
		thisObj._testCaseContext.appendChild(block);
		TestRunner_reportStatus(thisObj);
	};

	var TestRunner_error = function(thisObj, name, ex)
	{
		thisObj._errors++;
		
		var block = _dl("mgBlock mgError", [
			_dt("mgHead", [
				_span("mgType", "[ERROR]"), "\t",
				_span("mgName", name), " :\t",
				_span("mgMessage", ex.message),
			]),
			_dd("mgStack", _pre(null, ex.stack)),
		]);
		thisObj._testCaseContext.appendChild(block);
		TestRunner_reportStatus(thisObj);
	};
	
	var TestRunner_reportStatus = function(thisObj)
	{
		var status;
		var error;
		if(thisObj._errors > 0) {
			status = _span("mgError", "FAULURE");
			error = _span("mgError", "ERROR: " + thisObj._errors);
		} else {
			status = _span("mgOK", "SUCCESS");
			error = _span("mgPass", "ERROR: " + thisObj._errors);
		}
		
		var block = _div(null, [
			_span("mgStatus", "STATUS: "), " ", status, ", ",
			_span("mgPass", "PASS: " + thisObj._passes), ", ",
			error, ", ",
			_span("mgAsserts", "Asserts: " + thisObj._asserts),
		]);
		
		dom_removeChildren(thisObj._statusContext);
		thisObj._statusContext.appendChild(block);
	};

	var TestRunner_log = function(thisObj, type, message)
	{
		thisObj._console.appendChild(_span(type, message));
	};

	mg.out = function(message)
	{
		TestRunner_log(mg.testRunner, "mgText", message + "\r\n");
	};
	mg.error = function(message)
	{
		TestRunner_log(mg.testRunner, "mgError", message + "\r\n");
	};
	mg.warn = function(message)
	{
		TestRunner_log(mg.testRunner, "mgWarn", message + "\r\n");
	};
	mg.info = function(message)
	{
		TestRunner_log(mg.testRunner, "mgInfo", message + "\r\n");
	};

	mg.TestRunner.prototype.init = function()
	{
		this._resultContext = _div("mgResultContext");
		this._statusContext = _div("mgStatusContext");
		this._console = _pre("mgConsole");
		
		var block = _div("mgTestRunner", [
			_div("mgTitle", TEST_RUNNER_TITLE),
			this._statusContext,
			this._console,
			this._resultContext
		]);
		this._block = block;

		var showButton = _div("mgTestRunnerShowButton", "TEST");
		showButton.style.display = "none";
		this._showButton = showButton;
		
		var blockClicked = false;
		block.addEventListener("click", function() {
			blockClicked = true;
		});
		showButton.addEventListener("click", function() {
			blockClicked = true;
			mg.testRunner.show();
		});
		window.addEventListener("click", function(e) {
			if(e.button == 0) {
				if(blockClicked == false) {
					mg.testRunner.hide();
				}
			}
			blockClicked = false;
		});
		
		document.body.appendChild(block);
		document.body.appendChild(showButton);
	};
	
	mg.TestRunner.prototype.add = function(testCase)
	{
		this._testCases.push(testCase);
	};
	
	mg.TestRunner.prototype.run = function()
	{
		var index = 0;
		var thisObj = this;
		var loop = function() {
			if(index >= thisObj._testCases.length)
				return;

			var testCase = thisObj._testCases[index];
			var testCaseName = isSetted(testCase.name) ? testCase.name: "UNDEFINED";

			thisObj._testCaseContext = _div("mgTestCaseContext", 
				_div("mgCaption", testCaseName));
			thisObj._resultContext.appendChild(thisObj._testCaseContext);

			var setUp = isSetted(testCase.setUp) ? testCase.setUp: null;
			var tearDown = isSetted(testCase.tearDown) ? testCase.tearDown: null;
			var cases = [];
			for(var i in testCase) {
				if(i.indexOf("test") == 0) {
					cases.push({name: i, test: testCase[i]});
				}
			}
			
			try {
				if(setUp != null) {
					TestRunner_call(thisObj, testCase, "setUp", setUp);
				}
			
				for(var i = 0; i < cases.length; i++) {
					var name = cases[i].name;
					var test = cases[i].test;
					
					TestRunner_call(thisObj, testCase, name, test);
				}
			
				if(tearDown != null) {
					TestRunner_call(thisObj, testCase, "tearDown", tearDown);
				}
			} catch(ex) {
				console.error(ex);
				TestRunner_error(thisObj, testCaseName, ex);
			}

			index++;
			setTimeout(loop, 0);
		};
		setTimeout(loop, 0);
	};
	
	mg.TestRunner.prototype.hide = function()
	{
		this._block.style.display = "none";
		this._showButton.style.display = "";
	};
	
	mg.TestRunner.prototype.show = function()
	{
		this._block.style.display = "";
		this._showButton.style.display = "none";
	};
	
	mg.testRunner = new mg.TestRunner();
	
	window.addEventListener("load", function() {
		mg.testRunner.init();
		mg.testRunner.run();
	});
})();
