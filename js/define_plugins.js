// This file defines the game plugins to be used by timeline.js
// Plugins for the instructions are in 'instructions.js'

import {
    make_full_html_display, 
    make_feedback_prompt,
    response_slider_labels,
    make_response_prompt,
    slider_plugin_button_labels,
    set_slider_start_based_on_trial_type
} from "./display_functions.js";
import { num_of_draws } from "./timeline.js"
import { data_funs } from "./data_functions.js";


// Basic task and source attributes
// All trials
var empty_expert_array = Array(5).fill('empty') // defines empty array
var grey_expert_array =  Array(5).fill('grey'); // defines array of grey experts

// toggle full screen mode
var fullscreen_mode_game = true;

// Set up an empty dictionary to fill with the trials 
var plugins = {};

plugins.prolific_id = {
    type: 'survey-text',
    questions: [
        {
            prompt: "Before we begin, please input your <b>PROLIFIC ID</b> here.<br>This will be used to determine your bonus.",
        }
    ],
    on_finish: function() {
        let prolific_id = jsPsych.data.getLastTrialData().values()[0].response.Q0
        jsPsych.data.addProperties({prolific_id: prolific_id})
    }
  }
  

// Demographics ----------------------------------------------------------------
plugins.demographics = {
    type: 'survey-html-form',
    preamble: '<p>Before we begin with the instructions,<br>we kindly ask you to fill out the following information<br>about yourself.</b> </p>',
    html:
        '<p>Age: ' + 
        '<input type="number" id="age" name="age" required size="3" min="18" max="100"></p>' +
        
        '<p>Gender: <select name="gender" id="gender">' + 
        '<option value="">--Please choose an option--</option>' + 
        '<option value="female">Female</option>' +
        '<option value="male">Male</option>' +
        '<option value="other">Other</option>' +
        '<option value="prefer_not">Prefer not to say</option>' + 
        '</select></p>' +
                
        '<p>Highest level of education: <select name="education" id="education">' + 
        '<option value="">--Please choose an option--</option>' + 
        '<option value="NoHighSchool">No high school degreee</option>' +
        '<option value="HighSchool">High school degree</option>' +
        '<option value="SomeCollege">Some college</option>' +
        "<option value='Bachelor'>Bachelor's Degree</option>" + 
        "<option value='Master'>Master's Degree</option>" + 
        "<option value='PhD'>PhD</option>" + 
        '</select></p>',
    on_finish: function(){
        data_funs.save_data(
            jsPsych.data.getLastTrialData().values()[0].filename_for_csv, 
            jsPsych.data.get().csv(),
            "intermediate")
    },
    data: {experiment_stage : "Demographics"}
};


// Practice trial plugins ------------------------------------------------------

var slider_width = 550;

plugins.next_policy = {
    type: 'html-keyboard-response',
    stimulus: '<p><img src="js/img/piggy-bank.png" alt="Kyberneum", width = "200"></p>' +
        '<p>Next Endorsement</p>',
    trial_duration: 400,
    choices: jsPsych.NO_KEYS,
    data: function(){return data_funs.save_standard_trial_data_from_timeline_var("next_source")}
};

plugins.new_source_notification = {
    type: 'html-button-response',
    stimulus: function(){
        let source = jsPsych.timelineVariable('source_type');
        let expert_look = jsPsych.timelineVariable('expert_look_indicator');
        let left_fund = window.source_fund_map[source].left;
        let right_fund = window.source_fund_map[source].right;
        return `
            <p><img src="js/img/neutral_expert_${expert_look}.png" width="130" alt="source"></p>
            <p><b>You are now seeing endorsements from a new financial advisor. </b></p>
            <p>This advisor endorses between: </p>
            <p>
                <span style="background-color:${left_fund.colour}; color: white; padding: 8px 16px; border-radius: 20px; margin: 5px;">${left_fund.name}
                </span>
                &nbsp; and &nbsp;
                <span style="background-color:${right_fund.colour}; color: white; padding: 8px 16px; border-radius: 20px; margin: 5px;">${right_fund.name}
                </span>
            </p>`
    },
    choices: ['Continue']
};

