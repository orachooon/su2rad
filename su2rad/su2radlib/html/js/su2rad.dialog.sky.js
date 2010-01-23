
var su2rad = su2rad ? su2rad : new Object()
su2rad.dialog = su2rad.dialog ? su2rad.dialog : new Object()

su2rad.dialog.sky = su2rad.dialog.sky ? su2rad.dialog.sky : new Object()

function SkyOptionsObject() {
    this.generator = "gensky";
    this.skytype = "-c";
    this.g = 0.2;
    this.t = 1.7;
    this.b = 1;
    this.B = 1;
    this.r = 1;
    this.R = 1;
    this._activeOptions = {};
    this._activeOptions.g = false;
    this._activeOptions.t = false;
    this._activeOptions.b = false;
    this._activeOptions.B = false;
    this._activeOptions.r = false;
    this._activeOptions.R = false;
    this.logging = true;
}

SkyOptionsObject.prototype.isActive = function (opt) {
    try {
        var active = this._activeOptions[opt];
    } catch (e) {
        var active = false;
    }
    return active;
}

SkyOptionsObject.prototype.setSkyType = function (stype) {
    if (stype.length != 2) {
        return false;
    }
    var s = stype.charAt(1);
    if ( s == 'u' || s == 'c' || s == 'i' || s == 's' ) {
        if (stype.charAt(0) == '+' || stype.charAt(0) == '-') {
            if (stype != this.skytype) {
                log.debug("new skytype: '" + stype + "'");
            }
            this.skytype = stype;
            return true;
        }
    }
    return false;
}

SkyOptionsObject.prototype.parseSkyCommand = function (cmdline) {
    // set sky options from sky command
    if (cmdline == '') {
        return
    }
    this.logging = false; // stop info level logging
    log.debug("parsing '" + cmdline + "'");
    if (cmdline.charAt(0) == '!') {
        cmdline = cmdline.substring(1,cmdline.length);
    }
    var parts = cmdline.split(' ');
    for (i=0; i<parts.length; i++) {
        var opt = parts[i];
        if (this.setGenerator(opt) == true) {
            // log.debug("new generator: '" + opt + "'");
        } else if (this.setSkyType(opt) == true) {
            // log.debug("new skytype: '" + opt + "'");
        } else if (opt == '-ang') {
            log.warn("sky option '-ang' ignored")
            if (i < parts.length-2) {
                var alt = parts[i+1];
                var azi = parts[i+2];
                if ( isNaN(parseFloat(alt)) ) {
                    log.error("value for altitude is not a number: '" + alt + "'" );
                } 
                if ( isNaN(parseFloat(alt)) ) {
                    log.error("value for azimuth is not a number: '" + azi + "'" );
                } 
                // TODO check next two args
            } else {
                log.error("incomplete option '" + opt + "' ignored");
            }
        } else if (isNaN(parseFloat(opt)) == false) {
            // skip argument to previous option
        } else if (opt.length == 2 && opt.charAt(0) == '-') {
            if (i < parts.length-1) {
                var arg = parts[i+1];
                if (this.setValue(opt, arg) == true) {
                    i += 1;
                } else {
                    log.error("value for option '" + opt + "' is not a number: '" + arg + "'" );
                }
            } else {
                log.error("incomplete option '" + opt + "' ignored");
            }
        }
    }
    this.logging = true; // resume info level logging
    // show sky options?
}

SkyOptionsObject.prototype.removeOption = function (opt) {
    if (opt == 'g') {
        this.g = 0.2;
    } else if (opt == 't') {
        this.t = 1.7;
    } else {
        this[opt] = '';
    }
}

SkyOptionsObject.prototype.setActive = function (opt, checked) {
    //log.debug("setActive('" + opt + "', '" + checked + "'");
    if (opt == 'g' || opt == 't') {
        this._activeOptions[opt] = checked;
    } else {
        this._activeOptions[opt.toLowerCase()] = false;
        this._activeOptions[opt.toUpperCase()] = false;
        this._activeOptions[opt] = checked;
    }
    if (this.logging) {
        if (checked) {
            log.info("new active option '" + opt + "' (value='" + this[opt] + "')");
        } else {
            log.info("option '" + opt + "' disabled");
        }
    }       
}

