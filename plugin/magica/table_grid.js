/**
 * t.hada 2017/02/18
 *
 * table grid plugin.
 */
function MgTableGrid(templateTable)
{
	this._generate(templateTable);
}

MgTableGrid.prototype.setDataSource = function(dataSource)
{
	this._removeAllChildren(this._body1Table);
	this._removeAllChildren(this._body2Table);

	var bodies = [];
	for(var i = 0; i < dataSource.length; i++) {
		var body = this._bodyTemplate.cloneNode(true);
		
		this._bind(body, i, dataSource[i]);
		
		bodies.push(body);
	}
	
	this._setSectionHeight(bodies);
	
	var fragment1 = document.createDocumentFragment();
	var fragment2 = document.createDocumentFragment();
	for(var i = 0; i < bodies.length; i++) {
		var body1 = bodies[i].cloneNode(true);
		this._filterFixCell(body1.rows);
		var body2 = bodies[i];
		this._filterNotFixCell(body2.rows);
		
		fragment1.appendChild(body1);
		fragment2.appendChild(body2);
	}
	
	this._body1Table.appendChild(fragment1);
	this._body2Table.appendChild(fragment2);
	
	this._dataSource = [].concat(dataSource);
	
	this._body2Div.scrollTop = 0;
	this._body2Div.scrollLeft = 0;
};

MgTableGrid.prototype.addDataSourceItem = function(item)
{	
	var body = this._bodyTemplate.cloneNode(true);
	
	this._bind(body, this._dataSource.length, item);
	
	this._dataSource.push(item);
	
	this._setSectionHeight([body]);
	
	var body1 = body.cloneNode(true);
	this._filterFixCell(body1.rows);
	var body2 = body;
	this._filterNotFixCell(body2.rows);
		
	this._body1Table.appendChild(body1);
	this._body2Table.appendChild(body2);
	
	this._body2Div.scrollLeft = 0;
	this._body2Div.scrollTop = this._body2Table.offsetHeight;
}