// slider practice original display uses regular 'initial_source'
plugins.practice_with_slider_feedback = { 
    type: 'custom-html-slider-response',
    source_type: function(){ return jsPsych.timelineVariable('source_type')},
    slider_start : function(){
        return jsPsych.data.getLastTrialData().values()[0].response},
    stimulus: function(){
        return make_full_html_display(
            jsPsych.timelineVariable('colours_indep'),
            jsPsych.timelineVariable('colours_news'),
            jsPsych.timelineVariable('expert_look_indicator'), // for expert_look_indicator,
            'initial',
            jsPsych.timelineVariable('experiment_stage'),
            jsPsych.timelineVariable('trial_type'),
            register_opinion_text[2],
            jsPsych.timelineVariable('news_station_first'),
            jsPsych.timelineVariable('with_independent_council'),
            jsPsych.timelineVariable('source_type'),
        );
    },
    labels: response_slider_labels,
    button_label: slider_plugin_button_labels.end,
    button_css_id: 'next_trial_btn',
    slider_width: slider_width,
    disable_slider: true,
    prompt: function() {
        let source = jsPsych.data.get().filter({plugin_type: 'practice_with_slider'}).last(1).values()[0]?.source_type || 'practice_source';
        return make_feedback_prompt(
            jsPsych.timelineVariable('correct_state'),
            jsPsych.data.getLastTrialData().values()[0].response,
            true, // <-- Feedback is always shown in the slider practice
            source
            )
    },
    data: function(){
        let d = data_funs.save_standard_trial_data_from_timeline_var("practice_with_slider");
        d.source_type = jsPsych.timelineVariable('source_type');
        return d;
    }
};


// Main experimental plugins ---------------------------------------------------

let register_opinion_text = [
    'Move the slider and register your <b>initial</b> opinion!',
    'Move the slider and register your <b>final</b> opinion!',
    'Thanks for registering your vote!'
]
for (let i = 0; i < register_opinion_text.length; i++) {
    register_opinion_text[i] =
        '<p id=register_opinion_text>' + register_opinion_text[i] + '<p>'
}

plugins.intitial_source = {
    type: 'custom-html-slider-response',
    source_type: function(){  return jsPsych.timelineVariable('source_type')},
    stimulus: function(){
        // console.log("with_independent_council:", jsPsych.timelineVariable('with_independent_council'));
        //console.log("experiment_stage:", jsPsych.timelineVariable('experiment_stage'));
        //console.log("source_type:", jsPsych.timelineVariable('source_type'));

        let expert_look = jsPsych.timelineVariable('expert_look_indicator');
        
        //console.log("expert_look:", expert_look);

        //let expert_look = jsPsych.timelineVariable('experiment_stage') == 'practice'?
        //   "0" : jsPsych.timelineVariable('expert_look_indicator'
               
        return make_full_html_display(
            jsPsych.timelineVariable('colours_indep'),
            jsPsych.timelineVariable('colours_news'),
            expert_look, // for expert_look_indicator
            'initial', // to hide bottom council 
            jsPsych.timelineVariable('experiment_stage'),
            jsPsych.timelineVariable('trial_type'), // trial type
            register_opinion_text[0],
            jsPsych.timelineVariable('news_station_first'),
            jsPsych.timelineVariable('with_independent_council'),
            jsPsych.timelineVariable('source_type')
        );
    },
    labels: response_slider_labels,
    prompt: function() {
        return make_response_prompt(jsPsych.timelineVariable('feedback_condition'))
    },
    button_label: function(){
        let label = slider_plugin_button_labels.initial;
        if (jsPsych.timelineVariable('experiment_stage') == 'practice') {
            label = slider_plugin_button_labels.practice;
        } else if (!jsPsych.timelineVariable('with_independent_council')){
            label = slider_plugin_button_labels.news_station_only
        }
        return label;
    },
    button_css_id: 'initial_opinion_btn',
    require_movement: true,
    slider_width: slider_width,
    data: function(){return data_funs.save_standard_trial_data_from_timeline_var('initial_source')},
    on_finish: function(data){
        data = data_funs.compute_and_update_quadratic_score(data);
        window.last_initial_response = data.response;
    },
    
};


