// File that contains the instruction and catch-question plugins for the experiment
import { data_funs } from "./data_functions.js";
import {
    make_source_img_html,
    display_catch_question_feedback
} from "./display_functions.js";

function create_instructions_object(
    feedback_condition,
    prolific_completion_code,
    num_of_blocks,
    news_station_first,
    with_independent_council,
    explain_news_station_before_independent_council
    ){
    
    // Empty object --> All instructions will be output as one object
    let instructions = {};

    let fullscreen_mode_instructions = true;
  
    var catch_q_general_preamble = 
        '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "600"></p>' +
        'Please answer the following question:';


    // Constructors ------------------------------------------------------------

    // constructor for a default instructions plugin
    function default_instruction_plugin(content){
        this.type = 'instructions';
        this.pages = content;
        this.show_clickable_nav = true;
        this.data = {experiment_stage : "instructions"};
    };

    // constructor for a default catch-question prompt plugin
    function default_catch_question_plugin(
        catch_question_name,
        prompt,
        options,
        correct_answer,
        question_type = "catch_question" // to distinguish consent
        ) {
        this.type = 'survey-multi-choice';
        this.preamble = function(){
            return question_type == "catch_question" ? 
                catch_q_general_preamble :
                ""
        };
        this.questions = [{
            prompt: prompt, 
            options: options, 
            required: true
        }];
        this.on_finish = function (data) {
            
            data.experiment_stage = "instructions";
            data.catch_question_name = catch_question_name;
            data.accuracy = true;
            if (data.response.Q0 !== correct_answer) {
                data.accuracy = false;
                data.times_comprehension_check_wrong = 
                    jsPsych.data.get().select('times_comprehension_check_wrong').max() + 1;                
            };
        };   
    }

    // Constructor for a default catch-question feedback plugin
    function default_catch_question_feedback_plugin(
        catch_question_name,
        prompt,
        options,    
        correct_answer
        ){
        this.type = 'survey-multi-choice';
        this.preamble = function(){
            return display_catch_question_feedback()
        };
        this.questions = [{
            prompt: prompt,  
            options: options, 
            required: true,
            preselected: function () {
                return jsPsych.data.getLastTrialData().values()[0].response.Q0;
            },
            hidden: function(){
                function filter_out_picked_option_from_element(value) {
                    return value != jsPsych.data.getLastTrialData().values()[0].response.Q0;
                };
                return options.filter(filter_out_picked_option_from_element);
            }
        }];
        this.on_finish = function(data){

            data.experiment_stage = "instructions";
            data.catch_question_name = catch_question_name;

            data.accuracy = false;
            if (data.response.Q0 === correct_answer) {
                data.accuracy = true;
            };
        };
    };


    // Printing the game as an experimenter:
    // Helper functions for printing the game to the console
    instructions.print_experimenter_info = function(feedback_condition, game){

        let feedback_message = "- Feedback condition: ";
        feedback_message += feedback_condition ? "With " : "Without ";
        feedback_message += "feedback (Reload page to resample)";

        let source_order_message = "- Source order:\n";
        for (let block = 0; block < game.shuffled_source_order.length; block++) {
            source_order_message += "  " + (block + 1) + ".: " + game.shuffled_source_order[block] + "\n"
        }

        console.log(
            "Welcome to the experiment: Here's some background info\n" +
            "about the currently sampled game:\n" +
            feedback_message + "\n" + 
            source_order_message +
            "The 'game' object is printed below - it additionally contains: \n" +
            "- the correct state per block and trial (.correct_colour_array)\n" +
            "- the number of blue votes for the initial council (.num_blue_indep_array)\n" + 
            "  and news station (.num_blue_news_array)" 
        )

        console.log(game)

    }

    // Actual plugins and timelines --------------------------------------------
    
    // Settings conditioned on with_independent_council
    let task_duration_for_consent = {
        false: "30",
        true: "50"
    }
    let base_payment_for_consent = {
        false: "6.00",
        true: "9.00"
    }
    let max_bonus_for_consent = {
        false: "3.00",
        true: "5.00"
    }
    
    let consent_prompt = 
        [
            '<p><b>Consent to Participate in a Research Study</b></p>' +
            '<p id="consent_text"><b>Study title:</b> Financial Decision-Making<br>' +
            '<b>Conducted by:</b> Meissene Bengana<br>' +
            '<b>Supervised by:</b> Dr. Mael Lebreton<br>' +
            '<b>Institution:</b> Paris School of Economics & Université Sorbonne Paris-1<br>' +
            '<b>Contact:</b> meissene.bengana@etu.u-paris.fr</p>' +
            '<p id="consent_text">You are invited to participate in a research study on financial decision-making. ' +
            'Please read the following information carefully before deciding whether to participate.</p>' +
            '<p id="consent_text"><b>What will you do?</b><br>' +
            'You will complete a computer-based task involving financial decisions, followed by a short questionnaire. ' +
            'The study takes approximately 30-45 minutes.</p>' +
            '<p id="consent_text"><b>Anonymity:</b><br>' +
            'Your responses will be collected anonymously. No personally identifying information will be stored alongside your data. ' +
            'Your data may be used for scientific publications in anonymized form.</p>' +
            '<p id="consent_text"><b>Voluntary participation:</b><br>' +
            'Your participation is entirely voluntary. You may withdraw at any time without consequence ' +
            'by closing the browser window.</p>' +
            '<p id="consent_text"><b>Compensation:</b><br>' +
            'This study does not offer any financial compensation for participation.</p>' +
            '<p id="consent_text"><b>Contact:</b><br>' +
            'If you have any questions about this study, please contact: meissene.bengana@etu.u-paris.fr</p>'
        ]


    instructions.consent = new default_instruction_plugin(consent_prompt)

    let consent_options = ['Yes', 'No']

    instructions.consent_questions = {
        type: 'survey-multi-choice',
        preamble: '<p id="consent_text"><b>Consent Form</b></p>',
        questions: [
          {
            prompt: '<p id="consent_text">I have read and understood the information above and I voluntarily agree to participate in this study.</p>',
            name: 'Consent', 
            options: ['Yes','No'], 
            required: true
          }, 
          {
            prompt: '<p id="consent_text">I understand that my data will be collected anonymously and may be used for scientific research.</p>', 
            name: 'DataConsent', 
            options: ['Yes','No'], 
            required: true
          },
          {
            prompt: '<p id="consent_text">I understand that I may withdraw from this study at any time without consequence.</p>', 
            name: 'Withdraw', 
            options: ['Yes','No'], 
            required: true
          }
        ]
    }

    instructions.data_questions = {
        type: 'html-button-response',
        stimulus: '',
        choices: [],
        trial_duration: 1
    }

    let no_consent_page = {
        type: 'html-keyboard-response',
        stimulus: '<p>You did not consent to participate. You can close this window now.</p>' +
            '<p>Thank you for your time!</p>',
        choices: jsPsych.NO_KEYS
    };

    instructions.show_if_no_consent = {
        timeline: [no_consent_page],
        conditional_function: function(){
            let consent_responses = jsPsych.data.getLastTrialData().values()[0].response
            console.log(consent_responses)
            consent_responses = Object.entries(consent_responses)
            for (let i = 0; i < consent_responses.length; i++) {
                if (consent_responses[i][1] == "No") {
                    return true
                }
            }
            return false
        }
    }

    let no_data_consent_page = {
        type: 'html-keyboard-response',
        stimulus: '<p>You did not consent to our data protection policy. You can close this window now.</p>' +
            '<p>Thank you for your time!</p>',
        choices: jsPsych.NO_KEYS
    };

    instructions.show_if_no_data_consent = {
        timeline: [no_data_consent_page],
        conditional_function: function(){
            return false
        }
    }


    // Full screen
    instructions.fullscreen = {
        type: 'fullscreen',
        message: 
            '<p>In the following game, your bonus payment will depend '+ 
            'on how well you do.<br>' +
            'Please perform to the best of your abilities.</p>' + 
            "<p>We strongly recommend playing the following game in full screen mode.<br>" +
            'Fullscreen mode will be activated by clicking on the "Start Experiment" button below.</p>' +
            '<p>During the instructions, we will ask you several questions ' +
            'which check if you understand the game.</p>' +
            '<p>Thanks - and have fun!</p>',
        button_label: "Start Experiment",
        fullscreen_mode: fullscreen_mode_instructions,
        data: {
            // initialize the comprehension check wrong counter
            times_comprehension_check_wrong : 0
        }
    }
    

    // Before game -----------------------

    let page_1_text = [
        '<p><img src="js/img/kyberneum.png" alt="Kyberneum"></p>' +
        '<p><b>Welcome to Kyberneum!</b></p>' +
        '<p>Kyberneum is a planet in a far-away galaxy with a special political system:<br>' +  
        'Kyberneum classifies its policies as either green or blue, and for each policy decision<br>its citizens ' +
        'express their confidence in which of two policy options is the better one.</p>' + 
        '<p>In this game, you will be a citizen of Kyberneum.</p>',

        '<p><img src="js/img/kyberneum.png" alt="Kyberneum"></p>' +
        "<p>Kyberneum's history has shown that <b>in half of the cases green policies are better <br>" +
        'and in half of the cases blue policies are better.</b></p>' +
        '<p>As experimenters, we know which policy was in fact better<br>' +
        'and so will be able to give you feedback on your confidence ratings.</p>'
    ]

    if(with_independent_council && !explain_news_station_before_independent_council){

        page_1_text.push(
            '<p>To help you form your confidence, you will see the following two sources of information<br>' + 
            'recommending either blue or green:</p>' + 
            '<p><b>1. The Independent Council</b>, a helpful panel of experts:</p>' +
            '<p>' + make_source_img_html(["green", "green", "green", "green", "blue"], 0) + '</p>'+
            "<p><b>2. A news station panel</b>. They might differ in their quality, and you'll have to learn about them:</p>" +
            '<p>' + make_source_img_html(["blue", "blue", "green", "green", "blue"], 6) + '</p>'+
            '<p>In this game, your task is to best use the information given by these two<br>' + 
            'sources of information to rate your confidence</p>',
        )

        page_1_text.push(
            '<p><img src="js/img/kyberneum.png" alt="Kyberneum" width = "600"></p>' +
            'Each type of council consists of <b>five experts each.</b><br>' +
            '<p>In both cases, <b>the experts change between the policies</b>, and are kept anonymous.<br>' + 
            'That way, there is a new expert panel for each trial.</p>' +
            '<p>On both the Independent Council and news station panels, the experts are <b>kept apart from each other<br>' + 
            'and do not interact</b>. As a result, the opinion of one expert does not<br>' +
            'influence the decision of another one.</p>'
        )
    } else {

        page_1_text.push(
            '<p>To help you form your confidence, Kyberneum has different news stations<br>' + 
            'recommending either blue or green like in this example:</p>' + 
            '<p>' + make_source_img_html(["blue", "blue", "green", "green", "blue"], 6) + '</p>'+
            "<p>These news stations might differ in their quality, and you'll have to learn about them.</p>" +
            '<p>In this game, your task is to best use the information given by these<br>' + 
            'sources of information to rate your confidence</p>',
        )

        page_1_text.push(
            '<p><img src="js/img/kyberneum.png" alt="Kyberneum" width = "600"></p>' +
            'Each news panel consists of <b>five experts each.</b><br>' +
            '<p>In both cases, <b>the experts on the panels change between the policies</b>, and are kept anonymous.<br>' + 
            'That way, there is a new expert panel for each trial.</p>' +
            '<p>The experts are <b>kept apart from each other<br>' + 
            'and do not interact</b>. As a result, the opinion of one expert does not<br>' +
            'influence the decision of another one.</p>'
        )

    }

    instructions.pages_1 = new default_instruction_plugin(page_1_text)

    let catch_question_1 = {
        name : 'catchq_no_influence',
        question: "<b>Select the true statement about Kyberneum's panel experts?</b>",
        options: [
            "The experts talk to each other and exchange views before giving their opinion.",
            "The experts do not get exchanged between trials.",
            "The experts do not influence each other."
        ],
        correct: "The experts do not influence each other."
    };

    instructions.catch_question_1 = new default_catch_question_plugin(
        catch_question_1.name,
        catch_question_1.question,
        catch_question_1.options,
        catch_question_1.correct
    );

    instructions.catch_question_1_feedback = new default_catch_question_feedback_plugin(
        catch_question_1.name,
        catch_question_1.question,
        catch_question_1.options,
        catch_question_1.correct
    );

    instructions.looping_timeline_1 = {
        timeline: [
            instructions.pages_1,
            instructions.catch_question_1,
            instructions.catch_question_1_feedback
        ],
        loop_function: function (data) {
            return !data.values()[data.values().length - 1].accuracy;
        }
    };

    
    
    if(with_independent_council) {

        console.log("Add second instruction pages")

        let page_2_text_array = []

        let intro_to_indep_council = '<p><img src="js/img/kyberneum.png" alt="Kyberneum"></p>' 

        if (!explain_news_station_before_independent_council) {
            intro_to_indep_council += '<p>You will now get to know the Independent Council a little better.</p>'
           } else {
            intro_to_indep_council += "<p>There is one big change to the main part of this experiment:<br>" +
                "You will not get feedback by Kyberneum lighting up in a color.<br>" + 
                "Instead, you will get to see another panel of experts, the so-called Independent Council</p>" + 
                "<p>They look like a  news station panel but have unmarked dresses:</p>" +
                '<p>' + make_source_img_html(["green", "green", "green", "green", "blue"], 0) + '</p>'+
                "<p>Just like the news stations,  this panel of experts is anonymized<br>" + 
                "and the individual experts do not influence each other"                
        }

        intro_to_indep_council += '<p>Being an Independent Council expert is a true honor on Kyberneum.<br>' +
            'As a result, each Independent Council member always honestly and truthfully says <br>' + 
            'what they believe to be the better policy.</p>'
        page_2_text_array.push(intro_to_indep_council)

        page_2_text_array.push(
            '<p>As you could see before, <b>the Independent Council experts sometimes disagree</b>. They do not do this on purpose. <br>' + 
            'Rather, even the Independent Council experts are not perfect and <b>sometimes make a mistake.</b><br>' +
            "Kyberneum's history has shown that expert mistakes happen at this ratio:</p>" +
            '<p><img src="js/img/instruct_expert_distribution_threequarters.png" alt="Independent Council Distribution", width = "850"></p>' +
            '<p>As you can see, an Independent Council expert errs <b>one out of four times</b>:<br>' +
            'That is, in on average 25 % of cases, an expert will say green even if<br>' +
            'the better policy was blue, or blue even if the better policy was green.</p>',
        )

        let note_on_indep_council = '<p><img src="js/img/kyberneum.png" alt="Kyberneum"></p>' +
            '<p>This can also mean the following:<br>' + 
            'Even if the majority of Independent Council experts say green (or blue) is better,<br>' +
            'this does not automatically mean that green (or blue) is the better policy.</p>' 
        if (!explain_news_station_before_independent_council) {
            note_on_indep_council += '<p>Your task is to use all experts together to form your confidence.</p>'
        } else {
            note_on_indep_council += '<p>Your task is to use all experts together to form your confidence.<br>' +
                'and learn about how good the news station is.</p>'
        }
         
        page_2_text_array.push(note_on_indep_council)
        
        if(explain_news_station_before_independent_council){
            page_2_text_array.push(
                '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "500"></p>' +
                '<p>The laws of Kyberneum dictate that, the news stations need to air their panels before the<br>' +
                'Independent Council opinions are announced.<br>' + 
                'The Independent Council members are also barred from watching the News Station.<br>' +
                'That way, <b>neither can the news stations influence the Independent Council,<br>' +
                'nor can the Independent Council influence the news station.</b></p>' +
                '<p>As a result, you can use the Independent Council and the news station as<br>' +
                '<b>two independent sources of information.</b></p>'
            )
        }

        instructions.pages_2 = new default_instruction_plugin(page_2_text_array);
     

        let catch_question_2 = {
            name: 'catchq_how_often_mistake',
            question: "<b>How often does one Independent Council expert make a mistake?</b>",
            options: [
                "Never.",
                "On average one out of four times.",
                "On average one out of ten times."
            ],
            correct: "On average one out of four times."
        };

        instructions.catch_question_2 = new default_catch_question_plugin(
            catch_question_2.name,
            catch_question_2.question,
            catch_question_2.options,
            catch_question_2.correct
        );

        instructions.catch_question_2_feedback = new default_catch_question_feedback_plugin(
            catch_question_2.name,
            catch_question_2.question,
            catch_question_2.options,
            catch_question_2.correct
        );

        instructions.looping_timeline_2 = {
            timeline: [
                instructions.pages_2,
                instructions.catch_question_2,
                instructions.catch_question_2_feedback
            ],
            loop_function: function (data) {
                return !data.values()[data.values().length - 1].accuracy;
            }
        };
    } 


    instructions.pages_3 = new default_instruction_plugin(
        [
            '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = 500></p>' +
            '<p>You will express your confidence using the following slider that ranges<br>' + 
            'from 100 % confident in green being better to 100 % confident in blue being better:</p>' +
            '<p><img src="js/img/instruct_slider_practice.png" alt="Buttons", width = "600"></p>' +
            '<p>The more confident you are in one policy being the better one, the farther you can move the slider to one of the ends.<br>' +
            'If you are entirely unsure about which policy is better, you can place the slider in the middle of the bar.<br>' +
            'However, to register your confidence, you will have to click on the slider at least once.</p>',   

            "<p>After placing the slider, a button will appear through which you can register your opinion.<br>" + 
            "Once you click it, we will reveal which policy was the better policy<br>" + 
            'by showing you Kyberneum illuminated either in blue (when blue was the better policy)<br>' + 
            'or green (when green was the better policy):</p>' +
            '<p><img src="js/img/kyberneum_blue.png" alt="Kyberneum"> <img src="js/img/kyberneum_green.png" alt="Kyberneum"></p>' +
            '<p>Before you submit your confidence, Kyberneum will be shown in grey.<br>' +
            "When the better policy was different to the one you were most confident in,<br>" + 
            "you will see a warning around the planet, for example like this:</p>" +
            '<img src="js/img/warning_left.png" alt="warning"><img src="js/img/kyberneum_blue.png" alt="Kyberneum"><img src="js/img/warning_right.png" alt="warning">',

            '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = 700></p>' +
            '<p><b>You will receive a bonus payment for your confidence ratings.</b></p>' + 
            '<p>We created a point system where <b>you profit the most by telling us your true confidence.</b></p>',

            '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = 700></p>' +   
            '<p>This is how the bonus works:</p>' +
            '<p>If blue turned out to be the better policy, you will get<br>' + 
            'more money the more confident you say you are in blue.<br>' +
            'If green turned out to be the better policy,<br>' +
            'you will get more money the more confident you say you are in green.</p>' +
            '</p>Alternatively, if green was the better policy and you say you are<br>'+
            'very confident in blue, you will receive the least reward (and vice versa).</p>' +
            '<p>That means that you will earn the most bonus by moving the confidence slider<br>' + 
            'as far in one direction as you truly belief is warranted.</p>' + 
            `<p>Recall that you can receive a bonus payment of up to GBP ${max_bonus_for_consent[with_independent_council]} on this game,<br>` +
            'so give your best when playing it. Note that we monitor overly random<br>' + 
            'behavior and that this can reduce your bonus.</p>'
        ]
    );

    let catch_question_3 = {
        name: 'catchq_how_most_bonus',
        question: '<b>How are you most likely to get the most bonus in this task?</b>',
        options: [
            'By always leaving the confidence slider in the middle of the bar.',
            'By always moving it to the extreme ends of the bar on every trial.',
            'By moving it as far as my confidence allows.'
        ],
        correct: 'By moving it as far as my confidence allows.'
    }

    instructions.catch_question_3 = new default_catch_question_plugin(
        catch_question_3.name,
        catch_question_3.question,
        catch_question_3.options,
        catch_question_3.correct
    );

    instructions.catch_question_3_feedback = new default_catch_question_feedback_plugin(
        catch_question_3.name,
        catch_question_3.question,
        catch_question_3.options,
        catch_question_3.correct
    );

    instructions.looping_timeline_3 = {
        timeline: [
            instructions.pages_3,
            instructions.catch_question_3,
            instructions.catch_question_3_feedback
        ],
        loop_function: function (data) {
            return !data.values()[data.values().length - 1].accuracy;
        }
    };


    let page_4_option = with_independent_council && !explain_news_station_before_independent_council ? "the Independent Council" : "a mock news station"
    let page_4_text ='  <p><img src="js/img/kyberneum.png" alt="Kyberneum"></p>' +
        `<p>You now have the chance to get to practice with ${page_4_option} for ten trials</p>` +
        '<p>Click "Start Practice" to begin.</p>' +
        '<p>Note that this will re-enter fullscreen mode if you have left it previously.<p>'

    instructions.pages_4 = {
        type: 'fullscreen',
        message: page_4_text,
        button_label: "Start Practice",
        fullscreen_mode: fullscreen_mode_instructions
    };  


    let page_5_option = page_4_option
    let page_5_option_2 = with_independent_council && !explain_news_station_before_independent_council ? "" : " or the one you just practiced with"

    let page_5_array = [
        '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "600"></p>' +
        `<p>Fantastic, you have now learned to play with ${page_5_option}.<br>` +
        'You will next learn more about the news stations.</p>' +
        '<p>In the main part of the experiment, you will be able to tell apart the news stations by their clothes.<br>Here are a few examples:</p>' +
        '<p><img src="js/img/instruct_source_intro.png" alt="News Stations", width = "630"></p>',
       
        '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "600"></p>' +
        '<p>In general, <b>the news stations could help you decide which policy is better.</b></p>' +
        '<p>Importantly however, experts from some news stations might be more or less frequently mistaken than<br>' +
        `those from other news stations${page_5_option_2}. Also, some news stations may be biased or lie.</p>` +
        '<p>As a result, as a new citizen of Kyberneum <b>you will have to learn<br>' +
        "how accurate each news station</b> is so you can best use its experts' opinions.</p>",
    ]

    if(with_independent_council && !explain_news_station_before_independent_council){
        page_5_array.push(
            '<p>In essence, you can imagine this situation like this: Whereas you know how often an<br>' +
            "Independent Council expert errs on average (one out of four times), you don't know<br>" +
            "about how likely the News Station experts are to make a mistake or be biased:</p>" +
            '<p><img src="js/img/instruct_news_distribution.png" alt="News Station Distribution", width = "900"></p>',
        )

        if(news_station_first){
            page_5_array.push(
                '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "500"></p>' +
                '<p>The laws of Kyberneum dictate that the news stations need to air their panels before the<br>' +
                'Independent Council opinions are announced.<br>' + 
                'The Independent Council members are also barred from watching the News Station.<br>' +
                'That way, <b>neither can the news stations influence the Independent Council,<br>' +
                'nor can the Independent Council influence the news station.</b></p>' +
                '<p>As a result, you can use the Independent Council and the news station as<br>' +
                '<b>two independent sources of information.</b></p>'
            )
        } else {
            page_5_array.push(
                '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "500"></p>' +
                '<p>By the laws of Kyberneum, the news stations need to record their panels before the<br>' +
                'Independent Council opinions are announced, but are only aired afterwards.<br>' +
                'That way, <b>neither can the news stations influence the Independent Council,<br>' +
                'nor can the Independent Council influence the news station.</b></p>' +
                '<p>As a result, you can use the Independent Council and the news station as<br>' +
                '<b>two independent sources of information.</b></p>'
            )
        }
    }


    instructions.pages_5 = new default_instruction_plugin(page_5_array);

    let catch_question_4_options = with_independent_council && !explain_news_station_before_independent_council ? 
        [
            'Some news station might help me improve my decision while others might not.',
            'The news stations and the Independent Council influence each other.',
            'Unlike the Independent Council members, the news stations experts talk to each other.'            
        ] : 
        [
            'Some news station might help me improve my decision while others might not.',
            'The news stations influence each other.',
            'All news station are as helpful as the one I just practiced with.'            
        ]



    let catch_question_4 = {
        name: 'catchq_station_influence',
        question: "<b>Which statement about Kyberneum's news station is true?</b>",
        options: catch_question_4_options,  
        correct: 'Some news station might help me improve my decision while others might not.'
    };

    instructions.catch_question_4 = new default_catch_question_plugin(
        catch_question_4.name,
        catch_question_4.question,
        catch_question_4.options,
        catch_question_4.correct
    );

    instructions.catch_question_4_feedback = new default_catch_question_feedback_plugin(
        catch_question_4.name,
        catch_question_4.question,
        catch_question_4.options,
        catch_question_4.correct
    );


    instructions.looping_timeline_5 = {
        timeline: [
            instructions.pages_5,
            instructions.catch_question_4,
            instructions.catch_question_4_feedback
        ],
        loop_function: function (data) {
            return !data.values()[data.values().length - 1].accuracy;
        }
    };

    let page_6_array = [];

    if (with_independent_council && !explain_news_station_before_independent_council){

        if(news_station_first){
            page_6_array.push(
                "<p>In addition to the Independent Council, you will now also see one news station's panel per trial.<br>" +
                'It will be shown before you will see the Independent Council like this:</p>' +
                '<p><img src="js/img/instruct_source_display_reverse.png" alt="News Station Display", width = "730"></p>' +
                '<p>You will first see the news station and <b>express your initial confidence</b> just like before.<br>' +
                'After that, the Independent Council will be revealed and you can change your confidence<br>' + 
                'in the direction your confidence has changed.</p>' + 
                '<p>For the “Register final opinion” button to appear<br>' +
                'you need to either move the slider, or - if your confidence<br>' +
                'has not changed - click on it at the current position.</p>',
    
                '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "600"></p>' +
                '<p>Your <b>bonus</b> will not only be based on your inital rating -<br>' +
                'but also <b>on your final rating.</b></p>' +
                '<p>So, if the Independent council makes you more confident in your decision,<br>' +
                'you should increase your rating, and earn more money that way. Likewise,<br>' +
                'if you became less confident in your decisions you should move the slider<br>' +
                'more towards the middle … or even change it to the other side if the<br>' +
                'Independent Council has convinced you that a different policy is in fact better.</p>'
            )
        } else {
            page_6_array.push(
                "<p>In addition to the Independent Council, you will now also see one news station's panel per trial.<br>" +
                'It will be shown after you have registered your initial confidence judgment like this:</p>' +
                '<p><img src="js/img/instruct_source_display.png" alt="News Station Display", width = "730"></p>' +
                '<p>You can then <b>update your initial confidence</b> by moving the slider on the bar<br>' +
                'in the direction your confidence has changed.</p>' + 
                '<p>For the “Register final opinion” button to appear<br>' +
                'you need to either move the slider, or - if your confidence<br>' +
                'has not changed - click on it at the current position.</p>',
    
                '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "600"></p>' +
                '<p>Your <b>bonus</b> will not only be based on your inital rating -<br>' +
                'but also <b>on your final rating.</b></p>' +
                '<p>So, if the News Station makes you more confident in your decision,<br>' +
                'you should increase your rating, and earn more money that way. Likewise,<br>' +
                'if you became less confident in your decisions you should move the slider<br>' +
                'more towards the middle … or even change it to the other side if the<br>' +
                'News Station has convinced you that a different policy is in fact better.</p>'
            )
        }

        if (feedback_condition == true) {
            page_6_array[1] += '<p>You will see which policy was better after you have entered your final opinion.</p>'
        } else if (feedback_condition == false) {
            page_6_array.push(
                '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "700"></p>' +
                '<p>So far you saw which policy was the better one.<br>' +
                'From now on, you will <b>not see this feedback anymore</b></p>' + 
                '<p>Everything else about the task  remains the same.<br>' +
                'You will from now on see Kyberneum in grey throughout:</p>' +
                '<p><img src="js/img/kyberneum_grey.png" alt="Kyberneum"></p>' 
            )
        }
    }

    page_6_array.push(
        '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "600"></p>' +
        '<p>In the main game, you will play ' + num_of_blocks + ' blocks of this task.</p>' +
        '<p><b>In each block, you will play with one news station council</b><br>' + 
        'and so can learn about its attributes.</p>' + 
        '<p>After the block has ended, you will move to another news source. Each station<br>' +
        'is independent from each other - so what you have learned in one block<br>' +
        'will not help you with the next.</p>'
    )

    instructions.pages_6 = new default_instruction_plugin(
        page_6_array
    )

    let catch_question_5_options = with_independent_council && !explain_news_station_before_independent_council ? 
        [
            'On Kyberneum, all news stations are just as helpful as the Independent Council.',
            'They might be helpful, but could also be unreliable or biased.',
            'The information provided by all news sources is entirely random.'
        ] :
        [
            'On Kyberneum, all news stations are the same.',
            'They might be helpful, but could also be unreliable or biased.',
            'The information provided by all news sources is entirely random.'
        ]

    let catch_question_5 = {
        name: 'catchq_knowledge_about_station',
        question: '<b>Before playing with each news station, what do you know about it:</b>',
        options: catch_question_5_options,
        correct: 'They might be helpful, but could also be unreliable or biased.' 
    };

    instructions.catch_question_5 = new default_catch_question_plugin(
        catch_question_5.name,
        catch_question_5.question,
        catch_question_5.options,
        catch_question_5.correct
    );

    instructions.catch_question_5_feedback = new default_catch_question_feedback_plugin(
        catch_question_5.name,
        catch_question_5.question,
        catch_question_5.options,
        catch_question_5.correct
    );

    instructions.looping_timeline_6 = {
        timeline: [
            instructions.pages_6,
            instructions.catch_question_5,
            instructions.catch_question_5_feedback
        ],
        loop_function: function (data) {
            return !data.values()[data.values().length - 1].accuracy;
        }
    };


    let array_for_later_ic_explaion = [
        "<p>From now on, you will see both a news station and an independent council per trial, like this.<br>" +
        '<p><img src="js/img/instruct_source_display_reverse.png" alt="News Station Display", width = "730"></p>' +
        '<p>You will first see the news station and <b>express your initial confidence</b> just like before.<br>' +
        'After that, the Independent Council will be revealed and you can change your confidence<br>' + 
        'in the direction your confidence has changed.</p>' + 
        '<p>For the “Register final opinion” button to appear<br>' +
        'you need to either move the slider, or - if your confidence<br>' +
        'has not changed - click on it at the current position.</p>',

        '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "600"></p>' +
        '<p>Your <b>bonus</b> will not only be based on your inital rating -<br>' +
        'but also <b>on your final rating.</b></p>' +
        '<p>So, if the Independent council makes you more confident in your decision,<br>' +
        'you should increase your rating, and earn more money that way. Likewise,<br>' +
        'if you became less confident in your decisions you should move the slider<br>' +
        'more towards the middle … or even change it to the other side if the<br>' +
        'Independent Council has convinced you that a different policy is in fact better.</p>'
    ]
    
    instructions.later_explainer_of_ic = new default_instruction_plugin(
        array_for_later_ic_explaion
    )


    instructions.pages_7 = {
        type: 'fullscreen',
        message: 
            '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "600"></p>' +
            '<p>Before  observing a real news station, you now have two trials<br>' +
            'to get to know this new set up</p>' + 
            '<p>Click "Start Practice" to begin.</p>' +
            '<p>Note that this will re-enter fullscreen mode if you have left it.<p>',
        button_label: "Start Practice",
        fullscreen_mode: fullscreen_mode_instructions
    };  

    let page_8_array = [
        '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "600"></p>' +
        '<p>Great! We’re now almost ready to start the experiment.</p>'
    ]

    if(with_independent_council) {
        if(news_station_first){
            page_8_array.push(
                '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "600"></p>' +
                '<p>One more thing: At the end of each block, you will see a <b>few trials where the<br>' +
                'Independent Council remains blurred out</b>. You will still register your<br>' +
                'initial vote based on the News Station.</p>'
            )
        } else{
            page_8_array.push(
                '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "600"></p>' +
                '<p>One more thing: At the end of each block, you will see a <b>few trials where the<br>' +
                'Independent Council is blurred out</b>. You will still register your<br>' +
                'initial vote based on this blurred Independent Council (remember that<br>' +
                'this can be "50/50"). Afterwards, you will see the News Station Council<br>' +
                'and can use what you learned about it to cast your final vote.</p>'
                )
        }

        if (feedback_condition == true) {
            page_8_array[1] += 
                "<p>Note that you will <b>not</b> receive feedback about which policy was the<br>" +
                "better one during those final few trials.<br>"  +
                "You will however still receive bonus for expressing your confidence accurately.</p>"
        } else {
            page_8_array[1] += "<p>You will still receive bonus for expressing your confidence accurately.</p>"
        }
    
    } else {
        let page_8_option = with_independent_council ? "the indpendent council" : "feedback for your choices"
        page_8_array.push(
            '<p><img src="js/img/kyberneum.png" alt="Kyberneum", width = "600"></p>' +
            '<p>One more thing: At the end of each block, you will see a <b>few trials where<br>' +
            `you will not see ${page_8_option}</b>. You will still register your<br>` +
            'confidence based on the news station vote and will still recevie bonus for expresssing your confidence</p>'
        )     
    }

    instructions.pages_8 = new default_instruction_plugin(
        page_8_array
    );



    // After game --------------------------
    let new_instructions_pages = [
        //Page 1 - Welcome 
        '<p><img src="js/img/piggy-bank.png" width="200"></p>' +
        '<p><b>Welcome to the study !</b></p>' +
        '<p>In this study, you will act as an investor trying to maximize your returns<br>' +
        'by making smart investment decisions. </p>' +
        '<p>Please read the following instructions carefully.</p>', 

        // Page 2 - Task overview 
        '<p><img src="js/img/piggy-bank.png" width="200"></p>' +
        '<p><b> Your task</b></p>' +
        '<p> On each trial, you will see endorsements from a financial advisor.<br>' +
        'Each advisor specialises in<b> two specific investment funds</b> and will endorse one of them.</p>' +
        '<p>Each trial, <b>one fund is objectively better performing than the other.</b><br>' +
        'The advisor\'s endorsement reflects their <i>belief</i> about which fund will perform better -<br>' +
        'it does not necessarily reflect reality.<br>' +
        'Your job is to use the slider to indicate how confident you are that one fund will perform better. </p>' +
        '<p>Move the slider towards the fund you think is better.<br>' +
        'The more confident you are, the further you should move it.</p>',

        // Page 3 - The advisors 
        '<p><img src="js/img/piggy-bank.png" width="200"></p>' +
        '<p><b>The financial advisors</b></p>' +
        '<p>Each advisor specializes in <b>one specific pair of funds</b> and will only ever evaluate two funds.<br>' +
        'For example, one advisor always evaluates Fund A vs Fund B.<br>' +
        'while another always evaluates Fund C vs Fund D.<br>' +
        'No two advisors evaluate the same pair of funds.</p>' +
        '<p>On each trial, you will see one advisor\'s endorsement and use it<br>' +
        'to decide which of their two funds you think performed better that trial.</p>' +
        '<p>The whole task is split into <b>4 blocks</b>.<br>' +
        'At the start of each block, you will be reminded of all 4 advisors and their fund pairs.</p>',

        // Page 4 - Reliability
        '<p><img src="js/img/piggy-bank.png" width="200"></p>' +
        '<p><b>Advisor reliability</b></p>' +
        '<p>The advisors <b>differ in how reliable</b> their endorsements are. <br>' +
        'Some advisors are more accurate than others.</p>' +
        '<p>Additionally, their reliability <b>may change over time</b> due to factors such as<br>' +
        'market conditions or internal restructuring.</p>' +
        '<p> So pay close attention to how well each advisor\'s endorsements<br>' +
        'match the actual outcomes - this can change!</p>',

        //Page 5 Feedback 
        '<p><img src="js/img/piggy-bank.png" width="200"></p>' +
        '<p><b>Feedback</b></p>' +
        '<p>After each decision, you will see a piggy bank indicating<br>' +
        'which fund <b>actually performed better</b> that month.</p>' +
        '<p><b>One fund is always objectively better performing than the other.</b><br>' +
        'The advisor\'s endorsement reflects their <i>belief</i> about which fund is better -<br>' +
        'it does not necessarily reflect reality. Some advisors are more accurate than the others!</p>' +
        '<p>The piggy bank will change color to match the winning fund:<br>' +
        '<table style="margin: auto; border-spacing: 20px;">' +
        '<tr>' +
        '<td style="text-align:center;"><img src="js/img/funda_piggybank.png" height="80"><br><b>Fund A won</b></td>' +
        '<td style="text-align:center;"><img src="js/img/fundb_piggybank.png" height="80"><br><b>Fund B won</b></td>' +
        '<td style="text-align:center;"><img src="js/img/fundc_piggybank.png" height="80"><br><b>Fund C won</b></td>' +
        '<td style="text-align:center;"><img src="js/img/fundd_piggybank.png" height="80"><br><b>Fund D won</b></td>' +
        '</tr>' +
        '</table></p>' +
        '<p>If you chose the <b>wrong fund</b>, warning signs will appear on either side of the piggy bank.</p>' +
        '<p>Use this feedback to learn about each advisor\'s reliability.</p>'+
        '<p>Between blocks, you will also see some trials <b>without feedback</b>.<br>' +
        'This is normal - just give your best estimate based on what you have learned so far.</p>',

        //Page 6 - Structure 
        '<p><img src="js/img/piggy-bank.png" width="200"></p>'+
        '<p><b>Study structure</b></p>' +
        '<p> The study consists of <b>4 blocks</b> of trials.<br>' +
        'You will see all 4 advisors in each block.</p>' +
        '<p>You can take a short break between blocks.</p>' +
        '<p><b>Your goal:</b> Try to be as accurate as possible throughout the study.<br>' +
        'The more correct decisions you make, the better you virtual investment returns!</p>' +
        '<p>Click "Next" to continue to a short practice session before the main study begins.</p>',

        //Page 7 - Practice intro
        '<p><img src="js/img/piggy-bank.png" width="200"></p>' +
        '<p><b>Practice trials</b></p>' +
        '<p>Before starting the main study, you will complete <b>4 practice trials</b>.</p>' +
        '<p>In these trials you will see endorsements from a <b>practice advisor</b><br>' +
        'who evaluates <b>Fund X vs Fund Y</b>.</p>' +
        '<p>This advisor is reliable - use these trials to get familiar with the task.</p>' +
        '<p>You will receive feedback after each practice trial.<br>' +
        'When you are ready, click "Next" to begin the practice.</p>'
    ];
    instructions.new_task_instructions = new default_instruction_plugin(new_instructions_pages);

    let debrief =
    '<p><b>Thank you for participating!</b></p>' +
    '<p>Now that you have completed the study, we can reveal its true purpose.</p>' +
    '<p>This study was not primarily about financial decison-making.<br>' +
    'It was designed to investigate <b>trust asymmetry</b> - specifically,<br>' +
    'how people update their trust in information sources differently<br>' +
    'depending on whether those sources confirm or disconfirm their expectations.<br>' +
    'This is based on the experimental paradigm developed by Schulz et al. (2025).</p>' +
    '<p>The "financial advisors" you interacted with were simulated sources<br>' +
    'with different levels of reliability. Some were more accurate than others,<br>' +
    'and for some advisors, their reliability changed halfway through the study.<br>' +
    'We were interested in how you adapted your trust in each advisor over time.</p>' +
    '<p>If you have any questions about this study or would like to withdraw your data,<br>' +
    'please contact: <b>meissene.bengana@etu.u-paris.fr</b></p>' +
    '<p>This research is conducted by Meissene Bengana under the surpervision of<br>' +
    'Dr. Mael Lebreton at the Paris School of Economics and Université Sorbonne Paris-1.</p>';

    instructions.after_game = new default_instruction_plugin([debrief]);

    let completion_code_page = 
        '<p>You have now completed the study.</p>' +
        '<p>Thank you again for your participation!</p>' +
        '<p>If you have any questions, please contact: meissene.bengana@etu.u-paris.fr</p>';

    instructions.final_screen_with_completion_code = {
        type: 'instructions',
        pages: [completion_code_page],
        show_clickable_nav: true,
        data: {experiment_stage: "instruction"}
    };

    instructions.main_study_start = {
        type: 'html-button-response',
        stimulus:
            '<p><img src="js/img/piggy-bank.png" width="200"></p>' +
            '<p><b>Great job completing the practice!</b></p>' +
            '<p>You are now ready to begin the main study.</p>' +
            '<p>Remember to use the feedback you receive to learn about each advisor\'s reliability.</p>' +
            '<p>Good luck!</p>',
        choices: ['Start Main Study']
    };
    return instructions;
}


export {create_instructions_object};