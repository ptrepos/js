/**
 * Created by t.hada on 2017/02/28
 */
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

var _mgBox = null;
function mgShowMessages(messages, element)
{
	if(element == undefined) {
		element = null;
	}
	
	if(_mgBox != null) {
		_mgBox.close();
		_mgBox = null;
	}

	var ul = document.createElement("ul");
	for(var i = 0; i < messages.length; i++) {
		var li = document.createElement("li");
		li.appendChild(document.createTextNode(messages[i]));
		ul.appendChild(li);
	}
	
	_mgBox = new PopupBox(ul, 10000);
	
	if(element != null) {
		_mgBox.element.style.position = "absolute";
		var left1 = element.offsetLeft + element.offsetWidth / 2;
		_mgBox.element.style.left = mgToPxStr(left1);
		_mgBox.element.style.top = mgToPxStr(element.offsetTop + element.offsetHeight);
	} else {
		_mgBox.element.style.right = "16px";
		_mgBox.element.style.bottom = "16px";
	}
	
	_mgBox.show();
}

function mgCloseMessages()
{
	if(_mgBox != null) {
		_mgBox.close();
		_mgBox = null;
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
		this._forceClose();
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

PopupBox.prototype._forceClose = function()
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
		this._forceClose();
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
		return new Utf16Validator(maxLength);
	}
	function UTF8(maxLength)
	{
		return new Utf8Validator(maxLength);
	}
	function Shift_JIS(maxLength)
	{
		return new ShiftJisValidator(maxLength);
	}
	function EUC_JP(maxLength)
	{
		return new EucJpValidator(maxLength);
	}

	var formValidator = this;

	input.analyzed = true;
	input.validators = eval("[" + expression + "]");
	
	this.setRequired(input, _required);
	
	for(var i = 0; i < input.validators.length; i++) {
		input.validators[i].layout(input);
	}
	
	input.addEventListener('blur', function(e) {
		if(_mgFocused == null) {
			if(formValidator.validateInput(this) == false) {
				/*this.value = "";*/
				/*formValidator.validateInput(this);*/
				_mgFocused = this;
				setTimeout(function() {
					_mgFocused.focus();
					_mgFocused = null;
				}, 0);
			} else {
				mgCloseMessages();
			}
		}
	});
	
	input.analyzed = true;
}
var _mgFocused = null;

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
	utf16: "「${caption}」の最大長は${maxLength}文字です。(現在${length}文字)",
	utf8: "「${caption}」の最大長は${maxLength}byte(UTF-8)です。(現在${length}byte)",
	shiftJis: "「${caption}」の最大長は${maxLength}byte(Shift_JIS)です。(現在${length}byte)",
	eucJp: "「${caption}」の最大長は${maxLength}byte(EUC-JP)です。(現在${length}byte)",
	invalidChar: "「${caption}」には不正な文字が含まれています。(${invalidChar})"
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
			_mgKeyCheck(e, allowed);
		});
	}
}

function _mgCreateKeySet(chars)
{
	var set = new Object();
	for(var i = 0; i < chars.length; i++) {
		set[chars[i]] = true;
	}
	return set;
}
var _MG_CHECK_CHARS_SET = _mgCreateKeySet(" !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~");

function _mgKeyCheck(e, allowed) {
	if(e.ctrlKey || e.altKey)
		return;
	if(_MG_CHECK_CHARS_SET[e.key] == true) {
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
		this.allowed = _MG_INTEGER_CHAR_SET;
	} else {
		this.allowed = _MG_DECIMAL_CHAR_SET;
	}
}
NumberValidator.prototype = new _RegExpValidatorBase();
_MG_INTEGER_CHAR_SET = _mgCreateKeySet("+-0123456789");
_MG_DECIMAL_CHAR_SET = _mgCreateKeySet("+-0123456789.");

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
LetterValidator.prototype.allowed = _mgCreateKeySet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz");

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
DigitValidator.prototype.allowed = _mgCreateKeySet("0123456789");

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
LetterOrDigitValidator.prototype.allowed = _mgCreateKeySet("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789");

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
YearMonthValidator.prototype.allowed = _mgCreateKeySet("0123456789/-");

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
DateValidator.prototype.allowed = _mgCreateKeySet("0123456789/-");

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
TimeValidator.prototype.allowed = _mgCreateKeySet("0123456789:");

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
DateTimeValidator.prototype.allowed = _mgCreateKeySet("0123456789/-: T");

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

