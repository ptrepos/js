if(this.mg == undefined) {
	mg = {};
}

(function() {
	var INVALID_MESSAGE = "Invalid Date Format";
	
	var checkDigit = function(str)
	{
		if(!/^[0-9]+$/.test(str)) {
			throw new Error(INVALID_MESSAGE);
		}
		return parseInt(str);
	}
	
	var W3CDTF_parse = function(str) {
	
	};
	var W3CDTF_format = function(value) {
	
	};
	
	var SimpleDateTime_parse = function(str) 
	{
		var index = 0;
		
		str = str.trim();
		
		var readDigit = function(patterns) 
		{
			for(var field in patterns) {
				var pattern = patterns[field];
				var i = str.indexOf(pattern, index);
				if(i >= 0) {
					var c = str.substr(index, i - index);
					index = i + pattern.length;
					return checkDigit(c);
				}
			}
			var s = checkDigit(str.substr(index));
			index = str.length;
			return s;
		};
		var skipSpace = function() 
		{
			while(index < str.length) {
				if(str.charAt(index) != " ")
					return;
				index++;
			}
		};
		
		var year = 0;
		var month = 1;
		var day = 1;
		var hour = 0;
		var minute = 0;
		var second = 0;
		
		year = readDigit(["/", "-"]);
		if(index < str.length) {
			month = readDigit(["/", "-"]);
			if(index < str.length) {
				day = readDigit([" ", "T"]);
				skipSpace();
				
				if(index < str.length) {
					hour = readDigit([":"]);
					if(index < str.length) {
						minute = readDigit([":"]);
						if(index < str.length) {
							second = checkDigit(str.substr(index));
						}
					}
				}
			}
		}
		
		//console.log(year, month, day, hour, minute, second);
		
		if(!(1 <= month && month <= 12)) {
			throw new Error(INVALID_MESSAGE);
		}
		if(!(1 <= day && day <= 31)) {
			throw new Error(INVALID_MESSAGE);
		}
		if(!(0 <= hour && hour <= 23)) {
			throw new Error(INVALID_MESSAGE);
		}
		if(!(0 <= minute && minute <= 59)) {
			throw new Error(INVALID_MESSAGE);
		}
		if(!(0 <= second && second < 60)) {
			throw new Error(INVALID_MESSAGE);
		}
		
		var date = new Date(year, month - 1, day);
		if(date.getDate() != day) {
			throw new Error(INVALID_MESSAGE);
		}
		
		return new Date(year, month - 1, day, hour, minute, second);
	};
	
	mg.SimpleDateFormat = {
		parse: SimpleDateTime_parse,
	};
})();