plugins.full_source = {
    type: 'custom-html-slider-response',
    source_type: function(){  return jsPsych.timelineVariable('source_type')},
    slider_start : function(){
        return set_slider_start_based_on_trial_type(
            jsPsych.timelineVariable('trial_type')
        );
    },
    stimulus: function(){
        return make_full_html_display(
            jsPsych.timelineVariable('colours_indep'),
            jsPsych.timelineVariable('colours_news'),
            jsPsych.timelineVariable('expert_look_indicator'),
            'final',
            'main',
            jsPsych.timelineVariable('trial_type'),
            register_opinion_text[1],
            jsPsych.timelineVariable('news_station_first'),
            jsPsych.timelineVariable('with_independent_council'),
            jsPsych.timelineVariable('source_type')
        );
    },
    labels: response_slider_labels,
    prompt: function() {
        return make_response_prompt(jsPsych.timelineVariable('feedback_condition'))
    },
    button_label: slider_plugin_button_labels.final,
    button_css_id: 'final_opinion_btn',
    require_movement: true,
    slider_width: slider_width,
    data: function(){
        let d = data_funs.save_standard_trial_data_from_timeline_var("full_source");
        d.source_type = jsPsych.timelineVariable('source_type');
        return d;
    },
    on_finish: function(data){
        data = data_funs.compute_and_update_quadratic_score(data);
        
    }
}; 


plugins.feedback = {
    type: 'custom-html-slider-response',
    source_type: function(){  return jsPsych.timelineVariable('source_type')},
    slider_start : function(){
        return window.last_initial_response || 50;
    },
    stimulus: function(){
        return make_full_html_display(
            jsPsych.timelineVariable('colours_indep'),
            jsPsych.timelineVariable('colours_news'),
            jsPsych.timelineVariable('expert_look_indicator'),
            'final',
            'main',
            jsPsych.timelineVariable('trial_type'),
            register_opinion_text[2],
            jsPsych.timelineVariable('news_station_first'),
            jsPsych.timelineVariable('with_independent_council'),
            jsPsych.timelineVariable('source_type')
        );
    },
    labels: response_slider_labels,
    button_label: slider_plugin_button_labels.end,
    slider_width: slider_width,
    disable_slider: true,
    button_css_id: 'next_trial_btn',
    prompt: function() {
        let response = window.last_initial_response || 50;
        return make_feedback_prompt(
            jsPsych.timelineVariable('correct_state'),
            response,
            jsPsych.timelineVariable('feedback_condition'),
            jsPsych.timelineVariable('source_type')
        );
    },
    data: function(){
        let d = data_funs.save_standard_trial_data_from_timeline_var("feedback");
        d.source_type = jsPsych.timelineVariable('source_type');
        return d;
    },
};


plugins.get_block_intros = function(expert_look_indicator, num_of_blocks){

    let array_of_block_intros = [];

    for (let block = 0; block < expert_look_indicator.length; block++) {

        // Build the advisor display for all 4 sources 
        let advisor_display = '<div style="display: inline-flex; flex-direction: row; justify-content: center; gap: 20px; flex-wrap: wrap;">';
        let source_order = ['source_low_1', 'source_low_2', 'source_high_1', 'source_high_2'];

        source_order.forEach((source, idx) => {
            let look = expert_look_indicator[idx];
            let left_fund = window.source_fund_map[source].left;
            let right_fund = window.source_fund_map[source].right;
            advisor_display += `
                <div style="text-align: center; margin: 10px;">
                    <img src="js/img/neutral_expert_${look}.png" width="100" alt="advisor"><br>
                    <span style="background-color:${left_fund.colour}; color: white; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 14px;">${left_fund.name}</span>
                    &nbsp; vs&nbsp;
                    <span style="background-color:${right_fund.colour}; color: white; padding: 4px 10px; border-radius: 12px; font-weight: bold; font-size: 14px;">${right_fund.name}</span>
                </div>`
        });
        advisor_display += '</div>';
        array_of_block_intros [block] = {
            type: 'fullscreen',
            message: 
            '<p><img src="js/img/piggy-bank.png" alt="Kyberneum", width = "300"></p>' +  
            '<p><b>Welcome to block ' + (block+1) + ' out of ' + num_of_blocks + '!</b></p>' +
            '</p>In this block, you will see endorsements from the following financial advisors:</p>' + 
            advisor_display +
            '<p>Click "Start Block" to begin.<p>' +
            '<p>Note that this will re-enter fullscreen mode if you have left it.<p>',
            button_label: "Start Block",
            fullscreen_mode: fullscreen_mode_game,
            on_finish: function(){
                data_funs.save_data(
                    jsPsych.data.getLastTrialData().values()[0].filename_for_csv, 
                    jsPsych.data.get().csv(),
                    "intermediate")
            }
        }
    }
    return array_of_block_intros;
}