var _MG_JIS_CHARS = "　、。，．・：；？！゛゜´｀¨＾￣＿ヽヾゝゞ〃仝々〆〇ー―‐／＼～∥｜…‥‘’“”（）〔〕［］｛｝〈〉《》「」『』【】＋－±×÷＝≠＜＞≦≧∞∴♂♀°′″℃￥＄￠￡％＃＆＊＠§☆★○●◎◇◆□■△▲▽▼※〒→←↑↓〓∈∋⊆⊇⊂⊃∪∩∧∨￢⇒⇔∀∃∠⊥⌒∂∇≡≒≪≫√∽∝∵∫∬Å‰♯♭♪†‡¶◯０１２３４５６７８９ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚぁあぃいぅうぇえぉおかがきぎくぐけげこごさざしじすずせぜそぞただちぢっつづてでとどなにぬねのはばぱひびぴふぶぷへべぺほぼぽまみむめもゃやゅゆょよらりるれろゎわゐゑをんァアィイゥウェエォオカガキギクグケゲコゴサザシジスズセゼソゾタダチヂッツヅテデトドナニヌネノハバパヒビピフブプヘベペホボポマミムメモャヤュユョヨラリルレロヮワヰヱヲンヴヵヶΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩαβγδεζηθικλμνξοπρστυφχψωАБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя─│┌┐┘└├┬┤┴┼━┃┏┓┛┗┣┳┫┻╋┠┯┨┷┿┝┰┥┸╂①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ㍉㌔㌢㍍㌘㌧㌃㌶㍑㍗㌍㌦㌣㌫㍊㌻㎜㎝㎞㎎㎏㏄㎡㍻〝〟№㏍℡㊤㊥㊦㊧㊨㈱㈲㈹㍾㍽㍼≒≡∫∮∑√⊥∠∟⊿∵∩∪亜唖娃阿哀愛挨姶逢葵茜穐悪握渥旭葦芦鯵梓圧斡扱宛姐虻飴絢綾鮎或粟袷安庵按暗案闇鞍杏以伊位依偉囲夷委威尉惟意慰易椅為畏異移維緯胃萎衣謂違遺医井亥域育郁磯一壱溢逸稲茨芋鰯允印咽員因姻引飲淫胤蔭院陰隠韻吋右宇烏羽迂雨卯鵜窺丑碓臼渦嘘唄欝蔚鰻姥厩浦瓜閏噂云運雲荏餌叡営嬰影映曳栄永泳洩瑛盈穎頴英衛詠鋭液疫益駅悦謁越閲榎厭円園堰奄宴延怨掩援沿演炎焔煙燕猿縁艶苑薗遠鉛鴛塩於汚甥凹央奥往応押旺横欧殴王翁襖鴬鴎黄岡沖荻億屋憶臆桶牡乙俺卸恩温穏音下化仮何伽価佳加可嘉夏嫁家寡科暇果架歌河火珂禍禾稼箇花苛茄荷華菓蝦課嘩貨迦過霞蚊俄峨我牙画臥芽蛾賀雅餓駕介会解回塊壊廻快怪悔恢懐戒拐改魁晦械海灰界皆絵芥蟹開階貝凱劾外咳害崖慨概涯碍蓋街該鎧骸浬馨蛙垣柿蛎鈎劃嚇各廓拡撹格核殻獲確穫覚角赫較郭閣隔革学岳楽額顎掛笠樫橿梶鰍潟割喝恰括活渇滑葛褐轄且鰹叶椛樺鞄株兜竃蒲釜鎌噛鴨栢茅萱粥刈苅瓦乾侃冠寒刊勘勧巻喚堪姦完官寛干幹患感慣憾換敢柑桓棺款歓汗漢澗潅環甘監看竿管簡緩缶翰肝艦莞観諌貫還鑑間閑関陥韓館舘丸含岸巌玩癌眼岩翫贋雁頑顔願企伎危喜器基奇嬉寄岐希幾忌揮机旗既期棋棄機帰毅気汽畿祈季稀紀徽規記貴起軌輝飢騎鬼亀偽儀妓宜戯技擬欺犠疑祇義蟻誼議掬菊鞠吉吃喫桔橘詰砧杵黍却客脚虐逆丘久仇休及吸宮弓急救朽求汲泣灸球究窮笈級糾給旧牛去居巨拒拠挙渠虚許距鋸漁禦魚亨享京供侠僑兇競共凶協匡卿叫喬境峡強彊怯恐恭挟教橋況狂狭矯胸脅興蕎郷鏡響饗驚仰凝尭暁業局曲極玉桐粁僅勤均巾錦斤欣欽琴禁禽筋緊芹菌衿襟謹近金吟銀九倶句区狗玖矩苦躯駆駈駒具愚虞喰空偶寓遇隅串櫛釧屑屈掘窟沓靴轡窪熊隈粂栗繰桑鍬勲君薫訓群軍郡卦袈祁係傾刑兄啓圭珪型契形径恵慶慧憩掲携敬景桂渓畦稽系経継繋罫茎荊蛍計詣警軽頚鶏芸迎鯨劇戟撃激隙桁傑欠決潔穴結血訣月件倹倦健兼券剣喧圏堅嫌建憲懸拳捲検権牽犬献研硯絹県肩見謙賢軒遣鍵険顕験鹸元原厳幻弦減源玄現絃舷言諺限乎個古呼固姑孤己庫弧戸故枯湖狐糊袴股胡菰虎誇跨鈷雇顧鼓五互伍午呉吾娯後御悟梧檎瑚碁語誤護醐乞鯉交佼侯候倖光公功効勾厚口向后喉坑垢好孔孝宏工巧巷幸広庚康弘恒慌抗拘控攻昂晃更杭校梗構江洪浩港溝甲皇硬稿糠紅紘絞綱耕考肯肱腔膏航荒行衡講貢購郊酵鉱砿鋼閤降項香高鴻剛劫号合壕拷濠豪轟麹克刻告国穀酷鵠黒獄漉腰甑忽惚骨狛込此頃今困坤墾婚恨懇昏昆根梱混痕紺艮魂些佐叉唆嵯左差査沙瑳砂詐鎖裟坐座挫債催再最哉塞妻宰彩才採栽歳済災采犀砕砦祭斎細菜裁載際剤在材罪財冴坂阪堺榊肴咲崎埼碕鷺作削咋搾昨朔柵窄策索錯桜鮭笹匙冊刷察拶撮擦札殺薩雑皐鯖捌錆鮫皿晒三傘参山惨撒散桟燦珊産算纂蚕讃賛酸餐斬暫残仕仔伺使刺司史嗣四士始姉姿子屍市師志思指支孜斯施旨枝止死氏獅祉私糸紙紫肢脂至視詞詩試誌諮資賜雌飼歯事似侍児字寺慈持時次滋治爾璽痔磁示而耳自蒔辞汐鹿式識鴫竺軸宍雫七叱執失嫉室悉湿漆疾質実蔀篠偲柴芝屡蕊縞舎写射捨赦斜煮社紗者謝車遮蛇邪借勺尺杓灼爵酌釈錫若寂弱惹主取守手朱殊狩珠種腫趣酒首儒受呪寿授樹綬需囚収周宗就州修愁拾洲秀秋終繍習臭舟蒐衆襲讐蹴輯週酋酬集醜什住充十従戎柔汁渋獣縦重銃叔夙宿淑祝縮粛塾熟出術述俊峻春瞬竣舜駿准循旬楯殉淳準潤盾純巡遵醇順処初所暑曙渚庶緒署書薯藷諸助叙女序徐恕鋤除傷償勝匠升召哨商唱嘗奨妾娼宵将小少尚庄床廠彰承抄招掌捷昇昌昭晶松梢樟樵沼消渉湘焼焦照症省硝礁祥称章笑粧紹肖菖蒋蕉衝裳訟証詔詳象賞醤鉦鍾鐘障鞘上丈丞乗冗剰城場壌嬢常情擾条杖浄状畳穣蒸譲醸錠嘱埴飾拭植殖燭織職色触食蝕辱尻伸信侵唇娠寝審心慎振新晋森榛浸深申疹真神秦紳臣芯薪親診身辛進針震人仁刃塵壬尋甚尽腎訊迅陣靭笥諏須酢図厨逗吹垂帥推水炊睡粋翠衰遂酔錐錘随瑞髄崇嵩数枢趨雛据杉椙菅頗雀裾澄摺寸世瀬畝是凄制勢姓征性成政整星晴棲栖正清牲生盛精聖声製西誠誓請逝醒青静斉税脆隻席惜戚斥昔析石積籍績脊責赤跡蹟碩切拙接摂折設窃節説雪絶舌蝉仙先千占宣専尖川戦扇撰栓栴泉浅洗染潜煎煽旋穿箭線繊羨腺舛船薦詮賎践選遷銭銑閃鮮前善漸然全禅繕膳糎噌塑岨措曾曽楚狙疏疎礎祖租粗素組蘇訴阻遡鼠僧創双叢倉喪壮奏爽宋層匝惣想捜掃挿掻操早曹巣槍槽漕燥争痩相窓糟総綜聡草荘葬蒼藻装走送遭鎗霜騒像増憎臓蔵贈造促側則即息捉束測足速俗属賊族続卒袖其揃存孫尊損村遜他多太汰詑唾堕妥惰打柁舵楕陀駄騨体堆対耐岱帯待怠態戴替泰滞胎腿苔袋貸退逮隊黛鯛代台大第醍題鷹滝瀧卓啄宅托択拓沢濯琢託鐸濁諾茸凧蛸只叩但達辰奪脱巽竪辿棚谷狸鱈樽誰丹単嘆坦担探旦歎淡湛炭短端箪綻耽胆蛋誕鍛団壇弾断暖檀段男談値知地弛恥智池痴稚置致蜘遅馳築畜竹筑蓄逐秩窒茶嫡着中仲宙忠抽昼柱注虫衷註酎鋳駐樗瀦猪苧著貯丁兆凋喋寵帖帳庁弔張彫徴懲挑暢朝潮牒町眺聴脹腸蝶調諜超跳銚長頂鳥勅捗直朕沈珍賃鎮陳津墜椎槌追鎚痛通塚栂掴槻佃漬柘辻蔦綴鍔椿潰坪壷嬬紬爪吊釣鶴亭低停偵剃貞呈堤定帝底庭廷弟悌抵挺提梯汀碇禎程締艇訂諦蹄逓邸鄭釘鼎泥摘擢敵滴的笛適鏑溺哲徹撤轍迭鉄典填天展店添纏甜貼転顛点伝殿澱田電兎吐堵塗妬屠徒斗杜渡登菟賭途都鍍砥砺努度土奴怒倒党冬凍刀唐塔塘套宕島嶋悼投搭東桃梼棟盗淘湯涛灯燈当痘祷等答筒糖統到董蕩藤討謄豆踏逃透鐙陶頭騰闘働動同堂導憧撞洞瞳童胴萄道銅峠鴇匿得徳涜特督禿篤毒独読栃橡凸突椴届鳶苫寅酉瀞噸屯惇敦沌豚遁頓呑曇鈍奈那内乍凪薙謎灘捺鍋楢馴縄畷南楠軟難汝二尼弐迩匂賑肉虹廿日乳入如尿韮任妊忍認濡禰祢寧葱猫熱年念捻撚燃粘乃廼之埜嚢悩濃納能脳膿農覗蚤巴把播覇杷波派琶破婆罵芭馬俳廃拝排敗杯盃牌背肺輩配倍培媒梅楳煤狽買売賠陪這蝿秤矧萩伯剥博拍柏泊白箔粕舶薄迫曝漠爆縛莫駁麦函箱硲箸肇筈櫨幡肌畑畠八鉢溌発醗髪伐罰抜筏閥鳩噺塙蛤隼伴判半反叛帆搬斑板氾汎版犯班畔繁般藩販範釆煩頒飯挽晩番盤磐蕃蛮匪卑否妃庇彼悲扉批披斐比泌疲皮碑秘緋罷肥被誹費避非飛樋簸備尾微枇毘琵眉美鼻柊稗匹疋髭彦膝菱肘弼必畢筆逼桧姫媛紐百謬俵彪標氷漂瓢票表評豹廟描病秒苗錨鋲蒜蛭鰭品彬斌浜瀕貧賓頻敏瓶不付埠夫婦富冨布府怖扶敷斧普浮父符腐膚芙譜負賦赴阜附侮撫武舞葡蕪部封楓風葺蕗伏副復幅服福腹複覆淵弗払沸仏物鮒分吻噴墳憤扮焚奮粉糞紛雰文聞丙併兵塀幣平弊柄並蔽閉陛米頁僻壁癖碧別瞥蔑箆偏変片篇編辺返遍便勉娩弁鞭保舗鋪圃捕歩甫補輔穂募墓慕戊暮母簿菩倣俸包呆報奉宝峰峯崩庖抱捧放方朋法泡烹砲縫胞芳萌蓬蜂褒訪豊邦鋒飽鳳鵬乏亡傍剖坊妨帽忘忙房暴望某棒冒紡肪膨謀貌貿鉾防吠頬北僕卜墨撲朴牧睦穆釦勃没殆堀幌奔本翻凡盆摩磨魔麻埋妹昧枚毎哩槙幕膜枕鮪柾鱒桝亦俣又抹末沫迄侭繭麿万慢満漫蔓味未魅巳箕岬密蜜湊蓑稔脈妙粍民眠務夢無牟矛霧鵡椋婿娘冥名命明盟迷銘鳴姪牝滅免棉綿緬面麺摸模茂妄孟毛猛盲網耗蒙儲木黙目杢勿餅尤戻籾貰問悶紋門匁也冶夜爺耶野弥矢厄役約薬訳躍靖柳薮鑓愉愈油癒諭輸唯佑優勇友宥幽悠憂揖有柚湧涌猶猷由祐裕誘遊邑郵雄融夕予余与誉輿預傭幼妖容庸揚揺擁曜楊様洋溶熔用窯羊耀葉蓉要謡踊遥陽養慾抑欲沃浴翌翼淀羅螺裸来莱頼雷洛絡落酪乱卵嵐欄濫藍蘭覧利吏履李梨理璃痢裏裡里離陸律率立葎掠略劉流溜琉留硫粒隆竜龍侶慮旅虜了亮僚両凌寮料梁涼猟療瞭稜糧良諒遼量陵領力緑倫厘林淋燐琳臨輪隣鱗麟瑠塁涙累類令伶例冷励嶺怜玲礼苓鈴隷零霊麗齢暦歴列劣烈裂廉恋憐漣煉簾練聯蓮連錬呂魯櫓炉賂路露労婁廊弄朗楼榔浪漏牢狼篭老聾蝋郎六麓禄肋録論倭和話歪賄脇惑枠鷲亙亘鰐詫藁蕨椀湾碗腕弌丐丕个丱丶丼丿乂乖乘亂亅豫亊舒弍于亞亟亠亢亰亳亶从仍仄仆仂仗仞仭仟价伉佚估佛佝佗佇佶侈侏侘佻佩佰侑佯來侖儘俔俟俎俘俛俑俚俐俤俥倚倨倔倪倥倅伜俶倡倩倬俾俯們倆偃假會偕偐偈做偖偬偸傀傚傅傴傲僉僊傳僂僖僞僥僭僣僮價僵儉儁儂儖儕儔儚儡儺儷儼儻儿兀兒兌兔兢竸兩兪兮冀冂囘册冉冏冑冓冕冖冤冦冢冩冪冫决冱冲冰况冽凅凉凛几處凩凭凰凵凾刄刋刔刎刧刪刮刳刹剏剄剋剌剞剔剪剴剩剳剿剽劍劔劒剱劈劑辨辧劬劭劼劵勁勍勗勞勣勦飭勠勳勵勸勹匆匈甸匍匐匏匕匚匣匯匱匳匸區卆卅丗卉卍凖卞卩卮夘卻卷厂厖厠厦厥厮厰厶參簒雙叟曼燮叮叨叭叺吁吽呀听吭吼吮吶吩吝呎咏呵咎呟呱呷呰咒呻咀呶咄咐咆哇咢咸咥咬哄哈咨咫哂咤咾咼哘哥哦唏唔哽哮哭哺哢唹啀啣啌售啜啅啖啗唸唳啝喙喀咯喊喟啻啾喘喞單啼喃喩喇喨嗚嗅嗟嗄嗜嗤嗔嘔嗷嘖嗾嗽嘛嗹噎噐營嘴嘶嘲嘸噫噤嘯噬噪嚆嚀嚊嚠嚔嚏嚥嚮嚶嚴囂嚼囁囃囀囈囎囑囓囗囮囹圀囿圄圉圈國圍圓團圖嗇圜圦圷圸坎圻址坏坩埀垈坡坿垉垓垠垳垤垪垰埃埆埔埒埓堊埖埣堋堙堝塲堡塢塋塰毀塒堽塹墅墹墟墫墺壞墻墸墮壅壓壑壗壙壘壥壜壤壟壯壺壹壻壼壽夂夊夐夛梦夥夬夭夲夸夾竒奕奐奎奚奘奢奠奧奬奩奸妁妝佞侫妣妲姆姨姜妍姙姚娥娟娑娜娉娚婀婬婉娵娶婢婪媚媼媾嫋嫂媽嫣嫗嫦嫩嫖嫺嫻嬌嬋嬖嬲嫐嬪嬶嬾孃孅孀孑孕孚孛孥孩孰孳孵學斈孺宀它宦宸寃寇寉寔寐寤實寢寞寥寫寰寶寳尅將專對尓尠尢尨尸尹屁屆屎屓屐屏孱屬屮乢屶屹岌岑岔妛岫岻岶岼岷峅岾峇峙峩峽峺峭嶌峪崋崕崗嵜崟崛崑崔崢崚崙崘嵌嵒嵎嵋嵬嵳嵶嶇嶄嶂嶢嶝嶬嶮嶽嶐嶷嶼巉巍巓巒巖巛巫已巵帋帚帙帑帛帶帷幄幃幀幎幗幔幟幢幤幇幵并幺麼广庠廁廂廈廐廏廖廣廝廚廛廢廡廨廩廬廱廳廰廴廸廾弃弉彝彜弋弑弖弩弭弸彁彈彌彎弯彑彖彗彙彡彭彳彷徃徂彿徊很徑徇從徙徘徠徨徭徼忖忻忤忸忱忝悳忿怡恠怙怐怩怎怱怛怕怫怦怏怺恚恁恪恷恟恊恆恍恣恃恤恂恬恫恙悁悍惧悃悚悄悛悖悗悒悧悋惡悸惠惓悴忰悽惆悵惘慍愕愆惶惷愀惴惺愃愡惻惱愍愎慇愾愨愧慊愿愼愬愴愽慂慄慳慷慘慙慚慫慴慯慥慱慟慝慓慵憙憖憇憬憔憚憊憑憫憮懌懊應懷懈懃懆憺懋罹懍懦懣懶懺懴懿懽懼懾戀戈戉戍戌戔戛戞戡截戮戰戲戳扁扎扞扣扛扠扨扼抂抉找抒抓抖拔抃抔拗拑抻拏拿拆擔拈拜拌拊拂拇抛拉挌拮拱挧挂挈拯拵捐挾捍搜捏掖掎掀掫捶掣掏掉掟掵捫捩掾揩揀揆揣揉插揶揄搖搴搆搓搦搶攝搗搨搏摧摯摶摎攪撕撓撥撩撈撼據擒擅擇撻擘擂擱擧舉擠擡抬擣擯攬擶擴擲擺攀擽攘攜攅攤攣攫攴攵攷收攸畋效敖敕敍敘敞敝敲數斂斃變斛斟斫斷旃旆旁旄旌旒旛旙无旡旱杲昊昃旻杳昵昶昴昜晏晄晉晁晞晝晤晧晨晟晢晰暃暈暎暉暄暘暝曁暹曉暾暼曄暸曖曚曠昿曦曩曰曵曷朏朖朞朦朧霸朮朿朶杁朸朷杆杞杠杙杣杤枉杰枩杼杪枌枋枦枡枅枷柯枴柬枳柩枸柤柞柝柢柮枹柎柆柧檜栞框栩桀桍栲桎梳栫桙档桷桿梟梏梭梔條梛梃檮梹桴梵梠梺椏梍桾椁棊椈棘椢椦棡椌棍棔棧棕椶椒椄棗棣椥棹棠棯椨椪椚椣椡棆楹楷楜楸楫楔楾楮椹楴椽楙椰楡楞楝榁楪榲榮槐榿槁槓榾槎寨槊槝榻槃榧樮榑榠榜榕榴槞槨樂樛槿權槹槲槧樅榱樞槭樔槫樊樒櫁樣樓橄樌橲樶橸橇橢橙橦橈樸樢檐檍檠檄檢檣檗蘗檻櫃櫂檸檳檬櫞櫑櫟檪櫚櫪櫻欅蘖櫺欒欖鬱欟欸欷盜欹飮歇歃歉歐歙歔歛歟歡歸歹歿殀殄殃殍殘殕殞殤殪殫殯殲殱殳殷殼毆毋毓毟毬毫毳毯麾氈氓气氛氤氣汞汕汢汪沂沍沚沁沛汾汨汳沒沐泄泱泓沽泗泅泝沮沱沾沺泛泯泙泪洟衍洶洫洽洸洙洵洳洒洌浣涓浤浚浹浙涎涕濤涅淹渕渊涵淇淦涸淆淬淞淌淨淒淅淺淙淤淕淪淮渭湮渮渙湲湟渾渣湫渫湶湍渟湃渺湎渤滿渝游溂溪溘滉溷滓溽溯滄溲滔滕溏溥滂溟潁漑灌滬滸滾漿滲漱滯漲滌漾漓滷澆潺潸澁澀潯潛濳潭澂潼潘澎澑濂潦澳澣澡澤澹濆澪濟濕濬濔濘濱濮濛瀉瀋濺瀑瀁瀏濾瀛瀚潴瀝瀘瀟瀰瀾瀲灑灣炙炒炯烱炬炸炳炮烟烋烝烙焉烽焜焙煥煕熈煦煢煌煖煬熏燻熄熕熨熬燗熹熾燒燉燔燎燠燬燧燵燼燹燿爍爐爛爨爭爬爰爲爻爼爿牀牆牋牘牴牾犂犁犇犒犖犢犧犹犲狃狆狄狎狒狢狠狡狹狷倏猗猊猜猖猝猴猯猩猥猾獎獏默獗獪獨獰獸獵獻獺珈玳珎玻珀珥珮珞璢琅瑯琥珸琲琺瑕琿瑟瑙瑁瑜瑩瑰瑣瑪瑶瑾璋璞璧瓊瓏瓔珱瓠瓣瓧瓩瓮瓲瓰瓱瓸瓷甄甃甅甌甎甍甕甓甞甦甬甼畄畍畊畉畛畆畚畩畤畧畫畭畸當疆疇畴疊疉疂疔疚疝疥疣痂疳痃疵疽疸疼疱痍痊痒痙痣痞痾痿痼瘁痰痺痲痳瘋瘍瘉瘟瘧瘠瘡瘢瘤瘴瘰瘻癇癈癆癜癘癡癢癨癩癪癧癬癰癲癶癸發皀皃皈皋皎皖皓皙皚皰皴皸皹皺盂盍盖盒盞盡盥盧盪蘯盻眈眇眄眩眤眞眥眦眛眷眸睇睚睨睫睛睥睿睾睹瞎瞋瞑瞠瞞瞰瞶瞹瞿瞼瞽瞻矇矍矗矚矜矣矮矼砌砒礦砠礪硅碎硴碆硼碚碌碣碵碪碯磑磆磋磔碾碼磅磊磬磧磚磽磴礇礒礑礙礬礫祀祠祗祟祚祕祓祺祿禊禝禧齋禪禮禳禹禺秉秕秧秬秡秣稈稍稘稙稠稟禀稱稻稾稷穃穗穉穡穢穩龝穰穹穽窈窗窕窘窖窩竈窰窶竅竄窿邃竇竊竍竏竕竓站竚竝竡竢竦竭竰笂笏笊笆笳笘笙笞笵笨笶筐筺笄筍笋筌筅筵筥筴筧筰筱筬筮箝箘箟箍箜箚箋箒箏筝箙篋篁篌篏箴篆篝篩簑簔篦篥籠簀簇簓篳篷簗簍篶簣簧簪簟簷簫簽籌籃籔籏籀籐籘籟籤籖籥籬籵粃粐粤粭粢粫粡粨粳粲粱粮粹粽糀糅糂糘糒糜糢鬻糯糲糴糶糺紆紂紜紕紊絅絋紮紲紿紵絆絳絖絎絲絨絮絏絣經綉絛綏絽綛綺綮綣綵緇綽綫總綢綯緜綸綟綰緘緝緤緞緻緲緡縅縊縣縡縒縱縟縉縋縢繆繦縻縵縹繃縷縲縺繧繝繖繞繙繚繹繪繩繼繻纃緕繽辮繿纈纉續纒纐纓纔纖纎纛纜缸缺罅罌罍罎罐网罕罔罘罟罠罨罩罧罸羂羆羃羈羇羌羔羞羝羚羣羯羲羹羮羶羸譱翅翆翊翕翔翡翦翩翳翹飜耆耄耋耒耘耙耜耡耨耿耻聊聆聒聘聚聟聢聨聳聲聰聶聹聽聿肄肆肅肛肓肚肭冐肬胛胥胙胝胄胚胖脉胯胱脛脩脣脯腋隋腆脾腓腑胼腱腮腥腦腴膃膈膊膀膂膠膕膤膣腟膓膩膰膵膾膸膽臀臂膺臉臍臑臙臘臈臚臟臠臧臺臻臾舁舂舅與舊舍舐舖舩舫舸舳艀艙艘艝艚艟艤艢艨艪艫舮艱艷艸艾芍芒芫芟芻芬苡苣苟苒苴苳苺莓范苻苹苞茆苜茉苙茵茴茖茲茱荀茹荐荅茯茫茗茘莅莚莪莟莢莖茣莎莇莊荼莵荳荵莠莉莨菴萓菫菎菽萃菘萋菁菷萇菠菲萍萢萠莽萸蔆菻葭萪萼蕚蒄葷葫蒭葮蒂葩葆萬葯葹萵蓊葢蒹蒿蒟蓙蓍蒻蓚蓐蓁蓆蓖蒡蔡蓿蓴蔗蔘蔬蔟蔕蔔蓼蕀蕣蕘蕈蕁蘂蕋蕕薀薤薈薑薊薨蕭薔薛藪薇薜蕷蕾薐藉薺藏薹藐藕藝藥藜藹蘊蘓蘋藾藺蘆蘢蘚蘰蘿虍乕虔號虧虱蚓蚣蚩蚪蚋蚌蚶蚯蛄蛆蚰蛉蠣蚫蛔蛞蛩蛬蛟蛛蛯蜒蜆蜈蜀蜃蛻蜑蜉蜍蛹蜊蜴蜿蜷蜻蜥蜩蜚蝠蝟蝸蝌蝎蝴蝗蝨蝮蝙蝓蝣蝪蠅螢螟螂螯蟋螽蟀蟐雖螫蟄螳蟇蟆螻蟯蟲蟠蠏蠍蟾蟶蟷蠎蟒蠑蠖蠕蠢蠡蠱蠶蠹蠧蠻衄衂衒衙衞衢衫袁衾袞衵衽袵衲袂袗袒袮袙袢袍袤袰袿袱裃裄裔裘裙裝裹褂裼裴裨裲褄褌褊褓襃褞褥褪褫襁襄褻褶褸襌褝襠襞襦襤襭襪襯襴襷襾覃覈覊覓覘覡覩覦覬覯覲覺覽覿觀觚觜觝觧觴觸訃訖訐訌訛訝訥訶詁詛詒詆詈詼詭詬詢誅誂誄誨誡誑誥誦誚誣諄諍諂諚諫諳諧諤諱謔諠諢諷諞諛謌謇謚諡謖謐謗謠謳鞫謦謫謾謨譁譌譏譎證譖譛譚譫譟譬譯譴譽讀讌讎讒讓讖讙讚谺豁谿豈豌豎豐豕豢豬豸豺貂貉貅貊貍貎貔豼貘戝貭貪貽貲貳貮貶賈賁賤賣賚賽賺賻贄贅贊贇贏贍贐齎贓賍贔贖赧赭赱赳趁趙跂趾趺跏跚跖跌跛跋跪跫跟跣跼踈踉跿踝踞踐踟蹂踵踰踴蹊蹇蹉蹌蹐蹈蹙蹤蹠踪蹣蹕蹶蹲蹼躁躇躅躄躋躊躓躑躔躙躪躡躬躰軆躱躾軅軈軋軛軣軼軻軫軾輊輅輕輒輙輓輜輟輛輌輦輳輻輹轅轂輾轌轉轆轎轗轜轢轣轤辜辟辣辭辯辷迚迥迢迪迯邇迴逅迹迺逑逕逡逍逞逖逋逧逶逵逹迸遏遐遑遒逎遉逾遖遘遞遨遯遶隨遲邂遽邁邀邊邉邏邨邯邱邵郢郤扈郛鄂鄒鄙鄲鄰酊酖酘酣酥酩酳酲醋醉醂醢醫醯醪醵醴醺釀釁釉釋釐釖釟釡釛釼釵釶鈞釿鈔鈬鈕鈑鉞鉗鉅鉉鉤鉈銕鈿鉋鉐銜銖銓銛鉚鋏銹銷鋩錏鋺鍄錮錙錢錚錣錺錵錻鍜鍠鍼鍮鍖鎰鎬鎭鎔鎹鏖鏗鏨鏥鏘鏃鏝鏐鏈鏤鐚鐔鐓鐃鐇鐐鐶鐫鐵鐡鐺鑁鑒鑄鑛鑠鑢鑞鑪鈩鑰鑵鑷鑽鑚鑼鑾钁鑿閂閇閊閔閖閘閙閠閨閧閭閼閻閹閾闊濶闃闍闌闕闔闖關闡闥闢阡阨阮阯陂陌陏陋陷陜陞陝陟陦陲陬隍隘隕隗險隧隱隲隰隴隶隸隹雎雋雉雍襍雜霍雕雹霄霆霈霓霎霑霏霖霙霤霪霰霹霽霾靄靆靈靂靉靜靠靤靦靨勒靫靱靹鞅靼鞁靺鞆鞋鞏鞐鞜鞨鞦鞣鞳鞴韃韆韈韋韜韭齏韲竟韶韵頏頌頸頤頡頷頽顆顏顋顫顯顰顱顴顳颪颯颱颶飄飃飆飩飫餃餉餒餔餘餡餝餞餤餠餬餮餽餾饂饉饅饐饋饑饒饌饕馗馘馥馭馮馼駟駛駝駘駑駭駮駱駲駻駸騁騏騅駢騙騫騷驅驂驀驃騾驕驍驛驗驟驢驥驤驩驫驪骭骰骼髀髏髑髓體髞髟髢髣髦髯髫髮髴髱髷髻鬆鬘鬚鬟鬢鬣鬥鬧鬨鬩鬪鬮鬯鬲魄魃魏魍魎魑魘魴鮓鮃鮑鮖鮗鮟鮠鮨鮴鯀鯊鮹鯆鯏鯑鯒鯣鯢鯤鯔鯡鰺鯲鯱鯰鰕鰔鰉鰓鰌鰆鰈鰒鰊鰄鰮鰛鰥鰤鰡鰰鱇鰲鱆鰾鱚鱠鱧鱶鱸鳧鳬鳰鴉鴈鳫鴃鴆鴪鴦鶯鴣鴟鵄鴕鴒鵁鴿鴾鵆鵈鵝鵞鵤鵑鵐鵙鵲鶉鶇鶫鵯鵺鶚鶤鶩鶲鷄鷁鶻鶸鶺鷆鷏鷂鷙鷓鷸鷦鷭鷯鷽鸚鸛鸞鹵鹹鹽麁麈麋麌麒麕麑麝麥麩麸麪麭靡黌黎黏黐黔黜點黝黠黥黨黯黴黶黷黹黻黼黽鼇鼈皷鼕鼡鼬鼾齊齒齔齣齟齠齡齦齧齬齪齷齲齶龕龜龠堯槇遙瑤凜熙纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹ￢￤＇＂ⅰⅱⅲⅳⅴⅵⅶⅷⅸⅹⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩ￢￤＇＂㈱№℡∵纊褜鍈銈蓜俉炻昱棈鋹曻彅丨仡仼伀伃伹佖侒侊侚侔俍偀倢俿倞偆偰偂傔僴僘兊兤冝冾凬刕劜劦勀勛匀匇匤卲厓厲叝﨎咜咊咩哿喆坙坥垬埈埇﨏塚增墲夋奓奛奝奣妤妺孖寀甯寘寬尞岦岺峵崧嵓﨑嵂嵭嶸嶹巐弡弴彧德忞恝悅悊惞惕愠惲愑愷愰憘戓抦揵摠撝擎敎昀昕昻昉昮昞昤晥晗晙晴晳暙暠暲暿曺朎朗杦枻桒柀栁桄棏﨓楨﨔榘槢樰橫橆橳橾櫢櫤毖氿汜沆汯泚洄涇浯涖涬淏淸淲淼渹湜渧渼溿澈澵濵瀅瀇瀨炅炫焏焄煜煆煇凞燁燾犱犾猤猪獷玽珉珖珣珒琇珵琦琪琩琮瑢璉璟甁畯皂皜皞皛皦益睆劯砡硎硤硺礰礼神祥禔福禛竑竧靖竫箞精絈絜綷綠緖繒罇羡羽茁荢荿菇菶葈蒴蕓蕙蕫﨟薰蘒﨡蠇裵訒訷詹誧誾諟諸諶譓譿賰賴贒赶﨣軏﨤逸遧郞都鄕鄧釚釗釞釭釮釤釥鈆鈐鈊鈺鉀鈼鉎鉙鉑鈹鉧銧鉷鉸鋧鋗鋙鋐﨧鋕鋠鋓錥錡鋻﨨錞鋿錝錂鍰鍗鎤鏆鏞鏸鐱鑅鑈閒隆﨩隝隯霳霻靃靍靏靑靕顗顥飯飼餧館馞驎髙髜魵魲鮏鮱鮻鰀鵰鵫鶴鸙黑";
var _mgJisCharSet = null;
function _mgGetJisCharSet() 
{
	if(_mgJisCharSet == null) {
		_mgJisCharSet = _mgCreateKeySet(_MG_JIS_CHARS);
	}
	return _mgJisCharSet;
}

