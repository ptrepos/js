if(this.mg == undefined) {
	mg = {};
}

(function() {
	var TEST_RUNNER_TITLE = "Magica TEST RUNNER v0.1.0";
	
	mg.isSetted = function(value) {
		return value != null && value != undefined;
	}
	var isSetted = mg.isSetted;

	mg.dom = {};
	
	var dom = mg.dom;
	
	dom.removeChildren = function(element) 
	{
		var parent = element.parentNode;
		var nextSibling = element.nextSibling;
	
		parent.removeChild(element);
		
		while(element.lastChild != null)
			element.removeChild(element.lastChild);

		parent.insertBefore(element, nextSibling);
	}
	var dom_removeChildren = dom.removeChildren;

	mg.html = {};
	
	var html = mg.html;

	html.text = function(message) {
		if(message instanceof Node) {
			return message;
		}
		if(message instanceof Array) {
			var f = document.createDocumentFragment();
			for(var i in message) {
				f.appendChild(html_text(message[i]));
			}
			return f;
		}
		
		return document.createTextNode(message.toString());
	};
	
	html.element = function(name, attrs, bodies) {
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
			e.appendChild(html_text(bodies));
		}
		
		return e;
	};
	var html_text = html.text;
	var html_element = html.element;
	
	html.span = function(attrs, bodies) {
		return html_element("span", attrs, bodies);
	};
	html.div = function(attrs, bodies) {
		return html_element("div", attrs, bodies);
	};
	html.a = function(attrs, bodies) {
		return html_element("a", attrs, bodies);
	};
	html.br = function(attrs) {
		return html_element("br", attrs, null);
	};
	html.pre = function(attrs, bodies) {
		return html_element("pre", attrs, bodies);
	};
	html.dl = function(attrs, bodies) {
		return html_element("dl", attrs, bodies);
	};
	html.dt = function(attrs, bodies) {
		return html_element("dt", attrs, bodies);
	};
	html.dd = function(attrs, bodies) {
		return html_element("dd", attrs, bodies);
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
		if(!(_equals(actual, excepted))) {
			throw new mg.AssertException("assertEquals [actual: " + actual.toString() + ", excepted: " + excepted.toString() +  "]");
		}
	};
	mg.assertNotEquals = function(actual, excepted) 
	{
		if(!(!_equals(actual, excepted))) {
			throw new mg.AssertException("assertNotEquals [actual: " + actual.toString() + ", excepted: " + excepted.toString() +  "]");
		}
	};
	mg.assertSame = function(actual, excepted) 
	{
		if(!(actual === excepted)) {
			throw new mg.AssertException("assertSame [actual: " + actual.toString() + ", excepted: " + excepted.toString() +  "]");
		}
	};
	mg.assertNotSame = function(actual, excepted) 
	{
		if(!(actual !== excepted)) {
			throw new mg.AssertException("assertNotSame [actual: " + actual.toString() + ", excepted: " + excepted.toString() +  "]");
		}
	};
	mg.assertNull = function(value) 
	{
		if(!(value === null)) {
			throw new mg.AssertException("assertNull [value:" + value.toString() + "]");
		}
	};
	mg.assertNotNull = function(value) 
	{
		if(!(value !== null)) {
			throw new mg.AssertException("assertNotNull [value: null]");
		}
	};
	mg.assertTrue = function(value) 
	{
		if(!(value === true)) {
			throw new mg.AssertException("assertTrue [value:" + value.toString() + "]");
		}
	};
	mg.assertFalse = function(value) 
	{
		if(!(value === false)) {
			throw new mg.AssertException("assertFalse [value:" + value.toString() + "]");
		}
	};
	mg.assertUndefined = function(value) 
	{
		if(!(value === undefined)) {
			throw new mg.AssertException("assertUndefined [value:" + value.toString() + "]");
		}
	};
	mg.assertArrayEquals = function(actual, excepted)
	{
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
		throw new mg.AssertException(isSetted(message) ? message: "fail");
	};
	
	mg.TestRunner = function() {
		this._testCases = [];
		this._passes = 0;
		this._errors = 0;
		this._resultContext = null;
		this._statusContext = null;
		this._testCaseContext = null;
		this._block = null;
		this._showButton = null;
	};
	
	var TestRunner_ok = function(thisObj, name)
	{
		thisObj._passes++;
		
		var block = html.dl("mgBlock mgOK", [
			html.dt("mgHead", [
				html.span("mgType", "[OK]"), "\t",
				html.span("mgName", name), " ",
			])
		]);
		thisObj._testCaseContext.appendChild(block);
		TestRunner_reportStatus(thisObj);
	};

	var TestRunner_error = function(thisObj, name, ex)
	{
		thisObj._errors++;
		
		var block = html.dl("mgBlock mgError", [
			html.dt("mgHead", [
				html.span("mgType", "[ERROR]"), "\t",
				html.span("mgName", name), " :\t",
				html.span("mgMessage", ex.message),
			]),
			html.dd("mgStack", html.pre(null, ex.stack)),
		]);
		thisObj._testCaseContext.appendChild(block);
		TestRunner_reportStatus(thisObj);
	};
	
	var TestRunner_reportStatus = function(thisObj)
	{
		var status;
		var error;
		if(thisObj._errors > 0) {
			status = html.span("mgError", "FAULURE");
			error = html.span("mgError", "ERROR: " + thisObj._errors);
		} else {
			status = html.span("mgOK", "SUCCESS");
			error = html.span("mgPass", "ERROR: " + thisObj._errors);
		}
		
		var block = html.div(null, [
			html.span("mgStatus", "STATUS: "), " ", status, ", ",
			html.span("mgPass", "PASS: " + thisObj._passes), ", ",
			error,
		]);
		
		dom_removeChildren(thisObj._statusContext);
		thisObj._statusContext.appendChild(block);
	};

	var TestRunner_log = function(thisObj, type, message)
	{
		thisObj._console.appendChild(html.span(type, message));
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
		this._resultContext = html.div("mgResultContext");
		this._statusContext = html.div("mgStatusContext");
		this._console = html.pre("mgConsole");
		
		var block = html.div("mgTestRunner", [
			html.div("mgTitle", TEST_RUNNER_TITLE),
			this._statusContext,
			this._console,
			this._resultContext
		]);
		this._block = block;

		var showButton = html.div("mgTestRunnerShowButton", "TEST");
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
		var testCaseName = isSetted(testCase.name) ? testCase.name: "UNDEFINED";
		
		this._testCases.push({type: "testCase", name: testCaseName});
		for(var name in testCase) {
			if(name.indexOf("test") == 0) {
				this._testCases.push({type: "test", name: name, test: testCase[name]});
			}
		}
	};
	
	mg.TestRunner.prototype.run = function()
	{
		var index = 0;
		var thisObj = this;
		var testCases = thisObj._testCases;
		var loop = function() {
			for(var i = 0; i < 8; i++) {
				if(index >= testCases.length) {
					return;
				}
				if(testCases[index].type == "testCase") {
					thisObj._testCaseContext = html.div("mgTestCaseContext", 
						html.div("mgCaption", testCases[index].name));
					thisObj._resultContext.appendChild(thisObj._testCaseContext);
				} else {
					var name = testCases[index].name;
					var test = testCases[index].test;
					
					try {
						test();
						
						TestRunner_ok(thisObj, name);
					} catch(ex) {
						TestRunner_error(thisObj, name, ex);
					}
				}

				index++;
			}
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