// Notification plug-ins
plugins.only_source_notification = {
    type: 'html-button-response',
    stimulus: function(){

        console.log(jsPsych.timelineVariable('with_independent_council'))

        let stimulus = 
            '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "600"></p>' +    
            '<p>You will now start the final trials of this block.<p>'

        let ic_blurred_out = '<p>In those, the Independent Council will be blurred out.</p>'
        
        let news_station_remains = 
            '<p>The news station remains the same with which you just interacted<br>' +
            'so try to use what you have just learned about it.</p>'

        let no_feedback_reminder = 
            '<p>Remember that you will <i>not</i> receive feedback in these few trials.</p>'

        if (jsPsych.timelineVariable('with_independent_council')){
            stimulus += ic_blurred_out         
        }

        stimulus += news_station_remains

        if (!jsPsych.timelineVariable('with_independent_council')){
            stimulus += no_feedback_reminder
        }

        stimulus += '<p>Click below to begin these trials.</p>'      

        return stimulus;
    },
    choices: ['Next']
};

plugins.questionnaire_start = {
    type: 'html-button-response',
    stimulus: 
        '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "600"></p>' +    
        '<p><b>Thanks for finishing this block!</b><br>' +
        "We will now ask you a few questions about the news station source<br>" + 
        "you just played with.</p>",
    choices: ['Next']
};

plugins.block_over_notification  = {
    type: 'html-button-response',
    stimulus: '<p><img src="js/img/piggy-bank.png" width="200"></p>' +   
        '<p><b>You have now finished this block!</b><p>',
    choices: ['Next']
};

plugins.game_over_notification = {
    type: 'html-button-response',
    stimulus: '<p><img src="js/img/piggy-bank.png" width="200"></p>' +   
        '<p><b>Congratulations, you have finished all 4 blocks!</b></p>' +
        '<p>You will now answer a few short questions before completing the study.</p>',
    choices: ['Next'],
    on_finish: function(){
        data_funs.save_data(
            jsPsych.data.getLastTrialData().values()[0].filename_for_csv, 
            jsPsych.data.get().csv(),
            "intermediate")
    }
};



// Questionnaire plug-ins ------------------------------------------------------

let likert_scale = [
    "Strongly<br>Disagree", 
    "Disagree", 
    "Neutral", 
    "Agree", 
    "Strongly<br>Agree"
];

function questionnaire_prompt(question_string, expert_look_indicator) {
    
    let prompt = 
        '<p><img src="js/img/neutral_expert_' + expert_look_indicator +
        '.png" alt="Kyberneum" width = "130" ></p>' +
        '<p><b>' + question_string +'<b></p>'

    return prompt;
};

plugins.trust_question = {
    type: 'html-slider-response',
    stimulus: function(){
        return questionnaire_prompt(
            "I trust this news station.",
            jsPsych.timelineVariable('expert_look_indicator')
        )
    },
    labels: likert_scale,
    slider_width: 500,
    require_movement: true,
    prompt: "<p>Select your response to continue.</p>",
    data: {
        source_type: jsPsych.timelineVariable('source_type'),
        block_stage: 'questionnaires',
        question: 'trust'
    }
};

plugins.improve_question = {
    type: 'html-slider-response',
    stimulus: function(){
        return questionnaire_prompt(
            "This news station improves my decisions.",
            jsPsych.timelineVariable('expert_look_indicator')
        )
    },
    labels: likert_scale, 
    slider_width: 500,
    require_movement: true,
    prompt: "<p>Select your response to continue.</p>",
    data: {
        source_type: jsPsych.timelineVariable('source_type'),
        block_stage: 'questionnaires',
        question: 'improve'
    }
};


// End of experiment -----------------------------------------------------------
plugins.post_experiment_survey = {
    type: 'survey-text',
    questions: [
        {prompt: "How did you approach the game?<br>For example, did you use any strategies?",
            rows: 5, columns: 70,
            name: 'strategy'
        },
        {prompt: "Did you experience any technical difficulties during this task?<br>If so, please describe your problem.",
            rows: 5, columns: 70,
            name: 'technical_difficulties'
        },
        {prompt: 'How much attention did you pay throughout the task?<br>' + 
        'Do you think you gave your best on this task?<br>' + 
            'Disclaimer: Your answer here will <i>not</i> have an impact your bonus.<br>',
            rows: 5, columns: 70,
            name: 'attention'
        },
        {prompt: 'Is there anything else you would like to let us know?',
            rows: 5, columns: 70,
            name: 'anything_else'
        }
    ],
    data: {
        experiment_stage: "debrief_questions"
    }
};


