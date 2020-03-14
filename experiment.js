
var experiment = {
  name: 'bp_existence_study',
  task: 'bp_existence_study',
  failQualification: "true",//FIX
  researcher: 'jfisher',
  numTasks: 3,//4?
  params: {
    "name":"bp_existence_study",
    "params":[
      {
        "name": "method",
        "type":"UniformChoice",
        "options":["breakpoints1", "breakpoints3", "breakpoints5", "global", "per-chart"]
      }
    ]
  },
  viewTask: viewTask,
  clearTask: clearTask,
  finish: finish,
}

var method, dataFName, dataRandomFName;


var training = true;

async function viewTask(opts) {
    var params = opts.params;
    console.log("view task");
    method = params['method']
    if (method == "breakpoints3"){
      dataFName = "databps3.json"
      dataRandomFName = "dataRandombps3.json"
    } else if (method == "breakpoints5"){
      dataFName = "databps5.json"
      dataRandomFName = "dataRandombps5.json"
    } else{
      dataFName = "databps1.json"
      dataRandomFName = "dataRandombps1.json"
    }
    $('#taskno').text(cur_task);
    if(training){
      await load_data(dataRandomFName)
    } else {
      await load_data(dataFName)
    }
    show("tool")
    updateData()
    console.log("UPDATING DATA")
    console.log(params);
}

function clearTask(params) {
  console.log('clearTask');
  console.log(params);
}

function finish(params) {
  console.log('finish');
  // opt.submit();
}


let max = 0;
let slider = document.querySelector('#slider');
let mentalSlider = document.querySelector('#mental');
let effortSlider = document.querySelector('#effort');
let performanceSlider = document.querySelector('#performance');
let frustrationSlider = document.querySelector('#frustration');


let query = document.getElementById('query');
let finalComment = document.getElementById('finalComment');
let breakpointsComment = document.getElementById('breakpointsComment');
let education = document.getElementById('education');
let age = document.getElementById('age');
let textArea = document.getElementById('textArea');
let nextTaskButton = document.getElementById('nextTaskButton');

let inputs = ["year", "month", "value"];

function hide(id){
  $(`#${id}`).hide()
}


function show(id){
  $(`#${id}`).show()
}

slider.addEventListener('input', updateData);



let spec_base = {
  "width": "container",
  "height": 400,
  "mark": "",
  "transform": [
    {"calculate": "monthFormat(datum.month-1)", "as": "monthStr"},
  ],
  "encoding": {
    "x": {
      "field": "monthStr",
      "type": "ordinal",
      "sort": {"op": "min", "field": "month"},
      "axis": {"title": "Month"}
    },
    "y": {
      "axis": {"title": "Oil Price (USD)"},
      "field": "",
      "type": "quantitative",
      "scale": {
        "type": "linear",
        "nice": false,
        "zero": false
      }
    }
  }
}
var dataMap = new Map();
var fileLoaded = ""
var xname = "";
var yname = "";
var encoding = "";
var gmax = 0;
var gmin = 0;
var label = "";
var task_data;
var task_order = [];
var cur_task = -1;
var tasks_results = [];
var start_time;
var time_took;
var qualTask;

async function load_data(fname) {
  if(fileLoaded == fname){
    return 0
  }
  await $.getJSON(fname, function(config) {
    console.log(fname)
    xname = config['xname'];
    yname = config['yname'];
    encoding = config['encoding']
    if (encoding == 'scatter'){
      encoding = "point"
    }
    spec_base['mark'] = encoding
    gmax = config['gmax']
    gmin = config['gmin']
    const urlParams = new URLSearchParams(window.location.search);
    const methodParam = urlParams.get('method');
    if(methodParam){
      method = methodParam;
    }
    if(method =="global" || method == "per-chart"){
      hide("breakpointsCommentDiv")
    }
    label = config['label']
    for (index of config['data']){
      dataMap.set(parseFloat(index['index']),index)
    }
    qualTask = config['qualTask']
    task_order = []
    range = []
    for (var i = 0; i < task_data.length; i++) {
      range.push(i)
    }
    for (var i = 0; i < task_data.length; i++) {
      index = Math.floor(Math.random() * (range.length));
      task_order.push(range[index])
      range.splice(index, 1)
    }
    cur_task = -1;
    tasks_results = [];
    slider.min = config['start'];
    slider.max = config['stop'];
    slider.step = config['step'];
    var steps = Math.floor((config['stop']-config['start'])/config['step']/2)
    slider.value = config['start']+steps*config['step'];
    vegaEmbed('#vis', {});
    query.innerText = "";
    fileLoaded = fname;
  });
}

//INITAL WORK
$(document).ready(function() {
  console.log("READY")
  $.getJSON("./tasks.json", function(data) {
    console.log(data['tasks'])
    let i = 2/0
    task_data = data['tasks']
  })
})



