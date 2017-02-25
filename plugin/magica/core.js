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
		__mgBox.element.style.position = "absolute";
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
		alert(messages.join('\n'));
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
		this._validateInput(input);
	} else {
		mgRemoveClass(input, "mg_required");
		mgRemoveClass(input, "mg_required_ng");
		mgRemoveClass(input, "mg_required_ok");
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
	function UTF16(maxLength)
	{
		return new Utf16LengthValidator(maxLength);
	}
	function UTF8(maxLength)
	{
		return new Utf8LengthValidator(maxLength);
	}
	function Shift_JIS(maxLength)
	{
		return new ShiftJisLengthValidator(maxLength);
	}
	function EUC_JP(maxLength)
	{
		return new EucJpLengthValidator(maxLength);
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
				messages.push(ValidationMessages.required.replace("${caption}", input.alt));
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
	required: "「${caption}」は必須入力です。",
	number: "「${caption}」は整数です。",
	numberDigits: "「${caption}」は整数部${digits}桁以下の整数です。",
	numberPrecision: "「${caption}」は少数部${precision}桁以内です。",
	numberDigitsPrecision: "「${caption}」は整数部${digits}桁,少数部${precision}桁以内です。",
	yearMonth: "「${caption}」の値は年月です。(yyyy/MM)",
	date: "「${caption}」は日付です。(yyyy/MM/dd)",
	timeMinute: "「${caption}」は時刻です。(HH:mm)",
	timeSecond: "「${caption}」は時刻です。(HH:mm:ss)",
	dateTimeMinute: "「${caption}」は日時です。(yyyy/MM/dd HH:mm)",
	dateTimeSecond: "「${caption}」は日時です。(yyyy/MM/dd HH:mm:ss)",
	letter: "「${caption}」は英字です。",
	digits: "「${caption}」は数字です。",
	letterOrDigits: "「${caption}」は英数字です。",
	mailAddress: "「${caption}」はメールアドレスです。",
	max: "「${caption}」は${value}以下です。",
	min: "「${caption}」は${value}以上です。",
	utf16: "「${caption}」の最大長は${maxLength}文字です。(現在${n}文字)",
	utf8: "「${caption}」の最大長は${maxLength}byte(UTF-8)です。(現在${n}byte)",
	shiftJis: "「${caption}」の最大長は${maxLength}byte(Shift_JIS)です。(現在${n}byte)",
	eucJp: "「${caption}」の最大長は${maxLength}byte(EUC-JP)です。(現在${n}byte)",
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
	this.allowed = null;
}
_RegExpValidatorBase.prototype = new Validator();

_RegExpValidatorBase.prototype.createMessage = function(caption)
{
	return ValidationMessages[this.messageId].replace("${caption}", caption);
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
	
	if(this.allowed != null) {
		var allowed = this.allowed;
		element.addEventListener("keypress", function(e) {
			__mgKeyCheck(e, allowed);
		});
	}
}

function __mgCreateKeySet(chars)
{
	var set = new Object();
	for(var i = 0; i < chars.length; i++) {
		set[chars[i]] = true;
	}
	return set;
}
var __MG_CHECK_CHARS_SET = __mgCreateKeySet(" !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~");

function __mgKeyCheck(e, allowed) {
	if(e.ctrlKey || e.altKey)
		return;
	if(__MG_CHECK_CHARS_SET[e.key] == true) {
		if(allowed[e.key] != true) {
			e.preventDefault();
		}
	}
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
	
	if(precision <= 0) {
		this.allowed = __MG_INTEGER_CHAR_SET;
	} else {
		this.allowed = __MG_DECIMAL_CHAR_SET;
	}
}
NumberValidator.prototype = new _RegExpValidatorBase();
__MG_INTEGER_CHAR_SET = __mgCreateKeySet("+-0123456789");
__MG_DECIMAL_CHAR_SET = __mgCreateKeySet("+-0123456789.");

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
	return text.replace("${caption}", caption)
	           .replace("${digits}", this.digits == null ? "null": this.digits.toString())
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
LetterValidator.prototype.allowed = __mgCreateKeySet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");

/*
 * class DigitValidator;
 */
function DigitValidator()
{
	this.pattern = new RegExp("^[0-9]$");
	this.className = "digit_field";
	this.messageId = "digits";
	this.allowed = "0123456789";
}
DigitValidator.prototype = new _RegExpValidatorBase();
DigitValidator.prototype.allowed = __mgCreateKeySet("0123456789");

/*
 * class LetterOrDigitValidator;
 */
function LetterOrDigitValidator()
{
	this.pattern = new RegExp("^[0-9]+$");
	this.className = "letter_or_digit_field";
	this.messageId = "letterOrDigit";
	this.allowed = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
}
LetterOrDigitValidator.prototype = new _RegExpValidatorBase();
LetterOrDigitValidator.prototype.allowed = __mgCreateKeySet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");

/**
 * class YearValidator;
 */
function YearMonthValidator()
{
	this.pattern = new RegExp("^[0-9]{1,4}[-/][0-9]{1,2}$");
	this.className = "year_month_field";
	this.messageId = "yearMonth";
	this.allowed = "0123456789/-";
}
YearMonthValidator.prototype = new _RegExpValidatorBase();
YearMonthValidator.prototype.allowed = __mgCreateKeySet("0123456789/-");

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
DateValidator.prototype.allowed = __mgCreateKeySet("0123456789/-");

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
	this.allowed = "0123456789:";
}
TimeValidator.prototype = new YearMonthValidator();
TimeValidator.prototype.allowed = __mgCreateKeySet("0123456789:");

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
DateTimeValidator.prototype.allowed = __mgCreateKeySet("0123456789/-: T");

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
		return ValidationMessages.max
			.replace("${caption}", caption)
			.replace("${value}", this.value.toString());
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
		return ValidationMessages.min
			.replace("${caption}", caption)
			.replace("${value}", this.value.toString());
	}
	return null;
}

