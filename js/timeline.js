/* 
File that contains the main timeline for the experiment
and runs the file in jspsych

This file calls higher-level functions that get the individual 
trial order and attributes ("set_up_function.js") and adds them to 
timeline variables. The plug-ins in the timeline variables are defined 
in the "define_plugins.js" as one objects (i.e. call plugins with 
plugins.[plugin of choice])
*/

// Load functions --------------------------------------------------------------
import {set_up} from "./set_up_functions.js";
import {plugins} from "./define_plugins.js";
import {create_instructions_object} from "./instructions.js";
import {data_funs} from "./data_functions.js";
import {array_of_pngs_to_load} from "./display_functions.js";

// Participant ID
var completion_code = jsPsych.randomization.randomID(8);
const subject_id = jsPsych.randomization.randomID(10);
const filename = `${subject_id}.csv`;
var prolific_completion_code = "C1FPSUBD - TEST"

// Order of task
var news_station_first = jsPsych.data.getURLVariable('news_station_first');

// adressed as string '0' or '1' (yes or no)
if(news_station_first == undefined){ // if not addressed in the url
    news_station_first = true;
    console.log("No news_station_first defined - place at beginning")
} else {
    news_station_first = Boolean(Number(news_station_first));
}
// console.log(news_station_first);

// Task type (that is with or without independent council)
var with_independent_council = false;
var explain_news_station_before_independent_council = true

if (with_independent_council == true) { 
    // When there is an independent council, we can randomize the feedback cond
    var feedback_condition = false // jsPsych.randomization.sampleWithoutReplacement([true, false], 1)[0];
   
} else {
    // In the pure news station first condition, we always have feedback 
    // and place the news station "first"
    var feedback_condition = true
    news_station_first = true;
}

// Game settings for prototyping:
var skip_consent = true
var skip_demographics = true
var skip_practice = true// enables jumping to the main block
var do_station_only_trials = false
var do_post_block_questionnaires = false
var include_epistemic_trust_questionnaire = false;

// Basic task and source attributes --------------------------------------------

var num_of_draws = 4; // number of draws per source
var trials_per_source =  8; // number of times participants see each source in one block (i.e. 8 trials with 4 draws each = 32 total draws per source per block)
var num_of_trials_per_block = trials_per_source * 4; // 4 sources per block
var initial_source_attributes = {b_I: 0.75, g_I: 0.75};
var source_attributes_block1 = {
    source_low_1: {b_F : 0.3, g_F : 0.3},
    source_low_2: {b_F : 0.3, g_F : 0.3},
    source_high_1: {b_F : 0.8, g_F : 0.8},
    source_high_2: {b_F : 0.8, g_F : 0.8} // note that the "high" and "low" sources are not actually different in their attributes, but we label them as such for the instructions and to make it easier to follow when creating the timeline variables
};
var source_attributes_block2 = {
    source_low_1: {b_F : 0.8, g_F : 0.8},
    source_low_2: {b_F : 0.3, g_F : 0.3},
    source_high_1: {b_F : 0.3, g_F : 0.3},
    source_high_2: {b_F : 0.8, g_F : 0.8}
};
var source_types = Object.keys(source_attributes_block1);
var num_of_blocks = 4;
var possible_states = ['green', 'blue'];
var expert_look_indicator = jsPsych.randomization.shuffle(
    [1, 2, 3, 4] // to grab the .png's
); 
var source_look_map = {
    source_low_1: expert_look_indicator[0],
    source_low_2: expert_look_indicator[1],
    source_high_1: expert_look_indicator[2],
    source_high_2: expert_look_indicator[3]
};
let expert_look_for_practice = '5'


// Create instructions
var instructions = create_instructions_object(
    feedback_condition, 
    prolific_completion_code,
    num_of_blocks,
    news_station_first,
    with_independent_council,
    explain_news_station_before_independent_council
    );