function MgInvalidCharError(invalidChar) {
	this.invalidChar = invalidChar;
	this.message = "Invalid char [" + invalidChar + "]";
}
MgInvalidCharError.prototype = new Error("Invalid char");

/**
 * 文字列長チェックを実装する。
 * UTF-8,UTF-16,Shift_JIS,EUC-JP
 */
function _mgGetUtf8Length(str)
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
			throw new MgInvalidCharError(str.charAt(i));
		}
	}
	return length;
}

function _mgGetShiftJisLength(str)
{
	var jisCharset = _mgGetJisCharSet();
	var length = 0;
	for(var i = 0; i < str.length; i++) {
		var c = str.charCodeAt(i);
		if(c <= 127) {
			length += 1;	// ASCII
		} else if(0xFF61 <= c && c <= 0xFF9F) {
			length += 1;	// 半角カナ
		} else {
			var cs = String.fromCharCode(c);
			if(jisCharset[cs] == true) {
				length += 2;
			} else {
				throw new MgInvalidCharError(cs);
			}
		}
	}
	return length;
}

function _mgGetEucJpLength(str)
{
	var jisCharset = _mgGetJisCharSet();
	var length = 0;
	for(var i = 0; i < str.length; i++) {
		var c = str.charCodeAt(i);
		if(c <= 127) {
			length += 1;	// ASCII
		} else if(0xFF61 <= c && c <= 0xFF9F) {
			length += 2;	// 半角カナ
		} else {
			var cs = String.fromCharCode(c);
			if(jisCharset[cs] == true) {
				length += 2;	// JISコード
			} else {
				throw new MgInvalidCharError(cs);
			}
		}
	}
	return length;
}

