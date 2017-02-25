function mgAddClass(element, className)
{
	element.className = element.className + " " + className;
}
function mgRemoveClass(element, className)
{
	var classes = element.className.split(" ");
	classes.remove(className);
	element.className = classes.join(" ");
}
function mgToPxStr(value)
{
	return value.toString() + "px";
}
/**
 * class Action;
 */
function Action()
{
}
Action.prototype._next = null;
Action.prototype._previous = null;
Action.prototype.ticks = 0;


function ActionEvent(ticks)
{
	this.ticks = ticks;
}
ActionEvent.prototype.exited = false;

Action.prototype.doAction = function(event)
{
	event.exited = true;
}

/**
 * class ActionManager;
 */
function ActionManager()
{
}
ActionManager.root = null;
ActionManager.started = false;
ActionManager.ticks = false;
ActionManager.frameTicks = 30;

ActionManager.addAction = function(obj)
{
	obj.ticks = this.ticks;
	
	if(this.root == null) {
		this.root = obj;
	} else {
		this.root._previous = obj;
		obj._next = this.root;
		this.root = obj;
	}
}

ActionManager.removeAction = function(obj)
{
	if(obj._next != null) {
		obj._next._previous = obj._previous;
	}
	if(obj._previous != null) {
		obj._previous._next = obj._next;
	}
	if(this.root == obj) {
		this.root = obj._next;
	}
	obj._previous = null;
	obj._next = null;
}

ActionManager.clearActions = function()
{
	this.root = null;
}

ActionManager.start = function()
{
	this.started = true;
	this._run();
}

ActionManager.stop = function()
{
	this.started = false;
}

ActionManager._run = function()
{
	if(!this.started)
		return;
	
	this.ticks = new Date().getTime();

	var node = this.root;
	while(node != null) {
		var event = new ActionEvent(this.ticks);
		node.doAction(event);
		if(event.exited) {
			if(node._previous != null) {
				node._previous._next = node._next;
			}
			if(node._next != null) {
				node._next._previous = node._previous;
			}
			if(node == this.root) {
				this.root = node._next;
			}
			var node1 = node._next;
			
			node._previous = null;
			node._next = null;
			
			node = node1;
		} else {
			node = node._next;
		}
	}
	
	var ticks = new Date().getTime();
	var timeout = (ActionManager.frameTicks - (ticks- this.ticks));
	if(timeout < 0) {
		timeout = 0;
	}
	
	var thisObj = this;
	window.setTimeout(function() {
		thisObj._run();
	}, timeout);
	
	this.ticks = ticks;
}

/**
 * class FadeinAction;
 */
function FadeinAction(element)
{
	this.element = element;
	this.interval = 200;
	this.startSize = 0.0;
	this.endSize = 1.0;
	this.width = element.offsetWidth;
	this.height = element.offsetHeight;
	this.top = element.offsetTop;
	this.left = element.offsetLeft;
	
	var opacity = 1.0;
	if(element.style.opacity != "") {
		opacity = parseFloat(element.style.opacity);
	}
	this.startOpacity = 0.0;
	this.endOpacity = opacity;
}
FadeinAction.prototype = new Action();
FadeinAction.prototype.doAction = function(e)
{
	var s = this.element.style;
	
	var ticks = e.ticks - this.ticks;
	if(ticks >= this.interval) {
		s.visibility = "visible";
		s.width = mgToPxStr(this.width);
		s.height = mgToPxStr(this.height);
		s.top = mgToPxStr(this.top);
		s.left = mgToPxStr(this.left);
		s.bottom = "";
		s.right = "";
		s.opacity = "";
		e.exited = true;
		return;
	}
	
	var ratio = ticks / this.interval;
	var opacity = this.startOpacity + ((this.endOpacity - this.startOpacity) * ratio);
	
	var size = this.startSize + ((this.endSize - this.startSize) * ratio);
	var width = this.width * size;
	var height = this.height * size;
	var left = this.left + this.width * 0.5 * (1.0 - size);
	var top = this.top + this.height * 0.5 * (1.0 - size);

	s.visibility = "visible";
	s.width = mgToPxStr(width);
	s.height = mgToPxStr(height);
	s.left = mgToPxStr(left);
	s.top = mgToPxStr(top);
	s.opacity = opacity.toString();
}

/**
 * class FadeoutAction;
 */