// Sample states and sources
var games = []
for (let block =  0; block < num_of_blocks; block++) {
    let current_source_attributes = (block < 2) ? source_attributes_block1 : source_attributes_block2; // switch source attributes after 2 blocks
    let game = set_up.get_game(
    possible_states,
    1,
    num_of_trials_per_block,
    num_of_draws,
    initial_source_attributes,
    source_types,
    current_source_attributes
);
    games.push(game);
}

// instructions.print_experimenter_info(feedback_condition, game)


// GET THE TIMELINE VARIABLES --------------------------------------------------

// Practice --------------------

// With slider
var num_blue_practice_slider = [3, 1, 2, 4];
var correct_colour_practice_slider = [
    'blue', 'green', 'green', 'blue'
];
var initial_practice_with_news_station = explain_news_station_before_independent_council || !with_independent_council
var practice_with_slider_timeline_variable = set_up.create_practice_timeline(
    num_of_draws,
    num_blue_practice_slider,
    correct_colour_practice_slider,
    initial_practice_with_news_station
);

// With sources
var num_blue_indep_practice_source = [4, 2];
var num_blue_news_practice_source = [4, 3];
var correct_colour_practice_source = ['blue', 'green', 'green']

var practice_with_source_timeline_variable = set_up.create_timeline_variable(
    ["practice_source"], // saves practice source
    1, // only one block of practice 
    num_blue_indep_practice_source.length,
    num_of_draws,
    [num_blue_indep_practice_source], // need to be in [] because only one block
    [num_blue_news_practice_source],
    [correct_colour_practice_source],
    expert_look_for_practice,
    feedback_condition,
    'station_practice',
    news_station_first,
    with_independent_council
) 


// Main experiment 
var all_block_timeline_variables = [];
for (let block = 0; block < num_of_blocks; block++) {
    let current_source_attributes = (block < 2) ? source_attributes_block1 : source_attributes_block2; 
    let block_trials = [];

    games[block].shuffled_source_order.forEach((source,source_idx) => {
        for (let trial = 0; trial < trials_per_source; trial++) {
            let trial_idx = source_idx * trials_per_source + trial; // to grab the right trial attributes from the game object
            block_trials.push({
                num_blue_indep: games[block].num_blue_indep_array[0][trial_idx],
                num_blue_news: games[block].num_blue_news_array[0][trial_idx],
                source_type: source,
                colours_indep: set_up.get_shuffled_source_order(num_of_draws, games[block].num_blue_indep_array[0][trial_idx]),
                colours_news: set_up.get_shuffled_source_order(num_of_draws, games[block].num_blue_news_array[0][trial_idx]),
                correct_state: games[block].correct_colour_array[0][trial_idx],
                expert_look_indicator: source_look_map[source],
                experiment_stage: 'main',
                experiment_phase: 'main',
                trial_type: 'normal',
                feedback_condition: feedback_condition,
                block_number: block + 1, 
                trial_number_within_block: trial_idx + 1,
                trial_number: block * num_of_trials_per_block + trial_idx + 1,
                news_station_first: news_station_first,
                with_independent_council: with_independent_council
            });
    
        }
        
    });

    //Shuffle trials across all sources within a block
    all_block_timeline_variables.push(
        jsPsych.randomization.shuffle(block_trials)
    );
}
//window.all_block_timeline_variables = all_block_timeline_variables;
//window.all_block_timeline_variables[0].map(t => t.source_type);
// BUILD THE TIMELINE ----------------------------------------------------------

// Practice with sliders
var practice_with_slider_timeline = {
    timeline: [
        plugins.next_policy,
        plugins.intitial_source,
        plugins.practice_with_slider_feedback
    ],
    timeline_variables: practice_with_slider_timeline_variable,
    data: {
        experiment_phase: 'practice_with_slider'
    }   
};


// Practice with sources
var practice_with_sources_timeline = {
    timeline: [
        plugins.next_policy,
        plugins.intitial_source,
        plugins.full_source,
        plugins.feedback
    ],
    timeline_variables: practice_with_source_timeline_variable,
    data: {
        experiment_phase: 'practice_with_source'
    }   
}