plugins.score_page = {
    type: 'html-button-response',
    stimulus: function(data){
        let final_pay_off = data_funs.get_pay_off(data, jsPsych.timelineVariable('with_independent_council'));
        let prompt = 
            '<p><img src="js/img/piggy-bank.png" width="200"></p>' +
            '<p>Congratulations, you have now finished this experiment.</p>' +
            '<p>Your performance translates to a <b>bonus of $' +
            final_pay_off.bonus.toFixed(2) + 
            '</b> which you will receive on Prolific.</p>' +
            '<p>Click next below to read a debrief and receive your completion code';
        return prompt;
    },
    choices: ['Next'],
    on_finish: function(){
        data_funs.save_data(
            jsPsych.data.getLastTrialData().values()[0].filename_for_csv, 
            jsPsych.data.get().csv(),
            "final")
    }
}


let epistemic_trust_questions = [
    "I usually ask people for advice when I have a personal problem.",
    "I find information easier to trust and absorb<br>when it comes from someone who knows me well.",
    "I’d prefer to find things out for myself on<br>the internet rather than asking people for information.",
    "I often feel that people do not understand what I want and need.",
    "I am often considered naïve because I believe almost anything that people tell me.",
    "When I speak to different people, I find myself easily<br>persuaded by what they say even if this is different from what I believed before.",
    "Sometimes, having a conversation with people who have<br>known me for a long time helps me develop new perspectives about myself.",
    "I find it very useful to learn from what people tell me about their experiences.",
    "If you put too much faith in what people tell you, you are likely to get hurt.",
    "To acknolwedge that you have read this question,<br>please choose neutral as the response here.",
    "When someone tells me something, my immediate<br>reaction is to wonder why they are telling me this.",
    "I have too often taken advice from the wrong people.",
    "People have told me that I am too easily influenced by others",
    "If I don’t know what to do, my first instinct<br>is to ask someone whose opinion I value.",
    "I don’t usually act on advice that I get from<br>others even when I think it’s probably sound.",
    "In the past, I have misjudged who to believe and been taken advantage of."
]

let epistemic_trust_labels = [
    'Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neutral', 'Somewhat Agree', 'Agree', 'Strongly<br>Agree'
]

let epistemic_trust_questions_array = []

for (let i = 0; i < epistemic_trust_questions.length; i++) {
    epistemic_trust_questions_array.push(
        {
            prompt: epistemic_trust_questions[i],
            labels: epistemic_trust_labels,
            name: i + 1,
            required: true
        }
    )    
}


plugins.epistemic_trust_questionnaire_split = []
let split_epistemic_trust_into_x_pages = 4
let epistemic_trust_qs_per_q = epistemic_trust_questions.length / split_epistemic_trust_into_x_pages

for (let i = 0; i< epistemic_trust_questions_array.length; i += epistemic_trust_qs_per_q) {
    let question_page = epistemic_trust_questions_array.slice(i, i + epistemic_trust_qs_per_q);
    let preamble = i == 0 ? "<p>Please fill out the following questions.</p>" :
        "<p>Please continue filling out the following questions.</p>"
    plugins.epistemic_trust_questionnaire_split.push(
        {
            type: 'survey-likert',
            preamble: preamble,
            questions: question_page,
            scale_width : 500,
            data: {experiment_stage : "EpistemicTrust"},
        }
    )
}

// Add saving on last item of epistemic trust questionnaire
plugins.epistemic_trust_questionnaire_split[plugins.epistemic_trust_questionnaire_split.length - 1].on_finish = function(){
    data_funs.save_data(
        jsPsych.data.getLastTrialData().values()[0].filename_for_csv, 
        jsPsych.data.get().csv(),
        "intermediate")
}


plugins.world_value_survey = {
    type: 'html-slider-response',
    stimulus: "<p>Please answer the following question by placing your opinion on the slider below</p>" +
        '<p><i>"Generally speaking, would you say that most people can be trusted<br>or that you need to be very careful in dealing with people?"</i></p>',
    labels: ['<i style="color:LightGray;">Most people can be trusted</i>', '<i style="color:LightGray;">Need to be very careful</i>'],
    slider_width: 500,
    require_movement: true,
    prompt: "<p>Select your response to continue.</p>",
    data: {experiment_stage : "WorldValues"}
};


