/**
 * @license
 *
 * complete.ly 1.0.0
 * MIT Licensing
 * Copyright (c) 2013 Lorenzo Puccetti
 *
 * This Software shall be used for doing good things, not bad things.
 *
 *
 * Modified by Zachary King (c) 2014.
 *
 **/

var utils = require('./utils');

module.exports = function(container, config) {
  const thisDocument = utils.get_document(container);
  const thisWindow = utils.get_window(container);

    config = config || {};
    config.fontSize =                       config.fontSize   || '13px';
    config.fontFamily =                     config.fontFamily || 'sans-serif';
    config.promptInnerHTML =                config.promptInnerHTML || '';
    config.color =                          config.color || '#333';
    config.hintColor =                      config.hintColor || '#aaa';
    config.backgroundColor =                config.backgroundColor || '#fff';
    config.dropDownBorderColor =            config.dropDownBorderColor || '#aaa';
    config.dropDownZIndex =                 config.dropDownZIndex || '100'; // to ensure we are in front of everybody
    config.dropDownOnHoverBackgroundColor = config.dropDownOnHoverBackgroundColor || '#ddd';

    var txtInput = thisDocument.createElement('input');
    txtInput.type ='text';
    txtInput.spellcheck = false;
    txtInput.style.fontSize =        config.fontSize;
    txtInput.style.fontFamily =      config.fontFamily;
    txtInput.style.color =           config.color;
    txtInput.style.backgroundColor = config.backgroundColor;
    txtInput.style.width = '100%';
    txtInput.style.outline = '0';
    txtInput.style.border =  '0';
    txtInput.style.margin =  '0';
    txtInput.style.padding = '0';

    var txtHint = txtInput.cloneNode();
    txtHint.disabled='';
    txtHint.style.position = 'absolute';
    txtHint.style.top =  '0';
    txtHint.style.left = '0';
    txtHint.style.borderColor = 'transparent';
    txtHint.style.boxShadow =   'none';
    txtHint.style.color = config.hintColor;

    txtInput.style.backgroundColor ='transparent';
    txtInput.style.verticalAlign = 'top';
    txtInput.style.position = 'relative';

    var wrapper = thisDocument.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.outline = '0';
    wrapper.style.border =  '0';
    wrapper.style.margin =  '0';
    wrapper.style.padding = '0';

    var prompt = thisDocument.createElement('div');
    prompt.style.position = 'absolute';
    prompt.style.outline = '0';
    prompt.style.margin =  '0';
    prompt.style.padding = '0';
    prompt.style.border =  '0';
    prompt.style.fontSize =   config.fontSize;
    prompt.style.fontFamily = config.fontFamily;
    prompt.style.color =           config.color;
    prompt.style.backgroundColor = config.backgroundColor;
    prompt.style.top = '0';
    prompt.style.left = '0';
    prompt.style.overflow = 'hidden';
    prompt.innerHTML = config.promptInnerHTML;
    prompt.style.background = 'transparent';
    if (thisDocument.body === undefined) {
        throw 'thisDocument.body is undefined. The library was wired up incorrectly.';
    }
    thisDocument.body.appendChild(prompt);
    var w = prompt.getBoundingClientRect().right; // works out the width of the prompt.
    wrapper.appendChild(prompt);
    prompt.style.visibility = 'visible';
    prompt.style.left = '-'+w+'px';
    wrapper.style.marginLeft= w+'px';

    wrapper.appendChild(txtHint);
    wrapper.appendChild(txtInput);

    var dropDown = thisDocument.createElement('div');
    dropDown.style.position = 'absolute';
    dropDown.style.visibility = 'hidden';
    dropDown.style.outline = '0';
    dropDown.style.margin =  '0';
    dropDown.style.padding = '0';
    dropDown.style.textAlign = 'left';
    dropDown.style.fontSize =   config.fontSize;
    dropDown.style.fontFamily = config.fontFamily;
    dropDown.style.backgroundColor = config.backgroundColor;
    dropDown.style.zIndex = config.dropDownZIndex;
    dropDown.style.cursor = 'default';
    dropDown.style.borderStyle = 'solid';
    dropDown.style.borderWidth = '1px';
    dropDown.style.borderColor = config.dropDownBorderColor;
    dropDown.style.overflowX= 'hidden';
    dropDown.style.whiteSpace = 'pre';
    dropDown.style.overflowY = 'scroll';

    var createDropDownController = function(elem) {
        var rows = [];
        var ix = 0;
        var oldIndex = -1;
        var current_row = null;

        var onMouseOver =  function() { this.style.outline = '1px solid #ddd'; }
        var onMouseOut =   function() { this.style.outline = '0'; }
        var onDblClick =  function(e) {
            e.preventDefault();
            p.onmouseselection(this.id);
        }

        var p = {
            hide :  function() { elem.style.visibility = 'hidden'; },
            refresh : function(token, options) {
                elem.style.visibility = 'hidden';
                ix = 0;
                elem.innerHTML ='';
                var vph = (thisWindow.innerHeight || thisDocument.documentElement.clientHeight);
                var rect = elem.parentNode.getBoundingClientRect();
                var distanceToTop = rect.top - 6;                        // heuristic give 6px
                var distanceToBottom = vph - rect.bottom -6;  // distance from the browser border.

                rows = [];
                for (var i = 0; i < options.length; i++) {
                    // ignore case
                    var found = options[i].matches.filter(function(match) {
                        return match.toLowerCase().indexOf(token.toLowerCase()) == 0;
                    });
                    if (found.length == 0)
                        continue;
                    var divRow = thisDocument.createElement('div');
                    divRow.style.color = config.color;
                    divRow.onmouseover = onMouseOver;
                    divRow.onmouseout =  onMouseOut;
                    // prevent selection for double click
                    divRow.onmousedown = function(e) { e.preventDefault(); };
                    divRow.ondblclick = onDblClick;
                    divRow.__hint = found[0];
                    divRow.id = options[i].id;
                    divRow.innerHTML = options[i].html;
                    rows.push(divRow);
                    elem.appendChild(divRow);
                    // limit results and add a note at the buttom
                    if (rows.length >= rs.display_limit) {
                        var divRow2 = thisDocument.createElement('div');
                        divRow2.innerHTML = ' ' + (options.length - rows.length) + ' more';
                        rows.push(divRow2);
                        elem.appendChild(divRow2);
                        break;
                    }
                }
                if (rows.length===0) {
                    return; // nothing to show.
                }
                p.highlight(0);

                // Heuristic (only when the distance to the to top is 4
                // times more than distance to the bottom
                if (distanceToTop > distanceToBottom*3) {
                    // we display the dropDown on the top of the input text
                    elem.style.maxHeight =  distanceToTop+'px';
                    elem.style.top ='';
                    elem.style.bottom ='100%';
                } else {
                    elem.style.top = '100%';
                    elem.style.bottom = '';
                    elem.style.maxHeight =  distanceToBottom+'px';
                }
                elem.style.visibility = 'visible';
            },
            highlight : function(index) {
                if (oldIndex !=-1 && rows[oldIndex]) {
                    rows[oldIndex].style.backgroundColor = config.backgroundColor;
                }
                rows[index].style.backgroundColor = config.dropDownOnHoverBackgroundColor; // <-- should be config
                oldIndex = index;
                current_row = rows[index];
            },
            // moves the selection either up or down (unless it's not
            // possible) step is either +1 or -1.
            move : function(step) {
                // nothing to move if there is no dropDown. (this happens if
                // the user hits escape and then down or up)
                if (elem.style.visibility === 'hidden')
                    return '';
                // No circular scrolling
                if (ix+step === -1 || ix+step === rows.length)
                    return rows[ix].__hint;
                ix+=step;
                p.highlight(ix);
                return rows[ix].__hint;
            },
            onmouseselection : function() {},
            get_current_row: function () {
                return current_row;
            }
        };
        return p;
    }

    var dropDownController = createDropDownController(dropDown);

    dropDownController.onmouseselection = function(id) {
        rs.onEnter(id)
        rs.input.focus();
    }

    wrapper.appendChild(dropDown);
    container.appendChild(wrapper);

    var spacer,
        // This will contain the leftSide part of the textfield (the bit that
        // was already autocompleted)
        leftSide;

    function calculateWidthForText(text) {
        if (spacer === undefined) { // on first call only.
            spacer = thisDocument.createElement('span');
            spacer.style.visibility = 'hidden';
            spacer.style.position = 'fixed';
            spacer.style.outline = '0';
            spacer.style.margin =  '0';
            spacer.style.padding = '0';
            spacer.style.border =  '0';
            spacer.style.left = '0';
            spacer.style.whiteSpace = 'pre';
            spacer.style.fontSize =   config.fontSize;
            spacer.style.fontFamily = config.fontFamily;
            spacer.style.fontWeight = 'normal';
            thisDocument.body.appendChild(spacer);
        }

        // Used to encode an HTML string into a plain text.
        // taken from http://stackoverflow.com/questions/1219860/javascript-jquery-html-encoding
        spacer.innerHTML = String(text).replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        return spacer.getBoundingClientRect().right;
    }


    var rs = {
        get_hint :    function(x) { return x; },
        display_limit: 1000,
        onArrowDown : function() {},               // defaults to no action.
        onArrowUp :   function() {},               // defaults to no action.
        onEnter :     function() {},               // defaults to no action.
        onTab :       function() {},               // defaults to no action.
        onChange:     function() { rs.repaint() }, // defaults to repainting.
        startFrom:    0,
        options:      [],

        // Only to allow easy access to the HTML elements to the final user
        // (possibly for minor customizations)
        wrapper : wrapper,
        input :  txtInput,
        hint  :  txtHint,
        dropDown :  dropDown,

        prompt : prompt,
        setText : function(text) {
            txtHint.value = text;
            txtInput.value = text;
        },
        getText : function() {
            return txtInput.value;
        },
        hideDropDown : function() {
            dropDownController.hide();
        },
        repaint : function() {
            var text = txtInput.value;
            var startFrom =  rs.startFrom;
            var options =    rs.options;
            var optionsLength = options.length;

            // breaking text in leftSide and token.
            var token = text.substring(startFrom);
            leftSide =  text.substring(0,startFrom);

            // updating the hint.
            txtHint.value ='';
            for (var i = 0; i < optionsLength; i++) {
                var found = options[i].matches.filter(function(match) {
                    return match.toLowerCase().indexOf(token.toLowerCase()) == 0;
                });
                if (found.length == 0)
                    continue;
                txtHint.value = rs.get_hint(found[0]);
                break;
            }

            // moving the dropDown and refreshing it.
            dropDown.style.left = calculateWidthForText(leftSide)+'px';
            dropDownController.refresh(token, rs.options);
        }
    };

    var registerOnTextChangeOldValue;

    // Register a callback function to detect changes to the content of the
    // input-type-text.  Those changes are typically followed by user's
    // action: a key-stroke event but sometimes it might be a mouse click.
    var registerOnTextChange = function(txt, callback) {
        registerOnTextChangeOldValue = txt.value;
        var handler = function() {
            var value = txt.value;
            if (registerOnTextChangeOldValue !== value) {
                registerOnTextChangeOldValue = value;
                callback(value);
            }
        };

        // For user's actions, we listen to both input events and key up events
        // It appears that input events are not enough so we defensively listen to key up events too.
        // source: http://help.dottoro.com/ljhxklln.php
        //
        // The cost of listening to three sources should be negligible as the handler will invoke callback function
        // only if the text.value was effectively changed.
        txt.addEventListener("input",  handler, false);
        txt.addEventListener('keyup',  handler, false);
        txt.addEventListener('change', handler, false);
    };


    registerOnTextChange(txtInput,function(text) { // note the function needs to be wrapped as API-users will define their onChange
        rs.onChange(text);
        rs.repaint();
    });


    var keyDownHandler = function(e) {
        e = e || thisWindow.event;
        var keyCode = e.keyCode;

        if (keyCode == 33) { return; } // page up (do nothing)
        if (keyCode == 34) { return; } // page down (do nothing);

        // right,  end, tab  (autocomplete triggered)
        if (keyCode == 39 || keyCode == 35 || keyCode == 9) {
            // for tabs we need to ensure that we override the default
            // behaviour: move to the next focusable HTML-element
            if (keyCode == 9) {
                e.preventDefault();
                e.stopPropagation();
                if (txtHint.value.length == 0) {
                    // tab was called with no action.
                    rs.onTab();
                }
            }
            // if there is a hint
            if (txtHint.value.length > 0) {
                txtInput.value = txtHint.value;
                var hasTextChanged = registerOnTextChangeOldValue != txtInput.value
                // avoid dropDown to appear again
                registerOnTextChangeOldValue = txtInput.value;
                // for example imagine the array contains the following
                // words: bee, beef, beetroot. User has hit enter to get
                // 'bee' it would be prompted with the dropDown again (as
                // beef and beetroot also match)
                if (hasTextChanged) {
                    // force it.
                    rs.onChange(txtInput.value);
                }
            }
            return;
        }

        if (keyCode == 13) { // enter
            // get current
            var id = dropDownController.get_current_row().id;
            rs.onEnter(id);
            return;
        }

        if (keyCode == 40) { // down
            var m = dropDownController.move(+1);
            if (m == '') { rs.onArrowDown(); }
            txtHint.value = rs.get_hint(m);
            return;
        }

        if (keyCode == 38 ) { // up
            var m = dropDownController.move(-1);
            if (m == '') { rs.onArrowUp(); }
            txtHint.value = rs.get_hint(m);
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // it's important to reset the txtHint on key down. Think: user
        // presses a letter (e.g. 'x') and never releases. You get
        // (xxxxxxxxxxxxxxxxx) and you would see still the hint. Reset the
        // txtHint. (it might be updated onKeyUp).
        txtHint.value ='';
    };

    txtInput.addEventListener("keydown",  keyDownHandler, false);
    return rs;
};