function FadeoutAction(element)
{
	this.element = element;
	this.interval = 300;
	
	var opacity = 1.0;
	if(element.style.opacity != "") {
		opacity = parseFloat(element.style.opacity);
	}
	this.startOpacity = opacity;
}
FadeoutAction.prototype = new Action();
FadeoutAction.prototype.doAction = function(e)
{
	var s = this.element.style;
	
	var ticks = e.ticks - this.ticks;
	if(ticks >= this.interval) {
		s.opacity = "";
		s.visibility = "hidden";
		e.exited = true;
		return;
	}
	
	var ratio = ticks / this.interval;
	var opacity = this.startOpacity * (1.0 - ratio);
	
	s.visibility = "visible";
	s.opacity = opacity.toString();
}

function ActionObject()
{
}
ActionObject.prototype = new Action();

/**
 * class PopupBox;
 */
function PopupBox(node, autoCloseDelay)
{
	if(autoCloseDelay == undefined || autoCloseDelay == null)
		autoCloseDelay = 5000;
	
	var outerDiv = document.createElement("div");
	var innerDiv = document.createElement("div");
	
	innerDiv.style.visibility = "hidden";
	innerDiv.appendChild(node);
	
	outerDiv.className = "mg_popupbox";
	outerDiv.style.visibility = "hidden";
	outerDiv.appendChild(innerDiv);
	
	var thisObj = this;
	outerDiv.addEventListener("click", function(e) {
		thisObj.close();
	});
	
	this.node = node;
	this.outerDiv = outerDiv;
	this.innerDiv = innerDiv;
	this.status = PopupBox.STATUS_WAIT;
	this.autoCloseDelay = autoCloseDelay;
	this.element = outerDiv;
	this.onclosed = null;
	
	this._fadeinAction = null;
	this._fadeoutAction = null;
	this._width = null;
	this._height = null;
}
PopupBox.prototype = new ActionObject();

PopupBox.STATUS_WAIT = 0;
PopupBox.STATUS_OPENING = 1;
PopupBox.STATUS_VIEW = 2;
PopupBox.STATUS_CLOSING = 3;
PopupBox.STATUS_CLOSED = 4;

PopupBox.prototype.show = function()
{
	if(this.status >= PopupBox.STATUS_OPENING) {
		this.__forceClose();
	}
	
	this.status = PopupBox.STATUS_OPENING;
	this.innerDiv.style.visibility = "hidden";
	this.outerDiv.style.visibility = "hidden";
	document.body.appendChild(this.outerDiv);
	
	if(this._width == null) {
		this._width = this.outerDiv.offsetWidth;
		this._height = this.outerDiv.offsetHeight;
	}
	
	ActionManager.addAction(this);
}

PopupBox.prototype.close = function()
{
	if(PopupBox.STATUS_OPENING <= this.status && this.status <= PopupBox.STATUS_VIEW) {
		this.status = PopupBox.STATUS_CLOSING;
	}
}

PopupBox.prototype.__forceClose = function()
{
	this._fadeinAction = null;
	this._fadeoutAction = null;
	this.status = PopupBox.STATUS_WAIT;
	this.outerDiv.parentNode.removeChild(this.outerDiv);
	
	var s = this.outerDiv.style;
	s.visibility = "";
	s.width = mgToPxStr(this._width);
	s.height = mgToPxStr(this._height);
	
	ActionManager.removeAction(this);
	
	if(this.onclosed != null) {
		this.onclosed(new Object());
	}
}

PopupBox.prototype.doAction = function(e)
{
	switch(this.status) {
	case PopupBox.STATUS_WAIT:
		break;
	case PopupBox.STATUS_OPENING:
		if(this._fadeinAction == null) {
			this._fadeinAction = new FadeinAction(this.outerDiv);
			this._fadeinAction.interval = 100;
			this._fadeinAction.ticks = e.ticks;
		}
		var event = new ActionEvent(e.ticks);
		this._fadeinAction.doAction(event);
		if(event.exited) {
			this.status = PopupBox.STATUS_VIEW;
			this._fadeinAction = null;
		}
		break;
	case PopupBox.STATUS_VIEW:
		this.innerDiv.style.visibility = "visible";
		this.outerDiv.style.visibility = "visible";

		if(this.autoCloseDelay != null) {
			if((e.ticks - this.ticks) >= this.autoCloseDelay) {
				this.status = PopupBox.STATUS_CLOSING;
			}
		}
		break;
	case PopupBox.STATUS_CLOSING:
		if(this._fadeoutAction == null) {
			this._fadeoutAction = new FadeoutAction(this.outerDiv);
			this._fadeoutAction.interval = 200;
			this._fadeoutAction.ticks = e.ticks;
		}
		var event = new ActionEvent(e.ticks);
		this._fadeoutAction.doAction(event);
		if(event.exited) {
			this.status = PopupBox.STATUS_CLOSED;
			this._fadeoutAction = null;
		}
		break;
	case PopupBox.STATUS_CLOSED:
		this.__forceClose();
		e.exited = true;
		
		break;
	}
}

