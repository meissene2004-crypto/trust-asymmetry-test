/**
 * jspsych-html-slider-response
 * a jspsych plugin for free response survey questions
 *
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['custom-html-slider-response'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'html-slider-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      min: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Min slider',
        default: 0,
        description: 'Sets the minimum value of the slider.'
      },
      max: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Max slider',
        default: 100,
        description: 'Sets the maximum value of the slider',
      },
      slider_start: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Slider starting value',
        default: 50,
        description: 'Sets the starting value of the slider',
      },
      step: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Step',
        default: 1,
        description: 'Sets the step of the slider'
      },
      labels: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name:'Labels',
        default: [],
        array: true,
        description: 'Labels of the slider.',
      },
      slider_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name:'Slider width',
        default: null,
        description: 'Width of the slider in pixels.'
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        array: false,
        description: 'Label of the button to advance.'
      },
      require_movement: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Require movement',
        default: false,
        description: 'If true, the participant will have to move the slider before continuing.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the slider.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show the trial.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when user makes a response.'
      },
      button_css_id: {
          type: jsPsych.plugins.parameterType.STRING,
          pretty_name: 'CSS id name of "next" button',
          default: "jspsych-html-slider-response-next",
          description: "Add custom css to the next buttons"
      },
      disable_slider: {
          type: jsPsych.plugins.parameterType.BOOL,
          pretty_name: "Fix slider position",
          default: false,
          description: 'If true, slider will not be moveable'
      },
      source_type: {
          type: jsPsych.plugins.parameterType.BOOL,
          pretty_name: "Source type",
          default: null,
          description: 'The source type for this trial, used to determine slider colors'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    // half of the thumb width value from jspsych.css, used to adjust the label positions
    var half_thumb_width = 7.5; 

    // add '#' to the css id of the button for later use
    var button_css_id_hash = "#" + trial.button_css_id;

    var source_type = null;
    try {
      source_type = jsPsych.timelineVariable('source_type');
    } catch (e) {
      source_type = null;
    }
    var left_color = '#E67E22'; // default orange color for left side of slider
    var right_color = '#9B59B6'; // default purple color for right side of slider
    var fund_colors = {
      practice_source: {left: '#8fa9aa', right: '#253232'},
      source_low_1: {left: '#E67E22', right: '#9B59B6'},
      source_low_2: {left: '#1A5276', right: '#F1948A'},
      source_high_1: {left: '#1E8449', right: '#922B21'},
      source_high_2: {left: '#F4D03F', right: '#5DADE2'},
    }
    if (source_type && window.source_fund_map && window.source_fund_map[source_type]) {
      left_color = window.source_fund_map[source_type].left_colour;
      right_color = window.source_fund_map[source_type].right_colour;
    };
    if (source_type && fund_colors[source_type]) {
      left_color = fund_colors[source_type].left;
      right_color = fund_colors[source_type].right;
    }
    

    var left_label = '100%<br>confident Fund A';
    var right_label = '100%<br>confident Fund B';
    var fund_labels = {
      practice_source: {left: 'Fund X', right: 'Fund Y'},
      source_low_1: {left: 'Fund A', right: 'Fund B'},
      source_low_2: {left: 'Fund C', right: 'Fund D'},
      source_high_1: {left: 'Fund E', right: 'Fund F'},
      source_high_2: {left: 'Fund G', right: 'Fund H'},
    }; 
    if (source_type && fund_labels[source_type]) {
      left_label = '100%<br>confident ' + fund_labels[source_type].left;
      right_label = '100%<br>confident ' + fund_labels[source_type].right
    }
    var html = `<style>
        #jspsych-html-slider-response-response:{
          background: transparent;
  }
        #jspsych-html-slider-response-response::-webkit-slider-runnable-track {
          background: linear-gradient(90deg, ${left_color} 0%, #ffffff 50%, ${right_color} 100%) !important;
  }
        #jspsych-html-slider-response-response::-moz-range-track {
          background: linear-gradient(90deg, ${left_color} 0%, #ffffff 50%, ${right_color} 100%) !important;
  }
  </style>`;
    html += '<div id="jspsych-html-slider-response-stimulus">' + trial.stimulus + '</div>';
    html += '<div id="jspsych-html-slider-response-wrapper" style="margin: 20px 0px 50px;">';
    html += '<div class="jspsych-html-slider-response-container" style="position:relative; margin: 0 auto 3em auto; ';
    if(trial.slider_width !== null){
      html += 'width:'+trial.slider_width+'px;';
    } else {
      html += 'width:auto;';
    }
    html += '">';
    html += '<input type="range" class="custom-slider" value="'+
        trial.slider_start+'" min="'+ trial.min+'" max="'+trial.max+'" step="'+ 
        trial.step+'" id="jspsych-html-slider-response-response"' + 
        (trial.disable_slider ? "disabled" : "") + '></input>';
    html += '<div>'
    if (trial.labels.length >= 5) {
      trial.labels[0] = '<p id=confidence_label>' + left_label + '</p>';
      trial.labels[trial.labels.length - 1] = '<p id=confidence_label>' + right_label + '</p>';
    }
    for(var j=0; j < trial.labels.length; j++){
      var label_width_perc = 100/(trial.labels.length-1);
      var percent_of_range = j * (100/(trial.labels.length - 1));
      var percent_dist_from_center = ((percent_of_range-50)/50)*100;
      var offset = (percent_dist_from_center * half_thumb_width)/100;
      html += '<div style="border: 1px solid transparent; display: inline-block; position: absolute; '+
      'left:calc('+percent_of_range+'% - ('+label_width_perc+'% / 2) - '+offset+'px); text-align: center; width: '+label_width_perc+'%;">';  
      html += '<span style="text-align: center; font-size: 80%;">'+trial.labels[j]+'</span>';
      html += '</div>'
    }
    html += '</div>';
    html += '</div>';
    html += '</div>';

    if (trial.prompt !== null){
      html += trial.prompt;
    }

    // add submit button
    html += '<button id="' + trial.button_css_id + '" class="jspsych-btn" '+ (trial.require_movement ? "disabled" : "") + '>'+trial.button_label+'</button>';

    display_element.innerHTML = html;

    var response = {
      rt: null,
      response: null
    };

    if(trial.require_movement){
      display_element.querySelector('#jspsych-html-slider-response-response').addEventListener('click', function(){
        display_element.querySelector(button_css_id_hash).disabled = false;
      });
    }

    display_element.querySelector(button_css_id_hash).addEventListener('click', function() {
      // measure response time
      var endTime = performance.now();
      response.rt = endTime - startTime;
      response.response = display_element.querySelector('#jspsych-html-slider-response-response').valueAsNumber;

      if(trial.response_ends_trial){
        end_trial();
      } else {
        display_element.querySelector(button_css_id_hash).disabled = true;
      }

    });

    function end_trial(){

      jsPsych.pluginAPI.clearAllTimeouts();

      // save data
      var trialdata = {
        rt: response.rt,
        stimulus: trial.stimulus,
        slider_start: trial.slider_start,
        response: response.response
      };

      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trialdata);
    }

    if (trial.stimulus_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        display_element.querySelector('#jspsych-html-slider-response-stimulus').style.visibility = 'hidden';
      }, trial.stimulus_duration);
    }

    // end trial if trial_duration is set
    if (trial.trial_duration !== null) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

    var startTime = performance.now();
  };

  return plugin;
})();
