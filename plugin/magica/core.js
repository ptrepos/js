function mgAddClass(element, className)
{
	if(element.className.length <= 0) {
		element.className = className;
	} else {
		var classes = element.className.split(" ");
		var index = classes.indexOf(className);
		if(index >= 0) {
			classes.splice(index, 1);
		}
		classes.push(className);
		
		element.className = classes.join(" ");
	}
}

function mgRemoveClass(element, className)
{
	var classes = element.className.split(" ");
	var index = classes.indexOf(className);
	if(index >= 0) {
		classes.splice(index, 1);
		element.className = classes.join(" ");
	}
}

function mgToPxStr(value)
{
	return value.toString() + "px";
}

var __mgBox = null;
function mgShowMessages(messages, element)
{
	if(element == undefined) {
		element = null;
	}
	
	if(__mgBox != null) {
		__mgBox.close();
		__mgBox = null;
	}

	var ul = document.createElement("ul");
	for(var i = 0; i < messages.length; i++) {
		var li = document.createElement("li");
		li.appendChild(document.createTextNode(messages[i]));
		ul.appendChild(li);
	}
	
	__mgBox = new PopupBox(ul, 10000);
	
	if(element != null) {
		var left1 = element.offsetLeft + element.offsetWidth / 2;
		__mgBox.element.style.left = mgToPxStr(left1);
		__mgBox.element.style.top = mgToPxStr(element.offsetTop + element.offsetHeight);
	} else {
		__mgBox.element.style.right = "16px";
		__mgBox.element.style.bottom = "16px";
	}
	
	__mgBox.show();
}
function mgCloseMessages()
{
	if(__mgBox != null) {
		__mgBox.close();
		__mgBox = null;
	}
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
	var messages = this._validate();
	
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
		this._analayzeValidators(elem, elem.getAttribute("validate"));
	}
	this._validate();
}

FormValidator.prototype.validateInput = function(input)
{
	var messages = this._validateInput(input);
	if(messages.length > 0) {
		mgShowMessages(messages, input);
		return false;
	}
	return true;
}

FormValidator.prototype.setRequired = function(input, value) 
{
	input._required = value;
	
	if(input._required) {
		mgAddClass(input, "mg_required");
	} else {
		mgRemoveClass(input, "mg_required");
	}
}

FormValidator.prototype.getRequired = function(input) 
{
	return input._required;
}