function __showMessages(messages)
{
	var ul = document.createElement("ul");
	for(var i = 0; i < messages.length; i++) {
		var li = document.createElement("li");
		li.appendChild(document.createTextNode(messages[i]));
		ul.appendChild(li);
	}
	
	var box = new PopupBox(ul);
	box.element.style.right = "16px";
	box.element.style.bottom = "16px";
	box.show();
}

/**
 * class FormValidator;
 */
function FormValidator(form)
{
	this.form = form;
	this.reanalayze();
	
	var formValidator = this;
	form.addEventListener('submit', function(e) {
		if(formValidator.validate() == false) {
			e.preventDefault();
			e.stopPropagation();
		}
	});
}

FormValidator.prototype.validate = function()
{
	var messages = [];
	
	if(messages.length > 0) {
		alert(messages.join('\r\n'));
		return false;
	}
	return true;
}

FormValidator.prototype.reanalayze = function()
{
	for(var i = 0; i < this.form.elements.length; i++) {
		var elem = this.form.elements[i];
		this._analayzeValidators(elem, elem.getAttribute("mg_validate"));
	}
	this._validate();
}

FormValidator.prototype.validateInput = function(input)
{
	var messages = this._validateInput(input);
	
	if(messages.length > 0) {
		__showMessages(messages);
		return false;
	}
	return true;
}

FormValidator.prototype.setRequired = function(input, value) 
{
	input.required = value;
	
	if(input.required) {
		mgAddClass(input, "mg_required");
	} else {
		mgRemoveClass(input, "mg_required");
	}
	
	formValidator._validateInput(input);
}

FormValidator.prototype.getRequired = function(input) 
{
	return input.required;
}

FormValidator.prototype._analayzeValidators = function(input, expression)
{
	if(input.analyzed == true)
		return;

	var _required = false;
	
	const SECOND = TimeField.SECOND;
	const MINUTE = TimeField.MINUTE;

	function required()
	{
		_required = true;
		return new Validator();
	}
	function number(digits, precision)
	{
		return new NumberField(digits, precision);
	}
	function digit()
	{
		return new DigitField();
	}
	function letter()
	{
		return new LetterField();
	}
	function letterOrDigit()
	{
		return new LetterOrDigitField();
	}
	function year()
	{
		return new YearField();
	}
	function yearMonth()
	{
		return new YearMonthField();
	}
	function date()
	{
		return new DateField();
	}
	function time(type)
	{
		return new TimeField(type);
	}
	function dateTime(type)
	{
		return new DateTimeField(type);
	}
	function mailAddress()
	{
		return new MailAddressField();
	}
	function max(value)
	{
		return new MaxValidator(value);
	}
	function min(value)
	{
		return new MinValidator(value);
	}
	
	var formValidator = this;

	input.analyzed = true;
	input.validators = eval("[" + expression + "]");
	
	this.setRequired(input, _required);

	for(var i = 0; i < input.validators.length; i++) {
		input.validators[i].layout(input);
	}
	
	input.unchangedValue = input.value;
	
	input.addEventListener('focus', function(e) {
		this.unchangedValue = this.value;
	});
	input.addEventListener('bulr', function(e) {
		if(formValidator._validateInput(this) == false) {
			this.value = this.unchangedValue;
		}
	});
}

FormValidator.prototype._validate = function()
{
	var messages = [];
	for(var i = 0; i < this.form.elements.length; i++) {
		var submessages = this._validateInput(this.form.elements[i]);
		for(var i = 0; i < submessages.length; i++) {
			messages.push(submessages[i]);
		}
	}
	return messages;
}

FormValidator.prototype._validateInput = function(input)
{
	var value = input.value;
	if(input.required) {
		if(value == null || value.length <= 0) {
			removeClass(input, "mg_required_ok");
			addClass(input, "mg_required_ng");
		} else {
			removeClass(input, "mg_required_ng");
			addClass(input, "mg_required_ok");
		}
	}
	
	var messages = [];
	for(var i = 0; i < input.validators.length; i++) {
		var message = input.validators[i].validate(input);
		if(message == null || message.length <= 0) {
			messages.push(message);
		}
	}
	return messages;
}