/**
 * 文字列長チェックを実装する。
 * UTF-8, Shift_JIS(なんちゃって), EUC-JP(なんちゃって)
 */
function __mgGetUtf8Length(str)
{
	var length = 0;
	for(var i = 0; i < str.length; i++) {
		var ucs4;
		// UTF16のサロゲートペアを解決してUCS4のコードを生成
		var c1 = str.charCodeAt(i);
		if(c1 < 0xD800 || 0xDFFF < c1) {
			ucs4 = c1;
		} else {
			var c2 = str.charCodeAt(i+1);
			if(!((0xD800 <= c1 && c1 <= 0xDBFF) && (0xDC00 <= c2 && c2 <= 0xDFFF))) {
				throw new Error("UTF16 is invalid.");
			}
			ucs4 = 0x10000 + (c1 - 0xD800) * 0x400 + (c2 - 0xDC00);
			i++;
		}
		
		// UCS4のコードから変換されるUTF8の長さを得る
		if(ucs4 <= 0x007F) {
			length += 1;
		} else if(ucs4 <= 0x07FF) {
			length += 2;
		} else if(ucs4 <= 0xFFFF) {
			length += 3;
		} else if(ucs4 <= 0x1FFFFF) {
			length += 4;
		}  else {
			throw new Error("UCS4 is invalid.");
		}
	}
	return length;
}

function __mgGetShiftJisLength(str)
{
	var length = 0;
	for(var i = 0; i < str.length; i++) {
		var c = str.charCodeAt(i);
		if(c <= 127) {
			length += 1;	// ASCII
		} else if(0xFF61 <= c && c <= 0xFF9F) {
			length += 1;	// 半角カナ
		} else {
			length += 2;	// ASCII以外だったら日本語コードと割り切る
		}
	}
	return length;
}

function __mgGetEucJpLength(str)
{
	var length = 0;
	for(var i = 0; i < str.length; i++) {
		var c = str.charCodeAt(i);
		if(c <= 127) {
			length += 1;	// ASCII
		} else {
			length += 2;	// ASCII以外だったら日本語コードと割り切る
		}
	}
	return length;
}

function Utf16LengthValidator(maxLength)
{
	if(maxLength == undefined || maxLength == null)
		throw new Error("The maxLength is required.");
		
	this.maxLength = maxLength;
}
Utf16LengthValidator.prototype = new Validator();

Utf16LengthValidator.prototype.validate = function(value, caption)
{
	var length = value.length;
	if(length > this.maxLength) {
		return ValidationMessages.utf16.replace("${caption}", caption)
		                              .replace("${maxLength}", this.maxLength)
		                              .replace("${n}", length);
	}
	return null;
}

function Utf8LengthValidator(maxLength)
{
	if(maxLength == undefined || maxLength == null)
		throw new Error("The maxLength is required.");
		
	this.maxLength = maxLength;
}
Utf8LengthValidator.prototype = new Validator();

Utf8LengthValidator.prototype.validate = function(value, caption)
{
	var length = __mgGetUtf8Length(value);
	if(length > this.maxLength) {
		return ValidationMessages.utf8.replace("${caption}", caption)
		                              .replace("${maxLength}", this.maxLength)
		                              .replace("${n}", length);
	}
	return null;
}

function ShiftJisLengthValidator(maxLength)
{
	if(maxLength == undefined || maxLength == null)
		throw new Error("The maxLength is required.");
	this.maxLength = maxLength;
}
ShiftJisLengthValidator.prototype = new Validator();

ShiftJisLengthValidator.prototype.validate = function(value, caption)
{
	var length = __mgGetShiftJisLength(value);
	if(length > this.maxLength) {
		return ValidationMessages.shiftJis.replace("${caption}", caption)
		                                  .replace("${maxLength}", this.maxLength)
		                                  .replace("${n}", length);
	}
	return null;
}

function EucJpLengthValidator(maxLength)
{
	if(maxLength == undefined || maxLength == null)
		throw new Error("The maxLength is required.");
	this.maxLength = maxLength;
}
EucJpLengthValidator.prototype = new Validator();

EucJpLengthValidator.prototype.validate = function(value, caption)
{
	var length = __mgGetEucJpLength(value);
	if(length > this.maxLength) {
		return ValidationMessages.eucJp.replace("${caption}", caption)
		                               .replace("${maxLength}", this.maxLength)
		                               .replace("${n}", length);
	}
	return null;
}

ActionManager.start();