function Utf16Validator(maxLength)
{
	if(maxLength == undefined || maxLength == null)
		throw new Error("The maxLength is required.");
		
	this.maxLength = maxLength;
}
Utf16Validator.prototype = new Validator();

Utf16Validator.prototype.validate = function(value, caption)
{
	var length = value.length;
	if(length > this.maxLength) {
		return ValidationMessages.utf16.replace("${caption}", caption)
		                              .replace("${maxLength}", this.maxLength)
		                              .replace("${length}", length);
	}
	return null;
}

function Utf8Validator(maxLength)
{
	if(maxLength == undefined || maxLength == null)
		throw new Error("The maxLength is required.");
		
	this.maxLength = maxLength;
}
Utf8Validator.prototype = new Validator();

Utf8Validator.prototype.validate = function(value, caption)
{
	try {
		var length = _mgGetUtf8Length(value);
		if(length > this.maxLength) {
			return ValidationMessages.utf8.replace("${caption}", caption)
			                              .replace("${maxLength}", this.maxLength)
			                              .replace("${length}", length);
		}
	} catch(ex) {
		if(ex instanceof MgInvalidCharError) {
			return ValidationMessages.invalidChar.replace("${caption}", caption)
			                                     .replace("${invalidChar}", ex.invalidChar);
		}
		throw ex;
	}
	return null;
}

