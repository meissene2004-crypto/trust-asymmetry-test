// File with functions and variables that help with the display of the task

// List of images that are preloaded by the loading plugin
let array_of_pngs_to_load = [
    'instruct_button_practice',
    'instruct_expert_distribution_threequarters',
    'instruct_news_distribution',
    'instruct_slider_practice',
    'instruct_source_display',
    'instruct_source_intro',
    'kyberneum',
    'kyberneum_blue',
    'kyberneum_colour',
    'kyberneum_green',
    'kyberneum_grey',
    'neutral_expert_1',
    'neutral_expert_2',
    'neutral_expert_3',
    'neutral_expert_4',
    'neutral_expert_5',
    'warning_left',
    'warning_right',
    'correct_left',
    'correct_right',
    'grey_piggybank',
    'funda_piggybank',
    'fundb_piggybank',
    'fundc_piggybank',
    'fundd_piggybank',
    'funde_piggybank',
    'fundf_piggybank',
    'fundg_piggybank',
    'fundh_piggybank',
    'fundx_piggybank',
    'fundy_piggybank'
]

var source_fund_map = {
    practice_source: {
        left: {fund: 'X', colour: '#8fa9aa', name: 'Fund X'},
        right: {fund: 'Y', colour: '#253232', name: 'Fund Y'}
    },
    source_low_1: {
        left: {fund: 'A', colour: '#E67E22', name: 'Fund A'},
        right: {fund: 'B', colour: '#9B59B6', name: 'Fund B'}
    },
    source_low_2: {
        left: {fund: 'C', colour: '#1A5276', name: 'Fund C'},
        right: {fund: 'D', colour: '#F1948A', name: 'Fund D'}
    },
    source_high_1: {
        left: {fund: 'E', colour: '#1E8449', name: 'Fund E'},
        right: {fund: 'F', colour: '#922B21', name: 'Fund F'}
    },
    source_high_2: {
        left: {fund: 'G', colour: '#F4D03F', name: 'Fund G'},
        right: {fund: 'H', colour: '#5DADE2', name: 'Fund H'}
    }
};
window.source_fund_map = source_fund_map; // make it globally available

for (let i = 0; i < array_of_pngs_to_load.length; i++) {
    array_of_pngs_to_load[i] =
        `js/img/${array_of_pngs_to_load[i]}.png`
}

// Helping variables for display
var response_slider_labels = [
    '100 %<br>confident Fund A',
    '75 %<br>',
    '50/50<br>',
    '75 %<br>',
    '100%<br>confident Fund B'
];
for (let i = 0; i < response_slider_labels.length; i++) {
    response_slider_labels[i] =
        '<p id=confidence_label>' + response_slider_labels[i] + '<p>'
}
var response_prompt = '';

var slider_plugin_button_labels = {
    practice: 'Register your confidence',
    news_station_only: 'Register your confidence',
    initial: 'Register your initial confidence',
    final: 'Register your final confidence',
    end: 'Next trial'
};

var slider_width = 60;


// Function that shows a message message for the catch-questions
// based on the participants answer and the old preamble
var catch_q_feedback = {
    correct: '<b><span style = "color:#4CAF50">Great, that was the correct answer.<br>' + 
        'You can now go on by clicking the "Continue" button below</span></b>' ,
    error: '<b><span style = "color:#f03a17">Unfortunately, you responded incorrectly.<br>' +
        'You will return to the beginning of this part of the instructions<br>' +
        'and can then try again.</span></b>'
};

function display_catch_question_feedback() {
    // console.log(jsPsych.data.getLastTrialData().values()[0].accuracy)
    let newpreamble = '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "600"></p>';
    if (jsPsych.data.getLastTrialData().values()[0].accuracy) {
        newpreamble += '<p>' + catch_q_feedback.correct + '</p>' 
    } else {
        newpreamble += '<p>' + catch_q_feedback.error + '</p>' 
    }
    return newpreamble;    
}