let news_station_likert_frequency = ["Never", "1 - 2 days", "3 - 4 days", "5 - 7 days"];

let news_types_for_frequency = [
    "Cable television news (e.g. CNN, Fox News, MSNBC)",
    "National network TV news (e.g. ABC, CBS, NBC)",
    "Local television news",
    "Social media (e.g. Facebook, Twitter, TikTok, Reddit)",
    "Podcasts",
    "Blogs",
    "Public radio (e.g. NPR)",
    "Talk radio",
    "News websites or apps",
    "Print newspapers"
];

let news_types_for_frequency_name = [
    "Cable",
    "NatTV",
    "LocalTV",
    "Socialmedia",
    "Podcasts",
    "Blogs",
    "PublicRadio",
    "TalkRadio",
    "NewsSitesApps",
    "PrintNewspapers"
];

let news_type_frequency_q_array = [];

let news_type_frequency_preamble = 
    "<p>Please continue answering the following questions.</p>" +
    "<p><b>How often did you use the following types of sources to get news in the past week?</b></p>"
    

for (let i = 0; i < news_types_for_frequency.length; i++) {
    news_type_frequency_q_array.push(
        {
            prompt: news_types_for_frequency[i],
            labels: news_station_likert_frequency,
            name: news_types_for_frequency_name[i],
            required: true
        }
    )    
}


plugins.news_source_frequency_questionnaire = {
    type: 'survey-likert',
    preamble: news_type_frequency_preamble,
    questions: news_type_frequency_q_array,
    scale_width : 500,
    data: {experiment_stage : "NewsFrequency"},
}


let news_type_preamble = "<p>Please continue answering the following questions.</p>"

let news_type_sources = [
    "ABC News",
    "Breitbart",
    "CBS News",
    "CNN",
    "Fox News",
    "MSNBC",
    "NBC News",
    "New York Times",
    "NPR",
    "Wall Street Journal",
    "Washington Post",
    "USA Today",
    "Other (enter on next page)"
]

let social_media_sources = [
    "Facebook",
    "Instagram",
    "Twitter",
    "WhatsApp",
    "Snapchat",
    "TikTok",
    "YouTube",
    "Reddit",
    "LinkedIn",
    "Other (enter on next page)"
]

plugins.news_sources_select = {
    type: 'survey-multi-select',
    preamble: news_type_preamble,
    questions: [
        {
            prompt: "<b>Which of the following media outlets (if any) do you<br> follow to get news?</b> Please select all that apply.",
            options: news_type_sources,
            horizontal: false,
            name: "Media"
        },
        {
            prompt: "<b>Which type of social media (if any) do you use<br>to get news?</b> Please select all that apply.",
            options: social_media_sources,
            horizontal: false,
            name: "SocialMedia"
        }
    ],
    data: {experiment_stage : "Sources"}
}


plugins.other_news_source = {
    type: 'survey-text',
    preamble: '<p><b>If you selected "other" on the previous page,<br>please fill in some more information here.</b></p>',
    questions: [
        {
            prompt: 'Enter any media outlets not previously mentioned:',
            placeholder: "e.g. Los Angeles Times, New York Post, BBC",
            name: "OtherMedia",
            rows: 3,
            columns: 50
        },
        {
            prompt: 'Enter any social media platforms not previously mentioned:',
            placeholder: "e.g. Truth Social, Medium, WeChat",
            name: "OtherSocialMedia",
            rows: 3,
            columns: 50
        }
    ],
    data: {experiment_stage : "SourcesOther"}
}

let source_trust_likert_answers = ["None at all", "A little", "A moderate amount", "A lot", "A great deal"]
let source_trust_sources = ["The press (e.g. news apps, newspapers)", "Television", "Social media"]
let source_trust_sources_names = ["Press", "Television", "SocialMedia"]
let source_trust_question_array = []

for (let i = 0; i < source_trust_sources.length; i++) {
    source_trust_question_array.push(
        {
            prompt: source_trust_sources[i],
            labels: source_trust_likert_answers,
            name: source_trust_sources_names[i],
            required: true
        }
    )    
}


plugins.news_trust_questionnaire = {
    type: 'survey-likert',
    preamble: 'To what extent to you trust the information that comes from the following',
    questions: source_trust_question_array,
    scale_width : 500,
    data: {experiment_stage : "NewsTrust"},
}




// Export all ------------------------------------------------------------------
export {plugins};