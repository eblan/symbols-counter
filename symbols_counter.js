/**
  Yet another symbols counter tool
  by Mikhail Drugoy
  https://github.com/eblan
  MIT licensed.
 */

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
    to = to || from;
    var rest = this.slice((to || from) + 1 || this.length);
    this.length = from < 0 ? this.length + from : from;
    return this.push.apply(this, rest);
};


// constructor
function SymbolCounter(props){
  props = props || {};
  this.total_id = props["total_id"] || Math.floor(Math.random() * (99999 - 999 + 1)) + 999;
  this.css_total_text  = props["css_total_text"]  || "";
  this.css_total_count = props["css_total_count"] || "";
  this.css_table  = props["css_table"]  || "";
  this.css_report = props["css_report"] || "";
  this.css_symbol = props["css_symbol"] || "";
  this.css_count  = props["css_count"]  || "";
  this.css_action = props["css_action"] || "";
};

SymbolCounter.prototype.plusMinusResult = function(what){
  var data = $(what).data(),
      total_id = data["total_id"],
      amount = data["amount"],
      $el = $("#" + total_id),
      total = +$el.text();

  if(data["act"] == "-"){
    total -= data["amount"];
    $(what).data({"act": "+", "amount":amount, "total_id":total_id});
    $(what).text("+");
  } else if(data["act"] == "+"){
    total += data["amount"];
    $(what).data({"act": "-", "amount":amount, "total_id":total_id});
    $(what).text("-");
  }

  $el.text(total);
  
};

SymbolCounter.prototype.clearReport = function(){
  this.container.innerHTML = "";
};

SymbolCounter.prototype.doReport = function(result){
  var container = this.container,
      reverse = [],
      plis_minus_id = "id_plus_minus",
      size = 0, key, total = 0,
      rep_text = "",
      columns = this.columns,
      len = columns,
      total_id = this.total_id,
      css_total_text = this.css_total_text,
      css_total_count = this.css_total_count,
      css_table  = this.css_table,
      css_report = this.css_report,
      css_symbol = this.css_symbol,
      css_count  = this.css_count,
      css_action = this.css_action;


  this.clearReport();

  var $tbl = $("<table>").attr({"class":css_table});
  $thead = $("<thead>");
  $tbody = $("<tbody>");
  $tbl.append($thead);
  $tbl.append($tbody);
  $tr = $("<tr>").attr({"class":css_report});

  for (key in result) {
    if (result.hasOwnProperty(key)) {
      size++;
      rep_text = key;
      switch (key) {
        case " ":
          rep_text = "spaces";
          break;
        case "\r":
        case "\n":
          rep_text = "carriage";
          break;
      }

      // make plus/minus clickable
      var plusMinusResult = this.plusMinusResult; // closure `this`
      $span = $("<span>").attr({"id":plis_minus_id + "_" + size}).text("-").click( function(){
        plusMinusResult(this);
      }).data({"act": "-", "amount":result[key], "total_id":total_id});

      total += result[key];
      reverse.push(result[key]);
      $tr.append($("<td>").attr({"class":css_symbol}).text(rep_text),
                 $("<td>").attr({"class":css_count}).text(result[key]),
                 $("<td>").attr({"class":css_action}).append($span) );
      len--;

      if(!len) {
        $tbody.append($tr);
        $tr = $("<tr>").attr({"class":css_report});
        len = columns;
      }
    };
  }

  if(len != columns && size > columns) { // второе условие на случай если уникальных символов меньше чем колонок в таблице
    len *= 3; // each symbol has three cells: display, count, action (-+)
    for(;len > 0;len--) {
      $tr.append($("<td>").text(" "));
    }
  }

  // create table header
  if(size){
    var $th = $("<tr>").attr({"class":css_report});

    if(columns < size) {
      // do nothing
    } else if(size <= columns){
      columns = size;
    } else {
      columns = Math.floor(size/columns);
    }

    for (;columns > 0;columns--){
      $th.append($("<th>").text("symbol"));
      $th.append($("<th>").text("count"));
      $th.append($("<th>").text("action"));
    }
    $thead.append($th);
  }

  // append report table to document
  $tbody.append($tr);
  $(this.container).append($tbl);
  $tbl.after($("<span>").attr({"class":css_total_text}).text("symbols:"),
             $("<span>").attr({"id":total_id, "class":css_total_count}).text(total) );

};

SymbolCounter.prototype.clearText = function(what){
  what.form.charcount.value = "";
};

SymbolCounter.prototype.doCount = function(what, container){

  var container = this.container = document.getElementById(container);

  if(!container){
    alert("container not defined"); // please, define correctly second argument
    return;
  }

  // get settings
  var form = what.form,
      do_trim = form.do_trim.checked,
      rm_dup_spaces = form.rm_dup_spaces.checked,
      rm_spaces_before_punctuate = form.rm_spaces_before_punctuate.checked,
      add_spaces_after_punctuate = form.add_spaces_after_punctuate.checked,
      registry_sensitive = form.registry_sensitive.checked;

  this.columns = parseInt(form.columns.value) ? parseInt(form.columns.value) : 10; // 10 - default value for columns text field
  form.columns.value = this.columns;


  // apply settings
  var txt = what.form.charcount.value;
  if(do_trim) txt = txt.trim();
  if(!registry_sensitive) txt = txt.toLowerCase();


  // initialize variables
  var i = 0, j, arr = txt.split(''), len = txt.length, result = {},
      report = {dub_spaces:0, rm_spaces_before_punctuate:0, add_spaces_after_punctuate:0},
      tmp_str, tmp_int;

  // proceed counting
  for(i; i<len; i++) {
    tmp_str = arr[i];

    switch(tmp_str) {
      case " ":
        if(i+1 < len && arr[i+1] == " "){
          report["dub_spaces"]++;
          if(rm_dup_spaces){
            arr.remove(i);
            i--;
            len--;
            continue;
          }
        }
        break;
      case ".":
      case ",":
      case ":":
      case ";":
        if(rm_spaces_before_punctuate && i > 0 && arr[i-1] == " "){
          // remove space before punctuate
          report["rm_spaces_before_punctuate"]++;
          arr.remove(i-1);
          i--;
          len--;
          if(result[" "]){
            result[" "]--;
          }
        }
        if(add_spaces_after_punctuate && i+1 < len && arr[i+1] != " ") {
          // add space after punctuate
          arr.splice(i+1,0," ");
          len++;
          report["add_spaces_after_punctuate"]++;
        }
        break;
    }

    tmp_int = result[tmp_str];
    tmp_int = isNaN(tmp_int) ? 0 : tmp_int;
    result[tmp_str] = ++tmp_int;
  }

  // make report
  this.doReport(result);
  what.form.charcount.value = arr.join("");
};