// Function for practice trials with feedback
function generate_practice_feeedback_html(was_correct) {
    let feedback_prompt = '<p>That was incorrect</p>';
    if (was_correct) {
        feedback_prompt = '<p>Correct - blue was the better policy!</p>';
    }
    return feedback_prompt;
}


// Function that takes array of colour names (e.g. ["blue", "green", ...])
// and builds a html string that shows the associated pngs
function make_source_img_html(colour_array, expert_look_indicator,source_type) {
    let html_string = '<div style="display: inline-flex; flex-direction: row; align-items: flex-end; justify-content: center;">';

    for (let i = 0; i < colour_array.length; i++) {
        let colour = colour_array[i];
        let bg_colour, letter;
        if (colour === 'blue' && source_type && source_fund_map[source_type]) { 
            bg_colour = source_fund_map[source_type].right.colour;
            letter = source_fund_map[source_type].right.fund;
        } else if (colour === 'green' && source_type && source_fund_map[source_type]) {
            bg_colour = source_fund_map[source_type].left.colour;
            letter = source_fund_map[source_type].left.fund;
        } else {
            bg_colour = '#BDC3C7';
            letter = '?';
        }
        let img_src = expert_look_indicator !== 0 ?
                `js/img/neutral_expert_${expert_look_indicator}.png` :
                `js/img/empty_0_expert.png`;
        
        html_string += 
            `<div style="position: relative; display: inline-block; margin: 5px;">
                <img src="${img_src}" width="90" alt="source">
                <span style="
                    position: absolute;
                    bottom: 50px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 85px;
                    height: 80px;
                    border-radius: 50%;
                    background-color: ${bg_colour};
                    color: white;
                    font-size: 22px;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                ">${letter}</span>
            </div>`;
    }
    html_string += '</div>';

    // console.log("html for imgs" + html_img_string);

    return html_string;
}


// Function that takes two arrays of colour names and makes a html string that
// will be used as the stimulus in the jspsych plugin
function make_full_html_display(
    colour_array_independent_council, 
    colour_array_news, 
    expert_look_indicator,
    trial_stage = 'final',
    experiment_stage = 'main',
    trial_type = 'normal',
    prompt_below,
    news_station_first,
    with_independent_council,
    source_type = null
    ) {

    // let news_station_first = false // HAS TO BE CORRECTED so that it is dynamic

    // Set display of the initial source
    let top_label_string = '<p class="council_header">';
    let bottom_label_string = '';

    let independent_council_string = 'Independent Council  '
    let news_station_string = source_type && source_fund_map[source_type] ?
        source_fund_map[source_type].left.name + ' vs ' + source_fund_map[source_type].right.name + ' ' :
        'Financial Advisory Council '
    
    top_label_string += news_station_first ? news_station_string : independent_council_string
    bottom_label_string += news_station_first ? independent_council_string : news_station_string

    // First, set up that is necessary for both practice and main blocks
    let full_html_display = ''; // initialize for the if statements below
    // The below conditional is for pretending that ic is news station in the only news practice
    let indep_council_expert_look = experiment_stage == 'practice' ? expert_look_indicator : 0 
    let independent_council_html = make_source_img_html(colour_array_independent_council, indep_council_expert_look, source_type)
    if (experiment_stage == 'main' || experiment_stage == 'station_practice') {
        
        var news_station_html = make_source_img_html(
            colour_array_news, 
            expert_look_indicator,
            source_type
            ) 
            //console.log("news_station_html:", news_station_html);
    }

    if (experiment_stage === 'practice' || !with_independent_council) {
        
        let string_for_single_source = with_independent_council ? 
            independent_council_string : news_station_string 
        let imgs_for_single_source = (experiment_stage === 'practice') ? 
            independent_council_html : news_station_html 
        full_html_display = '<p class="council_header">' + string_for_single_source +
            '</p>' + '<div>' + imgs_for_single_source + '</div>' ;
    
    } else {
    
        let top_source_html = news_station_first ? 
            news_station_html : independent_council_html;
        let bottom_source_html = ''
    
        if(trial_stage == 'initial'){
            bottom_source_html = make_source_img_html(Array(5).fill('grey'), 0)
        } else {
            bottom_source_html = news_station_first ? 
                independent_council_html : 
                news_station_html;
        }
      
        full_html_display = 
            top_label_string + top_source_html + 
            '<span style = "color:black" >___________________</span></p>' + 
            '<p class="council_header">'  + 
            bottom_label_string + bottom_source_html + 
            '<span style = "color:black" >___________________</span></p>';
    
        full_html_display += prompt_below;
        
    }
    return full_html_display; 
};