SkyOptionsObject.prototype.setGenerator = function(val) {
    var oldGen = this.generator;
    if (val == 'gensky') {
        this.generator = 'gensky';
    } else if (val == 'gendaylit') {
        this.generator = 'gendaylit';
        alert("'gendaylit' not enabled yet\ndefault to 'gensky'")
        this.generator = 'gensky';
    } else if (val == 'hdr-image') {
        this.generator = 'hdr-image';
        alert("'hdr-image' not enabled yet\ndefault to 'gensky'")
        this.generator = 'gensky';
    } else {
        //log.error("'unknown sky generator '" + val + "'; generator unchanged")
        return false;
    }
    if (oldGen != this.generator) {
        log.debug("new generator: '" + opt + "'");
    }
    return true;
}

SkyOptionsObject.prototype.setValue = function(opt, val) {
    //log.debug("setValue(opt='" + opt + "', val='" + val + "'");
    if (opt.length == 2 && opt.charAt(0) == '-') {
        opt = opt.charAt(1);
    }
    var v = parseFloat(val);
    if (isNaN(v)) {
        return false;
    } else {
        this.setActive(opt, true);
        if (this[opt] != v) {
            log.debug("new value for option '" + opt + "': '" + v + "'");
        }
        this[opt] = v;
    }
    if (opt == 'g' && v == 0.2) {
        this.setActive('g', false);
    } else if (opt == 't' && v == 1.7) {
        this.setActive('t', false);
    }
    return true;
}
    
SkyOptionsObject.prototype.toString = function() {
    var text = this.generator;
    text += " " + su2rad.settings.skytime.toGenskyString();
    text += " " + this.skytype;
    var opts = ['g', 't', 'b', 'B', 'r', 'R'];
    for(var i=0; i<opts.length; i++) {
        var opt = opts[i];
        if (this._activeOptions[opt] == true) {
            text += " -" + opt + " " + this[opt].toFixed(3);
        }
    }
    return text;
}



function SkyDateTimeObject() {
    this.skyDateMonth = 3;
    this.skyDateDay = 21;
    this.skyTimeHour = 12;
    this.skyTimeMinute = 00;
    this._maxDays = [31,28,31,30,31,30,31,31,30,31,30,31];
    this._time_t = 0; //XXX should be correct for 12:00 Mar 21st
    this.changed = false;
}

SkyDateTimeObject.prototype.getValueString = function (id) {
    var s = this[id].toString();
    if (s.length == 1) {
        s = '0' + s;
    }
    return s;
}

SkyDateTimeObject.prototype.setValue = function (id,val) {
    if (this._checkLimit(id,val) == false) {
        log.warn("value out of range: id='" + id + "' val='" + val + "'");
        return false;
    }
    this[id] = val;
    this.changed = true;
    if (id == 'skyDateMonth') {
        var maxdays = this._maxDays[val-1];
        if (this.skyDateDay > maxdays) {
            this.skyDateDay = maxdays;
        }
    }
    return true;
}

SkyDateTimeObject.prototype.setFromShadowTime_time_t = function (time_t) {
    this._time_t = time_t;
    var sdate = new Date(time_t*1000);
    this.skyDateMonth  = sdate.getUTCMonth()+1;
    this.skyDateDay    = sdate.getUTCDate();
    this.skyTimeHour   = sdate.getUTCHours();
    this.skyTimeMinute = sdate.getUTCMinutes();
    this.changed = false;
    /*XXX
    var text = "stime='" + stime + "'<br/> ";
    text += "msec=" + msec + "<br/>";
    text += "sdate=" + sdate + "<br/>";
    text += "GMTstring=" + sdate.toGMTString() + "<br/>";
    text += "UTCstring=" + sdate.toUTCString() + "<br/>";
    text += "gensky=" + this.toGenskyString() + "<br/>";
    su2rad.dialog.setStatusMsg(text);
    */
}