// Main experiment block
var main_exp_timeline = [];

plugins.block_intro_arrays = plugins.get_block_intros(expert_look_indicator, num_of_blocks);

for (let block = 0; block < num_of_blocks; block++) {
    
    // timeline variable based procedure that reps within one block
    let within_block_main_trialorder =  [
        plugins.next_policy,
        plugins.intitial_source, 
    ]
    if (with_independent_council){within_block_main_trialorder.push(plugins.full_source)}
    within_block_main_trialorder.push(plugins.feedback)
    
    let within_block_timeline = {
        timeline: within_block_main_trialorder,
        timeline_variables: all_block_timeline_variables[block],
        data: {
            experiment_phase: 'main',
        },
        sample: {
            type: 'fixed-repetitions',
            size: 1
        }
    };
    
    let news_source_only_timeline_variable = 
        set_up.create_station_only_timeline_variable(
            games[block].shuffled_source_order[0],
            num_of_draws,
            expert_look_indicator[block],
            (block + 1), // b/c 0-base
            num_of_trials_per_block,
            news_station_first,
            with_independent_council
        );

    let within_block_station_only_timeline = {
        timeline:  [plugins.next_policy, plugins.intitial_source,plugins.feedback], 
        timeline_variables: news_source_only_timeline_variable,
    };

    let questionnaire_timeline = {
        timeline: [
            plugins.trust_question,
            plugins.improve_question 
        ],
        timeline_variables: [
            {
                expert_look_indicator: expert_look_indicator[block],
                source_type: games[block].shuffled_source_order[0]
            }
        ],
    }

    // Join the actual timeline variable
    let one_block_timeline = [
        plugins.block_intro_arrays[block],
        within_block_timeline
    ]
    

    if (do_station_only_trials) {
        let source_only_notification_timeline = {
            timeline: [plugins.only_source_notification],
            timeline_variables: [{with_independent_council: with_independent_council}]
        }  
        one_block_timeline.push(source_only_notification_timeline)
        one_block_timeline = one_block_timeline.concat(within_block_station_only_timeline)
    }
// Probe trials after each block 
let probe_trials = [];
let shuffled_probe_sources = jsPsych.randomization.shuffle([...source_types]);
shuffled_probe_sources.forEach(source_type => {
    for (let k = 0; k <= 4; k++) {
        let colours = set_up.get_shuffled_source_order(num_of_draws, k);
        probe_trials.push({
            source_type: source_type,
            num_blue: k,
            num_green: 4 - k,
            num_blue_indep: k,
            num_blue_news: k,
            colours_indep: Array(num_of_draws).fill('grey'),
            colours_news: colours,
            correct_state: 'blue', // doesn't matter for probe trial, but needs to be filled for the display function
            expert_look_indicator: source_look_map[source_type],
            experiment_stage: 'main',
            experiment_phase: 'probe',
            trial_type: 'normal',
            feedback_condition: false,
            block_number: block + 1,
            trial_number_within_block: 0,
            trial_number: 0,
            news_station_first: news_station_first,
            with_independent_council: with_independent_council,
            probe_phase: (block < 2) ?  "pre" : "post" 
        });
    }
    
});

let probe_timeline = {
    timeline: [
        plugins.next_policy,
        plugins.intitial_source, 
    ],
    
    timeline_variables: probe_trials
};


let break_before_probe = {
    type: 'html-button-response',
    stimulus: '<p><img src = "js/img/kyberneum.png" alt = "Kyberneum", width = "600"></p>' +'<p><b>Well done, you have finished this block!</b></p>' + '<p>You can take a short break before continuing.</p>' + '<p>When you are ready, click below to continue.</p>',
    choices: ['Continue'],
};
one_block_timeline.push(break_before_probe);
one_block_timeline.push(probe_timeline);


    if (do_post_block_questionnaires) {
        one_block_timeline.push(plugins.questionnaire_start)
        one_block_timeline = one_block_timeline.concat(questionnaire_timeline)
    }
    
    if (block < (num_of_blocks - 1)) { // only add block over until last block
        one_block_timeline.push(plugins.block_over_notification)
    }

    main_exp_timeline = main_exp_timeline.concat(one_block_timeline)
};