function ShiftJisValidator(maxLength)
{
	if(maxLength == undefined || maxLength == null)
		throw new Error("The maxLength is required.");
	this.maxLength = maxLength;
}
ShiftJisValidator.prototype = new Validator();

ShiftJisValidator.prototype.validate = function(value, caption)
{
	try {
		var length = _mgGetShiftJisLength(value);
		if(length > this.maxLength) {
			return ValidationMessages.shiftJis.replace("${caption}", caption)
			                                  .replace("${maxLength}", this.maxLength)
			                                  .replace("${length}", length);
		}
	} catch(ex) {
		if(ex instanceof MgInvalidCharError) {
			return ValidationMessages.invalidChar.replace("${caption}", caption)
			                                     .replace("${invalidChar}", ex.invalidChar);
		}
		throw ex;
	}
	return null;
}

function EucJpValidator(maxLength)
{
	if(maxLength == undefined || maxLength == null)
		throw new Error("The maxLength is required.");
	this.maxLength = maxLength;
}
EucJpValidator.prototype = new Validator();

EucJpValidator.prototype.validate = function(value, caption)
{
	try {
		var length = _mgGetEucJpLength(value);
		if(length > this.maxLength) {
			return ValidationMessages.eucJp.replace("${caption}", caption)
			                               .replace("${maxLength}", this.maxLength)
			                               .replace("${length}", length);
		}
	} catch(ex) {
		if(ex instanceof MgInvalidCharError) {
			return ValidationMessages.invalidChar.replace("${caption}", caption)
			                                     .replace("${invalidChar}", ex.invalidChar);
		}
		throw ex;
	}
	return null;
}

ActionManager.start();
