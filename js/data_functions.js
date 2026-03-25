/*
This file contains functions that take care of the data saving of the experiment
*/


let data_funs = {} // all functions will be methods to this object

data_funs.save_data = function(filename, data, stage){
    if (typeof jatos !=='undefined') {
        jatos.appendResultData(data);
    } else {
        console.log("JATOS not available - data not saved:", stage);
    }
    }


data_funs.get_date_string = function(){
    let current_date = new Date()
    let current_date_string = current_date.toISOString() // note that this is UTC
    let current_year = current_date_string.substr(0,4);
    let current_month = current_date_string.substr(5,2);
    let current_day = current_date_string.substr(8,2);
    let current_hour = current_date_string.substr(11,2);
    let current_minute = current_date_string.substr(14,2);

    return [
        current_year,
        current_month,
        current_day,
        current_hour,
        current_minute
    ].join("-")
}


data_funs.get_csv_filename = function(completion_code, date_string){
    return [date_string, completion_code].join('-');
}


data_funs.add_all_properties = function(
    completion_code,
    feedback_condition,
    start_time_and_date,
    filename_for_csv,
    worker_id,
    assignment_id,
    hit_id,
    news_station_first,
    with_independent_council
){

    let feedback_condition_string = feedback_condition ? "With" : "Without";
    let news_station_condittion_string = news_station_first ? "First" : "Second"

    jsPsych.data.addProperties({
        completion_code: completion_code,
        condition: feedback_condition_string,
        start_ISO_time: start_time_and_date,
        filename_for_csv: filename_for_csv,
        worker_id: worker_id,
        assignment_id: assignment_id,
        hit_id: hit_id,     
        news_station_first: news_station_condittion_string,
        with_independent_council: with_independent_council
    });
};


data_funs.save_standard_trial_data_from_timeline_var = function(plugin_type){
    return {
        plugin_type: plugin_type, 
        num_blue_indep: jsPsych.timelineVariable('num_blue_indep'),
        num_blue_news: jsPsych.timelineVariable('num_blue_news'),
        source_type: jsPsych.timelineVariable('source_type'),
        colours_indep: jsPsych.timelineVariable('colours_indep'),
        colours_news: jsPsych.timelineVariable('colours_news'),
        block_stage: jsPsych.timelineVariable('trial_type'), // with(out) Independent Council
        block_number: jsPsych.timelineVariable('block_number'),
        experiment_stage: jsPsych.timelineVariable('experiment_stage'),
        expert_look_indicator: jsPsych.timelineVariable('expert_look_indicator'),
        correct_state : jsPsych.timelineVariable('correct_state'),
        trial_number_within_block : jsPsych.timelineVariable('trial_number_within_block'),
        trial_number : jsPsych.timelineVariable('trial_number')
    }
}

data_funs.compute_accuracy = function(confidence, state){

    let state_indicator = state == "green" ? 0 : 1;
    let accuracy = 
        Math.sign(confidence - 50) === Math.sign(state_indicator - .5) ?
        1 : 0;
    return accuracy;
}

data_funs.compute_quadratic_score = function(confidence, state){
    
    let state_indicator = state == "green" ? 0 : 1;
    confidence = confidence / 100; // because confidence is entered from 0 - 100
    let brier_score = (confidence - state_indicator) ** 2; // the lower, the better
    let quadratic_score = 1 - brier_score; // transforms to quadratic score -> maximize 

    return quadratic_score;
};

// Used for summing up the quadratic score
function filter_function_for_score(x){
    let condition = (x.plugin_type === 'initial_source' || 
                x.plugin_type === 'full_source') && 
                x.experiment_stage === 'main' &&
                x.block_stage === 'normal'; // only trials with both Ind Council and News Station
    return condition;
}

data_funs.sum_up_quadratic_scores = function(data){
     // subset to only include the main experiment trials with initial or full source
    let filtered_data = jsPsych.data.get().filterCustom(filter_function_for_score);
    return filtered_data.select('quadratic_score').sum();
}

// Compute bonus from points
function translate_score_to_bonus(score, with_independent_council){
    let total_bonus = 0
    if (with_independent_council){
        let bonus_per_point = 0.10; // was .11 (05.06.23)
        total_bonus = (score - 162) * bonus_per_point; // 150 because that is equivalent to an agent that always picks  50 %
        console.log("Computing bonus with IC") 
    } else {
        let bonus_per_point = .15;
        total_bonus = (score - 80) * bonus_per_point;
        console.log("Computing bonus without IC")
    }
    return total_bonus;
}

// combined function that does both the computation and the updating of the quadratic Score
data_funs.compute_and_update_quadratic_score = function(data){
    data.accuracy = data_funs.compute_accuracy(data.response, data.correct_state); 
    data.quadratic_score = data_funs.compute_quadratic_score(data.response, data.correct_state);
    data.total_quadratic_score = data_funs.sum_up_quadratic_scores(data);
    return data;
}

// Get score and bonus at the end of the experiment
data_funs.get_pay_off = function(data, with_independent_council){
    let filtered_data = jsPsych.data.get().filterCustom(filter_function_for_score);
    let max_quadratic_score = filtered_data.select('total_quadratic_score').max();
    let bonus = translate_score_to_bonus(max_quadratic_score, with_independent_council); // cap bonus

    let bonus_max_cap = with_independent_council ? 5 : 3 

    bonus = bonus < 0 ? 0 : bonus
    bonus = bonus > bonus_max_cap ? bonus_max_cap : bonus // cap bonus 

    return {bonus : bonus, max_score: max_quadratic_score};
}


export {data_funs};