SkyDateTimeObject.prototype.getShadowTime = function () {
    var newDate = new Date();
    newDate.setUTCFullYear(2002);
    newDate.setUTCMonth(this.skyDateMonth-1);
    newDate.setUTCDate(this.skyDateDay);
    newDate.setUTCHours(this.skyTimeHour);
    newDate.setUTCMinutes(this.skyTimeMinute);
    newDate.setUTCSeconds(0);
    newDate.setUTCMilliseconds(0);
    //var text = "new_t: " + Date.parse(newDate.toUTCString())/1000 + "<br/>";
    return Date.parse(newDate.toUTCString()) / 1000
}

SkyDateTimeObject.prototype._checkLimit = function (id,val) {
    // check value of input field against allowed limits
    if (id.indexOf('Date') > 0 && val == 0) {
        return false;
    }
    var max = 12;
    if (id == 'skyDateMonth') {
        max = 12;
    } else if (id == 'skyDateDay') {
        max = this._maxDays[this.skyDateMonth-1];
    } else if (id == 'skyTimeHour') {
        max = 23;
    } else if (id == 'skyTimeMinute') {
        max = 59;
    }
    // return true or false
    if (max >= val) {
        return true;
    } else {
        return false;
    }
}

SkyDateTimeObject.prototype.toGenskyString = function () {
    var text = this.skyDateMonth + " " + this.skyDateDay + " ";
    text += this.skyTimeHour + ":" + this.skyTimeMinute;
    return text;
}




su2rad.dialog.sky.onGenskyInputChanged = function(opt) {
    log.debug("onGenskyInputChanged(opt='" + opt + "')");
    var id = "genskyOptionInput" + opt;
    var val = document.getElementById(id).value;
    var v = parseFloat(val);
    if (isNaN(v)) {
        alert("value is not a number: '" + val + "'");
        document.getElementById(id).value = su2rad.settings.sky[opt];
    } else {
        su2rad.settings.sky.setValue(opt, v);
    }
    // document.getElementById('skyCommandLine').innerHTML = su2rad.settings.sky.toString();
    this.update();
    applySkySettings();
}

su2rad.dialog.sky.setDateTime = function(id) {
    log.debug("onSkyDateTimeChange(id='" + id + "'");
    var val = document.getElementById(id).value;
    if (val.indexOf('0') == 0 && val.length == 2) {
        val = val.substring(1,2);
    }
    val = parseInt(val);
    if (su2rad.settings.skytime.setValue(id, val) == true) {
        log.info("new value for '" + id + "': '" + val + "'");
    } else {
        alert("value out of range:\nid='" + id + "'\nvalue='" + val + "'");
    }
    document.getElementById(id).value = su2rad.settings.skytime.getValueString(id);
    if (id == 'skyDateMonth') {
        document.getElementById('skyDateDay').value = su2rad.settings.skytime.getValueString('skyDateDay');
    }
    su2rad.settings.location.setValue('ShadowTime_time_t', su2rad.settings.skytime.getShadowTime()); 
    this.update()
    applySkySettings();
}

su2rad.dialog.sky.setGenerator = function(generator) {
    //var generator = document.getElementById('skyGenerator').value;
    su2rad.settings.sky.setGenerator(generator);
    this.updateOptionsDisplay()
    this.update()
    applySkySettings();
}

su2rad.dialog.sky.onSkyTypeChange = function() {
    var stype = document.getElementById('genskySkyType').value;
    if (stype == 'c' || stype == 'u') {
        document.getElementById('sunOptionCB').checked = false;
        document.getElementById('genskySunOption').style.display='none';
    } else {
        document.getElementById('genskySunOption').style.display='';
    }
    var sun = '-';
    if (document.getElementById('sunOptionCB').checked == true) {
        sun = '+';
    }
    stype = sun+stype;
    if (su2rad.settings.sky.setSkyType(stype)) {
        log.info("new sky type: '" + stype + "'");
    } else {
        log.error("onSkyTypeChange(): error setting sky type '" + stype + "'");
    }
    //document.getElementById('skyCommandLine').innerHTML = su2rad.settings.sky.toString();
    this.update()
    applySkySettings();
}

su2rad.dialog.sky.updateOptionsDisplay = function() {
    setSelectionValue('skyGenerator', su2rad.settings.sky.generator);
    if (su2rad.settings.sky.generator == 'gensky') {
        this._updateGenskyOptions();
        this.updateSkyTypeDisplay();
    }
    this.setOptionsVisibility(su2rad.settings.sky.generator); 
}

