# AI Coding Guidelines for trust-asymmetry-test

## Project Overview
This is a jsPsych-based online experiment for studying trust asymmetry in financial decision-making. It uses ES6 modules, runs in the browser, and deploys via JATOS for data collection.

## Architecture
- **Main Entry**: `index.html` loads jsPsych and custom plugins, then runs `js/timeline.js` as an ES6 module.
- **Modular Structure**: Core logic split into:
  - `timeline.js`: Defines experiment flow, conditions, and timeline construction.
  - `set_up_functions.js`: Handles randomization, binomial sampling, and timeline variable creation.
  - `define_plugins.js`: Configures jsPsych plugins with custom HTML displays.
  - `display_functions.js`: Generates HTML stimuli and feedback.
  - `data_functions.js`: Manages data saving (JATOS online, console.log locally).
  - `instructions.js`: Creates instruction screens.
- **Data Flow**: Trials use timeline variables with properties like `num_blue_indep`, `source_type`, `feedback_condition`. Data saved as CSV via JATOS.

## Key Conventions
- **Plugins**: Defined as objects in `plugins` dict, e.g., `plugins.feedback = {type: 'html-slider-response', ...}`. Call via `plugins.[name]` in timelines.
- **Timeline Variables**: Arrays of objects with trial-specific data, created by `set_up.create_timeline_variable()`.
- **Randomization**: Use `jsPsych.randomization.shuffle()` or `sampleWithoutReplacement()`. Binomial draws via custom `rbinom()`.
- **Conditions**: Controlled via URL params (e.g., `news_station_first=1`) or hardcoded flags like `feedback_condition`.
- **File Naming**: Subject data: `${subject_id}.csv`. Images: `expert_${number}.png` in `img/`.

## Workflows
- **Local Development**: Open `index.html` in browser. No build step required.
- **Debugging**: Use browser dev tools. Set `skip_*` flags in `timeline.js` for prototyping (e.g., `skip_practice = true`).
- **Data Saving**: Locally logs to console; online uses JATOS `jatos.appendResultData()`.
- **Deployment**: Upload to JATOS server; participants access via provided link.

## Patterns
- **Nested Timelines**: Experiment structured as nested jsPsych timelines with `timeline_variables` for repetition.
- **Conditional Logic**: Use flags like `with_independent_council` to include/exclude plugins dynamically.
- **Custom HTML**: Stimuli generated via functions in `display_functions.js`, e.g., `make_full_html_display()`.
- **State Management**: Global vars for conditions; no state libraries.

Reference: `timeline.js` for overall flow, `define_plugins.js` for plugin examples, `set_up_functions.js` for randomization logic.</content>
<parameter name="filePath">/Users/meissene/Documents/GitHub/trust-asymmetry-test/.github/copilot-instructions.md