// Full timeline ---------------------------------------------------------------
plugins.preload = {
    type: 'preload',
    auto_preload: true, // automatically load all files based on the main timeline
    images: array_of_pngs_to_load,
    data: {game_attributes: {initial_source_attributes, source_attributes_block1, source_attributes_block2}}
};



var timeline = [plugins.preload]

// Create the practice and instructions timeline based on the conditions
var consent_timeline_array = [
    instructions.consent,
    instructions.consent_questions,
    instructions.show_if_no_consent,
    instructions.data_questions,
    instructions.show_if_no_data_consent,
]

var demographics_and_info_array = [
    plugins.prolific_id,
    instructions.fullscreen,
    plugins.demographics,
]

var practice_timeline_array = [
    instructions.new_task_instructions,
    practice_with_slider_timeline,
    instructions.main_study_start
]
if(!skip_demographics) practice_timeline_array = demographics_and_info_array.concat(practice_timeline_array)
if(!skip_consent) practice_timeline_array = consent_timeline_array.concat(practice_timeline_array)

if(!skip_practice) {
    for (let i = 0; i < practice_timeline_array.length; i++) {
        timeline.push(practice_timeline_array[i])
    }
}

    
// add main experiment block
timeline = timeline.concat(main_exp_timeline)
timeline.push(plugins.game_over_notification)

// add questionnaires
timeline.push(plugins.world_value_survey)

if (include_epistemic_trust_questionnaire) {
    for (let i = 0; i < plugins.epistemic_trust_questionnaire_split.length; i++) { 
        timeline.push(plugins.epistemic_trust_questionnaire_split[i])
    }
}

timeline.push(plugins.news_source_frequency_questionnaire)
timeline.push(plugins.news_sources_select)
timeline.push(plugins.other_news_source)
timeline.push(plugins.news_trust_questionnaire)


// add post experiment questionnaire
timeline.push(plugins.post_experiment_survey)
let score_page_timeline_var = {with_independent_council: with_independent_council}
let score_page_timeline = {
    timeline: [plugins.score_page],
    timeline_variables: [score_page_timeline_var],
};
timeline = timeline.concat(score_page_timeline)
timeline.push(instructions.after_game)
timeline.push(instructions.final_screen_with_completion_code)
const save_data = {
    type: jsPsychPipe,
    action: "save",
    experiment_id: "FodkH67ndum4",
    filename: filename,
    data_string: ()=>jsPsych.data.get().csv()
};
timeline.push(save_data);



// Running and datasaving ------------------------------------------------------


// Data arguments
let start_time_and_date = data_funs.get_date_string();
let filename_for_csv = data_funs.get_csv_filename(completion_code, start_time_and_date);
let worker_id = jsPsych.data.getURLVariable('PROLIFIC_PID');
let assignment_id = jsPsych.data.getURLVariable('STUDY_ID');
let hit_id = jsPsych.data.getURLVariable('SESSION_ID');
data_funs.add_all_properties(
    completion_code,
    feedback_condition,
    start_time_and_date,
    filename_for_csv,
    worker_id,
    assignment_id,
    hit_id,
    news_station_first,
    with_independent_council
);

if (typeof jatos !== 'undefined') {
    jatos.onLoad(function() {
        jsPsych.init({
            timeline: timeline,
            on_finish: function() {
                jatos.endStudy(jsPsych.data.get().csv());
            }
        });
    });
} else {
    // Running locally without JATOS 
    jsPsych.init({
        timeline: timeline
    });
}


export {num_of_draws, feedback_condition};