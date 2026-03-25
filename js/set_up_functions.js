// File that contains functions that help in building the task

// All functions will be exported as methods to set_up class
let set_up = {};

// function that gets draws from a binomial distribution
// adapted from https://statisticsblog.com/probability-distributions/#installation
function rbinom(n, size, p){

    let to_return = []

    for(let i=0; i<n; i++) {
        let result = 0;
        for(let j=0; j<size; j++) {
            if(Math.random() < p) {
                result++
            }
        }
        to_return[i] = result;
    }

    if (n == 1) {
        to_return = to_return[0]
    }

    return to_return;
};


// Function that takes total number of draws and number of one category
// and returns a shuffled array of colours - used to create timeline variable
set_up.get_shuffled_source_order = function(num_total, num_blue) {
    let array_of_blues = Array(num_blue).fill("blue");
    let array_of_green = Array(num_total - num_blue).fill("green");
    let full_colour_array = array_of_blues.concat(array_of_green);
    let shuffled_colour_array = jsPsych.randomization.shuffle(full_colour_array);
    return shuffled_colour_array
}


// Function that creates the 'game:
// - randomizes source order
// - randomizes state order
// - draws actual samples for participant
set_up.get_game = function(
    possible_states,
    num_of_blocks,
    num_of_trials_per_block,
    num_of_draws,
    initial_source_attributes,
    source_types,
    source_attributes
    ) {
    
    // Randomize source order
    let shuffled_source_order = jsPsych.randomization.shuffle(source_types);
    

    let correct_colour_array = [];
    let num_blue_indep_array = [];
    let num_blue_news_array = [];

    for (let block = 0; block < num_of_blocks; block++) {
        
        // shuffle order of states
        let random_state_order = jsPsych.randomization.repeat(
            possible_states,
            num_of_trials_per_block/2
            );
        correct_colour_array.push(random_state_order);

        let current_source = shuffled_source_order[block]
        let one_block_num_blue_indep_array = [];
        let one_block_num_blue_news_array = [];

        // console.log(random_state_order)

        // Sample the draws for each trial
        for (let trial = 0; trial < num_of_trials_per_block; trial++) {

            let probability_indep_blue = NaN;
            let probability_news_blue = NaN;

            if (random_state_order[trial] == 'blue') {
                probability_indep_blue = initial_source_attributes.b_I;
                probability_news_blue = source_attributes[current_source].b_F;
            } else if (random_state_order[trial] == 'green'){
                probability_indep_blue = 1 - initial_source_attributes.g_I
                probability_news_blue = 1 - source_attributes[current_source].g_F;
            }
            
            let num_blue_indep_one_trial = rbinom(1, num_of_draws, probability_indep_blue);
            let num_blue_news_one_trial = rbinom(1, num_of_draws, probability_news_blue);
            one_block_num_blue_indep_array.push(num_blue_indep_one_trial);
            one_block_num_blue_news_array.push(num_blue_news_one_trial);
        };
        num_blue_indep_array.push(one_block_num_blue_indep_array);
        num_blue_news_array.push(one_block_num_blue_news_array);
    }

    let full_game = {
        shuffled_source_order,
        correct_colour_array,
        num_blue_indep_array,
        num_blue_news_array
    };

    return full_game;
}