function updateData() {
  var data = dataMap.get(parseFloat(slider.value))
  query.innerText = `${label}: ${slider.value}`
  // spec_base.encoding.x.field = xname;
  // if ((typeof data.records[xname]) == 'number'){
  //   spec_base.encoding.x.type = 'quantitative'
  // } else {
  //   spec_base.encoding.x.type = 'nominal'
  // }
  spec_base.encoding.y.field = yname;

  spec_global = JSON.parse(JSON.stringify(spec_base))
  spec_bp = JSON.parse(JSON.stringify(spec_base))
  spec_global.encoding.y.scale.domain = []
  spec_bp.encoding.y.scale.domain = []
  spec_global.encoding.y.scale.domain[0] = gmin
  spec_global.encoding.y.scale.domain[1] = gmax
  spec_bp.encoding.y.scale.domain[0] = data.min
  spec_bp.encoding.y.scale.domain[1] = data.max
  // spec_base.title = "per-chart"
  // spec_global.title = "global"
  // spec_bp.title = "breakpoints"
  var spec;
  if (method == "global") {
    spec = spec_global;
  } else if (method == "per-chart"){
    spec = spec_base;
  } else {
    spec = spec_bp;
  }
  var spec = {
    "data": {
      "values": data.records
    },
    "config": {
      "axis": {
        "labelFontSize": 16,
        "titleFontSize": 20
      }
    },
    "hconcat": [spec]
  }
  vegaEmbed('#vis', spec);
}

function dummyData() {
  var exp = gpaas.startExperiment(() => { return experiment; });
  exp.run();
  hide("intro")
  hide("haveAnswer")
  show("tool")
  // updateData();
  show("doneDummyIntro")
  show("tutorial")
  if(method == "global"){
    show("optionalScale")
  }
  taskQuestion.innerText = "Tutorial"
}

function doneDummy() {
  hide("doneDummyIntro")
  hide("tutorial")
  hide("tool")
  show("haveAnswer")
  show("qualTask")
  // show("begintask0")
  return false
}

function checkQualTask(){
  //gpass.nextQualification($('#qualTaskQ').val()=="no")
  hide("qualTask")
  show("begintask0")
}

function answers() {
  var d = new Date();
  time_took = d.getTime()-start_time
  hide("tool")
  for (let inputName of inputs) {
    hide("inputName")
  }
  console.log(task_data, task_order[cur_task], task_order, cur_task)
  for (let input of task_data[task_order[cur_task]].answers) {
    show(input.type)
    document.getElementById(`${input.type}Label`).innerText = input.label+":"
  }
  show("submitAnswer")
  return false
}

async function taskStart() {
  if(cur_task >= 0){
    var vals = {}
    var answers = []
    for (let inputName of task_data[task_order[cur_task]].answers) {
      var input = document.getElementById(inputName.type+"Ans")
      answers.push(input.value)
      input.value = ""
    }
    vals.answer = answers
    vals.mental = mentalSlider.value
    mentalSlider.value = 4
    vals.effort = effortSlider.value
    effortSlider.value = 4
    vals.performance = performanceSlider.value
    performanceSlider.value = 4
    vals.frustration = frustrationSlider.value
    frustrationSlider.value = 4
    vals.textArea = textArea.value
    textArea.value = ""
    vals.time = time_took
    tasks_results[task_order[cur_task]] = vals
    //logData(vals)
  } else {
    await load_data(dataFName)
  }
  cur_task++
  console.log("YO")
  gpaas.nextTask();
  hide("begintask")
  hide("begintask0")
  if(cur_task>=task_data.length) {
    show("done")
  } else {
    console.log("TASK")
    console.log(task_data)
    taskQuestion.innerHTML = `Task ${cur_task+1}:<br>${task_data[task_order[cur_task]].question}`
    show("tool")
    updateData();
    var d = new Date();
    start_time = d.getTime()
  }
  return false
}

function finalEnding(){
  // fetch("/submitdata", {
  //   headers: {
  //     'Accept': 'application/json',
  //     'Content-Type': 'application/json'
  //   },
  //   method: "POST",
  //   body: JSON.stringify({results: tasks_results, method: method, order: task_order.join(' '), comment: finalComment.value})
  // });
  gpaas.logData({method: method, order: task_order.join(' '), comment: finalComment.value, bpcomment: breakpointsComment.value})
  gpaas.logData({education: education.value, age: age.value})
  hide("done")
  show("veryFinal")
}

function submit() {
  hide("submitAnswer")
  if(cur_task==task_data.length-1){
    nextTaskButton.innerText = "Proceed to final information"
  }
  show("begintask")
  return false
}
//MEMORY LEAK VEGA ERROR?