function make_response_prompt(feedback_condition) {

    let img_string = `<p><img src="js/img/grey_piggybank.png" alt="Piggybank", height = "125" ></p>`;

    return img_string;
};

// Function that creates the html string for the 'prompt' in the feedback plugin
// This is also adaptive to the feedback condition
function make_feedback_prompt(correct_colour_on_trial, slider_position, feedback_condition, source_type = null) {
    let piggybank_img = 'grey';
    let incorrect_notification_left = '';
    let incorrect_notification_right = '';

    if (feedback_condition === true){

        if (source_type && source_fund_map[source_type]) {
            let fund = correct_colour_on_trial === 'blue' ?
                source_fund_map[source_type].right.fund.toLowerCase() :
                source_fund_map[source_type].left.fund.toLowerCase();
            piggybank_img = 'fund' + fund;
        } else {
            piggybank_img = correct_colour_on_trial === 'blue' ? 'purple' : 'orange';
        }
        let incorrect_notification_left_when_incorrect = '<img src="js/img/warning_left.png" alt="warning" height = "125">';
        let incorrect_notification_right_when_incorrect =  '<img src="js/img/warning_right.png" alt="warning" height = "125">';
        let correct_notification_left_when_correct = '<img src="js/img/correct_left.png" alt="correct" height = "125">';
        let correct_notification_right_when_correct = '<img src="js/img/correct_right.png" alt="correct" height = "125">';

        if (correct_colour_on_trial === 'blue') {
            if (slider_position < 50) {
                incorrect_notification_left = incorrect_notification_left_when_incorrect;
                incorrect_notification_right = incorrect_notification_right_when_incorrect;
            } else if (slider_position > 50) {
                incorrect_notification_left = correct_notification_left_when_correct;
                incorrect_notification_right = correct_notification_right_when_correct;
            }
        } else if (correct_colour_on_trial === 'green'){
            if (slider_position > 50){
                incorrect_notification_left = incorrect_notification_left_when_incorrect;
                incorrect_notification_right = incorrect_notification_right_when_incorrect;
            } else if (slider_position < 50){
                incorrect_notification_left = correct_notification_left_when_correct;
                incorrect_notification_right = correct_notification_right_when_correct;
            }
        };
    };

    let feedback_prompt = 
        `<p>${incorrect_notification_left}<img src="js/img/${piggybank_img}_piggybank.png" alt="piggybank" height = "125">${incorrect_notification_right}</p>`;

    return feedback_prompt;
};

// Function that places the slider based on the the trial type
function set_slider_start_based_on_trial_type(trial_type){
    // in normal trials, slider start is defined by the answer based on
    // the independent council
    let slider_position = jsPsych.data.getLastTrialData().values()[0].response;

    return slider_position;
}

export {
    source_fund_map,
    array_of_pngs_to_load,
    display_catch_question_feedback,
    make_full_html_display, 
    make_response_prompt,
    make_feedback_prompt,
    make_source_img_html, 
    generate_practice_feeedback_html, 
    response_slider_labels,
    response_prompt,
    slider_plugin_button_labels,
    set_slider_start_based_on_trial_type,
    slider_width
}