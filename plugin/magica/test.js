if(mg == undefined) {
	mg = {};
}

(function() {
	var TEST_RUNNER_TITLE = "Magica TEST RUNNER v0.1.0";
	
	mg.isDefault = function(value) {
		return value != null && value != undefined;
	}
	var isDefault = mg.isDefault;
	
	mg.html = {};
	
	var html = mg.html;

	html.text = function(message) {
		if(message instanceof Node) {
			return message;
		}
		if(message instanceof Array) {
			var f = document.createFragment();
			for(var i in message) {
				f.appendChild(html_text(message[i]));
			}
			return f;
		}
		return document.createTextNode(message.toString());
	};
	
	html.element = function(name, attrs, bodies) {
		var e = document.createElement(name);
		if(attrs instanceof String) {
			e.className = attrs;
		} else {
			for(var i in attrs) {
				e.setAttribute(i, attrs[i].toString());
			}
		}
		if(!isDefault(bodies)) {
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
		return html_element("span", attrs, bodies);
	};
	html.a = function(attrs, bodies) {
		return html_element("a", attrs, bodies);
	};
	html.br = function() {
		return html_element("br", null, null);
	};
	
	mg.AssertException = function(message) {
		this.message = message;
	};
	mg.AssertException.prototype = new Error("AssertException");

	mg.assertEquals = function(expression, value, message) {
		if(expression === value) {
			throw new mg.AssertException("excepted [" + value + "]");
		}
	}
	mg.assertNotEquals = function(expression, value, message) {
		if(expression !== value) {
			throw new mg.AssertException("excepted [" + value + "]");
		}
	}
	mg.assertNull = function(expression, message) {
		if(expression !== null) {
			throw new mg.AssertException("excepted");
		}
	}
	mg.assertNotNull = function(expression, message) {
		if(!(expression !== null)) {
			throw new mg.AssertException("excepted");
		}
	}
	mg.assertFail = function(message) {
		throw new mg.AssertException(message);
	}
	
	mg.TestRunner = {};
	mg.TestRunner._testCases = [];
	mg.TestRunner._resultContext = null;
	mg.TestRunner._statusContext = null;
	mg.TestRunner._testCaseContext = null;
	
	mg.TestRunner._success = function(name)
	{
		var block = html.div("mg_block", [
			html.div("mg_head", [
				"[", html.span("mg_success", "SUCCESS"), "] ", 
				html.span("mg_name", name)
			])
		]);
		this._testCaseContext.appendChild(block);
	}

	mg.TestRunner._error = function(name, ex)
	{
		var block = html.div("mg_block", [
			html.div("mg_head", [
				"[", html.span("mg_error", "ERROR"), "] ", 
				html.span("mg_message", ex.message),
			]),
			html.div("mg_stack", ex.stack)
		]);
		this._testCaseContext.appendChild(block);
	}
	
	mg.TestRunner.init = function()
	{
		this._resultContext = html.div("mgResultContext");
		this._statusContext = html.div("mgStatus");
		
		var block = html.div("mgTestRunner", [
			html.div("mgTitle", TEST_RUNNER_TITLE),
			this.statusContext,
			this.resultContext
		]);
		document.body.appendChild(block);
	}
	
	mg.TestRunner.add = function(testCase)
	{
		var testCaseName = isDefault(testCase.name) ? "UNDEFINED": testCase.name;
		
		this._testCases.push({type: "testCase", name: testCaseName});
		for(var name in testCase) {
			if(name.startsWith("test")) {
				this._testCases.push({type: "test", name: name, test: testCase[name]});
			}
		}
	}
	
	mg.TestRunner.run = function(testCase)
	{
		var index = 0;
		var timeoutLoop = function() {
			if(index >= mg.TestRunner._testCases.length) {
				return;
			}
			if(mg.TestRunner._testCases[index].type == "testCase") {
				this._testCaseContext = html.div("mg_testCaseContext", 
					html.div("mg_caption", mg.TestRunner._testCases[index].name));
				this._resultContext.appendChild(this.testCaseContext);
				break;
			} else {
				var name = testCaseArray[index].name;
				var test = testCaseArray[index].test;
				
				index++;
				
				try {
					test();
					
					mg.TestRunner._success(name);
				} catch(ex) {
					mg.TestRunner._error(name, ex);
				}
			}
			setTimeout(0, timeoutLoop);
		};
		setTimeout(0, timeoutLoop);
	}
	
	document.addEventListener("load", function() {
		mg.TestRunner.init();
		mg.TestRunner.run();
	});
})();