su2rad.dialog.sky.setOptionsVisibility = function(generator) {
    //log.debug("setOptbionsVisibility('" + generator + "')");
    if (generator == 'gendaylit') {
        document.getElementById('genskyTypeOptions').style.display='none';
        document.getElementById('gendaylitTypeOptions').style.display='';
        document.getElementById('skyOptsGensky').style.display='none';
        document.getElementById('skyOptsGendaylit').style.display='';
        document.getElementById('skyOptsHDRImage').style.display='none';
    } else if (generator == 'hdr-image') {
        document.getElementById('genskyTypeOptions').style.display='none';
        document.getElementById('gendaylitTypeOptions').style.display='none';
        document.getElementById('skyOptsGensky').style.display='none';
        document.getElementById('skyOptsGendaylit').style.display='none';
        document.getElementById('skyOptsHDRImage').style.display='';
    } else {
        document.getElementById('genskyTypeOptions').style.display='';
        document.getElementById('gendaylitTypeOptions').style.display='none';
        document.getElementById('skyOptsGensky').style.display='';
        document.getElementById('skyOptsGendaylit').style.display='none';
        document.getElementById('skyOptsHDRImage').style.display='none';
    }
}

su2rad.dialog.sky.setSkyCmdLine = function () {
    // update command line showing sky generator options
    var loc = su2rad.settings.location.City + ", "+ su2rad.settings.location.Country;
    document.getElementById("skySummaryLocation").innerHTML = loc;
    document.getElementById("skySummaryNorth").innerHTML = su2rad.settings.location.NorthAngle.toFixed(2);
    var sky = su2rad.settings.location.toGenskyString();
    document.getElementById("skySummaryOptions").innerHTML = sky;
    document.getElementById("skyCommandLine").innerHTML = '<b>cmd:</b> ' + sky;
    su2rad.dialog.setStatusMsg(sky);
}

su2rad.dialog.sky.updateSkyDateTimeDisplay = function () {
    document.getElementById('skyDateMonth').value = su2rad.settings.skytime.getValueString('skyDateMonth');
    document.getElementById('skyDateDay').value = su2rad.settings.skytime.getValueString('skyDateDay');
    document.getElementById('skyTimeHour').value = su2rad.settings.skytime.getValueString('skyTimeHour');
    document.getElementById('skyTimeMinute').value = su2rad.settings.skytime.getValueString('skyTimeMinute');
}

su2rad.dialog.sky.updateDialog = function () {
    // update sky related dialog elements
    this.updateOptionsDisplay();
    this.updateSkyDateTimeDisplay();
    this.setSkyCmdLine()
}

su2rad.dialog.sky.updateSkyTypeDisplay = function () {
    // set sky type selector and sun check box
    if (su2rad.settings.sky.generator == 'gensky') {
        if (su2rad.settings.sky.skytype.charAt(0) == "+") {
            document.getElementById('sunOptionCB').checked = true;
        } else {
            document.getElementById('sunOptionCB').checked = false;
        }
        setSelectionValue('genskySkyType', su2rad.settings.sky.skytype.charAt(1));
        if (su2rad.settings.sky.skytype.charAt(1) == 'i' || su2rad.settings.sky.skytype.charAt(1) == 's') {
            document.getElementById('genskySunOption').style.display = '';
        } else {
            document.getElementById('genskySunOption').style.display = 'none';
        }
    }
}
    
su2rad.dialog.sky._updateGenskyOptions = function () {
    var text = "<div class=\"optionsHeader\" style=\"width:330px;\">";
    text += "<span class=\"gridLabel\" style=\"width:240px;\">gensky options:</span>";
    text += "</div>";
    text += "<div class=\"genskyOptions\" style=\"width:100px;\">";
    text += "<div class=\"rpictOverrideHeader\" style=\"width:80px;\">general</div>";
    text += this._updateGenskyOptionsDiv("g");
    text += this._updateGenskyOptionsDiv("t");
    text += "</div>";
    text += "<div class=\"genskyOptions\">";
    var opts = ["sky radiance","-b","-B","solar radiance","-r","-R"];
    for (var i=0; i<opts.length; i++) {
        opt = opts[i];
        if (opt.charAt(0) != '-') {
            text += "<div class=\"rpictOverrideHeader\">" + opt + "</div>";
        } else {
            text += this._updateGenskyOptionsDiv(opt.charAt(1));
        }
    }
    text += "</div>";
    document.getElementById("skyOptsGensky").innerHTML = text;
    $('.skyOptionInput').numeric({allow:"."});
}