MgTableGrid.prototype._generate = function(templateTable)
{
	// DOM\‘¢‚Ì¶¬
	var head1Table = templateTable.cloneNode(false);
	var head2Table = templateTable.cloneNode(false);
	var body1Table = templateTable.cloneNode(false);
	var body2Table = templateTable.cloneNode(false);

	var gridDiv = document.createElement("div");
	gridDiv.className = "mg_grid";
	
	var workingTable = templateTable.cloneNode(false);
	workingTable.style.visibility = "hidden";
	gridDiv.appendChild(workingTable);
	
	var head1Div = document.createElement("div");
	head1Div.className = "mg_grid_head mg_grid_fixed";
	head1Div.appendChild(head1Table);
	gridDiv.appendChild(head1Div);
	
	var head2Div = document.createElement("div");
	head2Div.className = "mg_grid_head mg_grid_scroll";
	head2Div.appendChild(head2Table);
	gridDiv.appendChild(head2Div);
	
	var body1Div = document.createElement("div");
	body1Div.className = "mg_grid_body mg_grid_fixed";
	body1Div.appendChild(body1Table);
	gridDiv.appendChild(body1Div);
	
	var body2Div = document.createElement("div");
	body2Div.className = "mg_grid_body mg_grid_scroll";
	body2Div.appendChild(body2Table);
	gridDiv.appendChild(body2Div);
	
	this.grid = gridDiv;

	templateTable.parentNode.insertBefore(gridDiv, templateTable);
	templateTable.parentNode.removeChild(templateTable);

	this_workingTable = workingTable;
	
	var head = templateTable.tHead.cloneNode(true);
	this._setSectionHeight([head]);

	var head1 = head.cloneNode(true);
	this._filterFixCell(head1.rows);
	head1Table.appendChild(head1);
	
	var head2 = head;
	this._filterNotFixCell(head2.rows);
	head2Table.appendChild(head2);
	
	this._bodyTemplate = templateTable.tBodies[0].cloneNode(true);
	
	var head1Width = this._calcTableWidth(head1Table.tHead);
	var head2Width = this._calcTableWidth(head2Table.tHead);

	head1Table.style.width = this._toPxStr(head1Width);
	body1Table.style.width = this._toPxStr(head1Width);
	head2Table.style.width = this._toPxStr(head2Width);
	body2Table.style.width = this._toPxStr(head2Width);

	var gridStyle = templateTable.getAttribute("grid-style");
	if(gridStyle != null)
		gridDiv.setAttribute("style", gridStyle);
	var gridClass = templateTable.getAttribute("grid-class");
	if(gridClass != null)
		this._addClass(gridDiv, gridClass);

	gridDiv.style.position = "relative";

	head1Div.style.position = "absolute";
	head2Div.style.position = "absolute";
	body1Div.style.position = "absolute";
	body2Div.style.position = "absolute";
	
	head1Div.style.overflow = "hidden";
	head2Div.style.overflow = "hidden";
	body1Div.style.overflow = "hidden";
	body2Div.style.overflow = "scroll";
	
	head1Div.style.top = "0px";
	head2Div.style.top = "0px";
	head1Div.style.left = "0px";
	body1Div.style.left = "0px";
	
	var offsetHeight = Math.max(head1Div.offsetHeight, head2Div.offsetHeight);
	var offsetWidth = Math.max(head1Div.offsetWidth, body1Div.offsetWidth);
	
	head2Div.style.left = this._toPxStr(offsetWidth);
	head2Div.style.right = "16px";
	
	body1Div.style.top = this._toPxStr(offsetHeight);
	body1Div.style.bottom = "16px";
	
	body2Div.style.top = this._toPxStr(offsetHeight);
	body2Div.style.left = this._toPxStr(offsetWidth);
	body2Div.style.right = "0px";
	body2Div.style.bottom = "0px";
	gridDiv.style.height = this._toPxStr(body2Div.offsetTop + body2Div.offsetHeight - 1);
	
	this._head1Table = head1Table;
	this._head2Table = head2Table;
	this._body1Table = body1Table;
	this._body2Table = body2Table;
	
	this._head1Div = head1Div;
	this._head1Div = head1Div;
	this._body1Div = body1Div;
	this._body2Div = body2Div;
	
	body2Div.addEventListener('scroll', function() {
		body1Div.scrollTop = 
			body1Table.offsetHeight * body2Div.scrollTop / body2Table.offsetHeight;
		head2Div.scrollLeft = 
			head2Table.offsetWidth * body2Div.scrollLeft / body2Table.offsetWidth;
	});
	
	templateTable = null;
};

MgTableGrid.prototype._toPxStr = function(value)
{
	return value.toString() + "px";
};

MgTableGrid.prototype._addClass = function(elem, className)
{
	if(elem.className == null || elem.className.length <= 0) {
		elem.className = className;
	} else {
		elem.className = elem.className + " " + className;
	}
};

MgTableGrid.prototype._removeAllChildren = function(elem)
{
	var parent = elem.parentNode;
	var nextSibling = elem.nextSibling;
	
	parent.removeChild(elem);
	
	while(elem.lastChild != null)
		elem.removeChild(elem.lastChild);
		
	parent.insertBefore(elem, nextSibling);
};

MgTableGrid.prototype._getItemFieldValue = function(item, fieldName)
{
	if(fieldName == "this")
		return item.toString();

	var value = item[fieldName];
	if(value === undefined) 
		return "FIELD NOT FOUND";
	else if(value === null)
		return "";
	else
		return value.toString();
};

MgTableGrid.prototype._setSectionHeight = function(bodies)
{
	var working = this_workingTable;
	var fragment = document.createDocumentFragment();
	for(var i = 0; i < bodies.length; i++) {
		fragment.appendChild(bodies[i]);
	}
	working.appendChild(fragment);
	
	var rowHeights = [];
	for(var i = 0; i < bodies.length; i++) {
		var section = bodies[i];
		for(var j = 0; j < section.rows.length; j++) {
			rowHeights.push(this._toPxStr(section.rows[j].offsetHeight + 1));
		}
	}
	
	this._removeAllChildren(working);

	var k = 0;
	for(var i = 0; i < bodies.length; i++) {
		var rows = bodies[i].rows;
		for(var j = 0; j < rows.length; j++) {
			rows[j].style.height = rowHeights[k++];
		}
	}
};