// Function that creates the timeline variables for the main experiment
set_up.create_timeline_variable = function(
    source_order,
    num_of_blocks,
    num_of_trials_per_block,
    num_of_draws,
    num_blue_indep_array,
    num_blue_news_array,
    correct_colour_array,
    expert_look_indicator,
    feedback_condition,
    experiment_stage = 'main',
    news_station_first,
    with_independent_council
    ) {
    
    let all_block_timeline_variables = [];
    for (let block = 0; block < num_of_blocks; block++) {
        
        // Iterate over blocks
        let one_block_timeline_variable = [];
        
        for (let trial = 0; trial< num_of_trials_per_block; trial++) {
        
            let shuffled_colour_indep_on_this_trial = 
                this.get_shuffled_source_order(
                    num_of_draws, 
                    num_blue_indep_array[block][trial]
                );
        
            let shuffled_colour_news_on_this_trial = 
                this.get_shuffled_source_order(
                    num_of_draws, 
                    num_blue_news_array[block][trial]); 
        
            let one_trial_attributes = {
                num_blue_indep: num_blue_indep_array[block][trial],
                num_blue_news: num_blue_news_array[block][trial],
                source_type: source_order[block],
                colours_indep: shuffled_colour_indep_on_this_trial,
                colours_news: shuffled_colour_news_on_this_trial, 
                correct_state: correct_colour_array[block][trial],
                expert_look_indicator: expert_look_indicator[block],
                experiment_stage: experiment_stage,
                trial_type: 'normal',
                feedback_condition: feedback_condition,
                block_number: block + 1,
                trial_number_within_block: (trial + 1),
                trial_number: (block * num_of_trials_per_block + (trial + 1)),
                news_station_first: news_station_first,
                with_independent_council: with_independent_council
            };
                                    
            one_block_timeline_variable.push(one_trial_attributes);
        }

        all_block_timeline_variables.push(one_block_timeline_variable)

    }

    if (num_of_blocks == 1) {
        all_block_timeline_variables = all_block_timeline_variables[0]
    }

    return all_block_timeline_variables;
}


set_up.create_station_only_timeline_variable = function(
    current_source,
    num_of_draws,
    expert_look_indicator,
    block, // to save the trial number accurately
    num_of_trials_per_block,
    news_station_first,
    with_independent_council
    ){

    // get all possible news station sources
    let all_possible_draws = []; 
    for (let i = 0; i != (num_of_draws + 1); ++i) all_possible_draws.push(i)
    all_possible_draws = jsPsych.randomization.shuffle(all_possible_draws);

    // to fill later
    let grey_expert_array = Array(num_of_draws).fill('grey');

    let news_source_only_timeline_variable = []
    for (let i = 0; i < all_possible_draws.length; i++) {     
        
        let shuffled_station_colours = this.get_shuffled_source_order(
            num_of_draws,
            all_possible_draws[i]
        );

        news_source_only_timeline_variable.push({
            num_blue_news: all_possible_draws[i],
            source_type: current_source,
            block_number: block,
            colours_indep: grey_expert_array,
            colours_news: shuffled_station_colours,
            correct_state: 'blue', // state doesn't matter here (no feedback)
            expert_look_indicator: expert_look_indicator,
            experiment_stage: 'main',
            trial_type: 'station_only',
            feedback_condition: false,
            trial_number_within_block:  (num_of_trials_per_block + i + 1),
            trial_number: (block * num_of_trials_per_block +
                (block - 1) * (num_of_draws + 1) + // indexes the previous station only trials
                (num_of_trials_per_block + i + 1)),
            news_station_first: news_station_first,
            with_independent_council: with_independent_council
        })
        
    }

    return news_source_only_timeline_variable;
}


set_up.create_practice_timeline = function(
    num_of_draws,
    num_blue_practice_slider,
    correct_colour_practice_slider,
    practice_with_news_station_only
){

    let num_of_trials_practice_slider = num_blue_practice_slider.length;
    let practice_with_slider_timeline_variable = [];
    let expert_look_for_practice = practice_with_news_station_only ? 5 : 0

    console.log(expert_look_for_practice)

    for (let practice_trial = 0; practice_trial < num_of_trials_practice_slider; practice_trial++) {
        
        let shuffled_colours_on_this_trial = 
            set_up.get_shuffled_source_order(
                num_of_draws, 
                num_blue_practice_slider[practice_trial]);
        let one_trial_attributes = {
            num_blue_indep: num_blue_practice_slider[practice_trial],
            num_blue_news: num_blue_practice_slider[practice_trial],
            source_type: 'practice_source',
            colours_indep: shuffled_colours_on_this_trial,
            colours_news: shuffled_colours_on_this_trial,
            correct_state: correct_colour_practice_slider[practice_trial] ,
            expert_look_indicator : expert_look_for_practice,
            experiment_phase: 'practice',
            experiment_stage: 'practice',
            trial_type: 'normal',
            feedback_condition: true,
            block_number: 0,
            trial_number: (practice_trial + 1), // because 0 initialized
            trial_number_within_block: (practice_trial + 1),
            news_station_first: true,
            with_independent_council: false,
            
        };
        practice_with_slider_timeline_variable.push(one_trial_attributes);
    }
    return practice_with_slider_timeline_variable;
}


export {set_up};