FormValidator.prototype._analayzeValidators = function(input, expression)
{
	if(input.analyzed == true)
		return;
	if(expression == null || expression.length <= 0)
		return;

	var _required = false;
	
	const SECOND = TimeValidator.SECOND;
	const MINUTE = TimeValidator.MINUTE;

	function required()
	{
		_required = true;
		return new Validator();
	}
	function number(digits, precision)
	{
		return new NumberValidator(digits, precision);
	}
	function digit()
	{
		return new DigitValidator();
	}
	function letter()
	{
		return new LetterValidator();
	}
	function letterOrDigit()
	{
		return new LetterOrDigitValidator();
	}
	function year()
	{
		return new YearValidator();
	}
	function yearMonth()
	{
		return new YearMonthValidator();
	}
	function date()
	{
		return new DateValidator();
	}
	function time(type)
	{
		return new TimeValidator(type);
	}
	function dateTime(type)
	{
		return new DateTimeValidator(type);
	}
	function mailAddress()
	{
		return new MailAddressValidator();
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
	
	input.addEventListener('blur', function(e) {
		if(__mgFocused == null) {
			if(formValidator.validateInput(this) == false) {
				/*this.value = "";*/
				/*formValidator.validateInput(this);*/
				__mgFocused = this;
				setTimeout(function() {
					__mgFocused.focus();
					__mgFocused = null;
				}, 0);
			} else {
				mgCloseMessages();
			}
		}
	});
	
	input.analyzed = true;
}
var __mgFocused = null;

FormValidator.prototype._validate = function()
{
	var messages = [];
	for(var i = 0; i < this.form.elements.length; i++) {
		var submessages = this._validateInput(this.form.elements[i], true);
		for(var j = 0; j < submessages.length; j++) {
			messages.push(submessages[j]);
		}
	}
	return messages;
}

FormValidator.prototype._validateInput = function(input, requiredMessage)
{
	if(requiredMessage == undefined)
		requiredMessage = false;
	if(input.validators == null || input.validators == undefined)
		return true;

	var value = input.value;
	
	if(value != null || value.length > 0) {
		var messages = [];
		for(var i = 0; i < input.validators.length; i++) {
			var message = input.validators[i].validate(value, input.alt);
			if(message != null && message.length > 0) {
				messages.push(message);
			}
		}
	}
	
	if(input._required) {
		// 値が空白またはバリデータで無効判定が出ている場合、
		// 項目をNGとする。
		if(value == null || value.length <= 0 || messages.length > 0) {
			mgRemoveClass(input, "mg_required_ok");
			mgAddClass(input, "mg_required_ng");
			if(requiredMessage) {
				messages.push(input.alt + ValidationMessages.required);
			}
		} else {
			mgRemoveClass(input, "mg_required_ng");
			mgAddClass(input, "mg_required_ok");
		}
	}

	return messages;
}

function _convertToSampleType(value, sample)
{
	if(sample instanceof Number)
		return Number(value);
	else if(sample instanceof Date)
		return Date.parse(value);
	else 
		return value;
}

var ValidationMessagesDefault = {
	required: ": 値は必須入力です。",
	number: ": 値は整数でなければいけません。",
	numberDigits: ": 値は整数部${digits}桁以下の整数でなければいけません。",
	numberPrecision: ": 値は少数部${precision}桁以内でなければいけません。",
	numberDigitsPrecision: ": 値は整数部${digits}桁,少数部${precision}桁以内でなければいけません。",
	yearMonth: ": 値は年月でなければいけません。(yyyy/MM)",
	date: ": 値は日付でなければいけません。(yyyy/MM/dd)",
	timeMinute: ": 値は時刻でなければいけません。(HH:mm)",
	timeSecond: ": 値は時刻でなければいけません。(HH:mm:ss)",
	dateTimeMinute: ": 値は日時でなければいけません。(yyyy/MM/dd HH:mm)",
	dateTimeSecond: ": 値は日時でなければいけません。(yyyy/MM/dd HH:mm:ss)",
	letter: ": 値は英字でなければいけません。",
	digits: ": 値は数字でなければいけません。",
	letterOrDigits: ": 値は英数字でなければいけません。",
	mailAddress: ": 値はメールアドレスでなければいけません。",
	max: ": 値は${value}以下でなければいけません。",
	min: ": 値は${value}以上でなければいけません。",
};

var ValidationMessages = ValidationMessagesDefault;

/*
 * class Validator;
 * @brief
 *   バリデータベースクラス
 */
function Validator()
{
}
Validator.prototype.validate = function(value, caption)
{
	return null;
}
Validator.prototype.layout = function(element)
{
}
Validator.prototype.unlayout = function(element)
{
}

/*
 * class _RegExpValidatorBase
 * @brief
 *   正規表現バリデータ
 */
function _RegExpValidatorBase(expression, className)
{
	this.pattern = new RegExp(expression);
	this.className = className;
}
_RegExpValidatorBase.prototype = new Validator();

_RegExpValidatorBase.prototype.createMessage = function(caption)
{
	return caption + ValidationMessages[this.messageId];
}

_RegExpValidatorBase.prototype.validate = function(value, caption)
{
	if(value == null || value.length <= 0)
		return null;
		
	if(!this.pattern.test(value)) {
		return this.createMessage(caption);
	}
	return null;
}

_RegExpValidatorBase.prototype.layout = function(element)
{
	mgAddClass(element, this.className);
}

_RegExpValidatorBase.prototype.unlayout = function(element)
{
	mgRemoveClass(element, this.className);
}

/*
 * class NumberValidator;
 */
function NumberValidator(digits, precision)
{
	if(digits == undefined) {
		digits = null;
	}
	if(precision == undefined || precision == null) {
		precision = 0;
	}
	
	var pattern = "^";
	if(digits == null) {
		pattern += "[+-]?[0-9]+";
	} else {
		pattern += "[+-]?[0-9]{1,"+ digits +"}"
	}
	
	if(precision <= 0) {
	} else {
		pattern += "([\.][0-9]{1," + precision + "}|)";
	}
	
	pattern += "$";
	
	this.digits = digits;
	this.precision = precision;
	this.pattern = new RegExp(pattern);
	this.className = "number_field";
}
NumberValidator.prototype = new _RegExpValidatorBase();

NumberValidator.prototype.createMessage = function(caption)
{
	var text = null;
	if(this.digits != null && this.precision > 0) {
		text = ValidationMessages.numberDigitsPrecision;
	} else if(this.digits != null && this.precision <= 0) {
		text = ValidationMessages.numberDigits;
	} else if(this.digits == null && this.precision > 0) {
		text = ValidationMessages.numberPrecision;
	} else {
		text = ValidationMessages.number;
	}
	return caption + 
	       text.replace("${digits}", this.digits == null ? "null": this.digits.toString())
	           .replace("${precision}", this.precision.toString());
}

/*
 * class LetterValidator;
 */
function LetterValidator()
{
	this.pattern = new RegExp("^[a-zA-Z]$");
	this.className = "letter_field";
	this.messageId = "letter";
}
LetterValidator.prototype = new _RegExpValidatorBase();

/*
 * class DigitValidator;
 */
function DigitValidator()
{
	this.pattern = new RegExp("^[0-9]$");
	this.className = "digit_field";
	this.messageId = "digits";
}
DigitValidator.prototype = new _RegExpValidatorBase();

/*
 * class LetterOrDigitValidator;
 */
function LetterOrDigitValidator()
{
	this.pattern = new RegExp("^[0-9]+$");
	this.className = "letter_or_digit_field";
	this.messageId = "letterOrDigit";
}
LetterOrDigitValidator.prototype = new _RegExpValidatorBase();


/**
 * class YearValidator;
 */
function YearMonthValidator()
{
	this.pattern = new RegExp("^[0-9]{1,4}[-/][0-9]{1,2}$");
	this.className = "year_month_field";
	this.messageId = "yearMonth";
}
YearMonthValidator.prototype = new _RegExpValidatorBase();

YearMonthValidator.prototype.validate = function(value, caption)
{
	if(value == null || value.length <= 0)
		return null;
		
	if(!this.pattern.test(value) || Date.parse(value) == NaN) {
		return this.createMessage(caption);
	}
	return null;
}

/**
 * class DateValidator;
 */
function DateValidator()
{
	this.pattern = new RegExp("^[0-9]{1,4}[-/][0-9]{1,2}[-/][0-9]{1,2}$");
	this.className = "date_field";
	this.messageId = "date";
}
DateValidator.prototype = new YearMonthValidator();

/**
 * class TimeValidator;
 */
function TimeValidator(type)
{
	if(type == undefined || type == null) {
		type = TimeValidator.SECOND;
	}
	
	if(type == TimeValidator.SECOND) {
		this.pattern = new RegExp("^[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$");
		this.messageId = "timeSecond";
	} else {
		this.pattern = new RegExp("^[0-9]{1,2}:[0-9]{1,2}$");
		this.messageId = "timeMinute";
	}
	this.className = "time_field";
}
TimeValidator.prototype = new YearMonthValidator();

TimeValidator.MINUTE = "minute";
TimeValidator.SECOND = "second";

/**
 * class DateTimeValidator;
 */
function DateTimeValidator(type)
{
	if(type == undefined || type == null) {
		type = TimeValidator.SECOND;
	}
	
	if(type == TimeValidator.SECOND) {
		this.pattern = new RegExp("^[0-9]{1,4}[-/][0-9]{1,2}[-/][0-9]{1,2}([ ]+|T)[0-9]{1,2}:[0-9]{1,2}:[0-9]{1,2}$");
		this.messageId = "dateTimeSecond";
	} else {
		this.pattern = new RegExp("^[0-9]{1,4}[-/][0-9]{1,2}[-/][0-9]{1,2}([ ]+|T)[0-9]{1,2}:[0-9]{1,2}$");
		this.messageId = "dateTimeMinute";
	}
	this.className = "date_time_field";
}
DateTimeValidator.prototype = new YearMonthValidator();

/**
 * class MailAddressValidator;
 */
function MailAddressValidator()
{
	this.pattern = new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$");
	this.className = "mail_address_field";
	this.messageId = "mailAddress";
}
MailAddressValidator.prototype = new _RegExpValidatorBase();

/**
 * class MaxValidator;
 */
function MaxValidator(value) 
{
	this.value = value;
}
MaxValidator.prototype = new Validator();

MaxValidator.prototype.validate = function(value, caption)
{
	if(value == null || value.length <= 0)
		return null;

	var converted = _convertToSampleType(value, this.value);
	if(converted > this.value) {
		return caption + ValidationMessages.max.replace("${value}", this.value.toString());
	}
	return null;
}

/**
 * class MinValidator;
 */
function MinValidator(value) 
{
	this.value = value;
}
MinValidator.prototype = new Validator();

MinValidator.prototype.validate = function(value, caption)
{
	if(value == null || value.length <= 0)
		return null;

	var converted = _convertToSampleType(value, this.value);
	if(converted < this.value) {
		return caption + ValidationMessages.min.replace("${value}", this.value.toString());
	}
	return null;
}

ActionManager.start();