MgTableGrid.prototype._calcTableWidth = function(bodyElem)
{
	if(bodyElem.rows.length <= 0)
		return 0;
	var rowSample = bodyElem.rows[0];
	var cellsLength = rowSample.cells.length;
	var tableWidth = 0;
	for(var i = 0; i < cellsLength; i++) {
		tableWidth += rowSample.cells[i].offsetWidth;
	}
	return tableWidth;
};

MgTableGrid.prototype._filterFixCell = function(rows)
{
	var rowsLength = rows.length;
	for(var i = 0; i < rowsLength; i++) {
		var cells = rows[i].cells;
		for (var j = cells.length; j > 0; j--) {
			var cell = cells[j-1];
			if(cell.getAttribute("fix") == null) {
 				cell.parentNode.removeChild(cell);
			}
 		}
	}
};

MgTableGrid.prototype._filterNotFixCell = function(rows)
{
	var rowsLength = rows.length;
	for(var i = 0; i < rowsLength; i++) {
		var cells = rows[i].cells;
		for (var j = cells.length; j > 0; j--) {
			var cell = cells[j-1];
			if(cell.getAttribute("fix") != null) {
 				cell.parentNode.removeChild(cell);
			}
 		}
	}
};

MgTableGrid.prototype._bind = function(rowTemplate, index, item)
{
	var oddEvenClass = (index % 2 == 0) ? "even": "odd";
	
	var rows = rowTemplate.rows;
	for(var i = 0; i < rows.length; i++) {
		this._addClass(rows[i], oddEvenClass);
		this._bindNode(rows[i], index, item);
	}
};

MgTableGrid.prototype._bindNode = function(node, index, item)
{
	while(node != null) {
		if(node.nodeType == Node.ELEMENT_NODE) {
			var nodeName = node.nodeName.toLowerCase();
			if(nodeName == "row-number") {
				this._bindRowNumberElement(node, index, item);
			} else if(nodeName == "out") {
				this._bindOutElement(node, index, item);
			} else {
				this._bindElementAttribute(node, index, item);
				
				if(node.firstChild != null) {
					this._bindNode(node.firstChild, index, item);
				}
			}
		}
		node = node.nextSibling;
	}
};

MgTableGrid.prototype._bindRowNumberElement = function(node, index, item)
{
	var hrefField = node.getAttribute("href-field");
	
	var newNode = document.createTextNode((index + 1).toString());
	if(hrefField != null && hrefField.length > 0) {
		var aNode = document.createElement("a");
		aNode.setAttribute("href", this._getItemFieldValue(item, hrefField));
		aNode.appendChild(newNode);
		newNode = aNode;
	}
	
	node.parentNode.insertBefore(newNode, node);
	node.parentNode.removeChild(node);
};

MgTableGrid.prototype._bindOutElement = function(node, index, item)
{
	var field = node.getAttribute("field");
	var hrefField = node.getAttribute("href-field");
	
	var newNode = document.createTextNode(
					this._getItemFieldValue(item, field));
	if(hrefField != null && hrefField.length > 0) {
		var aNode = document.createElement("a");
		aNode.setAttribute("href", this._getItemFieldValue(item, hrefField));
		aNode.appendChild(newNode);
		newNode = aNode;
	}
	
	node.parentNode.insertBefore(newNode, node);
	node.parentNode.removeChild(node);
};

MgTableGrid.prototype._bindElementAttribute = function(node, index, item)
{
	for(var i = 0; i < node.attributes.length; i++) {
		var attr = node.attributes[i];
		if(attr.name.startsWith("bind-")) {
			var value = this._getItemFieldValue(item, attr.value);
			node.setAttribute(attr.name.substring("bind-".length), value);
		}
	}
};