su2rad.dialog.sky._updateGenskyOptionsDiv = function(opt) {
    //log.debug("_updateskyOptionsDiv(opt='" + opt + "')");
    var text = "";
    var state = "";
    if (su2rad.settings.sky.isActive(opt) == true) {
        state = "checked";
    }
    if (opt == 'g' || opt == 't') {
        var text = "<div class=\"gridRow\" style=\"width:85px;\">";
        text += "<a class=\"gridLabel\" style=\"width:25px;\">-" + opt + ":";
        text += getToolTip('gensky', opt)
        text += "</a>";
        text += "<input type=\"text\" class=\"valueInput\"";
        text += " id=\"genskyOptionInput" + opt + "\"";
        text += " value=\"" + su2rad.settings.sky[opt] + "\"";
        text += " onChange=\"su2rad.dialog.sky.onGenskyInputChanged('" + opt + "')\" />";
        text += "</div>"
        return text;
    } else {
        var labels = {};
        labels.b = "diffuse normal"
        labels.B = "diffuse horizontal"
        labels.r = "direct normal" 
        labels.R = "direct horizontal" 
        var text = "<div class=\"gridRow\">";
        text += this.getCheckBoxLabel(opt, labels[opt]);
        if (su2rad.settings.sky.isActive(opt) == true) {
            text += "<input type=\"text\" class=\"valueInput\"";
            text += " id=\"genskyOptionInput" + opt + "\"";
            text += " value=\"" + su2rad.settings.sky[opt] + "\"";
            text += " onChange=\"su2rad.dialog.sky.onGenskyInputChanged('" + opt + "')\" />";
        } else {
            text += "<span class=\"defaultValue\">[not set]</span>";
        }
        text += "</div>"
        return text;
    }
}

su2rad.dialog.sky.getCheckBoxLabel = function(opt, label) {
    // return label and checkbox with onclick action set 
    // TODO: change to DOM elements with closure function
    if (!label || label == '') {
        label = "-" + opt;
    }
    if (su2rad.settings.sky.isActive(opt) == true) {
        var action = " onClick=\"su2rad.dialog.sky.enableGenskyOption('" + opt + "','false')\" "
        var text = '<input type="checkbox" ' + action + 'checked />';
    } else {
        var action = " onClick=\"su2rad.dialog.sky.enableGenskyOption('" + opt + "','true')\" "
        var text = '<input type="checkbox" ' + action + ' />';
    }
    text += '<a class="gridLabel" ' + action + ' >' + label + ':';
    text += getToolTip("gensky", opt);
    text += "</a>";
    return text;
}

su2rad.dialog.sky.enableGenskyOption = function(opt,enable) {
    if (enable == "false") {
        enable = false
    } else if ( enable == "true") {
        enable = true
    }
    log.debug("enableGenskyOption(opt='" + opt + "'");
    su2rad.settings.sky.setActive(opt, enable);
    this._updateGenskyOptions();
    this.update();
    applySkySettings();
}

su2rad.dialog.sky.update = function () {
    log.debug("updating 'Sky' page ...");
    su2rad.dialog.location.update();
    this.updateDialog()
    su2rad.dialog.googleMap.updateLocation();
    // enable 'apply' if location or time has changed
    if (su2rad.settings.location.changed == true || su2rad.settings.skytime.changed == true) {
        document.getElementById("applyLocationValues").disabled=false;
        document.getElementById("reloadShadowInfo").disabled=false;
    } else {
        document.getElementById("applyLocationValues").disabled=true;
        document.getElementById("reloadShadowInfo").disabled=true;
    }
    su2rad.settings.skytime.getShadowTime();
}